# ==========================================
# JOANA IA
# Milestone 01
# Verificação do Ambiente
# ==========================================

Clear-Host

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "         JOANA IA - MILESTONE 01"
Write-Host "     Verificacao do Ambiente"
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Diretório raiz
$Root = Split-Path $PSScriptRoot -Parent

Write-Host "Projeto localizado em:"
Write-Host $Root
Write-Host ""

# ----------------------------
# Node
# ----------------------------

Write-Host "[1/6] Verificando Node.js..."

if (Get-Command node -ErrorAction SilentlyContinue) {
    Write-Host "OK  Node encontrado: $(node -v)" -ForegroundColor Green
}
else {
    Write-Host "ERRO: Node.js nao encontrado." -ForegroundColor Red
    exit
}

# ----------------------------
# npm
# ----------------------------

Write-Host ""
Write-Host "[2/6] Verificando npm..."

if (Get-Command npm -ErrorAction SilentlyContinue) {
    Write-Host "OK  npm encontrado: $(npm -v)" -ForegroundColor Green
}
else {
    Write-Host "ERRO: npm nao encontrado." -ForegroundColor Red
    exit
}

# ----------------------------
# Backend
# ----------------------------

Write-Host ""
Write-Host "[3/6] Verificando backend..."

$backend = Join-Path $Root "backend"

if (Test-Path $backend) {
    Write-Host "OK  Pasta backend encontrada." -ForegroundColor Green
}
else {
    Write-Host "ERRO: Pasta backend inexistente." -ForegroundColor Red
    exit
}

# ----------------------------
# package.json
# ----------------------------

Write-Host ""
Write-Host "[4/6] Verificando package.json..."

if (Test-Path "$backend\package.json") {
    Write-Host "OK  package.json encontrado." -ForegroundColor Green
}
else {
    Write-Host "ERRO: package.json nao encontrado." -ForegroundColor Red
}

# ----------------------------
# tsconfig
# ----------------------------

Write-Host ""
Write-Host "[5/6] Verificando tsconfig.json..."

if (Test-Path "$backend\tsconfig.json") {
    Write-Host "OK  tsconfig.json encontrado." -ForegroundColor Green
}
else {
    Write-Host "ERRO: tsconfig.json nao encontrado." -ForegroundColor Red
}

# ----------------------------
# src
# ----------------------------

Write-Host ""
Write-Host "[6/6] Verificando estrutura src..."

$pastas = @(
"config",
"core",
"database",
"modules",
"plugins",
"shared"
)

foreach($p in $pastas){

    if(Test-Path "$backend\src\$p"){
        Write-Host "OK  src\$p" -ForegroundColor Green
    }
    else{
        Write-Host "FALTA src\$p" -ForegroundColor Yellow
    }

}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host " Milestone 01 concluido."
Write-Host " Ambiente validado."
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""