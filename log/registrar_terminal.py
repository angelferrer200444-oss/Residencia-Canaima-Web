"""Abre una terminal que registra los comandos ejecutados en un archivo diario."""

from __future__ import annotations

import subprocess
import sys
from datetime import datetime
from pathlib import Path


DIAS = (
    "lunes",
    "martes",
    "miércoles",
    "jueves",
    "viernes",
    "sábado",
    "domingo",
)


def marca_tiempo() -> str:
    ahora = datetime.now()
    return f"[{DIAS[ahora.weekday()]} {ahora:%d/%m/%Y %H:%M:%S}]"


def escribir_registro(archivo, mensaje: str) -> None:
    archivo.write(f"{marca_tiempo()} {mensaje.rstrip()}\n")
    archivo.flush()


def iniciar_terminal() -> int:
    carpeta_proyecto = Path(__file__).resolve().parent.parent
    carpeta_registros = Path(__file__).resolve().parent / "registros"
    carpeta_registros.mkdir(exist_ok=True)
    ruta_registros = str(carpeta_registros).replace("'", "''")
    ruta_proyecto = str(carpeta_proyecto).replace("'", "''")

    script_powershell = f"""
$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath '{ruta_proyecto}'
$logDirectory = '{ruta_registros}'
$global:lastLoggedHistoryId = 0
$global:terminalPromptReady = $false

function prompt {{
    if ($global:terminalPromptReady) {{
        $lastCommand = Get-History -Count 1
        if ($null -ne $lastCommand -and $lastCommand.Id -ne $global:lastLoggedHistoryId) {{
            $global:lastLoggedHistoryId = $lastCommand.Id
            $logFile = Join-Path $logDirectory ('terminal_' + (Get-Date -Format 'yyyy-MM-dd') + '.txt')
            $timestamp = (Get-Date).ToString(
                'dddd dd/MM/yyyy HH:mm:ss',
                [Globalization.CultureInfo]::GetCultureInfo('es-ES')
            )
            $commandText = $lastCommand.CommandLine -replace '\r?\n', ' '
            Add-Content -LiteralPath $logFile -Value ("[" + $timestamp + "] $ " + $commandText) -Encoding UTF8
        }}
    }}
    $global:terminalPromptReady = $true
    "PS $($executionContext.SessionState.Path.CurrentLocation)> "
}}
"""

    return subprocess.call(
        ["powershell.exe", "-NoLogo", "-NoExit", "-Command", script_powershell],
        cwd=carpeta_proyecto,
    )


def main() -> int:
    if len(sys.argv) < 2:
        return iniciar_terminal()

    carpeta_registros = Path(__file__).resolve().parent / "registros"
    carpeta_registros.mkdir(exist_ok=True)
    archivo_log = carpeta_registros / f"terminal_{datetime.now():%Y-%m-%d}.txt"
    comando = " ".join(sys.argv[1:])

    with archivo_log.open("a", encoding="utf-8") as registro:
        escribir_registro(registro, f"$ {comando}")

        try:
            proceso = subprocess.Popen(
                sys.argv[1:],
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                encoding="utf-8",
                errors="replace",
                bufsize=1,
            )

            if proceso.stdout is not None:
                for linea in proceso.stdout:
                    salida = linea.rstrip("\r\n")
                    print(salida)
                    escribir_registro(registro, salida)

            codigo_salida = proceso.wait()
        except FileNotFoundError:
            mensaje = f"No se encontró el comando: {sys.argv[1]}"
            print(mensaje, file=sys.stderr)
            escribir_registro(registro, mensaje)
            return 1
        except KeyboardInterrupt:
            proceso.terminate()
            mensaje = "Comando interrumpido por el usuario."
            print(mensaje, file=sys.stderr)
            escribir_registro(registro, mensaje)
            return 130

        escribir_registro(registro, f"[código de salida: {codigo_salida}]")
        return codigo_salida


if __name__ == "__main__":
    raise SystemExit(main())
