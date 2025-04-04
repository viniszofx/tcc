import { Card, CardContent } from "@/components/ui/card"

interface Props {
  title: string
}

export default function MainSection({ title }: Props) {
  return (
    <main className="p-6">
      <Card>
        <CardContent className="p-6 text-xl font-semibold">
          {title}
        </CardContent>
      </Card>
    </main>
  )
}
