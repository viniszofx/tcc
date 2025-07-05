import { createBrowserClient, createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const isSupabaseConfigured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Criar um cliente mock quando as variáveis de ambiente não estão configuradas
const createMockClient = () => {
  console.warn("Supabase não configurado: usando cliente simulado");
  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      signInWithPassword: async () => ({
        data: null,
        error: new Error("Supabase não configurado"),
      }),
      signOut: async () => ({ error: null }),
    },
    storage: {
      from: () => ({
        upload: async () => ({
          data: null,
          error: new Error("Bucket not available: Supabase não configurado"),
        }),
        getPublicUrl: () => ({ data: { publicUrl: null } }),
        remove: async () => ({ data: null, error: null }),
      }),
    },
  };
};

// Cliente para uso no navegador (client-side)
export const supabase = isSupabaseConfigured
  ? createBrowserClient(supabaseUrl, supabaseAnonKey)
  : (createMockClient() as any);

// Cliente para uso server-side (SSR/SSG) - requer cookieStore
export const createSupabaseServerClient = (cookieStore: any) => {
  if (!isSupabaseConfigured) {
    return createMockClient() as any;
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch (error) {
          // Ignore errors in server components
        }
      },
      remove(name: string, options: any) {
        try {
          cookieStore.set({ name, value: "", ...options });
        } catch (error) {
          // Ignore errors in server components
        }
      },
    },
  });
};

// Cliente específico para middleware
export const createSupabaseMiddleware = (request: any, response: any) => {
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: any[]) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });
};

// Cliente admin para operações que precisam de privilégios elevados
export const createSupabaseAdmin = () => {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseServiceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required");
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

// Para compatibilidade com código existente - apenas no servidor
// IMPORTANTE: Não exportar diretamente para evitar execução no cliente
// Use createSupabaseAdmin() diretamente nos arquivos de API/servidor
let _supabaseAdminInstance: any = null;

export const getSupabaseAdmin = () => {
  // Só tentar criar o admin client se estivermos no servidor
  if (typeof window !== "undefined") {
    throw new Error("Supabase Admin client should not be used on client-side");
  }

  if (!_supabaseAdminInstance) {
    try {
      _supabaseAdminInstance = createSupabaseAdmin();
    } catch (error) {
      console.warn(
        "Supabase Admin client not available:",
        error instanceof Error ? error.message : "Unknown error"
      );
      return null;
    }
  }

  return _supabaseAdminInstance;
};

// Deprecated: Use createSupabaseAdmin() ou getSupabaseAdmin() instead
// Esta exportação será removida em versões futuras
export const supabaseAdmin = null;
