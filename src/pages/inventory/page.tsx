import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export default function Inventory() {
  return (
    <div className="flex-1 w-full p-3 xs:p-4 sm:p-5 md:p-6 lg:p-8 flex items-center justify-center">
      <Card className="bg-[var(--bg-simple)] w-full max-w-[98%] xs:max-w-[95%] sm:max-w-[90%] md:max-w-[85%] lg:max-w-[calc(100%-var(--sidebar-width)-2rem)] mx-auto p-4 sm:p-6 lg:p-8 shadow-md rounded-lg flex flex-col min-h-[85vh] xs:min-h-[80vh] sm:min-h-[75vh] md:min-h-[70vh]">
        Hello
      </Card>
    </div>
  );
}
