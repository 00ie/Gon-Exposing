@echo off
setlocal

set "ROOT=%~dp0"
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"
set "MODE=%~1"

if /I "%MODE%"=="help" goto :help
if /I "%MODE%"=="--help" goto :help
if /I "%MODE%"=="-h" goto :help
if "%MODE%"=="" set "MODE=dev"

if not exist "%ROOT%\.env" if exist "%ROOT%\.env.example" copy /Y "%ROOT%\.env.example" "%ROOT%\.env" >nul

set "PYTHON_CMD=python"
if exist "%ROOT%\.venv\Scripts\python.exe" (
  set "PYTHON_CMD=%ROOT%\.venv\Scripts\python.exe"
) else (
  where python >nul 2>nul
  if errorlevel 1 (
    echo Python nao encontrado. Crie a venv ou instale o Python.
    echo Exemplo:
    echo   cd "%ROOT%"
    echo   python -m venv .venv
    echo   .venv\Scripts\pip install -r backend\requirements.txt -r backend\requirements-worker.txt
    exit /b 1
  )
)

where npm.cmd >nul 2>nul
if errorlevel 1 (
  echo npm.cmd nao encontrado. Instale o Node.js e tente novamente.
  exit /b 1
)

if not exist "%ROOT%\frontend\node_modules" (
  echo Instalando dependencias do frontend...
  pushd "%ROOT%\frontend"
  call npm.cmd install
  if errorlevel 1 (
    popd
    echo Falha ao instalar dependencias do frontend.
    exit /b 1
  )
  popd
)

echo Verificando dependencias do backend...
"%PYTHON_CMD%" -c "import uvicorn" >nul 2>nul
if errorlevel 1 (
  echo uvicorn nao encontrado. Instalando dependencias do backend...
  pushd "%ROOT%"
  call "%PYTHON_CMD%" -m pip install -r backend\requirements.txt -r backend\requirements-worker.txt
  if errorlevel 1 (
    popd
    echo Falha ao instalar dependencias do backend.
    exit /b 1
  )
  popd
)

if /I "%MODE%"=="dry-run" goto :dryrun

start "Gon Exposing - Backend" cmd /k "cd /d ""%ROOT%"" && ""%PYTHON_CMD%"" -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000"

if /I "%MODE%"=="prod" (
  start "Gon Exposing - Frontend" cmd /k "cd /d ""%ROOT%\frontend"" && npm.cmd run build && npm.cmd start"
) else (
  start "Gon Exposing - Frontend" cmd /k "cd /d ""%ROOT%\frontend"" && npm.cmd run dev"
)

echo Backend abrindo em outra janela: http://localhost:8000
echo Frontend abrindo em outra janela: http://localhost:3000
echo Modo: %MODE%
exit /b 0

:dryrun
echo Pasta raiz: %ROOT%
echo Modo: %MODE%
echo Python: %PYTHON_CMD%
echo Backend:
echo   cd /d "%ROOT%"
echo   "%PYTHON_CMD%" -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
echo Frontend dev:
echo   cd /d "%ROOT%\frontend"
echo   npm.cmd run dev
echo Frontend prod:
echo   cd /d "%ROOT%\frontend"
echo   npm.cmd run build ^&^& npm.cmd start
exit /b 0

:help
echo Gon Exposing Launcher
echo.
echo Uso:
echo   run.cmd
echo   run.cmd dev
echo   run.cmd prod
echo   run.cmd dry-run
echo.
echo Modos:
echo   dev      abre backend e frontend em modo desenvolvimento
echo   prod     abre backend e frontend com frontend em modo producao
echo   dry-run  mostra os comandos sem abrir janelas
exit /b 0
