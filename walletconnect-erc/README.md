# Hedera ERC dApp Example

**Live demo:** https://hashpack.github.io/walletconnect-test-dapp/walletconnect-erc/

An Angular test dApp for connecting to Hedera wallets via [Reown AppKit](https://docs.reown.com/appkit/overview) and the EVM-compatible (ERC) interface using Wagmi.

## Stack

- **Angular 19** — UI framework
- **Reown AppKit** (`@reown/appkit`) — WalletConnect modal and session management
- **Wagmi** (`@wagmi/core`) — EVM wallet interactions (transactions, signing)
- **Viem** — Ethereum data utilities

## Architecture

### `WalletconnectService`

Core service (`walletconnect.service.ts`) that manages the full wallet lifecycle:

- **`init()`** — Creates a `WagmiAdapter` and `AppKit` instance targeting Hedera Testnet (chain ID 296). Sets up connection state watching and pairing URI capture.
- **`connect()`** — Opens the Reown AppKit modal for wallet selection (HashPack featured).
- **`disconnect()`** — Disconnects the active session.
- **`sendTx()`** — Sends an EVM transaction via the connected wallet.
- **`signMsg()`** — Requests a personal message signature from the connected wallet.

### Iframe Auto-Connect

When this dApp runs inside an iframe, it automatically initiates a WalletConnect session and posts the pairing URI to the parent window — no user interaction required.

The parent frame receives a message like:

```typescript
window.addEventListener('message', (event) => {
    if (event.data.type === 'hedera-iframe-connect') {
        const pairingUri = event.data.pairingString;
        // Pass to your native wallet SDK
    }
});
```

#### Adding to your own dApp

Copy the `autoConnectWalletConnectInIframe` function and call it once after initializing your wagmi config / AppKit instance:

```typescript
import { connect, getConnection, getConnectors, watchConnectors } from '@wagmi/core';
import type { Config } from '@wagmi/core';

function autoConnectWalletConnectInIframe(wagmiConfig: Config) {
    if (window.self === window.top) return;
    if (getConnection(wagmiConfig).isConnected) return;

    const onConnectors = (connectors: ReturnType<typeof getConnectors>) => {
        const wc = connectors.find(c => c.id === 'walletConnect');
        if (!wc) return;

        wc.getProvider().then((provider: any) => {
            provider.on('display_uri', (uri: string) => {
                window.parent.postMessage(
                    { type: 'hedera-iframe-connect', pairingString: uri },
                    '*'
                );
            });
            connect(wagmiConfig, { connector: wc });
        });
    };

    const connectors = getConnectors(wagmiConfig);
    if (connectors.some(c => c.id === 'walletConnect')) {
        onConnectors(connectors);
    } else {
        watchConnectors(wagmiConfig, { onChange: onConnectors });
    }
}
```

**Why `watchConnectors`?** The WalletConnect connector registers asynchronously after AppKit initializes. The function waits for it to appear before attaching the listener.

**Framework-agnostic** — the function only depends on `@wagmi/core`. Works with Angular, React, Vue, or vanilla JS.

## Running

```bash
npm install
npm start
```

The app serves at `http://localhost:4200` by default.
