import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import BottomNav from '@/components/BottomNav'
import WelcomeModal from '@/components/WelcomeModal'

export const metadata: Metadata = {
  title: { default: 'KaiVel — Baca Manga & Manhwa', template: '%s | KaiVel' },
  description: 'Platform baca manga, manhwa, dan manhua terlengkap. Baca gratis, update cepat.',
  keywords: ['manga', 'manhwa', 'manhua', 'baca manga', 'komik online'],
  openGraph: {
    title: 'KaiVel — Baca Manga & Manhwa',
    description: 'Platform baca manga, manhwa, dan manhua terlengkap.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
        <BottomNav />
        <WelcomeModal />
      </body>
    </html>
  )
}
