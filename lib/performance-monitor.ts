import { NextRequest, NextResponse } from 'next/server';

/**
 * Monitor de performance para APIs
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private slowRequestThreshold: number = 5000; // 5 segundos
  private verySlowRequestThreshold: number = 30000; // 30 segundos

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Wrapper para monitorar performance de handlers de API
   */
  async monitorApiHandler<T>(
    handler: () => Promise<T>,
    context: {
      method: string;
      url: string;
      userId?: string;
    }
  ): Promise<T> {
    const startTime = Date.now();
    const { method, url, userId } = context;
    
    try {
      console.log(`🚀 [${method}] ${url} - Iniciado ${userId ? `(user: ${userId})` : '(anonymous)'}`);
      
      const result = await handler();
      const duration = Date.now() - startTime;
      
      this.logRequestCompletion(method, url, duration, 'success', userId);
      
      return result;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      
      this.logRequestCompletion(method, url, duration, 'error', userId, error);
      
      throw error;
    }
  }

  /**
   * Log da conclusão da requisição com análise de performance
   */
  private logRequestCompletion(
    method: string,
    url: string,
    duration: number,
    status: 'success' | 'error',
    userId?: string,
    error?: any
  ) {
    const userInfo = userId ? ` (user: ${userId})` : ' (anonymous)';
    const statusIcon = status === 'success' ? '✅' : '❌';
    
    if (duration > this.verySlowRequestThreshold) {
      console.error(
        `🐌 [VERY SLOW] ${statusIcon} [${method}] ${url} - ${duration}ms${userInfo}`,
        error ? `Error: ${error.message}` : ''
      );
    } else if (duration > this.slowRequestThreshold) {
      console.warn(
        `⚠️ [SLOW] ${statusIcon} [${method}] ${url} - ${duration}ms${userInfo}`,
        error ? `Error: ${error.message}` : ''
      );
    } else {
      console.log(
        `${statusIcon} [${method}] ${url} - ${duration}ms${userInfo}`,
        error ? `Error: ${error.message}` : ''
      );
    }

    // Log adicional para erros de timeout
    if (error && (error.message?.includes('timeout') || error.message?.includes('fetch failed'))) {
      console.error('🔥 TIMEOUT/NETWORK ERROR DETECTED:', {
        method,
        url,
        duration,
        error: error.message,
        stack: error.stack?.split('\n').slice(0, 5).join('\n'), // Primeiras 5 linhas do stack
      });
    }
  }

  /**
   * Configurar thresholds de performance
   */
  setThresholds(slow: number, verySlow: number) {
    this.slowRequestThreshold = slow;
    this.verySlowRequestThreshold = verySlow;
  }
}

/**
 * Wrapper para handlers de API com monitoramento de performance
 */
export function withPerformanceMonitoring<T>(
  handler: (request: NextRequest, ...args: any[]) => Promise<T>,
  options?: {
    slowThreshold?: number;
    verySlowThreshold?: number;
  }
) {
  return async (request: NextRequest, ...args: any[]): Promise<T> => {
    const monitor = PerformanceMonitor.getInstance();
    
    if (options) {
      monitor.setThresholds(
        options.slowThreshold || 5000,
        options.verySlowThreshold || 30000
      );
    }

    return monitor.monitorApiHandler(
      () => handler(request, ...args),
      {
        method: request.method,
        url: request.url,
        // Tentar extrair userId dos headers ou cookies se disponível
        userId: request.headers.get('x-user-id') || undefined,
      }
    );
  };
}

/**
 * Utilitário para medir tempo de operações específicas
 */
export class OperationTimer {
  private startTime: number;
  private operationName: string;

  constructor(operationName: string) {
    this.operationName = operationName;
    this.startTime = Date.now();
    console.log(`⏱️ [${operationName}] Iniciado`);
  }

  finish(additionalInfo?: string) {
    const duration = Date.now() - this.startTime;
    const info = additionalInfo ? ` - ${additionalInfo}` : '';
    
    if (duration > 10000) {
      console.warn(`⚠️ [${this.operationName}] Concluído em ${duration}ms${info} (LENTO)`);
    } else if (duration > 5000) {
      console.log(`⏱️ [${this.operationName}] Concluído em ${duration}ms${info} (moderado)`);
    } else {
      console.log(`✅ [${this.operationName}] Concluído em ${duration}ms${info}`);
    }
    
    return duration;
  }
}