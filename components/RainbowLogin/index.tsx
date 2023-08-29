import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { configureChains, createClient, WagmiConfig } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import ConnectBtn from './Custom';
import '@rainbow-me/rainbowkit/styles.css';

const { chains, provider } = configureChains([mainnet], [publicProvider()]);

const { connectors } = getDefaultWallets({
    appName: 'My RainbowKit App',
    chains,
});

const WagmiClient = createClient({
    autoConnect: true,
    connectors,
    provider,
});
interface IString {
    content: string;
}
const RainbowLogin = ({ content }: IString) => {
    //const USER_NONCE_URL='https://api.metamail.ink';
    return (
        <WagmiConfig client={WagmiClient}>
            <RainbowKitProvider chains={chains}>
                <ConnectBtn content={content} />
            </RainbowKitProvider>
        </WagmiConfig>
    );
};

export default RainbowLogin;
