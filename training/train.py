"""
Train Indian Sign Language Recognition Model

This script trains a deep learning model for ISL gesture recognition
using image data from Kaggle datasets.
"""

import os
import json
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, ReduceLROnPlateau, TensorBoard
from pathlib import Path
from datetime import datetime

# Configuration
class Config:
    # Paths
    PROJECT_ROOT = Path(__file__).parent.parent
    DATA_DIR = PROJECT_ROOT / "data" / "ISL"
    MODEL_DIR = PROJECT_ROOT / "model"
    LOGS_DIR = PROJECT_ROOT / "training" / "logs"
    
    # Model hyperparameters
    IMG_SIZE = (128, 128)  # Reduced for faster training
    BATCH_SIZE = 64        # Increased for faster processing
    EPOCHS = 30            # Reduced epochs (can still get good results)
    LEARNING_RATE = 0.001
    
    # Data augmentation
    ROTATION_RANGE = 20
    WIDTH_SHIFT_RANGE = 0.2
    HEIGHT_SHIFT_RANGE = 0.2
    ZOOM_RANGE = 0.2
    HORIZONTAL_FLIP = True
    
    # Training
    VALIDATION_SPLIT = 0.2
    EARLY_STOPPING_PATIENCE = 10
    REDUCE_LR_PATIENCE = 5

def check_data_directory():
    """Check if data directory exists and contains data"""
    if not Config.DATA_DIR.exists():
        print(f"✗ Data directory not found: {Config.DATA_DIR}")
        print("\nPlease download the dataset first:")
        print("  python training/download_dataset.py")
        return False
    
    # Check for subdirectories (gesture classes)
    subdirs = [d for d in Config.DATA_DIR.iterdir() if d.is_dir()]
    if not subdirs:
        print(f"✗ No gesture classes found in {Config.DATA_DIR}")
        return False
    
    print(f"✓ Found {len(subdirs)} gesture classes")
    print(f"  Classes: {', '.join([d.name for d in subdirs[:5]])}")
    if len(subdirs) > 5:
        print(f"  ... and {len(subdirs) - 5} more")
    
    return True

def create_data_generators():
    """Create data generators for training and validation"""
    
    print("\n📊 Creating data generators...")
    
    # Training data augmentation
    train_datagen = ImageDataGenerator(
        validation_split=Config.VALIDATION_SPLIT,
        rescale=1./255,
        rotation_range=Config.ROTATION_RANGE,
        width_shift_range=Config.WIDTH_SHIFT_RANGE,
        height_shift_range=Config.HEIGHT_SHIFT_RANGE,
        zoom_range=Config.ZOOM_RANGE,
        horizontal_flip=Config.HORIZONTAL_FLIP,
        fill_mode='nearest'
    )
    
    # Validation data (only rescaling)
    val_datagen = ImageDataGenerator(
        validation_split=Config.VALIDATION_SPLIT,
        rescale=1./255
    )
    
    # Training generator
    train_generator = train_datagen.flow_from_directory(
        Config.DATA_DIR,
        target_size=Config.IMG_SIZE,
        batch_size=Config.BATCH_SIZE,
        class_mode='categorical',
        subset='training',
        shuffle=True
    )
    
    # Validation generator
    val_generator = val_datagen.flow_from_directory(
        Config.DATA_DIR,
        target_size=Config.IMG_SIZE,
        batch_size=Config.BATCH_SIZE,
        class_mode='categorical',
        subset='validation',
        shuffle=False
    )
    
    print(f"✓ Training samples: {train_generator.samples}")
    print(f"✓ Validation samples: {val_generator.samples}")
    print(f"✓ Number of classes: {train_generator.num_classes}")
    
    return train_generator, val_generator

def create_model(num_classes):
    """Create CNN model for gesture recognition"""
    
    print("\n🏗️  Building model...")
    
    model = keras.Sequential([
        # First convolutional block
        layers.Conv2D(32, (3, 3), activation='relu', 
                     input_shape=(*Config.IMG_SIZE, 3)),
        layers.BatchNormalization(),
        layers.MaxPooling2D((2, 2)),
        layers.Dropout(0.25),
        
        # Second convolutional block
        layers.Conv2D(64, (3, 3), activation='relu'),
        layers.BatchNormalization(),
        layers.MaxPooling2D((2, 2)),
        layers.Dropout(0.25),
        
        # Third convolutional block
        layers.Conv2D(128, (3, 3), activation='relu'),
        layers.BatchNormalization(),
        layers.MaxPooling2D((2, 2)),
        layers.Dropout(0.25),
        
        # Fourth convolutional block
        layers.Conv2D(256, (3, 3), activation='relu'),
        layers.BatchNormalization(),
        layers.MaxPooling2D((2, 2)),
        layers.Dropout(0.25),
        
        # Flatten and dense layers
        layers.Flatten(),
        layers.Dense(512, activation='relu'),
        layers.BatchNormalization(),
        layers.Dropout(0.5),
        layers.Dense(256, activation='relu'),
        layers.BatchNormalization(),
        layers.Dropout(0.5),
        layers.Dense(num_classes, activation='softmax')
    ])
    
    # Compile model
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=Config.LEARNING_RATE),
        loss='categorical_crossentropy',
        metrics=['accuracy', keras.metrics.TopKCategoricalAccuracy(k=3, name='top_3_accuracy')]
    )
    
    # Print model summary
    model.summary()
    
    return model

