@echo off
setlocal

set "ROOT=%~dp0"
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"
set "PYTHON_CMD=python"

if exist "%ROOT%\.venv\Scripts\python.exe" (
  set "PYTHON_CMD=%ROOT%\.venv\Scripts\python.exe"
) else (
  where python >nul 2>nul
  if errorlevel 1 (
    echo Python nao encontrado.
    exit /b 1
  )
)

"%PYTHON_CMD%" "%ROOT%\backend\tools\cleanup_storage.py" %*
