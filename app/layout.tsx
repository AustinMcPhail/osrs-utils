import { imread } from '@u4/opencv4nodejs'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Create Next App',
    description: 'Generated by create next app',
}

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    console.log({ imread })
    return (
        <html lang="en">
            <body className={inter.className}>{children}</body>
        </html>
    )
}
