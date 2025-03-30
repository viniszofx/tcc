import React from 'react'

export default function RecoverPasswordLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen p-4'>
      <main className="w-full">
            {children}
        </main>
    </div>
  )
}