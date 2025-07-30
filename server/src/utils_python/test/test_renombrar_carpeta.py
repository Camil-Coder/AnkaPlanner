# src/utils_python/tests/test_renombrar_carpeta.py

import os       # Para manejo de archivos
import shutil   # Para eliminar carpetas al final del test
import sys      # Para incluir ruta del script objetivo

# Agregamos al path el directorio donde está la función que vamos a testear
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Importamos la función que queremos testear
from renombrar_carpeta_proyecto import renombrar_proyecto


def test_renombrar_proyecto():
    """
    Test para verificar que la función renombrar_proyecto() renombra correctamente
    una carpeta de proyecto dentro de una empresa simulada.
    """
    empresa = "PRUEBAEMPRESA"
    nombre_original = "PROYECTO123"
    nombre_nuevo = "PROYECTO321"
    ruta_base = r"D:\test"  # Ruta de prueba local, fuera del disco real

    # Crear la carpeta original manualmente como si existiera el proyecto
    ruta_origen = os.path.join(ruta_base, empresa, nombre_original)
    os.makedirs(ruta_origen, exist_ok=True)

    # Verificar que la carpeta original se haya creado
    assert os.path.exists(ruta_origen), "No se creó la carpeta original para el test."

    # Ejecutar el renombramiento
    ruta_resultado = renombrar_proyecto(empresa, nombre_original, nombre_nuevo, ruta_base=ruta_base)

    # Verificar que la nueva ruta exista
    assert os.path.exists(ruta_resultado), "La carpeta no fue renombrada correctamente."
    assert os.path.basename(ruta_resultado) == nombre_nuevo, "El nombre de la carpeta renombrada es incorrecto."

    print(f"Test completado. Carpeta renombrada a: {ruta_resultado}")

    # Opcional: si quieres eliminar las carpetas modificada durante el test, descomenta esta línea
    shutil.rmtree(os.path.join(ruta_base, empresa))


# Si el archivo se ejecuta directamente, correr el test
if __name__ == "__main__":
    test_renombrar_proyecto()
