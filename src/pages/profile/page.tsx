import ProfileAvatar from "@/components/custom/profile-avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export default function ProfilePage() {
    return (
        <div className="flex-1 w-full p-3 xs:p-4 sm:p-5 md:p-6 lg:p-8 flex items-center justify-center">
            <Card className="bg-[var(--bg-simple)] w-full max-w-[98%] xs:max-w-[95%] sm:max-w-[90%] md:max-w-[85%] lg:max-w-[calc(100%-var(--sidebar-width)-2rem)] mx-auto p-4 sm:p-6 lg:p-8 shadow-md rounded-lg flex flex-col min-h-[85vh] xs:min-h-[80vh] sm:min-h-[75vh] md:min-h-[70vh]">
                <div className="flex flex-col items-center w-full gap-4 xs:gap-5 sm:gap-6 md:gap-8 lg:gap-10 flex-grow">
                    <CardHeader className="w-full px-0 pt-0 text-center">
                        <ProfileAvatar foto="./logo.svg" />
                    </CardHeader>
                    
                    <Card className="bg-[var(--card-color)] w-full max-w-xs xs:max-w-sm sm:max-w-md md:max-w-lg shadow-sm rounded-lg p-3 sm:p-5 md:p-6 border-dashed border-[var(--border-input)] flex-1 flex flex-col">
                        <CardHeader className="w-full px-0 pt-0">
                            <CardTitle className="text-center text-sm xs:text-base sm:text-lg md:text-lg lg:text-xl text-[var(--font-color)]"></CardTitle>
                        </CardHeader>
                        <CardContent className="w-full flex flex-col items-center justify-center gap-2 xs:gap-3 sm:gap-4 px-0 pb-0 flex-grow">
                            <Input
                                id="file"
                                type="file"
                                className="w-full bg-[var(--bg-simple)] text-xs xs:text-sm sm:text-sm md:text-sm lg:text-base"
                                accept=".csv, .xls, .xlsx"
                            />
                        </CardContent>
                    </Card>
                
                    <div className="w-full max-w-xs xs:max-w-sm sm:max-w-md md:max-w-lg px-2 sm:px-0">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 xs:gap-3 sm:gap-4">
                            <div className="text-center sm:text-left flex-1">
                                <h1 className="text-sm xs:text-base sm:text-lg md:text-lg lg:text-xl font-bold text-[var(--font-color)]">Habilitar Aceleração de Hardware</h1>
                                <p className="text-xs xs:text-sm sm:text-sm md:text-sm lg:text-sm text-[var(--font-color)]">Acelera o processamento usando recursos do hardware</p>
                            </div>
                            <Switch id="hardware" className="scale-[1.1] xs:scale-[1.2] sm:scale-[1.3] md:scale-[1.4] lg:scale-[1.5] " />
                        </div>
                    </div>
                </div>
                
                <div className="w-full flex mt-6 xs:mt-7 sm:mt-8 md:mt-10 lg:mt-12 pt-3 xs:pt-4 border-t justify-end">
                    <Button className="w-full xs:w-[180px] sm:w-[200px] h-10 xs:h-11 sm:h-12 bg-[var(--button-color)] text-sm xs:text-base cursor-pointer text-[var(--font-color2)] hover:!bg-[var(--hover-3-color)] hover:!text-white transition-all">
                        Processar
                    </Button>
                </div>
            </Card>
        </div>
    );
}