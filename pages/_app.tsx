import type { AppProps } from 'next/app';
import Head from 'next/head';
import '../styles/globals.css';
//import 'antd/dist/antd.css';

import "@rainbow-me/rainbowkit/styles.css";
import {
  ConnectButton,
  getDefaultWallets,
  RainbowKitProvider
} from "@rainbow-me/rainbowkit";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { mainnet, polygon, optimism } from '@wagmi/core/chains'
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { SessionProvider } from 'next-auth/react';
const { chains, provider, webSocketProvider } = configureChains(
  [mainnet, polygon, optimism],
  [alchemyProvider({ apiKey: 'yourAlchemyApiKey' }), publicProvider()],
)

const { connectors } = getDefaultWallets({
  appName: "My RainbowKit App",
  chains
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
  webSocketProvider,
});
export default function App({ Component, pageProps }: AppProps) {
  return (
    <div>
      <Head>
        <title>MetaMail</title>
      </Head>
      <WagmiConfig client={wagmiClient}>
          <SessionProvider session={pageProps.session} refetchInterval={0}>
              <RainbowKitProvider chains={chains}>
                  <Component {...pageProps} />
              </RainbowKitProvider>
          </SessionProvider>
      </WagmiConfig>
    </div>
  );
}
