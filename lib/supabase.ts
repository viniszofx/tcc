import { createBrowserClient, createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL is required");
}

if (!supabaseAnonKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is required");
}

// Cliente para uso no navegador (client-side)
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// Cliente para uso server-side (SSR/SSG) - requer cookieStore
export const createSupabaseServerClient = (cookieStore: any) => {
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
export const supabaseAdmin = (() => {
  // Só tentar criar o admin client se estivermos no servidor
  if (typeof window !== "undefined") {
    console.warn("Supabase Admin client should not be used on client-side");
    return null;
  }

  try {
    return createSupabaseAdmin();
  } catch (error) {
    console.warn(
      "Supabase Admin client not available:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return null;
  }
})();
