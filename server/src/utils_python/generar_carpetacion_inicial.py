# src/utils_python/generar_carpetacion_inicial.py

import os   # Para manipular rutas y crear carpetas
import sys  # Para capturar argumentos pasados por consola
from dotenv import load_dotenv  # Permite cargar variables desde un archivo .env

# --------------------------------------------
# CARGA DE VARIABLES DESDE EL ARCHIVO .env
# --------------------------------------------

# Construye la ruta hasta el archivo .env (que está dos niveles arriba del script actual)
dotenv_path = os.path.join(os.path.dirname(__file__), '..', '..', '.env')

# Carga las variables de entorno definidas en ese archivo .env
load_dotenv(dotenv_path)

# Obtiene la variable RUTA_DISCO_BASE (donde se crearán las carpetas de proyecto)
RUTA_DISCO_BASE = os.getenv("RUTA_DISCO_BASE")


# --------------------------------------------
# FUNCIÓN PRINCIPAL: crear_estructura
# --------------------------------------------

def crear_estructura(nombre_empresa, nombre_proyecto, ruta_base=None):
    """
    Crea la estructura de carpetas base para un nuevo proyecto topográfico.
    
    Args:
        nombre_empresa (str): Nombre de la empresa dueña del proyecto.
        nombre_proyecto (str): Nombre del proyecto a crear.
        ruta_base (str, opcional): Ruta personalizada base para crear las carpetas (útil para testing).
                                   Si no se especifica, se usa la ruta del .env.
    
    Returns:
        str: Ruta absoluta del proyecto creado.
    """
    # Si no se especificó una ruta base, usar la del .env
    if ruta_base is None:
        ruta_base = RUTA_DISCO_BASE

    print(f"Usando ruta base: {ruta_base}")

    # Ruta completa de la carpeta de la empresa
    ruta_empresa = os.path.join(ruta_base, nombre_empresa)

    # Ruta completa del proyecto (empresa/proyecto)
    ruta_proyecto = os.path.join(ruta_empresa, nombre_proyecto)

    # Si no existe la carpeta de la empresa, se crea
    if not os.path.exists(ruta_empresa):
        os.makedirs(ruta_empresa)

    # Lista con todas las subcarpetas que se deben crear dentro del proyecto
    carpetas = [
        os.path.join(ruta_proyecto, 'Entregables', 'CURVAS'),
        os.path.join(ruta_proyecto, 'Entregables', 'DSM'),
        os.path.join(ruta_proyecto, 'Entregables', 'DTM'),
        os.path.join(ruta_proyecto, 'Entregables', 'NUBE'),
        os.path.join(ruta_proyecto, 'Entregables', 'ORTOMOSAICO'),
        os.path.join(ruta_proyecto, 'Entregables', 'RESTITUCION', 'DIGITALIZACIÓN'),
        os.path.join(ruta_proyecto, 'Entregables', 'RESTITUCION', 'GDB'),
        os.path.join(ruta_proyecto, 'Procesamiento', '1. Topografia', 'Cambio de Epoca'),
        os.path.join(ruta_proyecto, 'Procesamiento', '1. Topografia', 'Rastreos'),
        os.path.join(ruta_proyecto, 'Procesamiento', '1. Topografia', 'Reportes'),
    ]

    # Se crean todas las carpetas necesarias (si ya existen, no genera error)
    for carpeta in carpetas:
        print(f"Creando carpeta: {carpeta}")
        os.makedirs(carpeta, exist_ok=True)

    # Mensajes de verificación para asegurar que la estructura fue creada
    print(f"Verificando existencia directa: {os.path.exists(ruta_proyecto)}")
    print(f"Contenido creado: {os.listdir(ruta_proyecto) if os.path.exists(ruta_proyecto) else 'No existe'}")

    # Retorna la ruta completa del proyecto recién creado
    return ruta_proyecto


# --------------------------------------------
# BLOQUE EJECUTABLE: si el script se ejecuta directamente desde consola
# --------------------------------------------

if __name__ == '__main__':
    # Verifica que se hayan pasado exactamente 2 argumentos: empresa y proyecto
    if len(sys.argv) != 3:
        print("Uso: python generar_carpetacion_inicial.py <empresa> <proyecto>")
        sys.exit(1)

    # Captura los argumentos enviados por consola
    empresa = sys.argv[1]
    proyecto = sys.argv[2]

    # Ejecuta la creación de carpetas
    ruta = crear_estructura(empresa, proyecto)

    # Imprime la ruta creada (esto será leído por el backend de Node.js)
    print(ruta)
