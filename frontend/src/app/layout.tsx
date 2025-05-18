import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Mi Aplicación Web',
    description: 'Aplicación web creada con Next.js, FastAPI y PostgreSQL',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
    <html lang="es">
        <body className={inter.className}>
        {children}
        </body>
    </html>
    )
}