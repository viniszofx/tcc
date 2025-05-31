"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  console.log("signIn called", formData);
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  console.log("signIn data", data);

  const { error } = await supabase.auth.signInWithPassword(data);
  console.log("signIn error", error);
  if (error) {
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signUp(formData: FormData) {
  const data = {
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  // Validate required fields
  if (!data.email || !data.password || !data.first_name || !data.last_name) {
    redirect("/error?message=missing_fields");
  }

  const { error, data: userData } = await createUserAccount(data);

  console.log("signUp result:", userData, error);

  if (error) {
    console.error("Sign up error:", error.message);
    redirect(`/error?message=${error.message}`);
  }

  revalidatePath("/", "layout");
  redirect("/verify-email");
}

async function createUserAccount({
  email,
  password,
  first_name,
  last_name,
}: {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}) {
  const supabase = await createClient();

  const result = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name,
        last_name,
        full_name: `${first_name} ${last_name}`,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_URL}/confirm`,
    },
  });

  return result;
}

export async function signOut() {
  console.log("signOut called");
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Error signing out:", error);
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/");
}

async function signInWith({ provider }: { provider: string }) {
  const ServerUrl = process.env.NEXT_PUBLIC_BASE_URL;
  console.log("ServerUrl", ServerUrl);
  if (!ServerUrl) {
    console.error(
      "NEXT_PUBLIC_BASE_URL is not defined in the environment variables."
    );
    redirect("/error?message=missing_url");
  }

  console.log("signInWith called", provider);
  const supabase = await createClient();

  const { error, data } = await supabase.auth.signInWithOAuth({
    provider: provider as any,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/auth/callback`,
    },
  });

  console.log("signInWith result data:", data.provider, data.url);
  console.log("signInWith result error:", error);

  if (error) {
    console.error("Error signing in with provider:", error);
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect(data.url);
}

export async function signInWithGoogle() {
  console.log("signInWithGoogle called");
  return await signInWith({
    provider: "google",
  });
}

export async function signInWithMagicLink(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;

  if (!email) {
    return { error: "Email is required" };
  }

  // Validate email domain
  if (
    !email.endsWith("@estudante.ifms.edu.br") &&
    !email.endsWith("@ifms.edu.br")
  ) {
    return { error: "Invalid email domain" };
  }

  try {
    const { error, data } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_URL}/auth/callback`,
        data: {
          email,
          // role: email.includes("@estudante.ifms.edu.br") ? "student" : "staff",
          // name: email.split("@")[0], // Add name from email
        },
      },
    });
    console.log("signInWithMagicLink result data:", data);
    if (error) {
      console.error("Magic link error:", error.message);
      return { error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { error: "An unexpected error occurred" };
  }
}
