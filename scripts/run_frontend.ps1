$root = Split-Path -Parent $PSScriptRoot
$node = "C:\Users\digbi\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
$env:PATH = "C:\Users\digbi\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin;$env:PATH"
Set-Location "$root\frontend"
& $node "..\.tools\package\bin\npm-cli.js" run dev -- --host 127.0.0.1 --port 5173
