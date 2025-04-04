# PowerShell Script para gerar páginas React com estrutura padrão

Write-Host "Criando páginas do sistema..." -ForegroundColor Cyan
Write-Host "-------------------------------------" -ForegroundColor Cyan

# Função para garantir que o diretório existe
function Ensure-Directory {
    param (
        [string]$path
    )
    if (-not (Test-Path $path)) {
        New-Item -ItemType Directory -Path $path -Force | Out-Null
    }
}

# Diretório base
$pastaBase = "app/dashboard"

# Lista de páginas (comuns)
$pags = @( 
    "home", "profile", "users", "committees", "campuses", "organizations", 
    "assets/originals", "assets/copies", "inventories", "groups", 
    "roles", "permissions", "user-roles", "role-permissions"
)

# Lista de páginas únicas por ID
$pagsId = @( 
    "committees/[id]", "campuses/[id]", "organizations/[id]", 
    "assets/originals/[id]", "assets/copies/[id]", "inventories/[id]", 
    "groups/[id]", "roles/[id]", "permissions/[id]", 
    "user-roles/[id]", "role-permissions/[id]"
)

# Lista de páginas de autenticação (fora do dashboard)
$authPages = @("auth/login", "auth/signup", "auth/recover", "auth/callback")

# Criar páginas comuns
foreach ($pag in $pags) {
    $dir = Join-Path $pastaBase $pag
    Ensure-Directory $dir

    $filePath = Join-Path $dir "page.tsx"
    if (-not (Test-Path $filePath)) {
        $content = @"
import MainSection from "@/components/MainSection"

export default function Page() {
  return <MainSection title="$pag" />
}
"@
        $content | Out-File -LiteralPath $filePath -Encoding utf8 -Force
        Write-Host "Criado: $filePath" -ForegroundColor Green
    } else {
        Write-Host "Já existe: $filePath" -ForegroundColor Yellow
    }
}

# Criar páginas únicas por ID
foreach ($pag in $pagsId) {
    $dir = Join-Path $pastaBase $pag
    Ensure-Directory $dir

    $filePath = Join-Path $dir "page.tsx"
    if (-not (Test-Path $filePath)) {
        $content = @"
export default function Page() {
  return <div>Hello, world</div>
}
"@
        $content | Out-File -LiteralPath $filePath -Encoding utf8 -Force
        Write-Host "Criado: $filePath" -ForegroundColor Green
    } else {
        Write-Host "Já existe: $filePath" -ForegroundColor Yellow
    }
}

# Criar páginas de autenticação
foreach ($auth in $authPages) {
    $dir = Join-Path "app" $auth
    Ensure-Directory $dir

    $filePath = Join-Path $dir "page.tsx"
    if (-not (Test-Path $filePath)) {
        $content = @"
export default function Page() {
  return <div>$auth</div>
}
"@
        $content | Out-File -LiteralPath $filePath -Encoding utf8 -Force
        Write-Host "Criado: $filePath" -ForegroundColor Green
    } else {
        Write-Host "Já existe: $filePath" -ForegroundColor Yellow
    }
}

Write-Host "\nTodas as páginas foram processadas." -ForegroundColor Cyan
