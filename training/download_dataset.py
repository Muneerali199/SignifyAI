"""
Download Indian Sign Language datasets from Kaggle

This script downloads and extracts ISL datasets for training.
Make sure you have set up the Kaggle API first (see KAGGLE_SETUP.md)
"""

import os
import sys
import subprocess
import zipfile
from pathlib import Path

# Get project root directory
PROJECT_ROOT = Path(__file__).parent.parent
DATA_DIR = PROJECT_ROOT / "data"

# Ensure data directory exists
DATA_DIR.mkdir(exist_ok=True)

# Available datasets
DATASETS = {
    "1": {
        "name": "indian-sign-language-isl",
        "kaggle_id": "prathumarikeri/indian-sign-language-isl",
        "description": "Indian Sign Language Dataset (Image-based)"
    },
    "2": {
        "name": "isl-csltr",
        "kaggle_id": "drblack00/isl-csltr-indian-sign-language-dataset",
        "description": "ISL CSLTR Dataset (Video-based continuous sign language)"
    },
    "3": {
        "name": "both",
        "kaggle_id": "both",
        "description": "Download both datasets"
    }
}

def check_kaggle_setup():
    """Check if Kaggle API is properly configured"""
    try:
        result = subprocess.run(
            ["kaggle", "datasets", "list", "--max-size", "1"],
            capture_output=True,
            text=True,
            check=True
        )
        print("✓ Kaggle API is configured correctly")
        return True
    except subprocess.CalledProcessError:
        print("✗ Kaggle API is not configured properly")
        print("\nPlease follow the setup instructions in KAGGLE_SETUP.md")
        return False
    except FileNotFoundError:
        print("✗ Kaggle CLI is not installed")
        print("\nInstall it with: pip install kaggle")
        return False

def download_dataset(kaggle_id, dataset_name):
    """Download and extract a dataset from Kaggle"""
    
    dataset_path = DATA_DIR / dataset_name
    
    # Check if dataset already exists
    if dataset_path.exists() and any(dataset_path.iterdir()):
        print(f"\n⚠ Dataset '{dataset_name}' already exists")
        overwrite = input("Do you want to re-download it? (y/n): ").lower()
        if overwrite != 'y':
            print(f"Skipping {dataset_name}")
            return True
    
    dataset_path.mkdir(exist_ok=True)
    
    print(f"\n📥 Downloading {dataset_name}...")
    print(f"   Kaggle ID: {kaggle_id}")
    
    try:
        # Change to data directory
        os.chdir(DATA_DIR)
        
        # Download dataset using Kaggle API
        subprocess.run(
            ["kaggle", "datasets", "download", "-d", kaggle_id],
            check=True
        )
        
        # Find the downloaded zip file
        zip_files = list(DATA_DIR.glob(f"*.zip"))
        if not zip_files:
            print(f"✗ No zip file found for {dataset_name}")
            return False
        
        # Use the most recently downloaded zip
        zip_file = max(zip_files, key=os.path.getctime)
        
        print(f"📦 Extracting {zip_file.name}...")
        
        # Extract the dataset
        with zipfile.ZipFile(zip_file, 'r') as zip_ref:
            zip_ref.extractall(dataset_path)
        
        # Remove the zip file
        zip_file.unlink()
        
        print(f"✓ Successfully downloaded and extracted {dataset_name}")
        print(f"   Location: {dataset_path}")
        
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"✗ Failed to download {dataset_name}")
        print(f"   Error: {e}")
        return False
    except Exception as e:
        print(f"✗ Error processing {dataset_name}: {e}")
        return False
    finally:
        # Change back to original directory
        os.chdir(PROJECT_ROOT)

def show_dataset_info(dataset_path):
    """Show information about the downloaded dataset"""
    if not dataset_path.exists():
        return
    
    print(f"\n📊 Dataset Structure:")
    
    # Count subdirectories (gesture classes)
    subdirs = [d for d in dataset_path.iterdir() if d.is_dir()]
    if subdirs:
        print(f"   Classes found: {len(subdirs)}")
        print(f"   Classes: {', '.join([d.name for d in subdirs[:10]])}")
        if len(subdirs) > 10:
            print(f"   ... and {len(subdirs) - 10} more")
        
        # Count total files
        total_files = sum(len(list(d.glob('*.*'))) for d in subdirs)
        print(f"   Total files: {total_files}")
    else:
        files = list(dataset_path.glob('**/*.*'))
        print(f"   Total files: {len(files)}")

def main():
    print("=" * 60)
    print("  Indian Sign Language Dataset Downloader")
    print("=" * 60)
    
    # Check Kaggle API setup
    if not check_kaggle_setup():
        sys.exit(1)
    
    # Show available datasets
    print("\nAvailable datasets:")
    for key, dataset in DATASETS.items():
        print(f"  {key}. {dataset['description']}")
    
    # Get user choice
    choice = input("\nSelect dataset to download (1-3): ").strip()
    
    if choice not in DATASETS:
        print("Invalid choice!")
        sys.exit(1)
    
    # Download selected dataset(s)
    if choice == "3":
        # Download both
        success1 = download_dataset(
            DATASETS["1"]["kaggle_id"],
            DATASETS["1"]["name"]
        )
        success2 = download_dataset(
            DATASETS["2"]["kaggle_id"],
            DATASETS["2"]["name"]
        )
        
        if success1:
            show_dataset_info(DATA_DIR / DATASETS["1"]["name"])
        if success2:
            show_dataset_info(DATA_DIR / DATASETS["2"]["name"])
    else:
        # Download single dataset
        dataset = DATASETS[choice]
        success = download_dataset(dataset["kaggle_id"], dataset["name"])
        
        if success:
            show_dataset_info(DATA_DIR / dataset["name"])
    
    print("\n" + "=" * 60)
    print("✓ Download complete!")
    print("=" * 60)
    print("\nNext steps:")
    print("  1. Review the downloaded data in the 'data' folder")
    print("  2. Run training: python training/train.py")
    print("=" * 60)

if __name__ == "__main__":
    main()
