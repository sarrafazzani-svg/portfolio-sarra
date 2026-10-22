@echo off
cd /d C:\Users\SARRA\Downloads\portSarra
git add render.yaml
git commit -m "Fix render.yaml configuration"
git push origin main
echo.
echo ===================================
echo Deploy fix pushed to GitHub!
echo Your Render deployment should retry automatically.
echo Check https://render.com in a few minutes
echo ===================================
pause
