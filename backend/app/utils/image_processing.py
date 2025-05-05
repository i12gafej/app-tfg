import io
from PIL import Image
import os
from pathlib import Path
from app.core.config import Settings

settings = Settings().copy()

# Crear directorios si no existen
settings.COVERS_DIR.mkdir(parents=True, exist_ok=True)
settings.LOGOS_DIR.mkdir(parents=True, exist_ok=True)
settings.PHOTOS_DIR.mkdir(parents=True, exist_ok=True)

settings = Settings().copy()

def process_cover_image(image_data: bytes) -> bytes:
    """
    Procesa la imagen de portada para ajustarla al formato A4.
    El proceso mantiene el centro de la imagen y recorta los excesos para mantener el ratio A4.
    """
    try:
        # Abrir la imagen desde los bytes
        img = Image.open(io.BytesIO(image_data))
        
        # Convertir a RGB si es necesario
        if img.mode in ('RGBA', 'P'):
            img = img.convert('RGB')
        
        # Obtener dimensiones actuales
        width, height = img.size
        current_ratio = height / width
        
        if current_ratio < settings.A4_RATIO:
            # La imagen es más ancha que el ratio A4
            # Calculamos el nuevo ancho necesario manteniendo el alto actual
            new_width = int(height / settings.A4_RATIO)
            # Calculamos los puntos de recorte desde el centro
            left = (width - new_width) // 2
            right = left + new_width
            # Recortamos la imagen manteniendo el alto completo
            img = img.crop((left, 0, right, height))
        else:
            # La imagen es más alta que el ratio A4
            # Calculamos el nuevo alto necesario manteniendo el ancho actual
            new_height = int(width * settings.A4_RATIO)
            # Calculamos los puntos de recorte desde el centro
            top = (height - new_height) // 2
            bottom = top + new_height
            # Recortamos la imagen manteniendo el ancho completo
            img = img.crop((0, top, width, bottom))
        
        # Redimensionar a las dimensiones A4 finales
        img = img.resize((settings.A4_WIDTH, settings.A4_HEIGHT), Image.Resampling.LANCZOS)
        
        # Guardar la imagen procesada en bytes
        output = io.BytesIO()
        img.save(output, format='JPEG', quality=95)
        return output.getvalue()
        
    except Exception as e:
        print(f"Error al procesar la imagen: {str(e)}")
        raise