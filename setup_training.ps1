# ISL Model Training Pipeline - Quick Setup Script for PowerShell
# Run this script to set up and execute the training pipeline

function Write-Header {
    param([string]$Text)
    Write-Host ""
    Write-Host "=" * 60 -ForegroundColor Cyan
    Write-Host "  $Text" -ForegroundColor Cyan
    Write-Host "=" * 60 -ForegroundColor Cyan
    Write-Host ""
}

function Write-Success {
    param([string]$Text)
    Write-Host "[OK] $Text" -ForegroundColor Green
}

function Write-Error {
    param([string]$Text)
    Write-Host "[ERROR] $Text" -ForegroundColor Red
}

function Write-Warning {
    param([string]$Text)
    Write-Host "[WARNING] $Text" -ForegroundColor Yellow
}

function Test-Python {
    Write-Header "Checking Python Installation"
    try {
        $version = python --version 2>&1
        Write-Success "Python is installed: $version"
        return $true
    }
    catch {
        Write-Error "Python is not installed or not in PATH"
        Write-Host "Please install Python 3.8+ from https://www.python.org/" -ForegroundColor Yellow
        return $false
    }
}

function Install-Dependencies {
    Write-Header "Installing Python Dependencies"
    try {
        pip install -r training/requirements.txt
        Write-Success "Dependencies installed successfully"
        return $true
    }
    catch {
        Write-Error "Failed to install dependencies"
        return $false
    }
}

