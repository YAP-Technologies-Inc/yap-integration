"use client";

import { PrivyProvider } from "@privy-io/react-auth";

const seiTestnet = {
  id: 1328,
  name: "Sei Testnet",
  network: "sei-testnet",
  nativeCurrency: {
    name: "Sei",
    symbol: "SEI",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://evm-rpc-testnet.sei-apis.com"],
    },
  },
  blockExplorers: {
    default: {
      name: "Seitrace",
      url: "https://seitrace.com/testnet/evm",
    },
  },
};

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      clientId={process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID!}
      config={{
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
        },
        supportedChains: [seiTestnet],     
        defaultChain: seiTestnet,        
        appearance: {
          theme: "#F6F0E8",
          landingHeader: "Welcome to Yap",
          loginMessage: "The only app that pays you to practice languages.",
          showWalletLoginFirst: false,
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
