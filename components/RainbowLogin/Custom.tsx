import { ConnectButton } from '@rainbow-me/rainbowkit';
interface IString {
  content: string;
}
export default function ConnectBtn({ content }: IString) {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready && account && chain && (!authenticationStatus || authenticationStatus === 'authenticated');

        return (
          <div
            className='w-full h-full absolute left-0 top-0'
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
                width: '100%',
                height: '100%'
              },
            })}>
            {(() => {
              if (!connected) {
                return (
                  <button onClick={openConnectModal} type="button" className='w-full h-full'>
                    {content}
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button onClick={openChainModal} type="button">
                    Wrong network
                  </button>
                );
              }

              return (
                <div style={{ display: 'flex', gap: 12 }} className='w-full h-full'>
                  <button onClick={openAccountModal} type="button" className='w-full h-full'>
                    {account.displayName}
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