function Test-KaggleAPI {
    Write-Header "Checking Kaggle API Setup"
    
    # Check if Kaggle CLI is installed
    try {
        $null = kaggle --version 2>&1
        Write-Success "Kaggle CLI is installed"
    }
    catch {
        Write-Warning "Kaggle CLI not found, installing..."
        pip install kaggle
    }
    
    # Check if kaggle.json exists
    $kagglePath = Join-Path $env:USERPROFILE ".kaggle\kaggle.json"
    if (-not (Test-Path $kagglePath)) {
        Write-Warning "kaggle.json not found!"
        Write-Host ""
        Write-Host "Please follow these steps:" -ForegroundColor Yellow
        Write-Host "  1. Go to https://www.kaggle.com/" -ForegroundColor Yellow
        Write-Host "  2. Login and go to Account settings" -ForegroundColor Yellow
        Write-Host "  3. Click 'Create New API Token'" -ForegroundColor Yellow
        Write-Host "  4. Move the downloaded kaggle.json to:" -ForegroundColor Yellow
        Write-Host "     $kagglePath" -ForegroundColor Cyan
        Write-Host ""
        
        # Create .kaggle directory
        $kaggleDir = Join-Path $env:USERPROFILE ".kaggle"
        if (-not (Test-Path $kaggleDir)) {
            New-Item -ItemType Directory -Path $kaggleDir -Force | Out-Null
            Write-Success "Created .kaggle directory"
        }
        
        Write-Host "Press any key after you've placed kaggle.json in the correct location..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    }
    
    # Test Kaggle API
    Write-Host ""
    Write-Host "Testing Kaggle API..." -ForegroundColor Cyan
    try {
        $null = kaggle datasets list --max-size 1 2>&1
        Write-Success "Kaggle API is configured correctly"
        return $true
    }
    catch {
        Write-Error "Kaggle API test failed"
        Write-Host "Please check your kaggle.json file" -ForegroundColor Yellow
        return $false
    }
}

function Show-Menu {
    Write-Host ""
    Write-Header "What would you like to do?"
    Write-Host "  1. Download dataset" -ForegroundColor White
    Write-Host "  2. Train model" -ForegroundColor White
    Write-Host "  3. Convert to TFLite" -ForegroundColor White
    Write-Host "  4. Test model" -ForegroundColor White
    Write-Host "  5. Run full pipeline (all steps)" -ForegroundColor White
    Write-Host "  6. Open documentation" -ForegroundColor White
    Write-Host "  7. Exit" -ForegroundColor White
    Write-Host ""
    
    $choice = Read-Host "Enter your choice (1-7)"
    return $choice
}

function Start-Download {
    Write-Header "Downloading Dataset"
    Push-Location training
    python download_dataset.py
    Pop-Location
    Write-Host ""
    Write-Host "Press any key to return to menu..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

function Start-Training {
    Write-Header "Training Model"
    
    if (-not (Test-Path "data\indian-sign-language-isl")) {
        Write-Error "Dataset not found!"
        Write-Host "Please download the dataset first (option 1)" -ForegroundColor Yellow
        Start-Sleep -Seconds 2
        return
    }
    
    Push-Location training
    python train.py
    Pop-Location
    Write-Host ""
    Write-Host "Press any key to return to menu..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

function Start-Conversion {
    Write-Header "Converting to TFLite"
    
    if (-not (Test-Path "model\isl_model.h5")) {
        Write-Error "Trained model not found!"
        Write-Host "Please train the model first (option 2)" -ForegroundColor Yellow
        Start-Sleep -Seconds 2
        return
    }
    
    Push-Location training
    python convert_to_tflite.py
    Pop-Location
    Write-Host ""
    Write-Host "Press any key to return to menu..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

function Start-Testing {
    Write-Header "Testing Model"
    
    if (-not (Test-Path "model\isl_model.h5")) {
        Write-Error "Trained model not found!"
        Write-Host "Please train the model first (option 2)" -ForegroundColor Yellow
        Start-Sleep -Seconds 2
        return
    }
    
    Push-Location training
    python test_model.py compare
    Pop-Location
    Write-Host ""
    Write-Host "Press any key to return to menu..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

function Start-FullPipeline {
    Write-Header "Running Full Pipeline"
    Write-Host "This will:" -ForegroundColor Cyan
    Write-Host "  1. Download dataset" -ForegroundColor White
    Write-Host "  2. Train model" -ForegroundColor White
    Write-Host "  3. Convert to TFLite" -ForegroundColor White
    Write-Host "  4. Test model" -ForegroundColor White
    Write-Host ""
    Write-Host "This may take 2-4 hours depending on your hardware." -ForegroundColor Yellow
    Write-Host ""
    
    $confirm = Read-Host "Continue? (y/n)"
    if ($confirm -ne "y") {
        return
    }
    
    try {
        Push-Location training
        
        Write-Host ""
        Write-Host "Step 1/4: Downloading dataset..." -ForegroundColor Cyan
        python download_dataset.py
        if ($LASTEXITCODE -ne 0) { throw "Download failed" }
        
        Write-Host ""
        Write-Host "Step 2/4: Training model..." -ForegroundColor Cyan
        python train.py
        if ($LASTEXITCODE -ne 0) { throw "Training failed" }
        
        Write-Host ""
        Write-Host "Step 3/4: Converting to TFLite..." -ForegroundColor Cyan
        python convert_to_tflite.py
        if ($LASTEXITCODE -ne 0) { throw "Conversion failed" }
        
        Write-Host ""
        Write-Host "Step 4/4: Testing model..." -ForegroundColor Cyan
        python test_model.py compare
        
        Pop-Location
        
        Write-Header "Full Pipeline Complete!"
        Write-Host "Your trained model is ready in the model/ directory." -ForegroundColor Green
        Write-Host ""
        Write-Host "To deploy to mobile app:" -ForegroundColor Cyan
        Write-Host "  Copy-Item model\isl_model_quantized.tflite app\assets\models\" -ForegroundColor White
        Write-Host "  Copy-Item model\labels.json app\assets\models\" -ForegroundColor White
        Write-Host ""
    }
    catch {
        Write-Error "Pipeline failed: $_"
        Pop-Location
    }
    
    Write-Host "Press any key to return to menu..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

function Open-Documentation {
    Write-Host ""
    Write-Host "Opening documentation..." -ForegroundColor Cyan
    Start-Process "TRAINING_QUICKSTART.md"
}

# Main script
Clear-Host
Write-Header "ISL Sign Language Translator - Training Setup"

# Check Python
if (-not (Test-Python)) {
    Write-Host "Press any key to exit..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

# Install dependencies
if (-not (Install-Dependencies)) {
    Write-Host "Press any key to exit..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

# Check Kaggle API
if (-not (Test-KaggleAPI)) {
    Write-Host "Press any key to exit..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

Write-Header "Setup Complete!"
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Download dataset:    training\download_dataset.py" -ForegroundColor White
Write-Host "  2. Train model:         training\train.py" -ForegroundColor White
Write-Host "  3. Convert to TFLite:   training\convert_to_tflite.py" -ForegroundColor White
Write-Host "  4. Test model:          training\test_model.py" -ForegroundColor White
Write-Host ""
Write-Host "For detailed instructions, see TRAINING_QUICKSTART.md" -ForegroundColor Yellow

# Main menu loop
while ($true) {
    $choice = Show-Menu
    
    switch ($choice) {
        "1" { Start-Download }
        "2" { Start-Training }
        "3" { Start-Conversion }
        "4" { Start-Testing }
        "5" { Start-FullPipeline }
        "6" { Open-Documentation }
        "7" { 
            Write-Host ""
            Write-Host "Thank you for using ISL Training Pipeline!" -ForegroundColor Green
            Write-Host ""
            exit 0
        }
        default {
            Write-Host "Invalid choice!" -ForegroundColor Red
        }
    }
}
