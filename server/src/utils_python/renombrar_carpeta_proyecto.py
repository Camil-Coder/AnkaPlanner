# src/utils_python/renombrar_carpeta_proyecto.py

import os   # Para manejar rutas y renombrar carpetas
import sys  # Para capturar argumentos desde consola
from dotenv import load_dotenv  # Para cargar variables desde el archivo .env

# --------------------------------------------
# CARGA DE VARIABLES DESDE EL ARCHIVO .env
# --------------------------------------------

# Ruta al archivo .env (dos niveles arriba de este script)
dotenv_path = os.path.join(os.path.dirname(__file__), '..', '..', '.env')

# Carga las variables de entorno del .env
load_dotenv(dotenv_path)

# Obtiene la ruta base donde están los proyectos (ej. F:\)
RUTA_DISCO_BASE = os.getenv("RUTA_DISCO_BASE")


# --------------------------------------------
# FUNCIÓN PRINCIPAL: renombrar_proyecto
# --------------------------------------------

def renombrar_proyecto(nombre_empresa, nombre_anterior, nombre_nuevo, ruta_base=None):
    """
    Renombra la carpeta de un proyecto existente, manteniendo la empresa y la estructura de carpetas.
    
    Args:
        nombre_empresa (str): Nombre de la empresa (carpeta raíz del proyecto)
        nombre_anterior (str): Nombre actual del proyecto (carpeta a renombrar)
        nombre_nuevo (str): Nuevo nombre del proyecto
        ruta_base (str, opcional): Ruta raíz personalizada (por defecto usa .env)
    
    Returns:
        str: Nueva ruta absoluta del proyecto renombrado
    """
    # Si no se especificó ruta base, usar la del archivo .env
    if ruta_base is None:
        ruta_base = RUTA_DISCO_BASE

    # Ruta completa de la empresa (carpeta raíz de sus proyectos)
    ruta_empresa = os.path.join(ruta_base, nombre_empresa)

    # Ruta actual del proyecto
    ruta_actual = os.path.join(ruta_empresa, nombre_anterior)

    # Nueva ruta con el nombre actualizado
    ruta_nueva = os.path.join(ruta_empresa, nombre_nuevo)

    # Validar que exista la carpeta actual
    if not os.path.exists(ruta_actual):
        raise FileNotFoundError(f"La carpeta original no existe: {ruta_actual}")

    # Validar que no exista ya una carpeta con el nuevo nombre
    if os.path.exists(ruta_nueva):
        raise FileExistsError(f"Ya existe una carpeta con el nuevo nombre: {ruta_nueva}")

    # Ejecutar el renombramiento
    os.rename(ruta_actual, ruta_nueva)

    # Retornar la nueva ruta al backend
    return ruta_nueva


# --------------------------------------------
# BLOQUE EJECUTABLE: si el script se ejecuta desde consola
# --------------------------------------------

if __name__ == '__main__':
    # Validar que se pasen exactamente 3 argumentos: empresa, nombre anterior y nombre nuevo
    if len(sys.argv) != 4:
        print("Uso: python renombrar_carpeta_proyecto.py <empresa> <nombre_anterior> <nombre_nuevo>")
        sys.exit(1)

    # Capturar los argumentos de consola
    empresa = sys.argv[1]
    anterior = sys.argv[2]
    nuevo = sys.argv[3]

    try:
        # Ejecutar el renombramiento
        ruta = renombrar_proyecto(empresa, anterior, nuevo)

        # Imprimir la nueva ruta (será leída por Node.js)
        print(ruta)

    except Exception as e:
        # Imprimir error en caso de fallo
        print(f"Error: {e}")
        sys.exit(1)
