import EmailCheck from "@/components/e-mail/check"

export const metadata = {
  title: "Verificar e-mail - KDÊ",
}

export default function EmailCheckPage() {
  return (
    <div >
      <EmailCheck searchParams={{ email: "" }}></EmailCheck>
    </div>
  )
}