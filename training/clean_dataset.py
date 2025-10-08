"""
Clean dataset by removing corrupted or invalid image files
"""
import os
from pathlib import Path
from PIL import Image
import shutil

PROJECT_ROOT = Path(__file__).parent.parent
DATA_DIR = PROJECT_ROOT / "data" / "ISL"

print("="*60)
print("  Cleaning Dataset - Removing Corrupted Images")
print("="*60)
print()

corrupted_files = []
valid_images = 0
total_files = 0

# Check all images in all class folders
for class_dir in DATA_DIR.iterdir():
    if not class_dir.is_dir():
        continue
    
    print(f"Checking class: {class_dir.name}")
    
    for img_file in class_dir.iterdir():
        if not img_file.is_file():
            continue
        
        total_files += 1
        
        try:
            # Try to open and verify the image
            with Image.open(img_file) as img:
                img.verify()  # Verify it's a valid image
            
            # If verification passed, try to load it
            with Image.open(img_file) as img:
                img.load()  # Actually load the image data
            
            valid_images += 1
            
        except Exception as e:
            print(f"  ✗ Corrupted: {img_file.name} - {str(e)[:50]}")
            corrupted_files.append(img_file)

print()
print("="*60)
print("  Scan Complete")
print("="*60)
print(f"Total files scanned: {total_files}")
print(f"Valid images: {valid_images}")
print(f"Corrupted images: {len(corrupted_files)}")
print()

if corrupted_files:
    print("Removing corrupted files...")
    for file_path in corrupted_files:
        try:
            file_path.unlink()
            print(f"  ✓ Removed: {file_path.name}")
        except Exception as e:
            print(f"  ✗ Failed to remove {file_path.name}: {e}")
    
    print()
    print(f"✓ Cleaned {len(corrupted_files)} corrupted files")
else:
    print("✓ No corrupted files found!")

print()
print("Dataset is now clean and ready for training!")
print(f"Total valid images: {valid_images}")
