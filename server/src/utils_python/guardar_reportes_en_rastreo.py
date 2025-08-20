# guardar_reportes_en_rastreo.py
# -----------------------------------------------
# Script para organizar y guardar archivos de reportes en subcarpetas
# -----------------------------------------------

import os
import sys
import shutil
from dotenv import load_dotenv


# -----------------------------------------------
# Cargar variables desde .env (ej: RUTA_DISCO_BASE=F:/)
# -----------------------------------------------
dotenv_path = os.path.join(os.path.dirname(__file__), '..', '..', '.env')
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path)

RUTA_DISCO_BASE = os.getenv("RUTA_DISCO_BASE")  # opcional, para remapear unidad


# -----------------------------------------------
# Función: aplicar base desde .env si corresponde
# -----------------------------------------------
def _aplicar_base_si_corresponde(ruta: str) -> str:
    if not RUTA_DISCO_BASE:
        return os.path.normpath(ruta)

    unidad_original = os.path.splitdrive(ruta)[0]  # ejemplo: "C:"
    if not unidad_original:
        return os.path.normpath(ruta)

    ruta_rel = os.path.relpath(ruta, start=unidad_original + os.sep)
    ruta_corregida = os.path.normpath(os.path.join(RUTA_DISCO_BASE, ruta_rel))
    return ruta_corregida


# -----------------------------------------------
# Función: crear directorio si no existe
# -----------------------------------------------
def _asegurar_directorio(ruta_dir: str) -> None:
    os.makedirs(ruta_dir, exist_ok=True)


# -----------------------------------------------
# Función: generar nombre sin colisión
# (archivo.csv -> archivo_1.csv si ya existe)
# -----------------------------------------------
def _ruta_sin_colision(destino_dir: str, nombre_archivo: str) -> str:
    base, ext = os.path.splitext(nombre_archivo)
    candidato = os.path.join(destino_dir, nombre_archivo)
    contador = 1
    while os.path.exists(candidato):
        candidato = os.path.join(destino_dir, f"{base}_{contador}{ext}")
        contador += 1
    return candidato


# -----------------------------------------------
# Función principal: guardar reportes (pegar y reemplazar)
# -----------------------------------------------
def guardar_reportes_en_rastreo(ruta_reportes: str, archivo_navegado: str, archivo_fix: str, archivo_difer: str):
    """
    Crea subcarpetas NAVEGADO, FIX y VALIDACION,
    PEGA los archivos con su mismo nombre y si existen los REEMPLAZA.
    Devuelve las rutas finales.
    """

    # Aplicar base si corresponde
    ruta_reportes = _aplicar_base_si_corresponde(ruta_reportes)

    # Definir subcarpetas
    carpeta_navegado   = os.path.join(ruta_reportes, "NAVEGADO")
    carpeta_fix        = os.path.join(ruta_reportes, "FIX")
    carpeta_validacion = os.path.join(ruta_reportes, "VALIDACION")

    # Crear subcarpetas
    _asegurar_directorio(carpeta_navegado)
    _asegurar_directorio(carpeta_fix)
    _asegurar_directorio(carpeta_validacion)

    # Helper: copiar sobrescribiendo (pegar y reemplazar)
    def _copiar_reemplazando(src: str, dest_dir: str) -> str:
        nombre = os.path.basename(src)
        destino = os.path.join(dest_dir, nombre)
        # shutil.copy2 sobrescribe si 'destino' ya existe
        shutil.copy2(src, destino)
        return destino

    try:
        # NAVEGADO -> NAVEGADO/<nombre_original>
        destino_nav = _copiar_reemplazando(archivo_navegado, carpeta_navegado)

        # FIX -> FIX/<nombre_original>
        destino_fix = _copiar_reemplazando(archivo_fix, carpeta_fix)

        # DIFER -> VALIDACION/<nombre_original>
        destino_difer = _copiar_reemplazando(archivo_difer, carpeta_validacion)

    except Exception as e:
        print(f"Error al copiar (pegar y reemplazar) archivos: {e}", file=sys.stderr)
        sys.exit(1)

    # Imprimir rutas en el orden esperado por Node.js
    print(destino_nav)
    print(destino_fix)
    print(destino_difer)

    return destino_nav, destino_fix, destino_difer


# -----------------------------------------------
# Ejecución directa desde consola
# -----------------------------------------------
if __name__ == "__main__":
    if len(sys.argv) != 5:
        print(
            "Uso: python guardar_reportes_en_rastreo.py <ruta_reportes> <archivo_navegado> <archivo_fix> <archivo_difer>",
            file=sys.stderr
        )
        sys.exit(1)

    ruta_reportes   = sys.argv[1]
    archivo_navegado = sys.argv[2]
    archivo_fix      = sys.argv[3]
    archivo_difer    = sys.argv[4]

    guardar_reportes_en_rastreo(ruta_reportes, archivo_navegado, archivo_fix, archivo_difer)
