"""
Convert trained Keras model to TensorFlow Lite format

This script converts the trained .h5 model to .tflite for mobile deployment.
"""

import tensorflow as tf
import json
import numpy as np
from pathlib import Path

# Configuration
PROJECT_ROOT = Path(__file__).parent.parent
MODEL_DIR = PROJECT_ROOT / "model"
INPUT_MODEL = MODEL_DIR / "isl_model.h5"
OUTPUT_MODEL = MODEL_DIR / "isl_model.tflite"
OUTPUT_MODEL_QUANTIZED = MODEL_DIR / "isl_model_quantized.tflite"

def check_model_exists():
    """Check if trained model exists"""
    if not INPUT_MODEL.exists():
        print(f"✗ Model not found: {INPUT_MODEL}")
        print("\nPlease train the model first:")
        print("  python training/train.py")
        return False
    
    print(f"✓ Found model: {INPUT_MODEL}")
    
    # Get model size
    size_mb = INPUT_MODEL.stat().st_size / (1024 * 1024)
    print(f"  Size: {size_mb:.2f} MB")
    
    return True

def load_model():
    """Load the trained Keras model"""
    print("\n📦 Loading model...")
    model = tf.keras.models.load_model(INPUT_MODEL)
    
    # Print model info
    print(f"✓ Model loaded successfully")
    print(f"  Input shape: {model.input_shape}")
    print(f"  Output shape: {model.output_shape}")
    
    return model

def convert_to_tflite(model, quantize=False):
    """Convert Keras model to TensorFlow Lite"""
    
    print(f"\n🔄 Converting to TFLite{' (quantized)' if quantize else ''}...")
    
    # Create converter
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    
    if quantize:
        # Apply optimizations (quantization)
        converter.optimizations = [tf.lite.Optimize.DEFAULT]
        
        # Optional: Use float16 quantization for better accuracy
        converter.target_spec.supported_types = [tf.float16]
        
        print("  Applying quantization optimizations...")
    
    # Convert the model
    tflite_model = converter.convert()
    
    return tflite_model

def save_tflite_model(tflite_model, output_path):
    """Save TFLite model to file"""
    
    # Save the model
    with open(output_path, 'wb') as f:
        f.write(tflite_model)
    
    # Get file size
    size_mb = output_path.stat().st_size / (1024 * 1024)
    
    print(f"✓ Saved TFLite model: {output_path}")
    print(f"  Size: {size_mb:.2f} MB")

def test_tflite_model(tflite_path, original_model):
    """Test the TFLite model with random input"""
    
    print(f"\n🧪 Testing TFLite model...")
    
    # Load TFLite model
    interpreter = tf.lite.Interpreter(model_path=str(tflite_path))
    interpreter.allocate_tensors()
    
    # Get input and output details
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()
    
    print(f"✓ Model loaded in interpreter")
    print(f"  Input shape: {input_details[0]['shape']}")
    print(f"  Output shape: {output_details[0]['shape']}")
    
    # Create random test input
    input_shape = input_details[0]['shape']
    test_input = np.random.random(input_shape).astype(np.float32)
    
    # Run inference with TFLite
    interpreter.set_tensor(input_details[0]['index'], test_input)
    interpreter.invoke()
    tflite_output = interpreter.get_tensor(output_details[0]['index'])
    
    # Run inference with original model
    keras_output = original_model.predict(test_input, verbose=0)
    
    # Compare outputs
    max_diff = np.max(np.abs(tflite_output - keras_output))
    mean_diff = np.mean(np.abs(tflite_output - keras_output))
    
    print(f"\n📊 Comparison with original model:")
    print(f"  Max difference: {max_diff:.6f}")
    print(f"  Mean difference: {mean_diff:.6f}")
    
    if max_diff < 0.01:
        print(f"  ✓ Models are very similar (max diff < 0.01)")
    elif max_diff < 0.1:
        print(f"  ⚠ Models are reasonably similar (max diff < 0.1)")
    else:
        print(f"  ⚠ Models may have significant differences (max diff >= 0.1)")

