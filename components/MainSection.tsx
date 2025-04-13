import { Card, CardContent } from "@/components/ui/card";

interface Props {
  title: string;
  children?: React.ReactNode;
}

export default function MainSection({ title, children }: Props) {
  return (
    <main className="p-6">
      <Card>
        <CardContent className="p-6 text-xl font-semibold">{title}</CardContent>
        <div className="p-6">{children}</div>
      </Card>
    </main>
  );
}
