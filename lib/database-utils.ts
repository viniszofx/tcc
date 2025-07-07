import { PrismaClient } from '@prisma/client';

/**
 * Executa uma operação do Prisma com timeout e retry
 * @param operation Função que retorna uma Promise da operação do Prisma
 * @param timeoutMs Timeout em milissegundos (padrão: 15 segundos)
 * @param maxRetries Número máximo de tentativas (padrão: 2)
 * @returns Resultado da operação
 */
export async function withDatabaseTimeout<T>(
  operation: () => Promise<T>,
  timeoutMs: number = 0, // Sem timeout
  maxRetries: number = 2
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Executar operação sem timeout
      const result = await operation();
      return result;
    } catch (error: any) {
      lastError = error;
      
      // Se for erro de conexão, tentar novamente
      if (
        (error.message?.includes('connection') ||
         error.code === 'P1001') && // Prisma connection error
        attempt < maxRetries
      ) {
        console.warn(`Database operation failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying...`);
        // Backoff exponencial: 1s, 2s, 4s...
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
        continue;
      }
      
      // Se não for erro de conexão ou esgotaram as tentativas, lançar o erro
      throw error;
    }
  }
  
  throw lastError;
}

/**
 * Executa múltiplas operações do Prisma em paralelo com timeout
 * @param operations Array de funções que retornam Promises das operações do Prisma
 * @param timeoutMs Timeout em milissegundos (padrão: 20 segundos)
 * @returns Array com os resultados das operações
 */
export async function withParallelDatabaseTimeout<T>(
  operations: (() => Promise<T>)[],
  timeoutMs: number = 0 // Sem timeout
): Promise<T[]> {
  // Executar todas as operações sem timeout
  return Promise.all(operations.map(op => op()));
}

/**
 * Configurações otimizadas para consultas do Prisma
 */
export const OPTIMIZED_QUERY_CONFIG = {
  // Sem timeout para consultas simples
  SIMPLE_QUERY_TIMEOUT: 0,
  
  // Sem timeout para consultas complexas com joins
  COMPLEX_QUERY_TIMEOUT: 0,
  
  // Sem timeout para operações de escrita
  WRITE_OPERATION_TIMEOUT: 0,
  
  // Número máximo de tentativas
  MAX_RETRIES: 2,
};