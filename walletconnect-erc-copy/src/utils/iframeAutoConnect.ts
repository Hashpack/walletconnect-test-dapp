import {
  connect,
  getConnections,
  getConnectors,
  watchConnectors,
  type Config,
} from "@wagmi/core";

/**
 * Auto-connects via WalletConnect when running inside an iframe.
 * Posts the pairing URI to the parent window for native wallet handling.
 * Call once after creating your wagmi config / ConnectKit instance.
 */
export function autoConnectWalletConnectInIframe(wagmiConfig: Config) {
  if (window.self === window.top) return;
  if (getConnections(wagmiConfig).length > 0) return;

  const onConnectors = (connectors: ReturnType<typeof getConnectors>) => {
    const wc = connectors.find((c) => c.id === "walletConnect");
    if (!wc) return;

    wc.getProvider().then((provider: any) => {
      provider.on("display_uri", (uri: string) => {
        window.parent.postMessage(
          { type: "hedera-iframe-connect", pairingString: uri },
          "*"
        );
      });
      connect(wagmiConfig, { connector: wc });
    });
  };

  const connectors = getConnectors(wagmiConfig);
  if (connectors.some((c) => c.id === "walletConnect")) {
    onConnectors(connectors);
  } else {
    watchConnectors(wagmiConfig, { onChange: onConnectors });
  }
}
