import os
import cv2
import numpy as np
try:
    import tflite_runtime.interpreter as tflite
except ImportError:
    try:
        import tensorflow.lite as tflite
    except ImportError:
        tflite = None

# Configuration
IMG_SIZE = (256, 256)
MODEL_PATH = os.path.join(os.getcwd(), 'Tuberculosis_Detection', 'best_tb_model.tflite')

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
        
        try:
            if tflite is None:
                raise ImportError("TFLite runtime not found.")
            _interpreter = tflite.Interpreter(model_path=MODEL_PATH)
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
        
        # VGG16 Preprocessing logic: RGB -> BGR and subtract ImageNet mean
        img_bgr = img_resized[..., ::-1] # RGB to BGR
        img_float = img_bgr.astype(np.float32)
        
        # ImageNet mean for BGR: [103.939, 116.779, 123.68]
        img_float[..., 0] -= 103.939
        img_float[..., 1] -= 116.779
        img_float[..., 2] -= 123.68
        
        img_preprocessed = np.expand_dims(img_float, axis=0)

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
