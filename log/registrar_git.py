"""Guarda el historial de Git en un archivo de texto diario."""

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


def main() -> int:
    carpeta_proyecto = Path(__file__).resolve().parent.parent
    carpeta_registros = Path(__file__).resolve().parent / "registros"
    carpeta_registros.mkdir(exist_ok=True)
    archivo_log = carpeta_registros / f"git_{datetime.now():%Y-%m-%d}.txt"

    resultado = subprocess.run(
        ["git", "-C", str(carpeta_proyecto), "log", "--all", "--date=iso", "--pretty=fuller"],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )

    with archivo_log.open("w", encoding="utf-8") as registro:
        registro.write(f"{marca_tiempo()} Historial generado con: git log\n\n")
        registro.write(resultado.stdout)
        if resultado.stderr:
            registro.write(f"\n{marca_tiempo()} {resultado.stderr.rstrip()}\n")

    if resultado.stdout:
        print(resultado.stdout, end="")
    if resultado.stderr:
        print(resultado.stderr, end="", file=sys.stderr)

    return resultado.returncode


if __name__ == "__main__":
    raise SystemExit(main())
