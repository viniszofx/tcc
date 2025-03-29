import React from 'react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
        <img className='mx-auto w-md' src="/Logotipo.svg" alt="logo" />
      <main className="w-full">
            {children}
        </main>
    </div>
  )
}
