# 📁 Diretório de Tipos Centralizados

Este diretório contém todos os tipos, interfaces e definições TypeScript do projeto, organizados de forma centralizada para melhor manutenção e reutilização.

## 📋 Estrutura

```
types/
├── index.ts          # 🎯 Ponto de entrada principal
├── core.ts           # 🏗️  Tipos principais do sistema
├── auth.ts           # 🔐 Autenticação e permissões
├── api.ts            # 🌐 API e validação
├── ui.ts             # 🎨 Componentes de interface
├── config.ts         # ⚙️  Configurações e constantes
├── legacy.ts         # 📦 Tipos legados (compatibilidade)
└── README.md         # 📖 Esta documentação
```

## 🎯 Como Usar

### Importação Simples (Recomendado)

```typescript
// Importa os tipos mais comuns
import { User, Organization, Commission, InventoryItem } from '@/types';

// Importa tipos específicos
import { AuthState, UserPermissions } from '@/types';

// Importa utilitários
import { hasRole, isUser } from '@/types';
```

### Importação Específica

```typescript
// Para tipos de autenticação
import { AuthState, UserPermissions, AppAbility } from '@/types/auth';

// Para tipos de API
import { ApiResponse, ApiError, ValidationResult } from '@/types/api';

// Para tipos de UI
import { ButtonProps, Theme, LoadingState } from '@/types/ui';

// Para configurações
import { SystemConfig, StorageType } from '@/types/config';

// Para tipos legados
import { Usuario, Comissao, BemCopia } from '@/types/legacy';
```

## 🏗️ Arquivos Detalhados

### `core.ts` - Tipos Principais
Contém as interfaces fundamentais do sistema:
- **Entidades**: `User`, `Organization`, `Campus`, `Commission`, `InventoryItem`
- **Enums**: `UserRole`, `CommissionRole`, `ConservationState`, `ItemStatus`
- **Relacionamentos**: Interfaces com relações entre entidades
- **Metadados**: Configurações e informações auxiliares

### `auth.ts` - Autenticação e Permissões
Tipos relacionados à autenticação e controle de acesso:
- **CASL**: `Actions`, `Subjects`, `AppAbility`
- **Contexto**: `AuthState`, `AuthContextType`, `UserContext`
- **Permissões**: `UserPermissions`, `CommissionAccessPermissions`
- **Roles**: `Role`, `Permission`, `UserRole`

### `api.ts` - API e Validação
Tipos para comunicação com APIs e validação:
- **Respostas**: `ApiResponse`, `ApiError`, `PaginatedResult`
- **Validação**: `ValidationResult`, `FormData` (vários tipos)
- **Upload**: `FileUploadResult`, `ProcessingStatus`
- **Sincronização**: `SyncStatus`, `SyncInfo`

### `ui.ts` - Interface de Usuário
Tipos para componentes e interface:
- **Básicos**: `Theme`, `Size`, `Variant`, `LoadingState`
- **Componentes**: Props para botões, inputs, modais, etc.
- **Navegação**: `MenuItem`, `SidebarProps`, `BreadcrumbProps`
- **Feedback**: `ToastMessage`, `LoadingIndicatorProps`

### `config.ts` - Configurações
Tipos para configuração do sistema:
- **Storage**: `StorageType`, `BucketConfig`, `STORAGE_KEYS`
- **Limites**: `LIMITS`, `ESSENTIAL_FIELDS`
- **API**: `RateLimitConfig`, `TimeoutConfig`, `RetryConfig`
- **Sistema**: `SystemConfig`, `EnvironmentVariables`

### `legacy.ts` - Compatibilidade
Tipos do sistema antigo mantidos para compatibilidade:
- **Interfaces antigas**: `Usuario`, `Comissao`, `Organizacao`
- **Enums legados**: `EstadoConservacao`, `StatusBem`
- **Funções de migração**: Conversores entre formatos antigo/novo

## 🛠️ Utilitários Incluídos

### Type Guards

```typescript
import { isUser, isOrganization, isCampus } from '@/types';

if (isUser(data)) {
  // TypeScript sabe que data é do tipo User
  console.log(data.email); // ✅ Type-safe
}
```

### Verificação de Roles

```typescript
import { hasRole } from '@/types';

if (hasRole(user, 'admin')) {
  // Usuário é admin
}

// Funciona com tipos legados também
if (hasRole(usuario, 'ADMINISTRADOR')) {
  // Compatibilidade com sistema antigo
}
```

## 📝 Convenções

### Nomenclatura
- **Interfaces**: PascalCase (`User`, `Organization`)
- **Enums**: PascalCase (`UserRole`, `ItemStatus`)
- **Types**: PascalCase (`ApiResponse`, `ValidationResult`)
- **Props**: Sufixo "Props" (`ButtonProps`, `ModalProps`)

### Organização
- **Básicos primeiro**: Tipos simples antes dos complexos
- **Relacionamentos separados**: Interfaces com relações em seção própria
- **Comentários**: Documentação para tipos complexos
- **Exports**: Sempre usar export nomeado

### Compatibilidade
- **Tipos legados**: Mantidos em `legacy.ts`
- **Migração gradual**: Funções de conversão incluídas
- **Aliases**: Type aliases para facilitar transição

## 🔄 Migração

### Passo a Passo
1. **Identifique** imports antigos no seu arquivo
2. **Substitua** pelos novos imports centralizados
3. **Teste** se não há erros de compilação
4. **Atualize** tipos se necessário

### Script Automático
```bash
# Execute o script de migração
node scripts/migrate-imports.js

# Ou em modo dry-run para visualizar mudanças
node scripts/migrate-imports.js --dry-run
```

### Exemplo de Migração

**Antes:**
```typescript
import { Usuario, Comissao } from '../lib/interface';
import { Commission } from '../interface';
import { Actions } from '../lib/types';
```

**Depois:**
```typescript
import { User, Commission, Actions } from '@/types';
// ou para manter compatibilidade:
import { Usuario, Comissao } from '@/types/legacy';
```

## 🚀 Benefícios

- ✅ **Centralização**: Todos os tipos em um local
- ✅ **Reutilização**: Evita duplicação de código
- ✅ **Manutenção**: Mudanças em um só lugar
- ✅ **Descoberta**: Fácil encontrar tipos relacionados
- ✅ **Consistência**: Nomenclatura padronizada
- ✅ **Type Safety**: Type guards e validações
- ✅ **Compatibilidade**: Suporte a código legado
- ✅ **Documentação**: Tipos bem documentados

## 📚 Referências

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Guia de Migração](../MIGRATION_GUIDE.md)
- [Script de Migração](../scripts/migrate-imports.js)

## 🤝 Contribuindo

Ao adicionar novos tipos:

1. **Escolha o arquivo correto** baseado na categoria
2. **Siga as convenções** de nomenclatura
3. **Adicione documentação** para tipos complexos
4. **Exporte no index.ts** se for um tipo comum
5. **Atualize este README** se necessário

---

💡 **Dica**: Use o IntelliSense do seu editor para explorar os tipos disponíveis digitando `import { } from '@/types'`