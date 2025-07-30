import os
import sys
import shutil

# Agregamos la ruta del script que vamos a testear
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Importamos la función a testear
from crear_gps_en_rastreo import crear_gps_en_rastreo

def test_crear_gps_en_rastreo():
    """
    Test que verifica la creación de la carpeta de un GPS
    y la copia de los archivos observado y navegado.
    """

    # Ruta simulada personalizada para pruebas
    ruta_base_fake = r"F\TEST\PROYECTO321\Procesamiento\1. Topografia\Rastreos\290725\Base"
    nombre_gps = "gps_test"

    # Creamos la carpeta base simulada si no existe
    os.makedirs(ruta_base_fake, exist_ok=True)

    # Crear archivos temporales simulados para prueba
    archivo_nav = os.path.join(ruta_base_fake, "archivo_test.nav")
    archivo_obs = os.path.join(ruta_base_fake, "archivo_test.obs")

    with open(archivo_nav, "w") as f:
        f.write("Contenido falso del archivo navegado")

    with open(archivo_obs, "w") as f:
        f.write("Contenido falso del archivo observado")

    # Ejecutar la función
    ruta_obs_final, ruta_nav_final = crear_gps_en_rastreo(
        ruta_base_fake, nombre_gps, archivo_nav, archivo_obs
    )

    # Verificaciones
    assert os.path.exists(ruta_obs_final), "❌ No se copió el archivo observado."
    assert os.path.exists(ruta_nav_final), "❌ No se copió el archivo navegado."

    print("✅ Archivos copiados correctamente en:")
    print("  Observado:", ruta_obs_final)
    print("  Navegado:", ruta_nav_final)

    # Limpieza final (opcional)
    shutil.rmtree(os.path.join(os.path.dirname(ruta_base_fake), "..", "..", ".."))

# Si se ejecuta directamente desde consola
if __name__ == "__main__":
    test_crear_gps_en_rastreo()
