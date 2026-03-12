import { useEffect } from "react";
import { useAccount } from "wagmi";
import { ConnectKitButton } from "connectkit";
import { ActionPanel } from "./components/ActionPanel";
import { Logger } from "./components/Logger";
import { useLogger } from "./hooks/useLogger";
import { autoConnectWalletConnectInIframe } from "./utils/iframeAutoConnect";
import { config } from "./Web3Provider";

function AppContent() {
  const { address, isConnected, isConnecting, chain } = useAccount();
  const { addMessage } = useLogger();

  useEffect(() => {
    addMessage("ConnectKit initialized", "");
    autoConnectWalletConnectInIframe(config);
  }, []);

  useEffect(() => {
    if (isConnected && address) {
      addMessage("Connected", "", { address, chain: chain?.name });
    }
  }, [isConnected, address]);

  return (
    <div className="container">
      <div className="panels">
        <div className="panel left">
          <div className="panel-header">
            <h1>ConnectKit Testbed</h1>
          </div>
          <div className="panel-content">
            {isConnecting && <p>Connecting...</p>}

            <ConnectKitButton />

            {isConnected && (
              <>
                <p className="address">EVM Address: {address}</p>
                <ActionPanel />
              </>
            )}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h1>Logger</h1>
          </div>
          <div className="panel-content">
            <Logger />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
