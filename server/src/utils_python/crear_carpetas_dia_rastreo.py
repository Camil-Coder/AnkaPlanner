# src/utils_python/crear_carpetas_dias_rastreos.py

import os
import sys
from dotenv import load_dotenv

# --------------------------------------------
# CARGA DE VARIABLES DESDE EL ARCHIVO .env
# --------------------------------------------

dotenv_path = os.path.join(os.path.dirname(__file__), '..', '..', '.env')
load_dotenv(dotenv_path)

RUTA_DISCO_BASE = os.getenv("RUTA_DISCO_BASE")  # Ejemplo: F:/

# --------------------------------------------
# FUNCIÓN PRINCIPAL
# --------------------------------------------

def crear_carpetas_dia_rastreo(ruta_proyecto, nombre_dia):
    """
    Crea las carpetas correspondientes a un día de rastreo dentro del proyecto.

    Args:
        ruta_proyecto (str): Ruta completa del proyecto (puede tener letra de unidad incorrecta).
        nombre_dia (str): Nombre del día de rastreo (ej: '280725').

    Returns:
        tuple: (ruta_rastreo_dia, ruta_reportes_dia)
    """

    # Asegurar que la ruta comience con la unidad correcta según el .env
    ruta_relativa = os.path.relpath(ruta_proyecto, start=os.path.splitdrive(ruta_proyecto)[0] + os.sep)
    ruta_proyecto_corregida = os.path.join(RUTA_DISCO_BASE, ruta_relativa)

    # Normaliza la ruta final
    ruta_proyecto_corregida = os.path.normpath(ruta_proyecto_corregida)

    # Construye rutas
    ruta_rastreo_dia = os.path.join(ruta_proyecto_corregida, 'Procesamiento', '1. Topografia', 'Rastreos', nombre_dia)
    ruta_reportes_dia = os.path.join(ruta_proyecto_corregida, 'Procesamiento', '1. Topografia', 'Reportes', nombre_dia)

    carpetas = [
        os.path.join(ruta_rastreo_dia, 'Base'),
        os.path.join(ruta_rastreo_dia, 'Red activa'),
        os.path.join(ruta_reportes_dia, 'FIX'),
        os.path.join(ruta_reportes_dia, 'NAVEGADO'),
    ]

    for carpeta in carpetas:
        print(carpeta)
        os.makedirs(carpeta, exist_ok=True)

    return ruta_rastreo_dia, ruta_reportes_dia

# --------------------------------------------
# EJECUCIÓN DESDE CONSOLA
# --------------------------------------------

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print("Uso: python crear_carpetas_dias_rastreos.py <ruta_proyecto> <nombre_dia>")
        sys.exit(1)

    ruta_ingresada = sys.argv[1]
    nombre_dia = sys.argv[2]

    ruta_rastreo, ruta_reporte = crear_carpetas_dia_rastreo(ruta_ingresada, nombre_dia)

    # Imprime las dos rutas para que el backend las pueda capturar
    print(ruta_rastreo)
    print(ruta_reporte)
