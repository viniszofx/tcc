import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
    return (
        <>
            <Card className="mx-auto max-w-2xl w-full mt-4">
                <CardHeader>
                    <CardTitle>Arraste seu arquivo CSV ou Excel</CardTitle>
                    <CardDescription></CardDescription>
                </CardHeader>
                <CardContent>
                </CardContent>
            </Card>
        </>
    )
}
