@echo off
chcp 65001 >nul
echo ================================================================
echo   SCRIPT DE LIMPIEZA DE CARPETAS RESIDUALES
echo ================================================================
echo.
echo Este script eliminará carpetas residuales de programas desinstalados:
echo   - PSeInt
echo   - Ollama
echo   - SmowICM (Sworl)
echo.
echo IMPORTANTE: Este script debe ejecutarse como Administrador
echo.
pause
echo.

echo Buscando y eliminando carpetas residuales...
echo.

REM ===== CARPETA DE USUARIO =====
echo [1/7] Revisando carpeta de usuario...

if exist "C:\Users\julie\PSeInt" (
    echo   ✓ Eliminando: C:\Users\julie\PSeInt
    rmdir /s /q "C:\Users\julie\PSeInt"
) else (
    echo   - PSeInt no encontrado en carpeta de usuario
)

if exist "C:\Users\julie\.ollama" (
    echo   ✓ Eliminando: C:\Users\julie\.ollama
    rmdir /s /q "C:\Users\julie\.ollama"
) else (
    echo   - .ollama no encontrado en carpeta de usuario
)

if exist "C:\Users\julie\ollama" (
    echo   ✓ Eliminando: C:\Users\julie\ollama
    rmdir /s /q "C:\Users\julie\ollama"
) else (
    echo   - ollama no encontrado en carpeta de usuario
)

if exist "C:\Users\julie\SmowICM" (
    echo   ✓ Eliminando: C:\Users\julie\SmowICM
    rmdir /s /q "C:\Users\julie\SmowICM"
) else (
    echo   - SmowICM no encontrado en carpeta de usuario
)



echo.

REM ===== APPDATA LOCAL =====
echo [2/7] Revisando AppData\Local...

if exist "C:\Users\julie\AppData\Local\PSeInt" (
    echo   ✓ Eliminando: AppData\Local\PSeInt
    rmdir /s /q "C:\Users\julie\AppData\Local\PSeInt"
) else (
    echo   - PSeInt no encontrado en AppData\Local
)

if exist "C:\Users\julie\AppData\Local\Ollama" (
    echo   ✓ Eliminando: AppData\Local\Ollama
    rmdir /s /q "C:\Users\julie\AppData\Local\Ollama"
) else (
    echo   - Ollama no encontrado en AppData\Local
)

if exist "C:\Users\julie\AppData\Local\SmowICM" (
    echo   ✓ Eliminando: AppData\Local\SmowICM
    rmdir /s /q "C:\Users\julie\AppData\Local\SmowICM"
) else (
    echo   - SmowICM no encontrado en AppData\Local
)

if exist "C:\Users\julie\AppData\Local\Sworl" (
    echo   ✓ Eliminando: AppData\Local\Sworl
    rmdir /s /q "C:\Users\julie\AppData\Local\Sworl"
) else (
    echo   - Sworl no encontrado en AppData\Local
)



echo.

REM ===== APPDATA ROAMING =====
echo [3/7] Revisando AppData\Roaming...

if exist "C:\Users\julie\AppData\Roaming\PSeInt" (
    echo   ✓ Eliminando: AppData\Roaming\PSeInt
    rmdir /s /q "C:\Users\julie\AppData\Roaming\PSeInt"
) else (
    echo   - PSeInt no encontrado en AppData\Roaming
)

if exist "C:\Users\julie\AppData\Roaming\Ollama" (
    echo   ✓ Eliminando: AppData\Roaming\Ollama
    rmdir /s /q "C:\Users\julie\AppData\Roaming\Ollama"
) else (
    echo   - Ollama no encontrado en AppData\Roaming
)

if exist "C:\Users\julie\AppData\Roaming\SmowICM" (
    echo   ✓ Eliminando: AppData\Roaming\SmowICM
    rmdir /s /q "C:\Users\julie\AppData\Roaming\SmowICM"
) else (
    echo   - SmowICM no encontrado en AppData\Roaming
)

if exist "C:\Users\julie\AppData\Roaming\Sworl" (
    echo   ✓ Eliminando: AppData\Roaming\Sworl
    rmdir /s /q "C:\Users\julie\AppData\Roaming\Sworl"
) else (
    echo   - Sworl no encontrado en AppData\Roaming
)



