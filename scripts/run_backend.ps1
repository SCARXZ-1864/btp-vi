$root = Split-Path -Parent $PSScriptRoot
$python = "C:\Users\digbi\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
$env:PYTHONPATH = "$root\backend\.deps;$root\.python_patches;$root"
$env:DATABASE_URL = "sqlite:///./dev_nodues.db"
$env:DEFAULT_ADMIN_EMAIL = "admin@college.edu"
$env:DEFAULT_ADMIN_PASSWORD = "admin12345"
$env:DEFAULT_ADMIN_NAME = "System Admin"
Set-Location $root
& $python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
