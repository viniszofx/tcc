import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function AuthPage() {
    return (
        <div className='flex flex-col items-center justify-center min-h-screen p-4'>
            <img className="mx-auto w-72 h-auto md:hidden" src="/Logotipo.svg" alt="logo" />
            <Card className="mx-auto max-w-2xl w-full mt-4">
                <CardHeader className="w-full flex flex-col items-start md:items-center text-left md:text-center">
                    <img className="w-88 h-auto hidden md:block mb-6" src="/Logotipo.svg" alt="logo" />
                    <CardTitle className='text-4xl font-bold'>Login</CardTitle>
                    <CardDescription className='mt-2'>O Controle de inventário na palma das as mãos</CardDescription>
                </CardHeader>
                <CardContent className='space-y-2'>
                    <Input placeholder='Email' type='email' />
                    <Input placeholder='Senha' type='password' />
                    <Button className='w-full' variant={'outline'}>Entrar</Button>
                    <a className='block w-full text-sm text-end' href="/">Esqueceu a senha?</a>
                </CardContent>
                <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                    <span className="relative z-10 bg-background px-2 text-muted-foreground">
                        ou
                    </span>
                </div>
                <CardFooter className='mt-6 flex flex-col'>
                    <Button className='w-full'>Entrar com Google</Button>
                    <p className='text-sm text-muted-foreground mt-2 text-center'>Entre em contato com o campus
                        para ter acesso ao sistema</p>
                </CardFooter>
            </Card>
        </div>
    )
}
