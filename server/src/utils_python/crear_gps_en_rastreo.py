import os
import sys
import shutil
from dotenv import load_dotenv

# -----------------------------------------------
# Cargar variable RUTA_DISCO_BASE desde .env
# -----------------------------------------------
dotenv_path = os.path.join(os.path.dirname(__file__), '..', '..', '.env')
load_dotenv(dotenv_path)

RUTA_DISCO_BASE = os.getenv("RUTA_DISCO_BASE")  # Ejemplo: F:/


# -----------------------------------------------
# Función principal
# -----------------------------------------------
def crear_gps_en_rastreo(ruta_base, nombre_gps, archivo_nav, archivo_obs):
    """
    Crea carpeta del GPS y copia archivos .nav y .obs dentro.

    Retorna:
        (ruta_archivo_nav, ruta_archivo_obs)
    """
    # Corregir unidad de disco si es distinta
    ruta_relativa = os.path.relpath(ruta_base, start=os.path.splitdrive(ruta_base)[0] + os.sep)
    ruta_base_corregida = os.path.normpath(os.path.join(RUTA_DISCO_BASE, ruta_relativa))

    # Crear la carpeta del GPS
    ruta_gps = os.path.join(ruta_base_corregida, nombre_gps)
    os.makedirs(ruta_gps, exist_ok=True)

    # Crear rutas de destino
    ruta_nav_destino = os.path.join(ruta_gps, os.path.basename(archivo_nav))
    ruta_obs_destino = os.path.join(ruta_gps, os.path.basename(archivo_obs))

    try:
        shutil.copy(archivo_nav, ruta_nav_destino)
        shutil.copy(archivo_obs, ruta_obs_destino)
    except Exception as e:
        print(f"Error al copiar archivos: {e}")
        sys.exit(1)

    # Imprimir para que el runner JS pueda capturarlas
    print(ruta_obs_destino)
    print(ruta_nav_destino)

    return ruta_obs_destino, ruta_nav_destino


# -----------------------------------------------
# Ejecución directa desde consola
# -----------------------------------------------
if __name__ == '__main__':
    if len(sys.argv) != 5:
        print("Uso: python crear_gps_en_rastreo.py <ruta_base> <nombre_gps> <archivo_nav> <archivo_obs>")
        sys.exit(1)

    ruta_base = sys.argv[1]
    nombre_gps = sys.argv[2]
    archivo_nav = sys.argv[3]
    archivo_obs = sys.argv[4]

    crear_gps_en_rastreo(ruta_base, nombre_gps, archivo_nav, archivo_obs)
