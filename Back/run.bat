@echo off
echo ========================================
echo    Iniciando servidor de Chazas API
echo ========================================
echo.

REM Activar entorno virtual si existe
if exist venv\Scripts\activate.bat (
    echo Activando entorno virtual...
    call venv\Scripts\activate.bat
) else (
    echo ADVERTENCIA: No se encontro entorno virtual
    echo Ejecuta primero: python -m venv venv
    echo.
)

REM Ejecutar servidor con uvicorn
echo Iniciando servidor en http://localhost:8000
echo Documentacion en http://localhost:8000/docs
echo.
echo Presiona Ctrl+C para detener el servidor
echo.

uvicorn app.main:app --reload --port 8000

pause