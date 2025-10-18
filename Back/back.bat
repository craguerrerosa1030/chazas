@echo off
REM === Activar el entorno conda ===
CALL "C:\Users\USER\Miniconda3\Scripts\activate.bat" back

REM === Iniciar el servidor FastAPI ===
uvicorn main:app --reload --host 127.0.0.1 --port 8000

REM === Mantener la ventana abierta para ver logs ===
pause
