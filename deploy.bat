@echo off
REM Deploy portfolio to GitHub and Render

cd /d "%~dp0"

echo.
echo ====== GIT SETUP ======
echo.

REM Initialize git repository
echo [1/5] Initializing Git repository...
git init
if errorlevel 1 goto error

echo [2/5] Configuring Git user (local)...
git config user.name "Portfolio Creator"
git config user.email "portfolio@deploy.local"
if errorlevel 1 goto error

echo [3/5] Adding all files (excluding .gitignore patterns)...
git add .
if errorlevel 1 goto error

echo [4/5] Creating first commit...
git commit -m "Initial portfolio deployment"
if errorlevel 1 goto error

echo [5/5] Adding GitHub remote...
REM Replace YOUR_USERNAME with actual username
git remote add origin https://github.com/YOUR_USERNAME/portfolio.git
if errorlevel 1 (
    echo Removing existing remote...
    git remote remove origin
    git remote add origin https://github.com/YOUR_USERNAME/portfolio.git
)

echo.
echo ====== NEXT STEPS ======
echo.
echo 1. Open GitHub and create repository: sarrafazzani-svg/portfolio
echo 2. Come back here and run:
echo    git branch -M main
echo    git push -u origin main
echo.
echo 3. After push succeeds, Render will auto-deploy!
echo.

goto end

:error
echo.
echo ERROR: Git command failed. Check your Git installation.
echo.

:end
pause
