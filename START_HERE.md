# 🎯 Start Here - ISL Model Training

Welcome! This guide will help you train your own Indian Sign Language recognition model.

## 📚 Documentation Overview

We have several guides to help you:

| Document | Purpose | When to Use |
|----------|---------|-------------|
| **TRAINING_QUICKSTART.md** | ⭐ Step-by-step quick start | Start here! |
| `SETUP_COMPLETE.md` | Overview of what was created | Understand the setup |
| `WORKFLOW_DIAGRAM.txt` | Visual workflow diagram | See the big picture |
| `training/README.md` | Complete training documentation | Detailed reference |
| `training/KAGGLE_SETUP.md` | Kaggle API setup guide | API configuration help |

## 🚀 Three Ways to Get Started

### Option 1: Interactive Script (Easiest!) ⭐

**For PowerShell (Recommended):**
```powershell
.\setup_training.ps1
```

**For Command Prompt:**
```cmd
setup_training.bat
```

The interactive script will:
- ✅ Check your Python installation
- ✅ Install dependencies
- ✅ Verify Kaggle API setup
- ✅ Provide a menu to run each step
- ✅ Run the full pipeline automatically

### Option 2: Manual Commands (Full Control)

Follow the commands in `TRAINING_QUICKSTART.md`:

```powershell
# 1. Install dependencies
pip install -r training/requirements.txt

# 2. Setup Kaggle API (see training/KAGGLE_SETUP.md)

# 3. Download dataset
cd training
python download_dataset.py

# 4. Train model
python train.py

# 5. Convert to TFLite
python convert_to_tflite.py

# 6. Test model
python test_model.py compare

# 7. Deploy to app
cd ..
Copy-Item model\isl_model_quantized.tflite app\assets\models\
Copy-Item model\labels.json app\assets\models\
```

### Option 3: Read Documentation First

1. Read `TRAINING_QUICKSTART.md` for the complete guide
2. Review `WORKFLOW_DIAGRAM.txt` to understand the process
3. Check `SETUP_COMPLETE.md` for an overview
4. Then run the commands manually or use the script

## 📋 Prerequisites

### Required
- ✅ Python 3.8 or higher
- ✅ Internet connection (for downloading dataset)
- ✅ 5+ GB free disk space
- ✅ Kaggle account (free)

### Recommended
- ⚡ NVIDIA GPU with CUDA (for faster training)
- 💾 10+ GB free disk space (for multiple datasets)
- 🔋 Stable power supply (training takes 1-3 hours)

## ⏱️ Time Estimates

| Step | Time Required |
|------|---------------|
| Setup (one-time) | ~10 minutes |
| Download dataset | ~10-15 minutes |
| **Train model** | **1-3 hours (GPU)** or 8-24 hours (CPU) |
| Convert to TFLite | ~2 minutes |
| Test model | ~2 minutes |
| Deploy to app | ~1 minute |
| **Total** | **~2-4 hours** |

## 🎯 Quick Reference

### Key Files Created

```
project/
├── training/
│   ├── download_dataset.py       # Download ISL datasets
│   ├── train.py                  # Train the model
│   ├── convert_to_tflite.py      # Convert to mobile format
│   ├── test_model.py             # Test the model
│   └── requirements.txt          # Python dependencies
│
├── data/                         # Downloaded datasets
├── model/                        # Trained models
│
├── setup_training.ps1            # Interactive PowerShell script
├── setup_training.bat            # Interactive batch script
├── TRAINING_QUICKSTART.md        # ⭐ Quick start guide
├── SETUP_COMPLETE.md             # Setup overview
└── WORKFLOW_DIAGRAM.txt          # Visual workflow
```

### Important Directories

- **`training/`** - All training scripts and documentation
- **`data/`** - Downloaded datasets (created after download)
- **`model/`** - Trained models and metadata (created after training)

### Output Files (After Training)

