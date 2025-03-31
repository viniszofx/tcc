import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export default function DashboardPage() {
    return (
        //sugestão de layout
        <div className="flex min-h-[calc(100vh-var(--header-height))] flex-col items-center justify-center px-4">
            <Card className="w-full max-w-[95%] md:max-w-[calc(100%-var(--sidebar-width))] min-h-[60vh] md:min-h-[70vh] mx-auto p-6 bg-white shadow-md rounded-lg">
                <CardHeader>
                    <CardTitle className="text-center md:text-left">
                        Arraste seu arquivo CSV ou Excel
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                    <Input id="file" type="file" className="w-full mb-4" />
                </CardContent>
                <div className="mx-auto flex flex-col md:flex-row items-center justify-between p-4 max-w-2xl w-full gap-4">
                    <div className="text-center md:text-left">
                        <h1 className="text-xl font-bold">Habilitar Aceleração de Hardware</h1>
                        <p className="text-sm">Acelera o processamento usando recursos do hardware</p>
                    </div>
                    <Switch id="hardware" />
                </div>
                <div className="flex justify-center md:justify-end mt-4">
                    <Button className="mx-auto md:ml-auto w-full md:w-auto">Processar</Button>
                </div>
            </Card>
        </div>
    );
}


