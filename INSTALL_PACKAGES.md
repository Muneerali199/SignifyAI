# 📦 Install Required Packages

## Step 1: Install TensorFlow.js for React Native

Run these commands in your project directory:

```bash
# Core TensorFlow packages
npm install @tensorflow/tfjs @tensorflow/tfjs-react-native

# Required peer dependencies
npm install @react-native-async-storage/async-storage
npm install expo-gl
npm install expo-camera

# Image processing
npm install expo-image-manipulator
npm install expo-file-system

# Optional but recommended for better performance
npm install @tensorflow/tfjs-backend-wasm
```

Or all at once:

```bash
npm install @tensorflow/tfjs @tensorflow/tfjs-react-native @react-native-async-storage/async-storage expo-gl expo-camera expo-image-manipulator expo-file-system
```

## Step 2: Update Your App

After installing packages, I'll update these files:

1. **`services/gestureRecognition.ts`** - Load and use real TFLite model
2. **`components/TranslatorCamera.tsx`** - Capture and process real camera frames
3. **`app/_layout.tsx`** - Initialize TensorFlow on app start

## Expected Installation Time

- **NPM Install:** 2-3 minutes
- **Code Updates:** Automated (I'll do it)
- **Testing:** 5-10 minutes

## Troubleshooting

### If npm install fails:

**Try clearing cache first:**
```bash
npm cache clean --force
npm install
```

**Or use yarn:**
```bash
yarn add @tensorflow/tfjs @tensorflow/tfjs-react-native
```

### If you see peer dependency warnings:

These are usually safe to ignore, but if needed:
```bash
npm install --legacy-peer-deps
```

## What Happens Next

Once packages are installed, I'll update your code to:
- ✅ Load the trained TFLite model on app startup
- ✅ Capture real camera frames
- ✅ Preprocess images (resize to 64x64, normalize)
- ✅ Run predictions using your trained model
- ✅ Display results with confidence scores

## Ready?

Run the install command, then tell me when it's done!

```bash
npm install @tensorflow/tfjs @tensorflow/tfjs-react-native @react-native-async-storage/async-storage expo-gl expo-image-manipulator expo-file-system
```
