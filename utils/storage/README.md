# Storage Utils Structure

Este diretório contém os utilitários de armazenamento refatorados para o sistema de inventário.

## Estrutura dos Arquivos

### `constants.ts`

- Constantes de configuração para localStorage e IndexedDB
- Chaves de armazenamento
- Campos essenciais dos itens de inventário
- Configurações de tamanho de chunk

### `compression.ts`

- Funções de compressão e descompressão de dados
- Divisão de dados em chunks
- Estimativa de tamanho de armazenamento
- Validação de limites de localStorage

### `indexeddb.ts`

- Operações específicas do IndexedDB
- Inicialização do banco de dados
- Armazenamento e recuperação de chunks
- Limpeza de dados

### `local-storage.ts`

- Operações específicas do localStorage
- Limpeza de chunks e metadados

### `storage-manager.ts`

- Gerenciador principal de armazenamento
- Coordena entre localStorage e IndexedDB
- Funções principais: save, get, clear
- Escolha automática do método de armazenamento

### `inventory-api.ts`

- Interface com a API de inventário
- Mapeamento de dados do frontend para API
- Validações de dados
- Integração com armazenamento local

### `index.ts`

- Arquivo barrel que exporta todas as funções
- Mantém compatibilidade com o código existente

## Uso

```typescript
import {
  saveProcessedData,
  getProcessedData,
  addInventoryItem,
} from "@/utils/storage";

// Salvar dados
await saveProcessedData(data, metadata);

// Recuperar dados
const { data, metadata } = await getProcessedData();

// Adicionar item via API
await addInventoryItem(item, commissionId, campusId);
```

## Vantagens da Refatoração

1. **Separação de Responsabilidades**: Cada arquivo tem uma função específica
2. **Manutenibilidade**: Código mais fácil de manter e depurar
3. **Testabilidade**: Funções podem ser testadas individualmente
4. **Reutilização**: Módulos podem ser reutilizados em outros contextos
5. **Compatibilidade**: Mantém compatibilidade com código existente
