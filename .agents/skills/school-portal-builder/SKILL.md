---
name: school-portal-builder
description: Builds the production web bundle with Vite, compiles the Capacitor Android APK with Gradle, copies the APK to the public folder, and commits & pushes changes to GitHub main branch.
---

# School Portal Build & Deployment Workflow

Whenever the user requests a production build, APK generation, or GitHub update, follow these steps in order:

## Step 1: Production Web Build
Run the Vite build command:
```powershell
cmd /c "npm run build"
```
Verify that the output exits with code 0.

## Step 2: Android APK Compilation
Run the Gradle debug assembly inside the `android/` directory:
```powershell
cmd /c "cd /d android && gradlew.bat assembleDebug"
```
Wait for completion and verify build success.

## Step 3: Copy APK to Public Directory
Copy the freshly compiled APK to `public/school-portal.apk`:
```powershell
Copy-Item -Path "android\app\build\outputs\apk\debug\app-debug.apk" -Destination "public\school-portal.apk" -Force
```

## Step 4: Commit & Push to GitHub
Use GitHub Desktop's embedded Git executable to commit and push:
```powershell
$git = "C:\Users\Hussein\AppData\Local\GitHubDesktop\app-3.6.4\resources\app\git\cmd\git.exe"
& $git add -A
& $git commit -m "feat/fix: <descriptive message>"
& $git push origin main
```

## Step 5: User Report
Summarize the build results, git commit hash, and confirm deployment status clearly to the user.
