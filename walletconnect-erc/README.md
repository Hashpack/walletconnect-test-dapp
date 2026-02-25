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

### Pairing URI

The service captures the WalletConnect pairing URI by listening to the `display_uri` event on the WalletConnect connector. When captured, it posts the URI to the parent window:

```typescript
window.parent.postMessage({ type: 'hedera-iframe-connect', pairingString: uri }, '*');
```

This enables iframe-based integrations where the parent frame handles wallet pairing.

## Running

```bash
npm install
npm start
```

The app serves at `http://localhost:4200` by default.
