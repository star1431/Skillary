import './globals.css'
import Script from 'next/script';
import Header from './components/Header'
import { SWRConfig } from 'swr';

export const metadata = {
  title: 'Skillary',
  description: '크리에이터와 함께 성장하세요',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <SWRConfig 
          value={{
            revalidateOnFocus: false,
            shouldRetryOnError: false,
            dedupingInterval: 2000,
          }}
        ></SWRConfig>
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
