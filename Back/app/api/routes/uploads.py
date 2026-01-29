"""
Rutas para upload de archivos (imágenes).
Usa Cloudinary para almacenamiento en la nube.
"""
import cloudinary
import cloudinary.uploader
from fastapi import APIRouter, UploadFile, File, HTTPException, status, Depends
from app.api.deps import get_current_user
from app.models.user import User
from app.config import settings

# Configurar Cloudinary
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True
)

# Extensiones permitidas
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}

# Tamaño máximo: 5MB
MAX_FILE_SIZE = 5 * 1024 * 1024

router = APIRouter(prefix="/uploads", tags=["Uploads"])


@router.post("/imagen")
async def upload_imagen(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    """
    Sube una imagen a Cloudinary.

    - Acepta: JPG, JPEG, PNG, GIF, WEBP
    - Tamaño máximo: 5MB
    - Devuelve la URL permanente de Cloudinary

    **Uso desde frontend:**
    ```javascript
    const formData = new FormData();
    formData.append('file', imagenSeleccionada);

    const response = await fetch('/api/v1/uploads/imagen', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token },
        body: formData
    });
    const { url } = await response.json();
    ```
    """
    # Validar que hay archivo
    if not file:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se envió ningún archivo"
        )

    # Validar extensión
    import os
    file_extension = os.path.splitext(file.filename)[1].lower()
    if file_extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Tipo de archivo no permitido. Usa: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # Leer contenido y validar tamaño
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El archivo es muy grande. Máximo 5MB"
        )

    # Verificar que Cloudinary está configurado
    if not settings.CLOUDINARY_CLOUD_NAME:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Cloudinary no está configurado"
        )

    try:
        # Subir a Cloudinary
        result = cloudinary.uploader.upload(
            content,
            folder="chazas",  # Carpeta en Cloudinary
            resource_type="image",
            transformation=[
                {"width": 800, "height": 800, "crop": "limit"},  # Limitar tamaño
                {"quality": "auto"},  # Optimizar calidad
                {"fetch_format": "auto"}  # Formato óptimo (webp si el browser lo soporta)
            ]
        )

        return {
            "success": True,
            "url": result["secure_url"],
            "public_id": result["public_id"],
            "message": "Imagen subida correctamente"
        }

    except Exception as e:
        print(f">> Error subiendo a Cloudinary: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al subir imagen: {str(e)}"
        )


@router.delete("/imagen/{public_id:path}")
async def delete_imagen(public_id: str, current_user: User = Depends(get_current_user)):
    """
    Elimina una imagen de Cloudinary.

    El public_id es el identificador único de la imagen en Cloudinary.
    Ejemplo: chazas/abc123xyz
    """
    if not settings.CLOUDINARY_CLOUD_NAME:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Cloudinary no está configurado"
        )

    try:
        result = cloudinary.uploader.destroy(public_id)

        if result.get("result") == "ok":
            return {
                "success": True,
                "message": "Imagen eliminada correctamente"
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Imagen no encontrada"
            )

    except Exception as e:
        print(f">> Error eliminando de Cloudinary: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar imagen: {str(e)}"
        )
