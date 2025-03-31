import Header from '@/components/custom/header'
import React from 'react'

export default function EmailCheckLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='flex flex-col items-center justify-center h-screen p-4 bg-[var(--card-color)]'>
      <Header name={''} links={[]}></Header>
      <main className="w-full">
            {children}
        </main>
    </div>
  )
}