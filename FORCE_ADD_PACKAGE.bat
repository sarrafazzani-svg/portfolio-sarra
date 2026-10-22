@echo off
cd /d C:\Users\SARRA\Downloads\portSarra
echo Adding package.json to git...
git add package.json -f
echo Committing...
git commit -m "Force add package.json"
echo Pushing to GitHub...
git push origin main
echo.
echo ===================================
echo package.json pushed to GitHub!
echo Render should now find it.
echo ===================================
pause
