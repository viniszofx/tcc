import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Testar se o cliente do supabase está funcionando
    const { data, error } = await supabase.auth.getSession();

    return NextResponse.json({
      success: true,
      hasSession: !!data.session,
      error: error?.message || null,
    });
  } catch (error) {
    console.error("Supabase test error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
