@echo off
title ISL Model Training - Please Do Not Close
color 0A

echo ============================================================
echo   ISL Sign Language Model Training
echo ============================================================
echo.
echo   This window will train your ISL recognition model.
echo   
echo   Time Required: Approximately 15-20 minutes
echo   
echo   IMPORTANT: 
echo   - Do NOT close this window
echo   - Do NOT press Ctrl+C
echo   - Let it complete fully
echo.
echo   You can minimize this window and do other work.
echo   The training will continue in the background.
echo.
echo ============================================================
echo.
pause

cd /d "%~dp0training"

echo.
echo Starting training...
echo.
echo Progress will be shown below:
echo ============================================================
echo.

python train_fast.py

echo.
echo.
echo ============================================================
echo   Training Complete!
echo ============================================================
echo.
echo Check the model folder for your trained model files.
echo.
echo Next steps:
echo   1. Convert to TFLite: python convert_to_tflite.py
echo   2. Test model: python test_model.py
echo   3. Deploy to app
echo.
pause