def create_model_metadata():
    """Create metadata file for the TFLite model"""
    
    print("\n📝 Creating model metadata...")
    
    # Load labels if available
    labels_path = MODEL_DIR / 'labels.json'
    if labels_path.exists():
        with open(labels_path, 'r') as f:
            labels = json.load(f)
    else:
        labels = {}
    
    # Load config if available
    config_path = MODEL_DIR / 'model_config.json'
    if config_path.exists():
        with open(config_path, 'r') as f:
            config = json.load(f)
    else:
        config = {}
    
    # Create metadata
    metadata = {
        "model_name": "ISL Gesture Recognition",
        "model_version": "1.0",
        "model_file": "isl_model.tflite",
        "input_shape": config.get('img_size', [224, 224]),
        "num_classes": config.get('num_classes', len(labels)),
        "labels": labels,
        "preprocessing": {
            "rescale": "1/255",
            "resize": config.get('img_size', [224, 224]),
            "color_mode": "RGB"
        },
        "usage": {
            "input": "Image tensor of shape [1, 224, 224, 3] with values in range [0, 1]",
            "output": "Probability distribution over gesture classes",
            "example": "interpreter.set_tensor(input_index, image_array); interpreter.invoke(); output = interpreter.get_tensor(output_index)"
        }
    }
    
    metadata_path = MODEL_DIR / 'tflite_metadata.json'
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=2)
    
    print(f"✓ Metadata saved: {metadata_path}")

def main():
    print("="*60)
    print("  TensorFlow Lite Model Converter")
    print("="*60)
    
    # Check if model exists
    if not check_model_exists():
        return
    
    # Load the model
    model = load_model()
    
    # Convert to TFLite (standard)
    print("\n" + "="*60)
    print("Converting standard TFLite model...")
    print("="*60)
    tflite_model = convert_to_tflite(model, quantize=False)
    save_tflite_model(tflite_model, OUTPUT_MODEL)
    test_tflite_model(OUTPUT_MODEL, model)
    
    # Convert to TFLite (quantized)
    print("\n" + "="*60)
    print("Converting quantized TFLite model (smaller, faster)...")
    print("="*60)
    tflite_model_quantized = convert_to_tflite(model, quantize=True)
    save_tflite_model(tflite_model_quantized, OUTPUT_MODEL_QUANTIZED)
    test_tflite_model(OUTPUT_MODEL_QUANTIZED, model)
    
    # Create metadata
    create_model_metadata()
    
    # Compare sizes
    print("\n" + "="*60)
    print("📊 Model Size Comparison:")
    print("="*60)
    
    keras_size = INPUT_MODEL.stat().st_size / (1024 * 1024)
    tflite_size = OUTPUT_MODEL.stat().st_size / (1024 * 1024)
    tflite_q_size = OUTPUT_MODEL_QUANTIZED.stat().st_size / (1024 * 1024)
    
    print(f"  Original Keras model: {keras_size:.2f} MB")
    print(f"  TFLite model:         {tflite_size:.2f} MB ({(tflite_size/keras_size)*100:.1f}%)")
    print(f"  TFLite quantized:     {tflite_q_size:.2f} MB ({(tflite_q_size/keras_size)*100:.1f}%)")
    print(f"\n  Size reduction: {keras_size - tflite_q_size:.2f} MB saved!")
    
    print("\n" + "="*60)
    print("✓ Conversion Complete!")
    print("="*60)
    print("\nGenerated files:")
    print(f"  1. {OUTPUT_MODEL.name} - Standard TFLite model")
    print(f"  2. {OUTPUT_MODEL_QUANTIZED.name} - Quantized (smaller, faster)")
    print(f"  3. tflite_metadata.json - Model metadata")
    print("\nNext steps:")
    print("  1. Copy the .tflite file to your mobile app's assets folder")
    print("  2. Update your React Native app to use the TFLite model")
    print("  3. Test the model in the mobile app")
    print("="*60)

if __name__ == "__main__":
    main()
