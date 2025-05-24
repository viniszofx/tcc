import SetupEmail from "@/app/(auth)/auth/trash/setup-email";

export const metadata = {
  title: "Verificar e-mail - KDÊ",
}

export default function SetupEmailPage() {
  return (
    <div >
      <SetupEmail searchParams={{ email: "" }}></SetupEmail>
    </div>
  )
}