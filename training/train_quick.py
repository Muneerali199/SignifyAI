"""
Quick Training Script - Optimized for faster training on CPU
This version uses smaller images and simpler model for faster results
"""

import os
import json
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping
from pathlib import Path
from datetime import datetime

# Configuration
PROJECT_ROOT = Path(__file__).parent.parent
DATA_DIR = PROJECT_ROOT / "data" / "ISL"
MODEL_DIR = PROJECT_ROOT / "model"

# Quick training settings - optimized for CPU
IMG_SIZE = (96, 96)  # Smaller for faster training
BATCH_SIZE = 128     # Larger batches
EPOCHS = 20          # Fewer epochs
LEARNING_RATE = 0.002

print("="*60)
print("  Quick ISL Model Training (CPU Optimized)")
print("="*60)
print()
print(f"Settings:")
print(f"  Image Size: {IMG_SIZE}")
print(f"  Batch Size: {BATCH_SIZE}")
print(f"  Epochs: {EPOCHS}")
print()

# Create model directory
MODEL_DIR.mkdir(exist_ok=True)

# Create data generators
print("📊 Creating data generators...")
train_datagen = ImageDataGenerator(
    validation_split=0.2,
    rescale=1./255,
    rotation_range=15,
    width_shift_range=0.15,
    height_shift_range=0.15,
    horizontal_flip=True
)

train_generator = train_datagen.flow_from_directory(
    DATA_DIR,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    subset='training'
)

val_generator = train_datagen.flow_from_directory(
    DATA_DIR,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    subset='validation'
)

num_classes = train_generator.num_classes
print(f"✓ Training samples: {train_generator.samples}")
print(f"✓ Validation samples: {val_generator.samples}")
print(f"✓ Classes: {num_classes}")
print()

# Create simplified model - faster to train
print("🏗️  Building model...")
model = keras.Sequential([
    # First block
    layers.Conv2D(32, 3, activation='relu', input_shape=(*IMG_SIZE, 3)),
    layers.MaxPooling2D(2),
    layers.Dropout(0.25),
    
    # Second block
    layers.Conv2D(64, 3, activation='relu'),
    layers.MaxPooling2D(2),
    layers.Dropout(0.25),
    
    # Third block
    layers.Conv2D(128, 3, activation='relu'),
    layers.MaxPooling2D(2),
    layers.Dropout(0.25),
    
    # Dense layers
    layers.Flatten(),
    layers.Dense(256, activation='relu'),
    layers.Dropout(0.5),
    layers.Dense(num_classes, activation='softmax')
])

model.compile(
    optimizer=keras.optimizers.Adam(learning_rate=LEARNING_RATE),
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

model.summary()
print()

# Callbacks
callbacks = [
    ModelCheckpoint(
        filepath=MODEL_DIR / 'isl_model_best.h5',
        monitor='val_accuracy',
        save_best_only=True,
        mode='max',
        verbose=1
    ),
    EarlyStopping(
        monitor='val_loss',
        patience=5,
        restore_best_weights=True,
        verbose=1
    )
]

# Train
print("🚀 Starting training...")
print(f"   Estimated time: ~{(train_generator.samples // BATCH_SIZE) * EPOCHS * 2 // 60} minutes")
print()

try:
    history = model.fit(
        train_generator,
        validation_data=val_generator,
        epochs=EPOCHS,
        callbacks=callbacks,
        verbose=1
    )
    
    print()
    print("="*60)
    print("✓ Training Complete!")
    print("="*60)
    
    # Save final model
    model_path = MODEL_DIR / 'isl_model.h5'
    model.save(model_path)
    print(f"✓ Model saved: {model_path}")
    
    # Save labels
    class_indices = train_generator.class_indices
    labels = {v: k for k, v in class_indices.items()}
    labels_path = MODEL_DIR / 'labels.json'
    with open(labels_path, 'w') as f:
        json.dump(labels, f, indent=2)
    print(f"✓ Labels saved: {labels_path}")
    
    # Save config
    config_path = MODEL_DIR / 'model_config.json'
    config = {
        'img_size': IMG_SIZE,
        'num_classes': num_classes,
        'class_names': list(labels.values()),
        'trained_on': datetime.now().isoformat(),
        'epochs_trained': len(history.history['accuracy']),
        'final_accuracy': float(history.history['accuracy'][-1]),
        'final_val_accuracy': float(history.history['val_accuracy'][-1]),
    }
    with open(config_path, 'w') as f:
        json.dump(config, f, indent=2)
    print(f"✓ Config saved: {config_path}")
    
    # Evaluate
    print()
    print("📈 Final Results:")
    print(f"  Training Accuracy: {history.history['accuracy'][-1]:.4f} ({history.history['accuracy'][-1]*100:.2f}%)")
    print(f"  Validation Accuracy: {history.history['val_accuracy'][-1]:.4f} ({history.history['val_accuracy'][-1]*100:.2f}%)")
    
    print()
    print("Next step: Convert to TFLite")
    print("  python training/convert_to_tflite.py")
    
except KeyboardInterrupt:
    print()
    print("⚠ Training interrupted by user")
    print("   Progress has been saved. You can resume or restart training.")
except Exception as e:
    print()
    print(f"✗ Training failed: {e}")
    raise
