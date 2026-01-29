@echo off
echo ========================================
echo     INICIANDO SERVIDOR DE CHAZAS
echo ========================================
echo.
echo El servidor se esta iniciando...
echo Espera 3-5 segundos...
echo.
echo Cuando veas "Application startup complete"
echo el servidor estara listo en:
echo.
echo    http://localhost:8000/docs
echo.
echo ========================================
echo IMPORTANTE: NO CIERRES ESTA VENTANA
echo Si cierras esta ventana, el servidor
echo se detendra.
echo ========================================
echo.

cd /d "%~dp0"
venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000

pause