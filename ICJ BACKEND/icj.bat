@echo off
title ICJ Enterprise Platform

:MENU
cls
echo ============================================
echo        ICJ ENTERPRISE PLATFORM
echo ============================================
echo.
echo 1. Start Development Server
echo 2. Build Project
echo 3. Validate Project
echo 4. Exit
echo.
set /p choice=Select Option (1-4):

if "%choice%"=="1" call dev.bat
if "%choice%"=="2" call build.bat
if "%choice%"=="3" call validate.bat
if "%choice%"=="4" exit

goto MENU