# Kaggle API Setup Instructions

This guide will help you set up the Kaggle API to download datasets for training.

## Step 1: Install Kaggle CLI

Open PowerShell terminal and run:

```powershell
pip install kaggle
```

## Step 2: Get Your Kaggle API Token

1. Log in to [Kaggle](https://www.kaggle.com/)
2. Click on your profile picture (top right) → **Account**
3. Scroll down to the **API** section
4. Click **Create New API Token**
5. This will download a file called `kaggle.json`

The file contains your credentials:
```json
{
  "username": "your_username",
  "key": "your_api_key"
}
```

## Step 3: Place kaggle.json in the Correct Location

### On Windows:

Create the `.kaggle` directory if it doesn't exist:

```powershell
New-Item -Path "$env:USERPROFILE\.kaggle" -ItemType Directory -Force
```

Move your downloaded `kaggle.json` to:

```powershell
Move-Item -Path "Downloads\kaggle.json" -Destination "$env:USERPROFILE\.kaggle\kaggle.json" -Force
```

Or manually place it at:
```
C:\Users\<YourUsername>\.kaggle\kaggle.json
```

### Alternative: Set Environment Variables

Instead of using the file, you can set environment variables:

```powershell
$env:KAGGLE_USERNAME = "your_username"
$env:KAGGLE_KEY = "your_api_key"
```

To make them permanent:

```powershell
[System.Environment]::SetEnvironmentVariable('KAGGLE_USERNAME', 'your_username', 'User')
[System.Environment]::SetEnvironmentVariable('KAGGLE_KEY', 'your_api_key', 'User')
```

## Step 4: Verify Installation

Test that the Kaggle API is working:

```powershell
kaggle datasets list
```

You should see a list of datasets if everything is set up correctly.

## Troubleshooting

**Error: "Could not find kaggle.json"**
- Make sure the file is in `C:\Users\<YourUsername>\.kaggle\`
- Check that the filename is exactly `kaggle.json` (not `kaggle.json.txt`)

**Error: "401 - Unauthorized"**
- Your API token may be invalid or expired
- Delete the old token on Kaggle and create a new one

**Error: "403 - Forbidden"**
- You may need to accept the dataset's terms and conditions on Kaggle's website first
- Visit the dataset page and click "Download" once to accept terms

## Next Steps

Once setup is complete, you can run the download script:

```powershell
cd training
python download_dataset.py
```
