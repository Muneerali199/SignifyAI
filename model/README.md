# Model files will be saved here after training

## Directory Contents

After running the training pipeline, this directory will contain:

- `isl_model.h5` - Final trained Keras model
- `isl_model_best.h5` - Best model checkpoint during training
- `isl_model.tflite` - TensorFlow Lite model (standard)
- `isl_model_quantized.tflite` - TensorFlow Lite model (quantized for mobile)
- `labels.json` - Class label mappings
- `training_history.json` - Training metrics history
- `model_config.json` - Model configuration and metadata
- `tflite_metadata.json` - TFLite model metadata

## Usage

To train the model:

```powershell
python training/train.py
```

To convert to TFLite:

```powershell
python training/convert_to_tflite.py
```

## Deployment

Copy the quantized TFLite model to your mobile app:

```powershell
Copy-Item isl_model_quantized.tflite ../app/assets/models/
```