def create_callbacks():
    """Create training callbacks"""
    
    # Create directories
    Config.MODEL_DIR.mkdir(exist_ok=True)
    Config.LOGS_DIR.mkdir(exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    callbacks = [
        # Save best model
        ModelCheckpoint(
            filepath=Config.MODEL_DIR / 'isl_model_best.h5',
            monitor='val_accuracy',
            save_best_only=True,
            mode='max',
            verbose=1
        ),
        
        # Early stopping
        EarlyStopping(
            monitor='val_loss',
            patience=Config.EARLY_STOPPING_PATIENCE,
            restore_best_weights=True,
            verbose=1
        ),
        
        # Reduce learning rate on plateau
        ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=Config.REDUCE_LR_PATIENCE,
            min_lr=1e-7,
            verbose=1
        ),
        
        # TensorBoard logging
        TensorBoard(
            log_dir=Config.LOGS_DIR / f'run_{timestamp}',
            histogram_freq=1,
            write_graph=True
        )
    ]
    
    return callbacks

def train_model(model, train_gen, val_gen):
    """Train the model"""
    
    print("\n🚀 Starting training...")
    print(f"   Epochs: {Config.EPOCHS}")
    print(f"   Batch size: {Config.BATCH_SIZE}")
    print(f"   Learning rate: {Config.LEARNING_RATE}")
    
    history = model.fit(
        train_gen,
        validation_data=val_gen,
        epochs=Config.EPOCHS,
        callbacks=create_callbacks(),
        verbose=1
    )
    
    return history

def save_model_and_metadata(model, train_gen, history):
    """Save final model and training metadata"""
    
    print("\n💾 Saving model...")
    
    # Save final model
    model_path = Config.MODEL_DIR / 'isl_model.h5'
    model.save(model_path)
    print(f"✓ Model saved: {model_path}")
    
    # Save class labels
    class_indices = train_gen.class_indices
    labels = {v: k for k, v in class_indices.items()}
    
    labels_path = Config.MODEL_DIR / 'labels.json'
    with open(labels_path, 'w') as f:
        json.dump(labels, f, indent=2)
    print(f"✓ Labels saved: {labels_path}")
    
    # Save training history
    history_path = Config.MODEL_DIR / 'training_history.json'
    history_dict = {
        'accuracy': [float(x) for x in history.history['accuracy']],
        'val_accuracy': [float(x) for x in history.history['val_accuracy']],
        'loss': [float(x) for x in history.history['loss']],
        'val_loss': [float(x) for x in history.history['val_loss']],
    }
    with open(history_path, 'w') as f:
        json.dump(history_dict, f, indent=2)
    print(f"✓ Training history saved: {history_path}")
    
    # Save model configuration
    config_path = Config.MODEL_DIR / 'model_config.json'
    config_dict = {
        'img_size': Config.IMG_SIZE,
        'num_classes': len(labels),
        'class_names': list(labels.values()),
        'trained_on': datetime.now().isoformat(),
        'epochs_trained': len(history.history['accuracy']),
        'final_accuracy': float(history.history['accuracy'][-1]),
        'final_val_accuracy': float(history.history['val_accuracy'][-1]),
    }
    with open(config_path, 'w') as f:
        json.dump(config_dict, f, indent=2)
    print(f"✓ Model config saved: {config_path}")

def evaluate_model(model, val_gen):
    """Evaluate model on validation set"""
    
    print("\n📈 Evaluating model...")
    
    results = model.evaluate(val_gen)
    
    print(f"\n{'='*60}")
    print("Final Evaluation Results:")
    print(f"{'='*60}")
    print(f"  Loss: {results[0]:.4f}")
    print(f"  Accuracy: {results[1]:.4f} ({results[1]*100:.2f}%)")
    if len(results) > 2:
        print(f"  Top-3 Accuracy: {results[2]:.4f} ({results[2]*100:.2f}%)")
    print(f"{'='*60}")

def main():
    print("="*60)
    print("  Indian Sign Language Model Training")
    print("="*60)
    
    # Check if GPU is available
    gpus = tf.config.list_physical_devices('GPU')
    if gpus:
        print(f"\n✓ GPU available: {len(gpus)} device(s)")
        for gpu in gpus:
            print(f"  - {gpu.name}")
    else:
        print("\n⚠ No GPU detected - training will use CPU (slower)")
    
    # Check data directory
    if not check_data_directory():
        return
    
    # Create data generators
    train_gen, val_gen = create_data_generators()
    
    # Create model
    model = create_model(train_gen.num_classes)
    
    # Train model
    history = train_model(model, train_gen, val_gen)
    
    # Evaluate model
    evaluate_model(model, val_gen)
    
    # Save model and metadata
    save_model_and_metadata(model, train_gen, history)
    
    print("\n" + "="*60)
    print("✓ Training Complete!")
    print("="*60)
    print("\nNext steps:")
    print("  1. Review training logs: tensorboard --logdir training/logs")
    print("  2. Convert to TFLite: python training/convert_to_tflite.py")
    print("  3. Test model: python training/test_model.py")
    print("="*60)

if __name__ == "__main__":
    main()
