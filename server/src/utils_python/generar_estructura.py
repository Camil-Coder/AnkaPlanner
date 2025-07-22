# generar_estructura.py
import os
import sys

# 1. Recibimos los argumentos: ruta_base, empresa, proyecto
ruta_disco = sys.argv[1]      # ejemplo: "F:/"
empresa = sys.argv[2]         # ejemplo: "DISAIN"
proyecto = sys.argv[3]        # ejemplo: "puerto-air170725"

# 2. Construir rutas
ruta_empresa = os.path.join(ruta_disco, empresa)
ruta_proyecto = os.path.join(ruta_empresa, proyecto)

# 3. Estructura de carpetas
estructura = [
    "Entregables/CURVAS",
    "Entregables/DSM",
    "Entregables/DTM",
    "Entregables/NUBE",
    "Entregables/ORTOMOSAICO",
    "Entregables/RESTITUCION/DIGITALIZACIÓN",
    "Entregables/RESTITUCION/GDB",
    "Procesamiento/1. Topografia/Cambio de Epoca",
    "Procesamiento/1. Topografia/Rastreos",
    "Procesamiento/1. Topografia/Reportes"
]

# 4. Crear carpeta empresa si no existe
os.makedirs(ruta_empresa, exist_ok=True)

# 5. Crear carpeta del proyecto y subcarpetas
for carpeta in estructura:
    os.makedirs(os.path.join(ruta_proyecto, carpeta), exist_ok=True)

# 6. Imprimir la ruta completa del proyecto como salida
print(ruta_proyecto)
