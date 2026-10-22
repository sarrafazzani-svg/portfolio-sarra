@echo off
REM Push the responsive gallery and project loading fixes

echo Staging files...
git add styles.css script.js

echo Creating commit...
git commit -m "Fix responsive mobile gallery, improve project loading from API, fix hero name display"

echo Pushing to GitHub...
git push origin main

echo.
echo ====== COMPLETE ======
echo Changes pushed to GitHub!
echo Render will auto-deploy in 1-2 minutes.
echo.
pause
