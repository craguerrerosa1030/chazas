@echo off
echo ========================================
echo    Registrando usuario de prueba
echo ========================================
echo.

curl -X POST "http://localhost:8000/api/v1/auth/register" ^
  -H "Content-Type: application/json" ^
  -d "{\"nombre\": \"Usuario Prueba\", \"email\": \"prueba@chazas.com\", \"password\": \"123456\", \"tipo_usuario\": \"estudiante\"}"

echo.
echo.
echo ========================================
echo Presiona cualquier tecla para salir
pause