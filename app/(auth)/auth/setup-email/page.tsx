import SetupEmail from "@/components/e-mail/setup-email";

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