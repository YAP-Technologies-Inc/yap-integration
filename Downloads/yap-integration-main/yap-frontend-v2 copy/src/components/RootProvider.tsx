// components/RootProvider.tsx
'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import ClientWrapper from './ClientWrapper';
import { UserProvider } from '@/context/UserContext';
import Script from 'next/script';
const seiTestnet = {
  id: 1328,
  name: 'Sei Testnet',
  network: 'sei-testnet',
  nativeCurrency: {
    name: 'Sei',
    symbol: 'SEI',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://evm-rpc-testnet.sei-apis.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Seitrace',
      url: 'https://seitrace.com/testnet/evm',
    },
  },
};

export default function RootProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PrivyProvider
        appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
        clientId={process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID!}
        config={{
          embeddedWallets: {
            createOnLogin: 'users-without-wallets',
          },
          supportedChains: [seiTestnet],
          defaultChain: seiTestnet,
          appearance: {
            theme: '#F0EBE1',
            landingHeader: 'Welcome to YAP',
            loginMessage: 'The only app that pays you to learn languages.',
            showWalletLoginFirst: false,
          },
        }}
      >
        <UserProvider>
          <ClientWrapper>{children}</ClientWrapper>
        </UserProvider>
      </PrivyProvider>
    </>
  );
}
