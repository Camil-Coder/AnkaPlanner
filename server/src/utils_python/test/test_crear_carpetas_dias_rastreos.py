# src/utils_python/tests/test_crear_carpetas_dia_rastreo.py

import os
import sys
import shutil

# Agregamos la ruta del script que vamos a testear
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Importamos la función que vamos a probar
from crear_carpetas_dia_rastreo import crear_carpetas_dia_rastreo

def test_crear_carpetas_dia_rastreo():
    """
    Test que verifica que se crean correctamente las carpetas de un día de rastreo
    dentro de una ruta de proyecto personalizada.
    """

    # Ruta base simulada para pruebas (evita usar F:)
    ruta_proyecto = r"A:\TEST\PROYECTO321"
    nombre_dia = "280725"

    # Llamamos a la función para crear las carpetas del día de rastreo
    ruta_rastreo, ruta_reportes = crear_carpetas_dia_rastreo(ruta_proyecto, nombre_dia)

    # Mostramos las rutas retornadas
    print("Ruta Rastreos:", ruta_rastreo)
    print("Ruta Reportes:", ruta_reportes)

    # Verificamos que las carpetas se hayan creado correctamente
    assert os.path.exists(os.path.join(ruta_rastreo, 'Base')), "No se creó la carpeta 'Base'."
    assert os.path.exists(os.path.join(ruta_rastreo, 'Red activa')), "No se creó la carpeta 'Red activa'."
    assert os.path.exists(os.path.join(ruta_reportes, 'FIX')), "No se creó la carpeta 'FIX'."
    assert os.path.exists(os.path.join(ruta_reportes, 'NAVEGADO')), "No se creó la carpeta 'NAVEGADO'."

    # Final
    print("✅ Test completado con éxito.")

    # Opcional: limpieza del entorno
    # shutil.rmtree(ruta_base_fake)

# Si se ejecuta directamente desde consola
if __name__ == "__main__":
    test_crear_carpetas_dia_rastreo()
