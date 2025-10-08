# Data Directory

This directory will store downloaded ISL datasets.

## Usage

Download datasets using:

```powershell
python training/download_dataset.py
```

## Expected Structure

After downloading, you'll have:

```
data/
├── indian-sign-language-isl/
│   ├── Hello/
│   │   ├── image1.jpg
│   │   ├── image2.jpg
│   │   └── ...
│   ├── ThankYou/
│   ├── Sorry/
│   └── ... (other gesture classes)
│
└── isl-csltr/
    └── ... (video-based dataset)
```

## Dataset Sources

All datasets are downloaded from Kaggle:
- `prathumarikeri/indian-sign-language-isl` - Image-based ISL
- `drblack00/isl-csltr-indian-sign-language-dataset` - Video-based ISL

## Note

This directory is gitignored to avoid committing large dataset files.
Always download datasets fresh using the download script.
