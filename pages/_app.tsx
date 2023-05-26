import '../styles/globals.css'
import { Web3Provider } from '@providers'
import type { AppProps } from 'next/app'


export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Web3Provider>
        <Component {...pageProps} />
      </Web3Provider>

    </>
  )
}
