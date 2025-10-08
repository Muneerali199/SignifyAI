# 🚀 Quick Start Guide - ISL Model Training

This guide will get you from zero to trained model in ~30 minutes (excluding training time).

## Step-by-Step Instructions

### 1️⃣ Install Python Dependencies (2 minutes)

```powershell
# Navigate to project directory
cd "c:\Users\Muneer Ali Subzwari\Downloads\project-bolt-sb1-6u9ncbhn\project"

# Install required packages
pip install -r training/requirements.txt
```

### 2️⃣ Setup Kaggle API (5 minutes)

**a) Install Kaggle CLI:**
```powershell
pip install kaggle
```

**b) Get API Credentials:**
1. Go to https://www.kaggle.com/
2. Login to your account
3. Click on your profile picture (top right) → **Account**
4. Scroll to **API** section → Click **Create New API Token**
5. This downloads `kaggle.json`

**c) Place Credentials:**
```powershell
# Create .kaggle directory
New-Item -Path "$env:USERPROFILE\.kaggle" -ItemType Directory -Force

# Copy kaggle.json to the directory
# Manually move Downloads\kaggle.json to C:\Users\<YourUsername>\.kaggle\
```

**d) Verify Setup:**
```powershell
kaggle datasets list
```
If you see a list of datasets, you're good to go! ✓

### 3️⃣ Download ISL Dataset (5-10 minutes)

```powershell
cd training
python download_dataset.py
```

- Select option `1` for Indian Sign Language ISL Dataset
- Wait for download and extraction to complete
- Dataset will be in `data/indian-sign-language-isl/`

### 4️⃣ Train the Model (1-3 hours depending on hardware)

```powershell
python train.py
```

What happens:
- ✓ Loads and preprocesses images
- ✓ Applies data augmentation
- ✓ Trains CNN model
- ✓ Saves best model checkpoint
- ✓ Generates training metrics

**Pro Tip**: Open another terminal and monitor training:
```powershell
tensorboard --logdir logs
# Visit http://localhost:6006
```

### 5️⃣ Convert to TFLite (2 minutes)

```powershell
python convert_to_tflite.py
```

Creates:
- `model/isl_model.tflite` - Standard
- `model/isl_model_quantized.tflite` - Optimized for mobile

### 6️⃣ Test Your Model (1 minute)

```powershell
python test_model.py compare
```

This tests both Keras and TFLite models with random images.

### 7️⃣ Deploy to Mobile App (1 minute)

```powershell
# Copy quantized model to app assets
Copy-Item ..\model\isl_model_quantized.tflite ..\app\assets\models\
Copy-Item ..\model\labels.json ..\app\assets\models\
```

## ✅ Verification Checklist

- [ ] Python dependencies installed
- [ ] Kaggle API configured (`kaggle datasets list` works)
- [ ] Dataset downloaded to `data/` folder
- [ ] Model trained successfully (files in `model/` folder)
- [ ] TFLite conversion completed
- [ ] Model tested with sample images
- [ ] Model files copied to app assets

## 🎯 Expected Output

After completion, you should have:

```
project/
├── data/
│   └── indian-sign-language-isl/  (Downloaded dataset)
├── model/
│   ├── isl_model.h5               (Trained Keras model)
│   ├── isl_model_best.h5          (Best checkpoint)
│   ├── isl_model.tflite           (TFLite model)
│   ├── isl_model_quantized.tflite (Optimized TFLite)
│   ├── labels.json                (Class labels)
│   └── model_config.json          (Model info)
└── training/
    └── logs/                       (Training logs)
```

## ⚡ Quick Commands Reference

```powershell
# Full pipeline in one go (after Kaggle setup):
cd training
python download_dataset.py      # Select dataset
python train.py                  # Train model
python convert_to_tflite.py      # Convert to mobile format
python test_model.py compare     # Verify models

# Copy to app
cd ..
Copy-Item model\isl_model_quantized.tflite app\assets\models\
Copy-Item model\labels.json app\assets\models\
```

## 🐛 Common Issues

**"Kaggle API not configured"**
- Check `kaggle.json` is in `C:\Users\<YourUsername>\.kaggle\`
- Verify JSON file has correct format

**"No data directory found"**
- Run `download_dataset.py` first
- Check that extraction completed successfully

**"Out of memory" during training**
- Edit `train.py`: Change `BATCH_SIZE = 32` to `BATCH_SIZE = 16`
- Or reduce `IMG_SIZE = (224, 224)` to `IMG_SIZE = (128, 128)`

**Training is very slow**
- You're likely using CPU instead of GPU
- Consider using Google Colab (free GPU) or AWS
- Or let it run overnight

## 🎓 Next Steps

1. **Improve Model**: Try different architectures, hyperparameters
2. **More Data**: Download additional datasets
3. **Integration**: Update mobile app to use real model
4. **Testing**: Test with real-world gesture videos

## 📚 Resources

- Full documentation: `training/README.md`
- Kaggle setup: `training/KAGGLE_SETUP.md`
- Model info: `model/README.md`

## 💡 Tips

- **GPU Recommended**: Training is 10-100x faster with GPU
- **Start Small**: Test with fewer epochs first (change `EPOCHS = 10`)
- **Monitor Training**: Use TensorBoard to watch progress
- **Save Often**: Model checkpoints are saved automatically

---

**Need Help?** Check the detailed guides in the `training/` directory!