echo.

REM ===== APPDATA LOCALLOW =====
echo [4/7] Revisando AppData\LocalLow...

if exist "C:\Users\julie\AppData\LocalLow\PSeInt" (
    echo   ✓ Eliminando: AppData\LocalLow\PSeInt
    rmdir /s /q "C:\Users\julie\AppData\LocalLow\PSeInt"
) else (
    echo   - PSeInt no encontrado en AppData\LocalLow
)

if exist "C:\Users\julie\AppData\LocalLow\Ollama" (
    echo   ✓ Eliminando: AppData\LocalLow\Ollama
    rmdir /s /q "C:\Users\julie\AppData\LocalLow\Ollama"
) else (
    echo   - Ollama no encontrado en AppData\LocalLow
)

if exist "C:\Users\julie\AppData\LocalLow\SmowICM" (
    echo   ✓ Eliminando: AppData\LocalLow\SmowICM
    rmdir /s /q "C:\Users\julie\AppData\LocalLow\SmowICM"
) else (
    echo   - SmowICM no encontrado en AppData\LocalLow
)

echo.

REM ===== PROGRAM FILES =====
echo [5/7] Revisando Program Files...

if exist "C:\Program Files\PSeInt" (
    echo   ✓ Eliminando: Program Files\PSeInt
    rmdir /s /q "C:\Program Files\PSeInt"
) else (
    echo   - PSeInt no encontrado en Program Files
)

if exist "C:\Program Files\Ollama" (
    echo   ✓ Eliminando: Program Files\Ollama
    rmdir /s /q "C:\Program Files\Ollama"
) else (
    echo   - Ollama no encontrado en Program Files
)

if exist "C:\Program Files\SmowICM" (
    echo   ✓ Eliminando: Program Files\SmowICM
    rmdir /s /q "C:\Program Files\SmowICM"
) else (
    echo   - SmowICM no encontrado en Program Files
)



echo.

REM ===== PROGRAM FILES (X86) =====
echo [6/7] Revisando Program Files (x86)...

if exist "C:\Program Files (x86)\PSeInt" (
    echo   ✓ Eliminando: Program Files (x86)\PSeInt
    rmdir /s /q "C:\Program Files (x86)\PSeInt"
) else (
    echo   - PSeInt no encontrado en Program Files (x86)
)

if exist "C:\Program Files (x86)\Ollama" (
    echo   ✓ Eliminando: Program Files (x86)\Ollama
    rmdir /s /q "C:\Program Files (x86)\Ollama"
) else (
    echo   - Ollama no encontrado en Program Files (x86)
)

if exist "C:\Program Files (x86)\SmowICM" (
    echo   ✓ Eliminando: Program Files (x86)\SmowICM
    rmdir /s /q "C:\Program Files (x86)\SmowICM"
) else (
    echo   - SmowICM no encontrado en Program Files (x86)
)



echo.

REM ===== PROGRAMDATA =====
echo [7/7] Revisando ProgramData...

if exist "C:\ProgramData\PSeInt" (
    echo   ✓ Eliminando: ProgramData\PSeInt
    rmdir /s /q "C:\ProgramData\PSeInt"
) else (
    echo   - PSeInt no encontrado en ProgramData
)

if exist "C:\ProgramData\Ollama" (
    echo   ✓ Eliminando: ProgramData\Ollama
    rmdir /s /q "C:\ProgramData\Ollama"
) else (
    echo   - Ollama no encontrado en ProgramData
)

if exist "C:\ProgramData\SmowICM" (
    echo   ✓ Eliminando: ProgramData\SmowICM
    rmdir /s /q "C:\ProgramData\SmowICM"
) else (
    echo   - SmowICM no encontrado en ProgramData
)



echo.
echo ================================================================
echo   LIMPIEZA COMPLETADA
echo ================================================================
echo.
echo El script ha terminado de buscar y eliminar carpetas residuales.
echo.
echo RECOMENDACIÓN: También puedes usar CCleaner o similar para
echo limpiar el registro de Windows de entradas obsoletas.
echo.
pause