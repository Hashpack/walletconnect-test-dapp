# Hedera WalletConnect Test dApp

Reference Angular applications demonstrating two approaches to wallet connectivity on Hedera.

**Live demo:** https://hashpack.github.io/walletconnect-test-dapp/

## Projects

| | [`walletconnect/`](walletconnect/) | [`walletconnect-erc/`](walletconnect-erc/) |
|---|---|---|
| **Approach** | Native Hedera via `@hashgraph/hedera-wallet-connect` | EVM-compatible via Reown AppKit + Wagmi |
| **Namespace** | `hedera:testnet` (CAIP-2) | `eip155:296` (EVM chain ID) |
| **Account format** | `0.0.12345` (Hedera account ID) | `0x...` (EVM address) |
| **RPC methods** | `hedera_signTransaction`, `hedera_executeTransaction`, `hedera_signAndExecuteQuery` | `eth_sendTransaction`, `personal_sign`, `eth_signTypedData` |
| **Transaction model** | Hedera SDK `Transaction` objects (protobuf, base64-encoded) via `DAppSigner` | Standard Ethereum JSON-RPC via Hedera's JSON-RPC relay |
| **Modal** | WalletConnect v2 modal + Hedera extension discovery | Reown AppKit modal (600+ wallets, social login, QR) |
| **Native Hedera features** | Full — HTS, HCS, scheduled txs, multi-party transfers, account operations | Limited — only what Hedera's EVM relay exposes (Solidity contracts, ERC-20/721, HBAR transfers via `msg.value`) |

## When to Use Which

**Use `walletconnect/` (native)** when your dApp needs:
- Hedera Token Service operations (associate, mint, transfer fungible/NFT tokens)
- Hedera Consensus Service (topic creation, message submission)
- Multi-party HBAR transfers in a single transaction
- Account key management (`AccountUpdateTransaction`)
- Any transaction type not available through the EVM relay

**Use `walletconnect-erc/` (EVM)** when your dApp:
- Interacts primarily with Solidity smart contracts deployed on Hedera
- Wants the Reown AppKit UI (social logins, email wallets, 600+ wallet directory)
- Needs to work with standard EVM tooling (ethers.js, viem, wagmi)
- Only requires basic HBAR transfers and ERC-20/721 token operations

## Setup

Both projects are independent Angular apps. Run them separately:

```bash
# Native Hedera
cd walletconnect && npm install && npm start

# EVM / Reown AppKit
cd walletconnect-erc && npm install && npm start
```

Each requires a WalletConnect project ID — register at [Reown Cloud](https://cloud.reown.com/) and update the `projectId` in the respective `walletconnect.service.ts`.

## Architecture

```
┌─────────────────────────────┐     ┌─────────────────────────────┐
│     walletconnect/          │     │     walletconnect-erc/      │
│                             │     │                             │
│  DAppConnector              │     │  Reown AppKit + Wagmi       │
│  ├─ hedera:testnet          │     │  ├─ eip155:296              │
│  ├─ DAppSigner              │     │  ├─ sendTransaction()       │
│  ├─ tx.executeWithSigner()  │     │  ├─ signMessage()           │
│  └─ HederaJsonRpcMethod     │     │  └─ <appkit-button>         │
│         │                   │     │         │                   │
│         ▼                   │     │         ▼                   │
│  WalletConnect v2 session   │     │  WalletConnect v2 session   │
│  (hedera namespace)         │     │  (eip155 namespace)         │
└────────────┬────────────────┘     └────────────┬────────────────┘
             │                                   │
             ▼                                   ▼
      ┌─────────────┐                   ┌──────────────┐
      │   Wallet     │                   │    Wallet    │
      │ (HashPack)   │                   │  (HashPack)  │
      │ signs via    │                   │  signs via   │
      │ Hedera SDK   │                   │  EVM relay   │
      └──────┬───────┘                   └──────┬───────┘
             │                                   │
             ▼                                   ▼
      ┌─────────────┐                   ┌──────────────┐
      │   Hedera     │                   │  Hedera EVM  │
      │  Consensus   │                   │  JSON-RPC    │
      │   Nodes      │                   │   Relay      │
      └─────────────┘                   └──────────────┘
```
