import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function RecoverPasswordPage() {
    return (
        <div className='flex flex-col items-center justify-center h-screen p-4'>
            <img className="mx-auto w-72 h-auto md:hidden" src="/Logotipo.svg" alt="logo" />
            <Card className="mx-auto max-w-3xl w-full mt-4 max-h-full md:p-8 border-[var(--border-color)] bg-[var(--bg-simple)]">
                <CardHeader className="flex flex-col items-start md:items-center text-left md:text-center">
                    <img className="w-88 h-auto hidden md:block mb-6" src="/Logotipo.svg" alt="logo" />
                    <CardTitle className='text-4xl font-bold mb-6 md:mb-2 text-[var(--font-color)]'>Esqueceu a senha?</CardTitle>
                    <CardDescription className='w-full md:w-112 mb-6 md:mb-4 text-[var(--font-color)]'>Digite seu endereço de e-mail e enviaremos um link para redefinir a senha</CardDescription>
                </CardHeader>
                <CardContent className='space-y-4 flex flex-col items-center'>
                    <div className='w-full md:w-112 space-y-3'>
                        <Input className='border-[var(--border-input)]' placeholder='Email' type='email' />
                        <Button className='w-full border-[var(--border-color)] bg-[var(--bg-simple)]' variant={'outline'}>Enviar link de redefinição</Button>
                    </div>
                </CardContent>
                <CardFooter className='flex justify-center text-center mt-6'>
                    <p className='w-full md:w-112 text-sm mt-2 text-[var(--font-color)]'>Você não recebeu o link no seu e-mail? Cheque seu spam
                    ou tente <a href="/auth" className='underline text-[var(--font-color)]'>outro e-mail.</a></p>
                </CardFooter>
            </Card>
        </div>
    )
}
