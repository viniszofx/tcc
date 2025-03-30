import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function RecoverPasswordPage() {
    return (
        <div className='flex flex-col items-center justify-center min-h-screen p-4'>
            <img className="mx-auto w-72 h-auto md:hidden" src="/Logotipo.svg" alt="logo" />
            <Card className="mx-auto max-w-2xl w-full mt-4">
                <CardHeader className="flex flex-col items-start md:items-center text-left md:text-center">
                    <img className="w-88 h-auto hidden md:block mb-6" src="/Logotipo.svg" alt="logo" />
                    <CardTitle className='text-3xl font-bold'>Esqueceu a senha?</CardTitle>
                    <CardDescription className='mt-2'>Digite seu endereço de e-mail e enviaremos um link para redefinir a senha</CardDescription>
                </CardHeader>
                <CardContent className='space-y-2 mt-6'>
                    <Input placeholder='Email' type='email' />
                    <Button className='w-full' variant={'outline'}>Enviar link de redefinição</Button>
                </CardContent>
                <CardFooter className='flex justify-center text-center mb-6'>
                    <p className='text-sm text-muted-foreground mt-2'>Você não recebeu o link no seu e-mail? Cheque seu spam
                    ou tente <a href="/auth" className='underline'>outro e-mail.</a></p>
                </CardFooter>
            </Card>
        </div>
    )
}
