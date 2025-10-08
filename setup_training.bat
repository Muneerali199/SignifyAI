@echo off
REM ISL Model Training Pipeline - Quick Setup Script for Windows
REM This script helps you set up and run the training pipeline

echo.
echo ========================================================
echo   ISL Sign Language Translator - Training Setup
echo ========================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://www.python.org/
    pause
    exit /b 1
)

echo [OK] Python is installed
python --version

echo.
echo ========================================================
echo   Step 1: Installing Python Dependencies
echo ========================================================
echo.

pip install -r training\requirements.txt
if errorlevel 1 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo [OK] Dependencies installed successfully
echo.

echo ========================================================
echo   Step 2: Checking Kaggle API Setup
echo ========================================================
echo.

REM Check if Kaggle is installed
kaggle --version >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Kaggle CLI not found, installing...
    pip install kaggle
)

echo [OK] Kaggle CLI is installed

REM Check if kaggle.json exists
if not exist "%USERPROFILE%\.kaggle\kaggle.json" (
    echo.
    echo [WARNING] kaggle.json not found!
    echo.
    echo Please follow these steps:
    echo   1. Go to https://www.kaggle.com/
    echo   2. Login and go to Account settings
    echo   3. Click "Create New API Token"
    echo   4. Move the downloaded kaggle.json to:
    echo      %USERPROFILE%\.kaggle\kaggle.json
    echo.
    echo Creating .kaggle directory...
    mkdir "%USERPROFILE%\.kaggle" 2>nul
    echo.
    echo Press any key after you've placed kaggle.json in the correct location...
    pause >nul
)

REM Test Kaggle API
echo.
echo Testing Kaggle API...
kaggle datasets list --max-size 1 >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Kaggle API test failed
    echo Please check your kaggle.json file
    pause
    exit /b 1
)

echo [OK] Kaggle API is configured correctly
echo.

echo ========================================================
echo   Setup Complete!
echo ========================================================
echo.
echo Next steps:
echo   1. Download dataset:    training\download_dataset.py
echo   2. Train model:         training\train.py
echo   3. Convert to TFLite:   training\convert_to_tflite.py
echo   4. Test model:          training\test_model.py
echo.
echo For detailed instructions, see TRAINING_QUICKSTART.md
echo.

:menu
echo ========================================================
echo   What would you like to do?
echo ========================================================
echo.
echo   1. Download dataset
echo   2. Train model
echo   3. Convert to TFLite
echo   4. Test model
echo   5. Run full pipeline (all steps)
echo   6. Open documentation
echo   7. Exit
echo.
set /p choice="Enter your choice (1-7): "

if "%choice%"=="1" goto download
if "%choice%"=="2" goto train
if "%choice%"=="3" goto convert
if "%choice%"=="4" goto test
if "%choice%"=="5" goto full
if "%choice%"=="6" goto docs
if "%choice%"=="7" goto end
echo Invalid choice!
goto menu

:download
echo.
echo ========================================================
echo   Downloading Dataset
echo ========================================================
echo.
cd training
python download_dataset.py
cd ..
echo.
echo Press any key to return to menu...
pause >nul
goto menu

:train
echo.
echo ========================================================
echo   Training Model
echo ========================================================
echo.
if not exist "data\indian-sign-language-isl" (
    echo [ERROR] Dataset not found!
    echo Please download the dataset first (option 1)
    pause
    goto menu
)
cd training
python train.py
cd ..
echo.
echo Press any key to return to menu...
pause >nul
goto menu

:convert
echo.
echo ========================================================
echo   Converting to TFLite
echo ========================================================
echo.
if not exist "model\isl_model.h5" (
    echo [ERROR] Trained model not found!
    echo Please train the model first (option 2)
    pause
    goto menu
)
cd training
python convert_to_tflite.py
cd ..
echo.
echo Press any key to return to menu...
pause >nul
goto menu

:test
echo.
echo ========================================================
echo   Testing Model
echo ========================================================
echo.
if not exist "model\isl_model.h5" (
    echo [ERROR] Trained model not found!
    echo Please train the model first (option 2)
    pause
    goto menu
)
cd training
python test_model.py compare
cd ..
echo.
echo Press any key to return to menu...
pause >nul
goto menu

:full
echo.
echo ========================================================
echo   Running Full Pipeline
echo ========================================================
echo.
echo This will:
echo   1. Download dataset
echo   2. Train model
echo   3. Convert to TFLite
echo   4. Test model
echo.
echo This may take 2-4 hours depending on your hardware.
echo.
set /p confirm="Continue? (y/n): "
if /i not "%confirm%"=="y" goto menu

echo.
echo Step 1/4: Downloading dataset...
cd training
python download_dataset.py
if errorlevel 1 goto error

echo.
echo Step 2/4: Training model...
python train.py
if errorlevel 1 goto error

echo.
echo Step 3/4: Converting to TFLite...
python convert_to_tflite.py
if errorlevel 1 goto error

echo.
echo Step 4/4: Testing model...
python test_model.py compare
cd ..

echo.
echo ========================================================
echo   Full Pipeline Complete!
echo ========================================================
echo.
echo Your trained model is ready in the model/ directory.
echo.
echo To deploy to mobile app:
echo   Copy-Item model\isl_model_quantized.tflite app\assets\models\
echo   Copy-Item model\labels.json app\assets\models\
echo.
pause
goto menu

:error
echo.
echo [ERROR] Pipeline failed!
echo Please check the error messages above.
cd ..
pause
goto menu

:docs
echo.
echo Opening documentation...
start TRAINING_QUICKSTART.md
goto menu

:end
echo.
echo Thank you for using ISL Training Pipeline!
echo.
pause
exit /b 0
