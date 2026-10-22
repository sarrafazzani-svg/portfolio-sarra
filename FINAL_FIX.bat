@echo off
cd /d C:\Users\SARRA\Downloads\portSarra
git add .
git commit -m "Remove render.yaml - use Render manual settings"
git push origin main
echo.
echo Pushed! Now in Render:
echo 1. Go to Settings
echo 2. Build & Deploy
echo 3. Make sure Root Directory is EMPTY
echo 4. Build Command: npm install
echo 5. Start Command: npm start
echo 6. Click Deploy in Deploys tab
pause
