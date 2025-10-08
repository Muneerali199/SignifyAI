"""
Test the trained model with sample images

This script tests the trained model or TFLite model with images from the dataset.
"""

import tensorflow as tf
import numpy as np
import json
from pathlib import Path
from PIL import Image
import random

# Configuration
PROJECT_ROOT = Path(__file__).parent.parent
MODEL_DIR = PROJECT_ROOT / "model"
DATA_DIR = PROJECT_ROOT / "data" / "indian-sign-language-isl"

def load_labels():
    """Load class labels"""
    labels_path = MODEL_DIR / 'labels.json'
    if not labels_path.exists():
        print("⚠ Labels file not found. Using directory names.")
        return None
    
    with open(labels_path, 'r') as f:
        labels = json.load(f)
    
    return labels

def load_keras_model():
    """Load trained Keras model"""
    model_path = MODEL_DIR / "isl_model.h5"
    
    if not model_path.exists():
        print(f"✗ Keras model not found: {model_path}")
        return None
    
    print(f"📦 Loading Keras model...")
    model = tf.keras.models.load_model(model_path)
    print(f"✓ Model loaded")
    return model

def load_tflite_model():
    """Load TFLite model"""
    tflite_path = MODEL_DIR / "isl_model.tflite"
    
    if not tflite_path.exists():
        print(f"✗ TFLite model not found: {tflite_path}")
        return None
    
    print(f"📦 Loading TFLite model...")
    interpreter = tf.lite.Interpreter(model_path=str(tflite_path))
    interpreter.allocate_tensors()
    print(f"✓ TFLite model loaded")
    return interpreter

def preprocess_image(image_path, target_size=(224, 224)):
    """Preprocess image for model input"""
    img = Image.open(image_path).convert('RGB')
    img = img.resize(target_size)
    img_array = np.array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

def predict_keras(model, image_array, labels):
    """Make prediction using Keras model"""
    predictions = model.predict(image_array, verbose=0)[0]
    
    # Get top 3 predictions
    top_indices = predictions.argsort()[-3:][::-1]
    
    results = []
    for idx in top_indices:
        class_name = labels[str(idx)] if labels else f"Class {idx}"
        confidence = predictions[idx]
        results.append((class_name, confidence))
    
    return results

def predict_tflite(interpreter, image_array, labels):
    """Make prediction using TFLite model"""
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()
    
    # Set input tensor
    interpreter.set_tensor(input_details[0]['index'], image_array.astype(np.float32))
    
    # Run inference
    interpreter.invoke()
    
    # Get output
    predictions = interpreter.get_tensor(output_details[0]['index'])[0]
    
    # Get top 3 predictions
    top_indices = predictions.argsort()[-3:][::-1]
    
    results = []
    for idx in top_indices:
        class_name = labels[str(idx)] if labels else f"Class {idx}"
        confidence = predictions[idx]
        results.append((class_name, confidence))
    
    return results

def get_random_images(n=5):
    """Get random images from dataset"""
    if not DATA_DIR.exists():
        print(f"✗ Data directory not found: {DATA_DIR}")
        return []
    
    # Get all subdirectories (classes)
    class_dirs = [d for d in DATA_DIR.iterdir() if d.is_dir()]
    
    if not class_dirs:
        print("✗ No class directories found")
        return []
    
    images = []
    for _ in range(n):
        class_dir = random.choice(class_dirs)
        class_images = list(class_dir.glob('*.jpg')) + list(class_dir.glob('*.png'))
        
        if class_images:
            img_path = random.choice(class_images)
            images.append((img_path, class_dir.name))
    
    return images

def test_model(model_type='keras'):
    """Test model with random images"""
    
    print("="*60)
    print(f"  Testing {model_type.upper()} Model")
    print("="*60)
    
    # Load labels
    labels = load_labels()
    
    # Load model
    if model_type == 'keras':
        model = load_keras_model()
        if model is None:
            return
    else:
        model = load_tflite_model()
        if model is None:
            return
    
    # Get random test images
    print(f"\n🎲 Selecting random test images...")
    test_images = get_random_images(5)
    
    if not test_images:
        print("✗ No test images found")
        return
    
    print(f"✓ Found {len(test_images)} test images\n")
    
    # Test each image
    for i, (img_path, true_label) in enumerate(test_images, 1):
        print(f"\n{'='*60}")
        print(f"Test Image {i}/{len(test_images)}")
        print(f"{'='*60}")
        print(f"File: {img_path.name}")
        print(f"True Label: {true_label}")
        
        # Preprocess image
        img_array = preprocess_image(img_path)
        
        # Make prediction
        if model_type == 'keras':
            predictions = predict_keras(model, img_array, labels)
        else:
            predictions = predict_tflite(model, img_array, labels)
        
        # Display results
        print(f"\nPredictions:")
        for j, (class_name, confidence) in enumerate(predictions, 1):
            marker = "✓" if class_name.lower() == true_label.lower() else " "
            print(f"  {marker} {j}. {class_name}: {confidence*100:.2f}%")
        
        # Check if prediction is correct
        top_prediction = predictions[0][0]
        if top_prediction.lower() == true_label.lower():
            print(f"\n✓ Correct prediction!")
        else:
            print(f"\n✗ Incorrect prediction (expected {true_label})")

def compare_models():
    """Compare Keras and TFLite predictions"""
    
    print("="*60)
    print("  Comparing Keras vs TFLite Models")
    print("="*60)
    
    # Load labels
    labels = load_labels()
    
    # Load both models
    keras_model = load_keras_model()
    tflite_model = load_tflite_model()
    
    if keras_model is None or tflite_model is None:
        print("✗ Both models must be available for comparison")
        return
    
    # Get test images
    test_images = get_random_images(3)
    
    if not test_images:
        print("✗ No test images found")
        return
    
    # Compare predictions
    for i, (img_path, true_label) in enumerate(test_images, 1):
        print(f"\n{'='*60}")
        print(f"Image {i}: {img_path.name} (True: {true_label})")
        print(f"{'='*60}")
        
        # Preprocess
        img_array = preprocess_image(img_path)
        
        # Keras predictions
        keras_preds = predict_keras(keras_model, img_array, labels)
        print(f"\nKeras Model:")
        for j, (name, conf) in enumerate(keras_preds[:3], 1):
            print(f"  {j}. {name}: {conf*100:.2f}%")
        
        # TFLite predictions
        tflite_preds = predict_tflite(tflite_model, img_array, labels)
        print(f"\nTFLite Model:")
        for j, (name, conf) in enumerate(tflite_preds[:3], 1):
            print(f"  {j}. {name}: {conf*100:.2f}%")
        
        # Compare top predictions
        if keras_preds[0][0] == tflite_preds[0][0]:
            print(f"\n✓ Both models agree: {keras_preds[0][0]}")
        else:
            print(f"\n⚠ Models disagree!")
            print(f"  Keras: {keras_preds[0][0]}")
            print(f"  TFLite: {tflite_preds[0][0]}")

def main():
    import sys
    
    if len(sys.argv) > 1:
        model_type = sys.argv[1].lower()
        if model_type == 'compare':
            compare_models()
        elif model_type in ['keras', 'tflite']:
            test_model(model_type)
        else:
            print("Usage: python test_model.py [keras|tflite|compare]")
    else:
        # Default: test Keras model
        test_model('keras')

if __name__ == "__main__":
    main()
