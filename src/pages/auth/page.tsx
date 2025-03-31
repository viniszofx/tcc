import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function AuthPage() {
    return (
        <div className='flex flex-col items-center justify-center h-screen p-4'>
            <img className="mx-auto w-72 h-auto md:hidden" src="/Logotipo.svg" alt="logo" />
            <Card className="mx-auto max-w-3xl w-full mt-4 max-h-full md:p-8 border-[var(--border-color)] bg-[var(--bg-simple)]">
                <CardHeader className="w-full flex flex-col items-start md:items-center text-left md:text-center">
                    <img className="w-88 h-auto hidden md:block mb-6" src="/Logotipo.svg" alt="logo" />
                    <CardTitle className='text-4xl font-bold text-[var(--font-color)]'>Login</CardTitle>
                    <CardDescription className='mt-2 text-[var(--font-color)]'>O Controle de inventário na palma das as mãos</CardDescription>
                </CardHeader>
                <CardContent className='space-y-4 flex flex-col items-center'>
                    <div className='w-full md:w-112 space-y-3'>
                    <Input className='border-[var(--border-input)]' placeholder='Email' type='email' />
                    <Input className='border-[var(--border-input)]' placeholder='Senha' type='password' />
                    <Button className='w-full border-[var(--border-color)] bg-[var(--bg-simple)] cursor-pointer' variant={'outline'}>Entrar</Button>
                    <a className='block w-full text-sm text-end text-[var(--font-color)]' href="/recover-password">Esqueceu a senha?</a>
                    </div>
                </CardContent>
                <div className="relative text-center text-sm after:absolute after:left-8 after:right-8 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-[var(--border-color)] w-full md:w-112 mx-auto mt-6">
                    <span className="relative z-10 bg-[var(--bg-simple)] px-2 text-[var(--font-color)]">
                        ou
                    </span>
                </div>
                <CardFooter className='mt-6 flex flex-col items-center'>
                    <Button className='w-full md:w-112 bg-[var(--button-color)] text-[var(--font-color2)] cursor-pointer'>Entrar com Google</Button>
                    <p className='text-sm mt-2 text-center text-[var(--font-color)]'>Entre em contato com o campus
                        para ter acesso ao sistema</p>
                </CardFooter>
            </Card>
        </div>
    )
}
