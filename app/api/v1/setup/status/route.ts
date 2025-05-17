import { createClient } from '@supabase/supabase-js';

export async function GET() {
  console.log("Checking Supabase client initialization...");
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || "", // Use a service role key
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  if(!supabase) {
    return new Response(JSON.stringify({ error: "Supabase client not initialized" }), { status: 500 });
  }

  // Changed this part to use the auth admin API
  const { data: users, error } = await supabase.auth.admin.listUsers()

  console.log(users);

  if(!users || error) {
    console.error("Error fetching users:", error);
    return new Response(JSON.stringify({ error: "Error fetching users" }), { status: 500 });
  }
  
  if (users.users.length === 0) {
    console.log("No users found, first user detected.");
    return new Response(JSON.stringify({ status: "first_user" }), { status: 200 });
  }

  return new Response(JSON.stringify({ status: "ok" }), { status: 200 });
}