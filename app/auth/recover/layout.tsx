import React from 'react'

export default function RecoverPasswordLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className='flex flex-col items-center justify-center h-screen p-4 bg-[var(--card-color)]'>
            <main className="w-full">
                {children}
            </main>
        </div>
    )
}