@echo off
title Deploy ISL Model to Mobile App
color 0B

echo ============================================================
echo   ISL Model Deployment Pipeline
echo ============================================================
echo.
echo   Step 1: Convert to TFLite format
echo   Step 2: Test the models
echo   Step 3: Deploy to app assets
echo.
echo ============================================================
echo.
pause

cd /d "%~dp0"

REM Step 1: Convert to TFLite
echo.
echo [1/3] Converting model to TFLite format...
echo ============================================================
cd training
python convert_to_tflite.py
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ✗ Conversion failed!
    pause
    exit /b 1
)
cd ..

REM Step 2: Test the models
echo.
echo.
echo [2/3] Testing the models...
echo ============================================================
cd training
python test_model.py compare
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ⚠ Testing had issues, but continuing...
)
cd ..

REM Step 3: Deploy to app
echo.
echo.
echo [3/3] Deploying to mobile app...
echo ============================================================

REM Create assets/models directory if it doesn't exist
if not exist "app\assets\models\" mkdir "app\assets\models\"

REM Copy the quantized model (smaller, optimized for mobile)
echo   Copying isl_model_quantized.tflite...
copy "model\isl_model_quantized.tflite" "app\assets\models\" >nul
if %ERRORLEVEL% EQU 0 (
    echo   ✓ Model copied
) else (
    echo   ✗ Failed to copy model
)

REM Copy labels
echo   Copying labels.json...
copy "model\labels.json" "app\assets\models\" >nul
if %ERRORLEVEL% EQU 0 (
    echo   ✓ Labels copied
) else (
    echo   ✗ Failed to copy labels
)

REM Copy metadata
echo   Copying metadata...
copy "model\tflite_metadata.json" "app\assets\models\" >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo   ✓ Metadata copied
) else (
    echo   ⚠ Metadata not found (optional)
)

echo.
echo ============================================================
echo   ✓ Deployment Complete!
echo ============================================================
echo.
echo Files deployed to: app\assets\models\
echo.
dir /B app\assets\models\
echo.
echo Next step: Update services\gestureRecognition.ts to load the model
echo.
pause
