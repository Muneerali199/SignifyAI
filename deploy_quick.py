"""
Quick deployment script - Convert, Test, Deploy
"""
import tensorflow as tf
import json
import shutil
from pathlib import Path

print("="*60)
print("  ISL Model Deployment Pipeline")
print("="*60)

PROJECT_ROOT = Path(__file__).parent
MODEL_DIR = PROJECT_ROOT / "model"
APP_ASSETS = PROJECT_ROOT / "app" / "assets" / "models"

# Step 1: Convert to TFLite
print("\n[1/3] Converting to TFLite...")
print("-"*60)

model_path = MODEL_DIR / "isl_model.h5"
if not model_path.exists():
    print(f"✗ Model not found: {model_path}")
    exit(1)

print(f"Loading model from: {model_path}")
model = tf.keras.models.load_model(str(model_path))
print("✓ Model loaded")

# Standard TFLite
print("\nConverting to standard TFLite...")
converter = tf.lite.TFLiteConverter.from_keras_model(model)
tflite_model = converter.convert()

tflite_path = MODEL_DIR / "isl_model.tflite"
tflite_path.write_bytes(tflite_model)
size_mb = len(tflite_model) / (1024 * 1024)
print(f"✓ Saved: {tflite_path.name} ({size_mb:.2f} MB)")

# Quantized TFLite
print("\nConverting to quantized TFLite...")
converter = tf.lite.TFLiteConverter.from_keras_model(model)
converter.optimizations = [tf.lite.Optimize.DEFAULT]
tflite_q_model = converter.convert()

tflite_q_path = MODEL_DIR / "isl_model_quantized.tflite"
tflite_q_path.write_bytes(tflite_q_model)
size_q_mb = len(tflite_q_model) / (1024 * 1024)
print(f"✓ Saved: {tflite_q_path.name} ({size_q_mb:.2f} MB)")

print(f"\n📊 Size comparison:")
print(f"   Standard:  {size_mb:.2f} MB")
print(f"   Quantized: {size_q_mb:.2f} MB (saved {size_mb - size_q_mb:.2f} MB)")

# Step 2: Create metadata
print("\n[2/3] Creating metadata...")
print("-"*60)

labels_path = MODEL_DIR / "labels.json"
if labels_path.exists():
    with open(labels_path) as f:
        labels = json.load(f)
    print(f"✓ Loaded {len(labels)} labels")
else:
    labels = {}
    print("⚠ No labels.json found")

metadata = {
    "model_name": "ISL Gesture Recognition",
    "model_version": "1.0",
    "input_shape": [64, 64, 3],
    "num_classes": 11,
    "labels": labels,
    "preprocessing": {
        "rescale": "1/255",
        "resize": [64, 64],
        "color_mode": "RGB"
    }
}

metadata_path = MODEL_DIR / "tflite_metadata.json"
with open(metadata_path, 'w') as f:
    json.dump(metadata, f, indent=2)
print(f"✓ Saved: {metadata_path.name}")

# Step 3: Deploy to app
print("\n[3/3] Deploying to mobile app...")
print("-"*60)

# Create directory if needed
APP_ASSETS.mkdir(parents=True, exist_ok=True)
print(f"✓ Assets directory: {APP_ASSETS}")

# Copy quantized model (recommended for mobile)
print(f"\nCopying {tflite_q_path.name}...")
shutil.copy2(tflite_q_path, APP_ASSETS / tflite_q_path.name)
print(f"✓ Model deployed")

# Copy labels
if labels_path.exists():
    print(f"Copying {labels_path.name}...")
    shutil.copy2(labels_path, APP_ASSETS / labels_path.name)
    print(f"✓ Labels deployed")

# Copy metadata
print(f"Copying {metadata_path.name}...")
shutil.copy2(metadata_path, APP_ASSETS / metadata_path.name)
print(f"✓ Metadata deployed")

# List deployed files
print("\n" + "="*60)
print("✓ Deployment Complete!")
print("="*60)

print(f"\nDeployed files in {APP_ASSETS}:")
for file in APP_ASSETS.glob("*"):
    if file.is_file():
        size = file.stat().st_size / 1024
        if size > 1024:
            print(f"  - {file.name} ({size/1024:.2f} MB)")
        else:
            print(f"  - {file.name} ({size:.2f} KB)")

print("\n" + "="*60)
print("Next Step: Update services/gestureRecognition.ts")
print("="*60)
print("""
Update your React Native code to load the model:

1. Install TensorFlow.js for React Native:
   npm install @tensorflow/tfjs @tensorflow/tfjs-react-native

2. In services/gestureRecognition.ts:
   - Import the model file
   - Load the TFLite model
   - Use it for predictions

Example:
  import * as tf from '@tensorflow/tfjs';
  import { bundleResourceIO } from '@tensorflow/tfjs-react-native';
  
  const model = await tf.loadLayersModel(
    bundleResourceIO('model/isl_model_quantized.tflite')
  );
""")

print("="*60)
