import os
import cv2
import numpy as np
import tensorflow as tf

# Configuration
IMG_SIZE = (256, 256)
MODEL_PATH = os.path.join(os.getcwd(), 'Tuberculosis-Detection', 'best_tb_model.tflite')

# Global variable for the interpreter to avoid reloading
_interpreter = None
_input_details = None
_output_details = None

def get_interpreter():
    """Loads and returns the TFLite interpreter."""
    global _interpreter, _input_details, _output_details
    if _interpreter is None:
        if not os.path.exists(MODEL_PATH):
            print(f"Error: TFLite model file not found at {MODEL_PATH}")
            return None
        
        print(f"Loading TFLite model from {MODEL_PATH}...")
        try:
            _interpreter = tf.lite.Interpreter(model_path=MODEL_PATH)
            _interpreter.allocate_tensors()
            
            # Get input and output details
            _input_details = _interpreter.get_input_details()
            _output_details = _interpreter.get_output_details()
            
            print("TFLite Model loaded successfully.")
        except Exception as e:
            print(f"Error loading TFLite model: {e}")
            return None
    return _interpreter

async def predict_tb(file_bytes: bytes) -> dict:
    """
    Predicts TB for an uploaded image using TFLite.
    Returns: {"label": "Tuberculosis" | "Normal", "confidence": float, "raw_score": float}
    """
    interpreter = get_interpreter()
    if interpreter is None:
        return {"error": "Model not loaded"}

    try:
        # Convert bytes to numpy array
        nparr = np.frombuffer(file_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            return {"error": "Could not decode image"}

        # Preprocessing (must match training)
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        img_resized = cv2.resize(img_rgb, IMG_SIZE)
        
        # VGG16 Preprocessing logic: Subtract mean [103.939, 116.779, 123.68]
        # (This is what preprocess_input does for VGG16)
        img_float = img_resized.astype(np.float32)
        # Note: preprocess_input for VGG16 converts RGB to BGR and subtracts ImageNet mean
        # Since we use RGB, we just simulate the subtraction if needed, or use tf.keras.applications.vgg16.preprocess_input
        img_expanded = np.expand_dims(img_float, axis=0)
        
        # We can still use the utility from tf if installed
        from tensorflow.keras.applications.vgg16 import preprocess_input
        img_preprocessed = preprocess_input(img_expanded)

        # Set input tensor
        interpreter.set_tensor(_input_details[0]['index'], img_preprocessed)

        # Run inference
        interpreter.invoke()

        # Get output tensor
        prediction = interpreter.get_tensor(_output_details[0]['index'])
        raw_score = float(prediction[0][0])
        
        label = "Tuberculosis" if raw_score > 0.5 else "Normal"
        confidence = raw_score if raw_score > 0.5 else (1 - raw_score)

        return {
            "label": label,
            "confidence": round(confidence, 4),
            "raw_score": round(raw_score, 4)
        }
    except Exception as e:
        print(f"TFLite Prediction error: {e}")
        return {"error": str(e)}
