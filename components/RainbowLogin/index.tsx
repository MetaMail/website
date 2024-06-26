import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { configureChains, createClient, WagmiConfig } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import ConnectBtn from './Custom';
import '@rainbow-me/rainbowkit/styles.css';

const { chains, provider } = configureChains([mainnet], [publicProvider()]);
// getDefaultWallets 用于获取默认的钱包连接器 
const { connectors } = getDefaultWallets({
  appName: 'My RainbowKit App',
  chains,
});

const WagmiClient = createClient({
  autoConnect: false,
  connectors,
  provider,
});
interface IString {
  content: string;
}
const RainbowLogin = ({ content }: IString) => {
  //const USER_NONCE_URL='https://api.metamail.ink';
  return (
    <WagmiConfig client={WagmiClient} >
      <RainbowKitProvider chains={chains}>
        <ConnectBtn content={content} />
      </RainbowKitProvider>
    </WagmiConfig>
  );
};

export default RainbowLogin;
