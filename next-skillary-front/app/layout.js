import './globals.css'
import Script from 'next/script';
import Header from './components/Header'

export const metadata = {
  title: 'Skillary',
  description: '크리에이터와 함께 성장하세요',
}

export default function RootLayout({ children }) {
  const clientKey = 'test_ck_yL0qZ4G1VO11Mw99NZLv8oWb2MQY'; 

  return (
    <html lang="ko">
      <body>
        <Header />
        {children}
        <Script 
          src="https://js.tosspayments.com/v2/standard"
          strategy="afterInteractive" 
        />
      </body>
    </html>
  )
}
