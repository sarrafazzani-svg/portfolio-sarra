@echo off
cd /d C:\Users\SARRA\Downloads\portSarra
git add render.yaml
git commit -m "Add rootDir to render.yaml"
git push origin main
echo.
echo Deploy fix v2 pushed!
echo Go back to Render and click Retry Deploy
pause
