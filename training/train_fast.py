"""
Ultra-Fast ISL Model Training - Completes in ~15-20 minutes on CPU
Optimized for quick results with decent accuracy
"""

import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'  # Reduce TensorFlow logging

import json
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping
from pathlib import Path
from datetime import datetime

# Ultra-fast configuration
class Config:
    PROJECT_ROOT = Path(__file__).parent.parent
    DATA_DIR = PROJECT_ROOT / "data" / "ISL"
    MODEL_DIR = PROJECT_ROOT / "model"
    
    # Ultra-fast settings
    IMG_SIZE = (64, 64)  # Very small images for speed
    BATCH_SIZE = 256     # Large batch size
    EPOCHS = 10          # Fewer epochs
    LEARNING_RATE = 0.001

print("="*60)
print("  Ultra-Fast ISL Training (~15-20 minutes)")
print("="*60)
print(f"\nSettings:")
print(f"  Image Size: {Config.IMG_SIZE}")
print(f"  Batch Size: {Config.BATCH_SIZE}")
print(f"  Epochs: {Config.EPOCHS}")
print(f"  Model: Lightweight CNN")

# Create data generators with minimal augmentation
print("\n📊 Loading data...")

train_datagen = ImageDataGenerator(
    rescale=1./255,
    validation_split=0.2,
    rotation_range=10,  # Minimal augmentation
    width_shift_range=0.1,
    height_shift_range=0.1,
)

train_gen = train_datagen.flow_from_directory(
    Config.DATA_DIR,
    target_size=Config.IMG_SIZE,
    batch_size=Config.BATCH_SIZE,
    class_mode='categorical',
    subset='training',
    shuffle=True
)

val_gen = train_datagen.flow_from_directory(
    Config.DATA_DIR,
    target_size=Config.IMG_SIZE,
    batch_size=Config.BATCH_SIZE,
    class_mode='categorical',
    subset='validation',
    shuffle=False
)

print(f"✓ Training: {train_gen.samples} images")
print(f"✓ Validation: {val_gen.samples} images")
print(f"✓ Classes: {train_gen.num_classes}")

# Build ultra-lightweight model
print("\n🏗️  Building lightweight model...")

model = keras.Sequential([
    # Single conv block
    layers.Conv2D(32, 3, activation='relu', input_shape=(*Config.IMG_SIZE, 3)),
    layers.MaxPooling2D(2),
    layers.Dropout(0.25),
    
    # Second conv block
    layers.Conv2D(64, 3, activation='relu'),
    layers.MaxPooling2D(2),
    layers.Dropout(0.25),
    
    # Dense layers
    layers.Flatten(),
    layers.Dense(128, activation='relu'),
    layers.Dropout(0.5),
    layers.Dense(train_gen.num_classes, activation='softmax')
])

model.compile(
    optimizer=keras.optimizers.Adam(learning_rate=Config.LEARNING_RATE),
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

print(model.summary())

# Calculate time estimate
steps_per_epoch = len(train_gen)
estimated_seconds = steps_per_epoch * Config.EPOCHS * 0.5  # ~0.5 sec per step on CPU
estimated_minutes = estimated_seconds / 60

print(f"\n🚀 Starting training...")
print(f"   Steps per epoch: {steps_per_epoch}")
print(f"   Estimated time: ~{int(estimated_minutes)} minutes")
print(f"   (Will finish around {datetime.now().hour}:{(datetime.now().minute + int(estimated_minutes)) % 60:02d})")

# Setup callbacks
Config.MODEL_DIR.mkdir(exist_ok=True)

callbacks = [
    ModelCheckpoint(
        filepath=Config.MODEL_DIR / 'isl_model_best.h5',
        monitor='val_accuracy',
        save_best_only=True,
        mode='max',
        verbose=1
    ),
    EarlyStopping(
        monitor='val_loss',
        patience=3,
        restore_best_weights=True,
        verbose=1
    )
]

# Train
try:
    print("\n" + "="*60)
    start_time = datetime.now()
    
    history = model.fit(
        train_gen,
        validation_data=val_gen,
        epochs=Config.EPOCHS,
        callbacks=callbacks,
        verbose=1
    )
    
    end_time = datetime.now()
    training_time = (end_time - start_time).total_seconds() / 60
    
    print("\n" + "="*60)
    print("✓ Training Complete!")
    print("="*60)
    print(f"  Time taken: {training_time:.1f} minutes")
    print(f"  Final training accuracy: {history.history['accuracy'][-1]:.2%}")
    print(f"  Final validation accuracy: {history.history['val_accuracy'][-1]:.2%}")
    
    # Save final model
    model_path = Config.MODEL_DIR / 'isl_model.h5'
    model.save(model_path)
    print(f"\n✓ Model saved: {model_path}")
    
    # Save labels
    labels = {v: k for k, v in train_gen.class_indices.items()}
    labels_path = Config.MODEL_DIR / 'labels.json'
    with open(labels_path, 'w') as f:
        json.dump(labels, f, indent=2)
    print(f"✓ Labels saved: {labels_path}")
    
    # Save config
    config_dict = {
        'img_size': Config.IMG_SIZE,
        'num_classes': train_gen.num_classes,
        'class_names': list(labels.values()),
        'training_time_minutes': round(training_time, 2),
        'final_accuracy': float(history.history['accuracy'][-1]),
        'final_val_accuracy': float(history.history['val_accuracy'][-1]),
        'trained_on': datetime.now().isoformat()
    }
    config_path = Config.MODEL_DIR / 'model_config.json'
    with open(config_path, 'w') as f:
        json.dump(config_dict, f, indent=2)
    print(f"✓ Config saved: {config_path}")
    
    print("\n" + "="*60)
    print("Next Steps:")
    print("="*60)
    print("1. Convert to TFLite:")
    print("   python convert_to_tflite.py")
    print("\n2. Test the model:")
    print("   python test_model.py")
    print("\n3. Deploy to mobile app:")
    print("   Copy-Item model\\isl_model_quantized.tflite app\\assets\\models\\")
    print("="*60)
    
except KeyboardInterrupt:
    print("\n\n⚠ Training interrupted!")
    print("   Partial progress may be saved in model/isl_model_best.h5")
    
except Exception as e:
    print(f"\n\n✗ Error during training: {e}")
    import traceback
    traceback.print_exc()
