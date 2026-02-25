# Hedera WalletConnect dApp Integration

A reference Angular application demonstrating how to integrate [Hedera WalletConnect](https://github.com/hashgraph/hedera-wallet-connect) into a dApp. This guide walks through the connection lifecycle implemented in [`walletconnect.service.ts`](src/app/services/walletconnect.service.ts).

## Dependencies

| Package | Purpose |
|---|---|
| `@hashgraph/hedera-wallet-connect` | Hedera-specific WalletConnect SDK — handles pairing, sessions, signing. Includes `@walletconnect/modal`, `@hiero-ledger/proto`, and `@walletconnect/types` as transitive dependencies. |
| `@hiero-ledger/sdk` | Hedera SDK for building and submitting transactions |

## Connection Lifecycle

The entire flow is orchestrated by the `init()` method. **Order matters** — each step depends on the previous one.

```typescript
async init() {
    await this.initWalletconnect(); // 1. Create & initialize the connector
    this.registerEvents();          // 2. Listen for session changes
    this.updateSessions();          // 3. Restore any existing sessions
    this.initExtensions();          // 4. Detect wallet extensions / iframe wallets
}
```

---

### Step 1: Initialize WalletConnect (`initWalletconnect`)

Creates the `DAppConnector` with your dApp metadata, target network, and WalletConnect project ID. Then calls `init()` to establish the underlying SignClient.

```typescript
this.dAppConnector = new DAppConnector(
    this.metadata,          // dApp name, URL, description, icons
    LedgerId.TESTNET,       // Target Hedera network
    this.projectId,         // WalletConnect Cloud project ID
    Object.values(HederaJsonRpcMethod),  // Supported RPC methods (sign, execute, etc.)
    [HederaSessionEvent.ChainChanged, HederaSessionEvent.AccountsChanged],
    [HederaChainId.Testnet]
);

await this.dAppConnector.init({ logger: 'info' });
```

**Why this is first:** Everything else depends on the `DAppConnector` and its internal `walletConnectClient` being ready.

**Where to get a project ID:** Register at [WalletConnect Cloud](https://cloud.walletconnect.com/).

#### Available Networks

The `DAppConnector` takes two network-related parameters that must be consistent with each other:

| `LedgerId` (Hedera SDK) | `HederaChainId` (WalletConnect) | Use case |
|---|---|---|
| `LedgerId.MAINNET` | `HederaChainId.Mainnet` (`hedera:mainnet`) | Production — real HBAR and tokens |
| `LedgerId.TESTNET` | `HederaChainId.Testnet` (`hedera:testnet`) | Development — free test HBAR via [faucet](https://portal.hedera.com/faucet) |
| `LedgerId.PREVIEWNET` | `HederaChainId.Previewnet` (`hedera:previewnet`) | Early access — upcoming network features before testnet |
| `LedgerId.LOCAL_NODE` | `HederaChainId.Devnet` (`hedera:devnet`) | Local development — [Hedera Local Node](https://github.com/hashgraph/hedera-local-node) |

- `LedgerId` determines which Hedera network the SDK targets for transaction building and node addresses.
- `HederaChainId` is the [CAIP-2](https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-2.md) chain identifier advertised to wallets during WalletConnect pairing. The wallet uses this to know which network to sign for.

To switch networks, update both values together:

```typescript
// Example: switching to mainnet
this.dAppConnector = new DAppConnector(
    this.metadata,
    LedgerId.MAINNET,                    // SDK network
    this.projectId,
    Object.values(HederaJsonRpcMethod),
    [HederaSessionEvent.ChainChanged, HederaSessionEvent.AccountsChanged],
    [HederaChainId.Mainnet]              // WalletConnect chain ID — must match
);
```

---

### Step 2: Register Events (`registerEvents`)

Subscribes to WalletConnect session lifecycle events so the dApp stays in sync when the wallet-side state changes.

```typescript
this.dAppConnector.onSessionIframeCreated = this.dappBrowserPairingEvent;

this.dAppConnector.walletConnectClient.on('session_update', () => this.updateSessions());
this.dAppConnector.walletConnectClient.on('session_delete', () => this.updateSessions());
```

| Event | Why it matters |
|---|---|
| `session_update` | Wallet changed accounts or permissions — refresh local state |
| `session_delete` | User disconnected from the wallet side — clear local session |
| `session_event` | Chain or account changed mid-session |
| `onSessionIframeCreated` | Wallet connected via an iframe dApp browser (e.g. HashPack) |

**Why this is second:** The `walletConnectClient` must exist (from step 1), and events should be registered before restoring sessions so no state changes are missed.

---

### Step 3: Restore Sessions (`updateSessions`)

Checks for any persisted sessions from a previous page load. WalletConnect sessions survive page refreshes — this step rehydrates local state.

```typescript
this.sessions = this.dAppConnector.walletConnectClient.session.getAll();

if (this.sessions.length > 0) {
    this.signer = this.dAppConnector.signers[0];

    // Extract account info from the session's Hedera namespace
    const sessionAccount = this.sessions[0].namespaces?.['hedera']?.accounts?.[0];
    const accountId = sessionAccount?.split(':').pop();

    this.currentAccount = {
        accountId,
        publicKey: this.sessions[0].sessionProperties?.['publicKey'],
        evmAddress: this.sessions[0].sessionProperties?.['evmAddress'],
    };

    this.connected = true;
}
```

**Key details:**
- The account string format is `hedera:testnet:0.0.12345` — split on `:` and take the last part to get the account ID.
- `publicKey` and `evmAddress` are stored in `sessionProperties` by the wallet during pairing.
- The `DAppSigner` retrieved here is used for all subsequent transaction signing.

---

### Step 4: Detect Extensions (`initExtensions`)

Discovers installed Hedera wallet browser extensions (e.g. HashPack, Blade) and iframe-based dApp browsers.

```typescript
findExtensions((metadata, isIframe) => {
    if (this.extensions.some(e => e.id === metadata.id)) return; // deduplicate
    this.extensions.push({ ...metadata, available: true, availableInIframe: isIframe });

    if (isIframe) {
        if (this.sessions.length > 0) return; // already connected
        this.connectToExtension(metadata);     // auto-connect in iframe context
    }
});
```

**Why this is last:** `updateSessions()` must run first so `this.sessions` is populated. This prevents the iframe auto-connect from triggering when a session already exists.

**Note:** The `findExtensions` callback can fire multiple times for the same extension (once per mode it supports). The deduplication guard prevents duplicate entries.

---

## Connecting a Wallet

### Via QR Code / Modal

For standard browser usage — opens a WalletConnect modal where the user scans a QR code or selects an installed wallet.

```typescript
const session = await this.dAppConnector.openModal();
this.updateSessions();
```

### Via Browser Extension

For direct connection to a detected wallet extension. Uses `DAppConnector.connectExtension()` which handles pairing internally.

```typescript
const session = await this.dAppConnector.connectExtension(extension.id);
this.updateSessions();
```

### Via dApp Browser (Iframe)

When the dApp is loaded inside a wallet's built-in browser, the iframe connection happens automatically in `initExtensions`. The `onSessionIframeCreated` callback handles the session once established.

```typescript
dappBrowserPairingEvent = (session: SessionTypes.Struct) => {
    // Arrow function to preserve `this` context
    this.updateSessions();
};
```

---

## Signing & Executing Transactions

Once connected, use the `DAppSigner` to sign and submit transactions. The signer proxies requests to the connected wallet for user approval.

### Execute a transaction (sign + submit)

```typescript
const txResponse = await tx.executeWithSigner(this.signer);
const receipt = await txResponse.getReceiptWithSigner(this.signer);
```

### Sign without executing

```typescript
const signedTx = await tx.signWithSigner(this.signer);
```

### Sign an arbitrary message

```typescript
const base64String = btoa(message);
const sigMaps = await this.signer.sign([base64StringToUint8Array(base64String)]);
```

---

## Disconnecting

```typescript
await this.dAppConnector.disconnectAll();
this.updateSessions(); // clears local state
```

This terminates all active sessions and pairings. Always call `updateSessions()` after to reset the UI.
