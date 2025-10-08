# Model Training Pipeline for ISL Translator

This directory contains all the scripts and tools needed to train, convert, and test the Indian Sign Language recognition model.

## 📁 Directory Structure

```
training/
├── KAGGLE_SETUP.md          # Kaggle API setup instructions
├── download_dataset.py       # Download ISL datasets from Kaggle
├── train.py                  # Train the CNN model
├── convert_to_tflite.py      # Convert to TFLite for mobile
├── test_model.py             # Test model predictions
├── requirements.txt          # Python dependencies
└── logs/                     # TensorBoard training logs
```

## 🚀 Quick Start

### 1. Install Dependencies

```powershell
pip install -r training/requirements.txt
```

### 2. Setup Kaggle API

Follow the detailed instructions in `KAGGLE_SETUP.md`:

```powershell
# Install Kaggle CLI
pip install kaggle

# Place kaggle.json in the correct location
New-Item -Path "$env:USERPROFILE\.kaggle" -ItemType Directory -Force
# Then copy your kaggle.json to C:\Users\<YourUsername>\.kaggle\
```

### 3. Download Dataset

```powershell
cd training
python download_dataset.py
```

This will:
- Show available ISL datasets
- Download your selected dataset(s)
- Extract to `data/` directory
- Display dataset statistics

### 4. Train the Model

```powershell
python training/train.py
```

Training features:
- **Data Augmentation**: Rotation, shifts, zoom, flips
- **Model Architecture**: CNN with BatchNorm and Dropout
- **Callbacks**: ModelCheckpoint, EarlyStopping, ReduceLROnPlateau
- **Logging**: TensorBoard integration
- **Validation**: 20% validation split

Training will save:
- `model/isl_model_best.h5` - Best model during training
- `model/isl_model.h5` - Final model
- `model/labels.json` - Class labels mapping
- `model/training_history.json` - Training metrics
- `model/model_config.json` - Model configuration

### 5. Monitor Training (Optional)

```powershell
tensorboard --logdir training/logs
```

Open http://localhost:6006 to view training metrics in real-time.

### 6. Convert to TFLite

```powershell
python training/convert_to_tflite.py
```

This creates:
- `model/isl_model.tflite` - Standard TFLite model
- `model/isl_model_quantized.tflite` - Quantized (smaller, faster)
- `model/tflite_metadata.json` - Model metadata

### 7. Test the Model

```powershell
# Test Keras model
python training/test_model.py keras

# Test TFLite model
python training/test_model.py tflite

# Compare both models
python training/test_model.py compare
```

## 📊 Available Datasets

### 1. Indian Sign Language ISL Dataset
- **Kaggle ID**: `prathumarikeri/indian-sign-language-isl`
- **Type**: Image-based
- **Format**: Static gesture images
- **Classes**: Multiple ISL gestures

### 2. ISL CSLTR Dataset
- **Kaggle ID**: `drblack00/isl-csltr-indian-sign-language-dataset`
- **Type**: Video-based
- **Format**: Continuous sign language
- **Use**: Advanced sequential modeling

## 🔧 Configuration

Edit the `Config` class in `train.py` to customize:

```python
class Config:
    IMG_SIZE = (224, 224)        # Input image size
    BATCH_SIZE = 32              # Training batch size
    EPOCHS = 50                  # Maximum epochs
    LEARNING_RATE = 0.001        # Initial learning rate
    VALIDATION_SPLIT = 0.2       # 20% for validation
    
    # Data augmentation
    ROTATION_RANGE = 20
    WIDTH_SHIFT_RANGE = 0.2
    HEIGHT_SHIFT_RANGE = 0.2
    ZOOM_RANGE = 0.2
    HORIZONTAL_FLIP = True
```

## 🏗️ Model Architecture

```
Input (224x224x3)
    ↓
Conv2D(32) + BatchNorm + MaxPool + Dropout(0.25)
    ↓
Conv2D(64) + BatchNorm + MaxPool + Dropout(0.25)
    ↓
Conv2D(128) + BatchNorm + MaxPool + Dropout(0.25)
    ↓
Conv2D(256) + BatchNorm + MaxPool + Dropout(0.25)
    ↓
Flatten
    ↓
Dense(512) + BatchNorm + Dropout(0.5)
    ↓
Dense(256) + BatchNorm + Dropout(0.5)
    ↓
Dense(num_classes, softmax)
```

## 📈 Expected Results

- **Training Time**: 1-3 hours (depending on dataset size and hardware)
- **Accuracy**: 85-95% (depends on dataset quality)
- **Model Size**: 
  - Keras (.h5): ~50-100 MB
  - TFLite: ~50-100 MB
  - TFLite Quantized: ~25-50 MB

## 🐛 Troubleshooting

### "Kaggle API not configured"
- Check that `kaggle.json` is in `C:\Users\<YourUsername>\.kaggle\`
- Verify the file has correct permissions
- See `KAGGLE_SETUP.md` for detailed instructions

### "No data directory found"
- Make sure you ran `download_dataset.py` first
- Check that data was extracted to `data/` folder
- Verify dataset structure has subdirectories for each class

### "Out of memory" during training
- Reduce `BATCH_SIZE` in `train.py` (try 16 or 8)
- Reduce `IMG_SIZE` (try 128x128)
- Close other applications

### Model not training well
- Increase `EPOCHS` (try 100)
- Adjust `LEARNING_RATE` (try 0.0001)
- Add more data augmentation
- Check data quality and balance

## 🔄 Complete Pipeline

```powershell
# 1. Setup (one-time)
pip install -r training/requirements.txt
# Configure Kaggle API (see KAGGLE_SETUP.md)

# 2. Download data
python training/download_dataset.py

# 3. Train model
python training/train.py

# 4. Monitor training (optional, in separate terminal)
tensorboard --logdir training/logs

# 5. Convert to TFLite
python training/convert_to_tflite.py

# 6. Test model
python training/test_model.py compare

# 7. Deploy to mobile app
# Copy model/isl_model_quantized.tflite to app/assets/models/
```

## 📱 Integration with Mobile App

After training and conversion:

1. Copy the TFLite model:
   ```powershell
   Copy-Item model/isl_model_quantized.tflite app/assets/models/
   ```

2. Copy the labels:
   ```powershell
   Copy-Item model/labels.json app/assets/models/
   ```

3. Update `services/gestureRecognition.ts` to load the actual TFLite model

4. Test in the mobile app

## 📚 Additional Resources

- [TensorFlow Documentation](https://www.tensorflow.org/lite/guide)
- [Kaggle API Docs](https://github.com/Kaggle/kaggle-api)
- [ISL Resources](https://indiansignlanguage.org/)

## 🤝 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review training logs in `training/logs/`
3. Verify your environment setup
4. Check TensorFlow version compatibility

## 📝 Notes

- **GPU Recommended**: Training is much faster with a CUDA-compatible GPU
- **Dataset Size**: Larger datasets = better accuracy but longer training
- **Quantization**: Use quantized model for faster mobile inference
- **Continuous Training**: You can resume training from saved checkpoints
