import os
import sys
import argparse
import shutil
import numpy as np
import pandas as pd
import cv2
import matplotlib.pyplot as plt
import seaborn as sn
import kagglehub
from sklearn.model_selection import train_test_split
from sklearn.metrics import confusion_matrix, classification_report, roc_curve, roc_auc_score
import tensorflow as tf
from tensorflow.keras.applications.vgg16 import VGG16, preprocess_input
from tensorflow.keras.models import Model, Sequential
from tensorflow.keras.layers import Input, Dense, Conv2D, BatchNormalization, MaxPooling2D, Dropout, Flatten, GlobalAveragePooling2D
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.callbacks import ReduceLROnPlateau, ModelCheckpoint

# --- Configuration ---
DATASET_ID = "kmader/pulmonary-chest-xray-abnormalities"
IMG_SIZE = (256, 256)
BATCH_SIZE = 32
EPOCHS = 100
MODEL_PATH = 'best_tb_model.h5'

def download_dataset():
    """Downloads the dataset using kagglehub."""
    print(f"Downloading dataset {DATASET_ID}...")
    path = kagglehub.dataset_download(DATASET_ID)
    print(f"Dataset downloaded to: {path}")
    return path

def prepare_data(base_path):
    """Prepares paths and labels for TB classification."""
    china_path = os.path.join(base_path, 'ChinaSet_AllFiles', 'ChinaSet_AllFiles', 'CXR_png')
    montgomery_path = os.path.join(base_path, 'Montgomery', 'MontgomerySet', 'CXR_png')
    
    paths = []
    labels = []
    
    # Process ChinaSet
    if os.path.exists(china_path):
        for f in os.listdir(china_path):
            if f.endswith('.png') and 'Thumbs.db' not in f:
                parts = f.split('_')
                if len(parts) >= 3:
                    label = parts[2].split('.')[0] # '0' for Normal, '1' for Abnormal
                    paths.append(os.path.join(china_path, f))
                    labels.append(label)
    
    # Process Montgomery set
    if os.path.exists(montgomery_path):
        for f in os.listdir(montgomery_path):
            if f.endswith('.png') and 'Thumbs.db' not in f:
                parts = f.split('_')
                if len(parts) >= 3:
                    label = parts[2].split('.')[0]
                    paths.append(os.path.join(montgomery_path, f))
                    labels.append(label)
                    
    df = pd.DataFrame({'path': paths, 'label': labels})
    print(f"Total samples found: {len(df)}")
    return df

def build_model(lr=0.0001, fine_tune_from=None):
    """
    Defines and compiles the TB detection model using VGG16.
    If fine_tune_from is provided, it unfreezes layers from that index onwards.
    """
    base_model = VGG16(weights='imagenet', include_top=False, input_shape=(*IMG_SIZE, 3))
    
    if fine_tune_from is None:
        # Freeze the base model layers initially
        base_model.trainable = False
    else:
        # Unfreeze the base model
        base_model.trainable = True
        # Freeze all layers before the fine_tune_from index
        for layer in base_model.layers[:fine_tune_from]:
            layer.trainable = False

    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = Dense(512, activation='relu')(x)
    x = Dropout(0.5)(x)
    x = Dense(128, activation='relu')(x)
    x = Dropout(0.3)(x)
    output = Dense(1, activation='sigmoid')(x)

    model = Model(inputs=base_model.input, outputs=output)
    model.compile(optimizer=tf.keras.optimizers.Adam(learning_rate=lr), 
                  loss='binary_crossentropy', 
                  metrics=['accuracy'])
    return model

def plot_history(history):
    """Plots training and validation metrics."""
    plt.figure(figsize=(12, 4))
    
    plt.subplot(1, 2, 1)
    plt.plot(history.history['accuracy'], label='Train Accuracy')
    plt.plot(history.history['val_accuracy'], label='Val Accuracy')
    plt.title('Accuracy')
    plt.legend()
    
    plt.subplot(1, 2, 2)
    plt.plot(history.history['loss'], label='Train Loss')
    plt.plot(history.history['val_loss'], label='Val Loss')
    plt.title('Loss')
    plt.legend()
    
    plt.show()

def predict_image(image_path, model_path=MODEL_PATH):
    """Predicts TB for a single image."""
    if not os.path.exists(image_path):
        print(f"Error: Image not found at {image_path}")
        return

    # Load Model
    print("Loading model...")
    model = build_model()
    try:
        model.load_weights(model_path)
    except Exception as e:
        print(f"Error loading model weights: {e}")
        return

    # Load and Preprocess Image
    print(f"Processing image: {image_path}")
    img = cv2.imread(image_path)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = cv2.resize(img, IMG_SIZE)
    img = np.expand_dims(img, axis=0)
    img = preprocess_input(img)

    # Predict
    raw_prediction = model.predict(img)[0][0]
    print(f"Raw model output: {raw_prediction:.4f}")
    
    label = "Tuberculosis" if raw_prediction > 0.5 else "Normal"
    confidence = raw_prediction if raw_prediction > 0.5 else (1 - raw_prediction)

    print("\n" + "="*30)
    print(f"RESULT: {label}")
    print(f"Confidence: {confidence:.2f}")
    print("="*30)

