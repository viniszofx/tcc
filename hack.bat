@echo off
setlocal EnableDelayedExpansion

:: Diretório base
set "BASE=app\api"

:: Rotas atualizadas com nomes em inglês
set ROUTES=auth\signup auth\login auth\logout auth\callback auth\recover profile\me profile\update users\[id] users committees\[id] committees campuses\[id] campuses organizations\[id] organizations assets\originals\[id] assets\originals assets\copies\[id] assets\copies inventories\[id] inventories groups\[id] groups roles\[id] roles permissions\[id] permissions user_roles role_permissions

:: Criar cada rota
for %%R in (%ROUTES%) do (
    set "DIR=%BASE%\%%R"
    if not exist "!DIR!" (
        mkdir "!DIR!"
    )
    (
        echo import ^{ NextResponse ^} from 'next/server';
        echo.
        echo export async function GET^(^) ^{
        echo.  return NextResponse.json^(^
        echo.    ^{ message: 'GET not implemented' ^}
        echo.  ^);
        echo ^}
        echo.
        echo export async function POST^(^) ^{
        echo.  return NextResponse.json^(^
        echo.    ^{ message: 'POST not implemented' ^}
        echo.  ^);
        echo ^}
        echo.
        echo export async function PUT^(^) ^{
        echo.  return NextResponse.json^(^
        echo.    ^{ message: 'PUT not implemented' ^}
        echo.  ^);
        echo ^}
        echo.
        echo export async function DELETE^(^) ^{
        echo.  return NextResponse.json^(^
        echo.    ^{ message: 'DELETE not implemented' ^}
        echo.  ^);
        echo ^}
    ) > "!DIR!\route.ts"
)

:: Criar middleware.ts, se não existir
if not exist app\middleware.ts (
    echo // middleware opcional > app\middleware.ts
)

echo.
echo ✅ Estrutura da API criada com sucesso com nomes em inglês!
pause
