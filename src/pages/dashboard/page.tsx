import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export default function DashboardPage() {
    return (
        <div className="flex min-h-full flex-col  ">
            <Card className="mx-auto max-w-2xl w-full mt-4">
                <CardHeader>
                    <CardTitle>Arraste seu arquivo CSV ou Excel</CardTitle>
                </CardHeader>
                <CardContent>
                    <Input id="file" type="file" />
                </CardContent>
            </Card>
            <div className="flex flex-1 items-center p-4">
                <div>
                    <h1 className="text-xl font-bold ">Habilitar Aceleração de Hardware</h1>
                    <p className="text-sm">Acelera o processamento usando recursos do hardware</p>
                </div>
                <Switch id="hardware" />
            </div>
            <Button>
                Processar
            </Button>
        </div>
    )
}
