# Scripts de Banco de Dados

Este diretório contém scripts para gerenciar o banco de dados do projeto.

## Scripts Disponíveis

### 1. Limpeza do Banco (`clean-database.ts`)

Remove **TODOS** os dados do banco de dados, mantendo apenas a estrutura das tabelas.

```bash
# Mostrar instruções (não executa)
npm run clean-db

# Executar limpeza (IRREVERSÍVEL!)
npm run clean-db -- --force
```

**⚠️ ATENÇÃO**: Esta operação é **IRREVERSÍVEL** e remove todos os dados!

### 2. Dados Básicos (`seed-basic-data.ts`)

Cria dados básicos de teste para desenvolvimento:

```bash
# Criar dados básicos
npm run seed-basic

# Reset completo (limpa + cria dados básicos)
npm run reset-db
```

### 3. Reset Completo

Combina limpeza + criação de dados básicos:

```bash
npm run reset-db
```

## Dados Criados pelo Seed Básico

- **1 Usuário de desenvolvimento**: `88ae80f0-4c14-44ea-b98a-235cf37bf170`
- **1 Organização**: UFMS (Universidade Federal de Mato Grosso do Sul)
- **1 Campus**: Campus Campo Grande
- **1 Comissão**: Comissão de Inventário 2025
- **3 Itens de inventário**: Computador, Projetor, Mesa
- **Histórico**: Registros de criação dos itens

## Segurança

- 🔒 **Produção**: Scripts são bloqueados em `NODE_ENV=production`
- 🔒 **Confirmação**: Operações destrutivas requerem flag `--force`
- 🔒 **Validação**: Verificação de ambiente antes da execução

## Estrutura de Limpeza

A limpeza segue a ordem correta para respeitar foreign keys:

1. `inventory_history` (histórico de inventário)
2. `inventory_items` (itens de inventário)
3. `commission_members` (membros de comissão)
4. `commissions` (comissões)
5. `campus_members` (membros de campus)
6. `campuses` (campus)
7. `organization_members` (membros de organização)
8. `organizations` (organizações)
9. `allowed_users` (usuários permitidos)
10. `user_profiles` (perfis de usuário)

## Uso Recomendado

### Para Desenvolvimento

```bash
# Reset completo para começar limpo
npm run reset-db

# Ou apenas dados básicos se o banco já estiver limpo
npm run seed-basic
```

### Para Limpeza Manual

```bash
# Limpar tudo (cuidado!)
npm run clean-db -- --force
```

## Logs

Os scripts fornecem logs detalhados de cada operação:

- ✅ Sucesso
- ❌ Erro
- 📝 Operação em andamento
- ⚠️ Avisos importantes

## Arquivos

- `clean-database.ts`: Script de limpeza
- `seed-basic-data.ts`: Script de dados básicos
- `README.md`: Esta documentação
