# @reown/appkit-adapter-hedera

A Reown AppKit adapter for the native Hedera (`hedera:`) WalletConnect namespace, enabling Hedera-native transactions (HTS, HCS, etc.) through the Reown modal UI.

## Installation

```bash
npm install @reown/appkit-adapter-hedera
```

Peer dependencies (installed with your AppKit setup):
- `@reown/appkit-common`
- `@reown/appkit-controllers`
- `@reown/appkit-utils`
- `@reown/appkit-wallet`
- `@walletconnect/universal-provider`

## Quick Start

```typescript
import { createAppKit } from '@reown/appkit'
import { HederaAdapter, hederaTestnet } from '@reown/appkit-adapter-hedera'

const hederaAdapter = new HederaAdapter()

const modal = createAppKit({
    adapters: [hederaAdapter],
    networks: [hederaTestnet],
    projectId: 'YOUR_PROJECT_ID',
    metadata: {
        name: 'My Hedera dApp',
        url: window.location.origin,
        description: 'A Hedera dApp using Reown AppKit',
        icons: ['https://example.com/icon.png'],
    },
})
```

## Executing Native Hedera Transactions

After connecting, get the `DAppSigner` from the provider to use with the Hedera SDK:

```typescript
import { HederaWalletConnectProvider } from '@reown/appkit-adapter-hedera'
import { TransferTransaction, Hbar } from '@hiero-ledger/sdk'

const provider = modal.getWalletProvider() as HederaWalletConnectProvider
const signer = provider.getDAppSigner()

const tx = new TransferTransaction()
    .addHbarTransfer('0.0.800', new Hbar(1))
    .addHbarTransfer('0.0.1339', new Hbar(-1))

const response = await tx.executeWithSigner(signer)
```

## Signing Messages

```typescript
const provider = modal.getWalletProvider() as HederaWalletConnectProvider
const result = await provider.signMessage('Hello Hedera!', '0.0.12345')
```

## Available Networks

```typescript
import { hederaMainnet, hederaTestnet, hederaPreviewnet } from '@reown/appkit-adapter-hedera/networks'
```

| Network | CAIP ID | Chain ID |
|---|---|---|
| `hederaMainnet` | `hedera:mainnet` | 295 |
| `hederaTestnet` | `hedera:testnet` | 296 |
| `hederaPreviewnet` | `hedera:previewnet` | 297 |

## How It Works

This adapter extends Reown's `AdapterBlueprint` with `namespace: 'hedera'`, meaning WalletConnect sessions use the native `hedera:testnet` chain ID and Hedera-specific RPC methods:

- `hedera_signAndExecuteTransaction`
- `hedera_signTransaction`
- `hedera_executeTransaction`
- `hedera_signMessage`
- `hedera_signAndExecuteQuery`

The `HederaWalletConnectProvider` wraps the WalletConnect `UniversalProvider` and exposes a `getDAppSigner()` method that returns a `DAppSigner` from `@hashgraph/hedera-wallet-connect`. This signer implements the Hedera SDK's `Signer` interface, so any `Transaction` object can call `.executeWithSigner(signer)` or `.signWithSigner(signer)` directly.

Balance queries use the Hedera Mirror Node REST API.

## vs EVM Approach (Wagmi adapter)

| | This adapter (native) | Wagmi adapter (EVM) |
|---|---|---|
| Namespace | `hedera:testnet` | `eip155:296` |
| Account format | `0.0.12345` | `0x...` |
| Transaction model | Hedera SDK protobuf via `DAppSigner` | Ethereum JSON-RPC via relay |
| HTS / HCS | Full support | Not available |
| Solidity contracts | Not directly | Full support |
