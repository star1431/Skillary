import './globals.css'
import Header from './components/Header'

export const metadata = {
  title: 'Skillary',
  description: '크리에이터와 함께 성장하세요',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <Header />
        {children}
      </body>
    </html>
  )
}
