"use server";

export async function signIn(formData: FormData): Promise<void> {
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };
  console.log("signIn received:", data);
}

export async function signUp(formData: FormData): Promise<void> {
  const data = {
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };
  console.log("signUp received:", data);
}

export async function signOut(): Promise<void> {
  console.log("signOut called");
}

export async function signInWithGoogle(): Promise<void> {
  console.log("signInWithGoogle called");
}

type MagicLinkResult = {
  error?: string;
  success?: boolean;
};

export async function signInWithMagicLink(
  formData: FormData
): Promise<MagicLinkResult> {
  const email = formData.get("email") as string;

  if (!email) {
    return { error: "Email is required" };
  }

  if (
    !email.endsWith("@estudante.ifms.edu.br") &&
    !email.endsWith("@ifms.edu.br")
  ) {
    return { error: "Invalid email domain" };
  }

  try {
    console.log("signInWithMagicLink received:", {
      email,
      redirectTo: `${process.env.NEXT_PUBLIC_URL}/auth/callback`,
      options: {
        data: { email },
      },
    });
    return { success: true };
  } catch (error) {
    return { error: (error as Error).message };
  }
}
