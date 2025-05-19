import FirstAcessEmail from "@/components/e-mail/firts-acess-email"

export const metadata = {
  title: "Verificar e-mail - KDÊ",
}

export default function FirstAcessPage() {
  return (
    <div >
      <FirstAcessEmail searchParams={{ email: "" }}></FirstAcessEmail>
    </div>
  )
}