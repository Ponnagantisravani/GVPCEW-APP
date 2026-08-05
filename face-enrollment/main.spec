# -*- mode: python ; coding: utf-8 -*-

import sys
import importlib.util
from pathlib import Path

from PyInstaller.utils.hooks import collect_data_files, collect_dynamic_libs, collect_submodules


APP_NAME = "GVPCEW-Face-Enrollment"
PROJECT_DIR = Path(SPECPATH).resolve().parent
PYTHON_DIR = Path(sys.base_prefix).resolve()


def _find_single_dir(candidates, description):
    for candidate in candidates:
        if candidate.is_dir():
            return candidate
    checked = "\n".join(str(path) for path in candidates)
    raise FileNotFoundError(f"Could not find {description}. Checked:\n{checked}")


def _find_tcl_tk_dirs():
    tcl_root = _find_single_dir(
        [
            PYTHON_DIR / "tcl",
            PYTHON_DIR / "Lib" / "tcl",
            PYTHON_DIR / "Library" / "lib",
        ],
        "Python Tcl root directory",
    )

    tcl_candidates = sorted(tcl_root.glob("tcl[0-9]*"))
    tk_candidates = sorted(tcl_root.glob("tk[0-9]*"))

    tcl_dir = _find_single_dir(tcl_candidates, "Tcl runtime directory")
    tk_dir = _find_single_dir(tk_candidates, "Tk runtime directory")
    return tcl_dir, tk_dir


def _optional_tree_data(dirname):
    source = PROJECT_DIR / dirname
    if not source.exists():
        return []
    return [(str(path), str(Path(dirname) / path.relative_to(source))) for path in source.rglob("*") if path.is_file()]


def _package_exists(package):
    return importlib.util.find_spec(package) is not None


def _collect_data(package):
    return collect_data_files(package) if _package_exists(package) else []


def _collect_binaries(package):
    return collect_dynamic_libs(package) if _package_exists(package) else []


def _runtime_submodule(name):
    parts = name.split(".")
    return not any(part in {"tests", "testing", "conftest", "__main__"} for part in parts)


def _collect_hidden(package):
    return collect_submodules(package, filter=_runtime_submodule) if _package_exists(package) else []


tcl_dir, tk_dir = _find_tcl_tk_dirs()

datas = [
    (str(tcl_dir), "tcl_data"),
    (str(tk_dir), "tk_data"),
]

datas += _collect_data("customtkinter")
datas += _collect_data("cv2")
datas += _collect_data("PIL")
datas += _collect_data("certifi")
datas += _collect_data("face_recognition_models")
datas += _collect_data("requests")

for asset_dir in ("api", "camera", "recognition", "ui", "utils", "datasets", "icons", "models"):
    datas += _optional_tree_data(asset_dir)

binaries = []
binaries += _collect_binaries("cv2")
binaries += _collect_binaries("numpy")
binaries += _collect_binaries("bcrypt")
binaries += _collect_binaries("cryptography")

hiddenimports = []
for package in (
    "customtkinter",
    "tkinter",
    "PIL",
    "cv2",
    "numpy",
    "requests",
    "urllib3",
    "charset_normalizer",
    "certifi",
    "idna",
    "bcrypt",
    "cryptography",
    "face_recognition",
    "face_recognition_models",
    "multiprocessing",
):
    hiddenimports += _collect_hidden(package)

hiddenimports += [
    "tkinter",
    "tkinter.colorchooser",
    "tkinter.commondialog",
    "tkinter.constants",
    "tkinter.dialog",
    "tkinter.dnd",
    "tkinter.filedialog",
    "tkinter.font",
    "tkinter.messagebox",
    "tkinter.scrolledtext",
    "tkinter.simpledialog",
    "tkinter.ttk",
    "PIL.Image",
    "PIL.ImageTk",
    "api.client",
    "camera.capture",
    "recognition.engine",
    "ui.main_window",
    "utils.profile",
]


a = Analysis(
    ["main.py"],
    pathex=[str(PROJECT_DIR)],
    binaries=binaries,
    datas=datas,
    hiddenimports=sorted(set(hiddenimports)),
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
    optimize=0,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.datas,
    [],
    name=APP_NAME,
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=False,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
