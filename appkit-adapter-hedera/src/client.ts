import type { CaipNetwork, ChainNamespace, Connection } from '@reown/appkit-common'
import {
    AdapterBlueprint,
    ChainController,
    WcHelpersUtil,
} from '@reown/appkit-controllers'
import { HelpersUtil } from '@reown/appkit-utils'
import type { W3mFrameProvider } from '@reown/appkit-wallet'
import { findExtensions, type ExtensionData } from '@hashgraph/hedera-wallet-connect'

import { HederaWalletConnectProvider } from './providers/HederaWalletConnectProvider.js'
import { HEDERA_MIRROR_NODES } from './networks.js'

const NAMESPACE = 'hedera' as ChainNamespace
const CONNECTOR_ID_WC = 'walletconnect'
const TINYBAR_DECIMALS = 8
const TINYBAR_PER_HBAR = 10 ** TINYBAR_DECIMALS

export class HederaAdapter extends AdapterBlueprint {
    private _universalProvider: any
    private balancePromises: Record<string, Promise<AdapterBlueprint.GetBalanceResult>> = {}

    constructor() {
        super({
            adapterType: 'hedera',
            namespace: NAMESPACE,
        })
    }

    // -- Connection lifecycle ------------------------------------------------

    async connect(params: AdapterBlueprint.ConnectParams): Promise<AdapterBlueprint.ConnectResult> {
        const connector = this.connectors.find(c => c.id === params.id)
        if (!connector) throw new Error('Connector not found')

        const provider = connector.provider as unknown as HederaWalletConnectProvider
        const address = await provider.connect({ chainId: params.chainId as string })

        const caipNetwork = this.getCaipNetworks()?.find(n => n.id === params.chainId)

        this.addConnection({
            connectorId: connector.id,
            accounts: [{ address }],
            caipNetwork,
        })

        this.emit('accountChanged', {
            address,
            chainId: params.chainId as string,
            connector,
        })

        return {
            id: connector.id,
            address,
            chainId: params.chainId as string,
            provider: connector.provider,
            type: connector.type,
        }
    }

    async disconnect(params?: AdapterBlueprint.DisconnectParams): Promise<AdapterBlueprint.DisconnectResult> {
        if (params?.id) {
            const connector = this.connectors.find(c => c.id === params.id)
            if (!connector) throw new Error('Connector not found')

            const provider = connector.provider as unknown as HederaWalletConnectProvider
            await provider.disconnect()
            this.deleteConnection(connector.id)

            if (this.connections.length === 0) {
                this.emit('disconnect')
            } else {
                this.emitFirstAvailableConnection()
            }

            const connection = this.connections.find(c =>
                HelpersUtil.isLowerCaseMatch(c.connectorId, params.id)
            )
            return { connections: connection ? [connection] : [] }
        }

        return this.disconnectAll()
    }

    private async disconnectAll(): Promise<AdapterBlueprint.DisconnectResult> {
        const disconnected: Connection[] = []
        for (const connection of [...this.connections]) {
            const connector = this.connectors.find(c =>
                HelpersUtil.isLowerCaseMatch(c.id, connection.connectorId)
            )
            if (connector) {
                await (connector.provider as unknown as HederaWalletConnectProvider).disconnect()
                this.deleteConnection(connector.id)
                disconnected.push(connection)
            }
        }
        this.emit('disconnect')
        return { connections: disconnected }
    }

    // -- Account & balance ---------------------------------------------------

    async getAccounts(params: AdapterBlueprint.GetAccountsParams): Promise<AdapterBlueprint.GetAccountsResult> {
        const connector = this.connectors.find(c => c.id === params.id)
        if (!connector) return { accounts: [] }
        const provider = connector.provider as unknown as HederaWalletConnectProvider
        const rawAccounts = await provider.getAccounts()
        return { accounts: rawAccounts as any }
    }

    async getBalance(params: AdapterBlueprint.GetBalanceParams): Promise<AdapterBlueprint.GetBalanceResult> {
        const address = params.address
        const symbol = params.caipNetwork?.nativeCurrency?.symbol ?? 'HBAR'

        if (!address) return { balance: '0', symbol }

        const caipNetworkId = params.caipNetwork?.caipNetworkId ?? 'hedera:testnet'
        const cacheKey = `${caipNetworkId}:${address}`

        const cached = this.balancePromises[cacheKey]
        if (cached) return cached

        const promise = this.fetchBalance(address, caipNetworkId as string, symbol)
            .finally(() => { delete this.balancePromises[cacheKey] })

        this.balancePromises[cacheKey] = promise
        return promise
    }

    private async fetchBalance(accountId: string, caipNetworkId: string, symbol: string): Promise<AdapterBlueprint.GetBalanceResult> {
        try {
            const mirrorNode = HEDERA_MIRROR_NODES[caipNetworkId] ?? HEDERA_MIRROR_NODES['hedera:testnet']
            const response = await fetch(`${mirrorNode}/api/v1/balances?account.id=${accountId}&limit=1`)
            const data = await response.json() as { balances?: { balance: number }[] }
            const tinybar = data.balances?.[0]?.balance ?? 0
            const hbar = (tinybar / TINYBAR_PER_HBAR).toString()
            return { balance: hbar, symbol }
        } catch {
            return { balance: '0', symbol }
        }
    }

    // -- Signing & transactions ----------------------------------------------