```
model/
├── isl_model.h5                  # Trained Keras model
├── isl_model_best.h5             # Best checkpoint
├── isl_model.tflite              # TFLite model (standard)
├── isl_model_quantized.tflite    # TFLite model (optimized) ⭐
├── labels.json                   # Class labels
├── training_history.json         # Training metrics
├── model_config.json             # Model configuration
└── tflite_metadata.json          # TFLite metadata
```

## 🔧 Troubleshooting

### Common Issues

**"Python not found"**
- Install Python 3.8+ from https://www.python.org/
- Make sure to check "Add Python to PATH" during installation

**"pip not found"**
- Python should include pip
- Try: `python -m pip install -r training/requirements.txt`

**"Kaggle API not configured"**
- See `training/KAGGLE_SETUP.md` for detailed setup instructions
- Make sure `kaggle.json` is in the right location

**"Out of memory during training"**
- Reduce batch size: Edit `train.py`, change `BATCH_SIZE = 32` to `BATCH_SIZE = 16`
- Reduce image size: Change `IMG_SIZE = (224, 224)` to `IMG_SIZE = (128, 128)`

**"Training is too slow"**
- You're probably using CPU instead of GPU
- Consider using cloud services (Google Colab, AWS, etc.)
- Or reduce dataset size for testing

### Getting Help

1. Check `TRAINING_QUICKSTART.md` for quick solutions
2. Read `training/README.md` for detailed information
3. Review `training/KAGGLE_SETUP.md` for API issues
4. Check error messages in terminal

## 📈 What to Expect

### Training Output
```
Epoch 1/50
1000/1000 [==============================] - 120s - loss: 2.5 - accuracy: 0.45
Epoch 2/50
1000/1000 [==============================] - 115s - loss: 1.8 - accuracy: 0.62
...
Epoch 20/50
1000/1000 [==============================] - 118s - loss: 0.3 - accuracy: 0.92
```

### Expected Accuracy
- **Training Accuracy**: 90-98%
- **Validation Accuracy**: 85-95%
- **Real-world Performance**: 80-90%

## ✅ Verification Checklist

Before you start:
- [ ] Python 3.8+ installed
- [ ] Internet connection available
- [ ] Kaggle account created
- [ ] 5+ GB free disk space

After setup:
- [ ] Dependencies installed successfully
- [ ] Kaggle API configured and working
- [ ] Documentation reviewed

After training:
- [ ] Dataset downloaded to `data/` folder
- [ ] Model files created in `model/` folder
- [ ] TFLite conversion completed
- [ ] Model tested successfully
- [ ] Model deployed to mobile app

## 🎓 Next Steps After Training

1. **Test in Mobile App**
   - Copy model to `app/assets/models/`
   - Update `gestureRecognition.ts`
   - Run the app: `npm run dev`

2. **Improve Model**
   - Try different architectures
   - Adjust hyperparameters
   - Add more training data
   - Increase training epochs

3. **Expand Dataset**
   - Download additional datasets
   - Combine multiple datasets
   - Add custom gestures
   - Balance class distribution

## 💡 Pro Tips

- 🚀 Start with a small test run (10 epochs) to verify everything works
- 📊 Use TensorBoard to monitor training: `tensorboard --logdir training/logs`
- 💾 Keep backups of your best models
- 🔄 Use the quantized TFLite model for better mobile performance
- ⚡ If you have a GPU, make sure TensorFlow detects it

## 📞 Support

If you encounter issues:

1. **First**: Check the troubleshooting section above
2. **Second**: Review the relevant documentation
3. **Third**: Check the error message and search online
4. **Fourth**: Review the setup in `SETUP_COMPLETE.md`

## 🎉 Ready to Start?

Choose your path:

### 🚀 Fast Start (Recommended)
```powershell
.\setup_training.ps1
```
Just run the script and follow the menu!

### 📚 Guided Start
Read `TRAINING_QUICKSTART.md` first, then run the commands manually.

### 🎯 Visual Learner
Check out `WORKFLOW_DIAGRAM.txt` to see the complete workflow.

---

**Let's train your ISL model!** 🤟

Choose any option above and follow the instructions. The entire process is automated and well-documented. Good luck! 🎓