def main():
    # 1. Download Data
    dataset_base_path = download_dataset()
    
    # 2. Prepare Dataframe
    df = prepare_data(dataset_base_path)
    
    if df.empty:
        print("Error: No data found. Please check the dataset paths.")
        return

    # # Shuffle the dataframe to ensure mixed classes in train/val splits
    # print("Shuffling dataset...")
    # df = df.sample(frac=1, random_state=42).reset_index(drop=True)
    # print(f"Label distribution:\n{df['label'].value_counts()}")

    # 3. Setup Generators
    train_datagen = ImageDataGenerator(
        preprocessing_function=preprocess_input,
        validation_split=0.2, 
        horizontal_flip=True,
        rotation_range=20,
        width_shift_range=0.2,
        height_shift_range=0.2,
        shear_range=0.2,
        zoom_range=0.2
    )
    
    val_datagen = ImageDataGenerator(preprocessing_function=preprocess_input, validation_split=0.2)
    
    train_gen = train_datagen.flow_from_dataframe(
        dataframe=df,
        x_col='path',
        y_col='label',
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='binary',
        subset='training'
    )
    
    val_gen = val_datagen.flow_from_dataframe(
        dataframe=df,
        x_col='path',
        y_col='label',
        target_size=IMG_SIZE,
        batch_size=1,
        class_mode='binary',
        subset='validation'
    )

    # 4. Build and Train Model (Stage 1: Top Layers)
    print("\n--- Stage 1: Training Top Layers ---")
    model = build_model(lr=0.0001)
    model.summary()
    
    lr_reducer = ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=3, verbose=1, min_lr=0.00001)
    checkpoint = ModelCheckpoint(MODEL_PATH, save_best_only=True, monitor='val_loss')
    early_stop = tf.keras.callbacks.EarlyStopping(monitor='val_loss', patience=10, restore_best_weights=True, verbose=1)

    print("Starting initial training...")
    model.fit(
        train_gen,
        epochs=EPOCHS // 2,
        validation_data=val_gen,
        callbacks=[lr_reducer, checkpoint, early_stop]
    )

    # Stage 2: Fine-Tuning
    print("\n--- Stage 2: Fine-Tuning Last Block ---")
    # VGG16 has 19 layers. Block 5 starts around layer 15.
    model = build_model(lr=0.00001, fine_tune_from=15)
    model.load_weights(MODEL_PATH) # Load best from stage 1
    
    history = model.fit(
        train_gen,
        epochs=EPOCHS,
        initial_epoch=EPOCHS // 2,
        validation_data=val_gen,
        callbacks=[lr_reducer, checkpoint, early_stop]
    )

    # 5. Evaluate
    plot_history(history)
    
    # Load best model for evaluation
    model.load_weights(MODEL_PATH)
    
    # Re-setup val_gen without shuffle for classification report
    eval_gen = val_datagen.flow_from_dataframe(
        dataframe=df,
        x_col='path',
        y_col='label',
        target_size=IMG_SIZE,
        batch_size=1,
        class_mode='binary',
        subset='validation',
        shuffle=False
    )
    
    preds = model.predict(eval_gen)
    preds_binary = (preds > 0.5).astype(int)
    
    print("\nClassification Report:")
    print(classification_report(eval_gen.classes, preds_binary, target_names=['Normal', 'Tuberculosis']))
    
    print("\nConfusion Matrix:")
    cm = confusion_matrix(eval_gen.classes, preds_binary)
    plt.figure(figsize=(8, 6))
    sn.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=['Normal', 'TB'], yticklabels=['Normal', 'TB'])
    plt.xlabel('Predicted')
    plt.ylabel('Actual')
    plt.title('TB Classification Confusion Matrix')
    plt.show()

    # Plot ROC Curve
    fpr, tpr, _ = roc_curve(eval_gen.classes, preds)
    auc = roc_auc_score(eval_gen.classes, preds)
    plt.figure(figsize=(8, 6))
    plt.plot(fpr, tpr, label=f'TB Prediction (AUC = {auc:.2f})')
    plt.plot([0, 1], [0, 1], 'r--')
    plt.xlabel('False Positive Rate')
    plt.ylabel('True Positive Rate')
    plt.title('ROC-AUC Curve')
    plt.legend(loc=4)
    plt.show()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="TB Classification Tool")
    parser.add_argument('--train', action='store_true', help="Run the full training pipeline")
    parser.add_argument('--predict', type=str, help="Path to an image for prediction")
    
    args = parser.parse_args()

    if args.predict:
        predict_image(args.predict)
    elif args.train:
        main()
    else:
        # Default behavior: If a model exists, offer prediction options, otherwise suggest training
        if os.path.exists(MODEL_PATH):
            print("Trained model found. Use --predict <path> to test an image.")
            print("Or use --train to re-run the training pipeline.")
        else:
            print("No model found. Running training pipeline...")
            main()
