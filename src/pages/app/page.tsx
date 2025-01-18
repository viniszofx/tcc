import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Download, Upload } from "lucide-react";
import { Separator } from "../../components/ui/separator";

export function App() {
  return (
    <Card className="m-2 md:m-0">
      <CardHeader>
        <CardTitle>#20250117</CardTitle>
        <CardDescription>Sala dos Professores</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-between items-center">
        <div>
          <p className="text-xs">Status</p>
          <Badge className="bg-green-500">Completo</Badge>
        </div>
        <Separator orientation="vertical"></Separator>
        <div>
          <Button>
            <Camera></Camera>
          </Button>
          <Button>
            <Upload></Upload>
          </Button>
          <Button>
            <Download></Download>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
