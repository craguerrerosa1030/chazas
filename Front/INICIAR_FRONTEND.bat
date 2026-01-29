@echo off
echo ========================================
echo     INICIANDO FRONTEND DE CHAZAS
echo ========================================
echo.
echo El frontend se esta iniciando...
echo Cuando veas "Compiled successfully"
echo el frontend estara listo en:
echo    http://localhost:3000
echo ========================================
echo IMPORTANTE: NO CIERRES ESTA VENTANA
echo ========================================
echo.

cd /d "%~dp0"
npm start

pause