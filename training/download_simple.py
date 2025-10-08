"""
Simple dataset downloader that works with Kaggle API directly
"""
import os
import sys
from pathlib import Path

# Add kaggle to path if needed
try:
    import kaggle
    print("✓ Kaggle module imported successfully")
except ImportError:
    print("✗ Kaggle not installed. Installing...")
    os.system("pip install kaggle")
    import kaggle

# Set up paths
PROJECT_ROOT = Path(__file__).parent.parent
DATA_DIR = PROJECT_ROOT / "data"
DATA_DIR.mkdir(exist_ok=True)

print("\n" + "="*60)
print("  Downloading ISL Dataset from Kaggle")
print("="*60)
print()

# Dataset to download
dataset_id = "prathumarikeri/indian-sign-language-isl"
output_dir = DATA_DIR / "indian-sign-language-isl"

print(f"Dataset: {dataset_id}")
print(f"Destination: {output_dir}")
print()

# Create output directory
output_dir.mkdir(parents=True, exist_ok=True)

try:
    print("📥 Downloading dataset...")
    print("   This may take several minutes depending on your internet connection...")
    print()
    
    # Download the dataset
    kaggle.api.dataset_download_files(
        dataset_id,
        path=str(DATA_DIR),
        unzip=True,
        quiet=False
    )
    
    print()
    print("="*60)
    print("✓ Download Complete!")
    print("="*60)
    print()
    
    # Check what was downloaded
    if output_dir.exists():
        subdirs = [d for d in output_dir.iterdir() if d.is_dir()]
        if subdirs:
            print(f"📊 Dataset contains {len(subdirs)} gesture classes:")
            for subdir in subdirs[:10]:
                num_files = len(list(subdir.glob('*.*')))
                print(f"   - {subdir.name}: {num_files} files")
            if len(subdirs) > 10:
                print(f"   ... and {len(subdirs) - 10} more classes")
    
    print()
    print("Next step: Train the model")
    print("  python training/train.py")
    print()
    
except Exception as e:
    print(f"✗ Error downloading dataset: {e}")
    print()
    print("Please check:")
    print("  1. Your internet connection")
    print("  2. Kaggle API credentials are correct")
    print("  3. You have accepted the dataset terms on Kaggle website")
    sys.exit(1)
