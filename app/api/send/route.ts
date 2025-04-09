import { EmailTemplate } from "@/components/e-mail";
import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  throw new Error("Missing RESEND_API_KEY in environment variables");
}

const resend = new Resend(resendApiKey);

export async function POST() {
  try {
    const { data, error } = await resend.emails.send({
      from: "teste@tcc.viniccius.com.br",
      to: ["pedroesnarriaga@gmail.com"],
      subject: "Hello world",
      react: await EmailTemplate({ firstName: "Vinicius" }),
    });

    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    return Response.json(data);
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
