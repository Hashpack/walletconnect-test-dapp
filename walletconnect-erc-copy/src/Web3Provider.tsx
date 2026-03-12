import { WagmiProvider, createConfig, http } from "wagmi";
import { hederaTestnet } from "viem/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import type { ReactNode } from "react";

const config = createConfig(
  getDefaultConfig({
    chains: [hederaTestnet],
    transports: {
      [hederaTestnet.id]: http("https://testnet.hashio.io/api"),
    },
    walletConnectProjectId: "8cacee4b1b9cd498201a93be98bc7a94",
    appName: "Hedera ERC dApp Example",
    appDescription: "An example Hedera dApp using ConnectKit",
    appUrl: window.location.origin,
    appIcon: "https://cdn-icons-png.flaticon.com/512/2178/2178110.png",
  })
);

const queryClient = new QueryClient();

export { config };

export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
