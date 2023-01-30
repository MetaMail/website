import '@rainbow-me/rainbowkit/styles.css';
import {getDefaultWallets, RainbowKitProvider ,RainbowKitAuthenticationProvider,} from '@rainbow-me/rainbowkit';
import { configureChains, createClient, useAccount, WagmiConfig } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { Connectbtn } from './Custom';
const { chains, provider } = configureChains(
    [mainnet],
    [publicProvider()]
);

const { connectors } = getDefaultWallets({
    appName: 'My RainbowKit App',
    chains
});

const wagmiClient = createClient({
    autoConnect: false,
    connectors,
    provider
});
interface Istring {
    content:string;
    };
const RainbowLogin = ({content}: Istring,) => {
    //const USER_NONCE_URL='https://api.metamail.ink';
    return (
        <WagmiConfig client={wagmiClient}>
            <RainbowKitProvider chains={chains}>
                <Connectbtn content={content}/>
            </RainbowKitProvider>
        </WagmiConfig>
    );
};

export default RainbowLogin;