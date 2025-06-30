import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log("Environment Check:");
    console.log("URL:", !!supabaseUrl, supabaseUrl?.substring(0, 30));
    console.log(
      "Anon Key:",
      !!supabaseAnonKey,
      supabaseAnonKey?.substring(0, 30)
    );
    console.log(
      "Service Key:",
      !!supabaseServiceKey,
      supabaseServiceKey?.substring(0, 30)
    );

    if (!supabaseUrl) {
      throw new Error("NEXT_PUBLIC_SUPABASE_URL is required");
    }

    if (!supabaseAnonKey) {
      throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is required");
    }

    // Test creating a simple Supabase client
    const { createClient } = await import("@supabase/supabase-js");
    const testClient = createClient(supabaseUrl, supabaseAnonKey);

    return NextResponse.json({
      success: true,
      hasUrl: !!supabaseUrl,
      hasAnonKey: !!supabaseAnonKey,
      hasServiceKey: !!supabaseServiceKey,
      client: !!testClient,
    });
  } catch (error) {
    console.error("Environment test error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