    async signMessage(params: AdapterBlueprint.SignMessageParams): Promise<AdapterBlueprint.SignMessageResult> {
        const provider = params.provider as unknown as HederaWalletConnectProvider
        if (!provider?.signMessage) throw new Error('Provider not available')
        const result = await provider.signMessage(params.message, params.address)
        return { signature: JSON.stringify(result) }
    }

    async sendTransaction(params: AdapterBlueprint.SendTransactionParams): Promise<AdapterBlueprint.SendTransactionResult> {
        const provider = params.provider as unknown as HederaWalletConnectProvider
        if (!provider) throw new Error('Provider not available')

        const signer = provider.getDAppSigner()
        if (!signer) throw new Error('DAppSigner not available')

        if (!params.data) throw new Error('Transaction data (base64) is required in params.data')

        const { Transaction } = await import('@hiero-ledger/sdk')
        const txBytes = Uint8Array.from(atob(params.data), c => c.charCodeAt(0))
        const tx = Transaction.fromBytes(txBytes)

        const response = await tx.executeWithSigner(signer)
        return { hash: response.transactionId.toString() }
    }

    async estimateGas(): Promise<AdapterBlueprint.EstimateGasTransactionResult> {
        return { gas: 0n }
    }

    async writeContract(): Promise<AdapterBlueprint.WriteContractResult> {
        return { hash: '' }
    }

    async writeSolanaTransaction(): Promise<AdapterBlueprint.WriteSolanaTransactionResult> {
        return { hash: '' }
    }

    parseUnits(params: AdapterBlueprint.ParseUnitsParams): AdapterBlueprint.ParseUnitsResult {
        return BigInt(Math.round(parseFloat(params.value) * (10 ** params.decimals)))
    }

    formatUnits(params: AdapterBlueprint.FormatUnitsParams): AdapterBlueprint.FormatUnitsResult {
        const divisor = 10 ** params.decimals
        return (Number(params.value) / divisor).toString()
    }

    // -- Connector sync ------------------------------------------------------

    async syncConnectors(): Promise<void> {
        if (typeof window === 'undefined') return

        findExtensions((metadata: ExtensionData, _isIframe: boolean) => {
            if (this.connectors.some(c => c.id === metadata.id)) return

            this.addConnector({
                id: metadata.id,
                name: metadata.name ?? 'Hedera Extension',
                type: 'INJECTED' as const,
                chain: NAMESPACE,
                chains: this.getCaipNetworks(),
                provider: null as any,
                imageUrl: metadata.icon,
            })
        })
    }

    async syncConnections(params: AdapterBlueprint.SyncConnectionsParams): Promise<void> {
        const wcConnector = this.connectors.find(c => c.id === CONNECTOR_ID_WC)
        if (!wcConnector || !this._universalProvider) return

        const accounts = WcHelpersUtil.getWalletConnectAccounts(
            this._universalProvider,
            NAMESPACE,
        )

        if (accounts.length > 0) {
            this.addConnection({
                connectorId: CONNECTOR_ID_WC,
                accounts: accounts.map((a: any) => ({ address: a.address })),
                caipNetwork: params.caipNetwork,
            })
        }

        if (params.connectToFirstConnector) {
            this.emitFirstAvailableConnection()
        }
    }

    async syncConnection(params: AdapterBlueprint.SyncConnectionParams): Promise<AdapterBlueprint.ConnectResult> {
        return this.connect({ ...params, type: '' })
    }

    // -- WalletConnect provider ----------------------------------------------

    async setUniversalProvider(universalProvider: any): Promise<void> {
        this._universalProvider = universalProvider

        WcHelpersUtil.listenWcProvider({
            universalProvider,
            namespace: NAMESPACE,
            onConnect: (accounts: any) => this.onConnect(accounts, CONNECTOR_ID_WC),
            onDisconnect: () => this.onDisconnect(CONNECTOR_ID_WC),
            onAccountsChanged: (accounts: any) => this.onAccountsChanged(accounts, CONNECTOR_ID_WC, false),
        })

        const hederaProvider = new HederaWalletConnectProvider({
            provider: universalProvider,
            chains: this.getCaipNetworks(),
            getActiveChain: () => ChainController.getCaipNetworkByNamespace(this.namespace),
        })

        this.addConnector({
            id: CONNECTOR_ID_WC,
            name: 'WalletConnect',
            type: 'WALLET_CONNECT' as const,
            chain: NAMESPACE,
            chains: this.getCaipNetworks(),
            provider: hederaProvider as any,
        })
    }

    override async switchNetwork(params: AdapterBlueprint.SwitchNetworkParams): Promise<void> {
        await super.switchNetwork(params)
    }

    getWalletConnectProvider(
        params: AdapterBlueprint.GetWalletConnectProviderParams
    ): AdapterBlueprint.GetWalletConnectProviderResult {
        return new HederaWalletConnectProvider({
            provider: params.provider,
            caipNetworks: params.caipNetworks,
            getActiveChain: () => ChainController.getCaipNetworkByNamespace(this.namespace),
        }) as any
    }

    // -- Not applicable for Hedera -------------------------------------------

    async getCapabilities(): Promise<unknown> { return {} }
    async grantPermissions(): Promise<unknown> { return {} }
    async revokePermissions(): Promise<`0x${string}`> { return '0x' }
    async walletGetAssets(): Promise<AdapterBlueprint.WalletGetAssetsResponse> { return {} }

    // -- Auth provider (not used) --------------------------------------------

    override setAuthProvider(_authProvider: W3mFrameProvider): void {}
}
