@echo off
title ICJ Enterprise Platform - Validation

echo.
echo ==========================================
echo Building Project...
echo ==========================================
echo.

npm run build

IF %ERRORLEVEL% NEQ 0 (
    echo.
    echo Build Failed.
    pause
    exit
)

echo.
echo ==========================================
echo Build Successful
echo ==========================================
echo.

echo Validation Checklist
echo.
echo [1] Login
echo [2] Registration
echo [3] Dashboard
echo [4] Organization
echo [5] Finance
echo [6] Documents
echo [7] Workflow
echo [8] Notifications
echo [9] Audit
echo.

pause