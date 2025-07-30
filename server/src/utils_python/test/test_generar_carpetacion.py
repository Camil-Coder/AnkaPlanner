# src/utils_python/tests/test_generar_carpetacion.py

import shutil   # Para eliminar carpetas al final del test (limpieza)
import sys      # Para acceder a argumentos y manipular rutas del sistema
import os       # Para manejar el sistema de archivos

# Agregamos la ruta del script que vamos a testear al sys.path (para poder importarlo)
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Importamos la función que queremos testear
from generar_carpetacion_inicial import crear_estructura


def test_crear_estructura_temporal():
    """
    Test básico para verificar que la función crear_estructura() crea correctamente
    las carpetas del proyecto con una ruta base personalizada.
    """

    # Parámetros de prueba simulados (como si el usuario hubiera creado un proyecto real)
    empresa = "PRUEBAEMPRESA"
    proyecto = "PROYECTO123"

    # Ruta personalizada donde queremos que se cree la carpeta del proyecto
    ruta_base = r"D:\test"  # Esto evita usar la ruta real del disco F: durante la prueba

    # Llamamos a la función para crear la estructura de carpetas
    ruta_generada = crear_estructura(empresa, proyecto, ruta_base=ruta_base)

    # Imprimimos la ruta para verificar
    print(f"Ruta generada: {ruta_generada}")
    print(f"¿Existe la carpeta?: {os.path.exists(ruta_generada)}")

    # Imprime el contenido de la carpeta de la empresa para confirmar que se creó el proyecto
    print(f"Contenido de {ruta_base}/{empresa}: {os.listdir(os.path.join(ruta_base, empresa)) if os.path.exists(os.path.join(ruta_base, empresa)) else 'No existe'}")

    # Verificaciones automáticas con asserts
    assert os.path.exists(ruta_generada), "La carpeta del proyecto no fue creada."
    assert os.path.isdir(ruta_generada), "La ruta generada no es un directorio válido."

    # Verificamos que una subcarpeta esperada se haya creado correctamente
    subcarpeta_curvas = os.path.join(ruta_generada, "Entregables", "CURVAS")
    assert os.path.exists(subcarpeta_curvas), "No se creó la subcarpeta CURVAS."

    # Mensaje final si todo sale bien
    print(f"Test finalizado. Carpeta creada en: {ruta_generada}")

    # Opcional: si quieres eliminar las carpetas creadas durante el test, descomenta esta línea
    # shutil.rmtree(os.path.join(ruta_base, empresa))


# Si el archivo se ejecuta directamente desde consola, corre el test
if __name__ == "__main__":
    test_crear_estructura_temporal()
