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
  timeoutMs: number = 15000,
  maxRetries: number = 2
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await Promise.race([
        operation(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Database operation timeout')), timeoutMs)
        )
      ]);
      
      return result;
    } catch (error: any) {
      lastError = error;
      
      // Se for timeout ou erro de conexão, tentar novamente
      if (
        (error.message?.includes('timeout') || 
         error.message?.includes('connection') ||
         error.code === 'P1001' || // Prisma connection error
         error.code === 'P1008') && // Prisma timeout error
        attempt < maxRetries
      ) {
        console.warn(`Database operation failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying...`);
        // Backoff exponencial: 1s, 2s, 4s...
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
        continue;
      }
      
      // Se não for erro de timeout/conexão ou esgotaram as tentativas, lançar o erro
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
  timeoutMs: number = 20000
): Promise<T[]> {
  return Promise.race([
    Promise.all(operations.map(op => op())),
    new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Parallel database operations timeout')), timeoutMs)
    )
  ]);
}

/**
 * Configurações otimizadas para consultas do Prisma
 */
export const OPTIMIZED_QUERY_CONFIG = {
  // Timeout padrão para consultas simples
  SIMPLE_QUERY_TIMEOUT: 10000, // 10 segundos
  
  // Timeout para consultas complexas com joins
  COMPLEX_QUERY_TIMEOUT: 20000, // 20 segundos
  
  // Timeout para operações de escrita
  WRITE_OPERATION_TIMEOUT: 15000, // 15 segundos
  
  // Número máximo de tentativas
  MAX_RETRIES: 2,
};