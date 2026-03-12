import type { CaipNetwork } from '@reown/appkit-common'
import {
    DAppSigner,
    HederaJsonRpcMethod,
    transactionToBase64String,
    base64StringToUint8Array,
    type ExecuteTransactionResult,
    type SignMessageResult,
    type SignTransactionResult,
} from '@hashgraph/hedera-wallet-connect'
import { AccountId, LedgerId, type Transaction } from '@hiero-ledger/sdk'

export class HederaWalletConnectProvider {
    readonly id = 'walletconnect'
    readonly name = 'WalletConnect'
    readonly type = 'WALLET_CONNECT' as const
    readonly chain = 'hedera' as const
    readonly chains: CaipNetwork[]
    readonly provider: any

    private getActiveChain: () => CaipNetwork | undefined
    private signer: DAppSigner | null = null

    constructor(params: {
        provider: any
        chains?: CaipNetwork[]
        caipNetworks?: CaipNetwork[]
        getActiveChain: () => CaipNetwork | undefined
    }) {
        this.provider = params.provider
        this.chains = params.chains ?? params.caipNetworks ?? []
        this.getActiveChain = params.getActiveChain
    }

    private get caipNetworkId(): string {
        return this.getActiveChain()?.caipNetworkId ?? 'hedera:testnet'
    }

    private get signerAccountId(): string | null {
        const accounts = this.provider.session?.namespaces?.['hedera']?.accounts
        if (!accounts?.length) return null
        return accounts[0]!
    }

    private get accountId(): string | null {
        const caipAccount = this.signerAccountId
        if (!caipAccount) return null
        return caipAccount.split(':').pop() ?? null
    }

    private getLedgerId(): LedgerId {
        const networkId = this.caipNetworkId
        if (networkId.includes('mainnet')) return LedgerId.MAINNET
        if (networkId.includes('previewnet')) return LedgerId.PREVIEWNET
        return LedgerId.TESTNET
    }

    getDAppSigner(): DAppSigner | null {
        if (this.signer) return this.signer

        const session = this.provider.session
        const signClient = this.provider.client
        if (!session || !signClient || !this.accountId) return null

        this.signer = new DAppSigner(
            AccountId.fromString(this.accountId),
            signClient,
            session.topic,
            this.getLedgerId(),
        )
        return this.signer
    }

    async connect(params?: { chainId?: string }): Promise<string> {
        const accounts = this.provider.session?.namespaces?.['hedera']?.accounts ?? []
        if (accounts.length === 0) {
            throw new Error('No Hedera accounts in WalletConnect session')
        }
        this.signer = null
        const caipAccount = accounts[0]!
        return caipAccount.split(':').pop()!
    }

    async disconnect(): Promise<void> {
        this.signer = null
        if (this.provider.session) {
            await this.provider.disconnect()
        }
    }

    async getAccounts(): Promise<{ address: string; type?: string }[]> {
        const accounts = this.provider.session?.namespaces?.['hedera']?.accounts ?? []
        return (accounts as string[]).map((caipAccount: string) => {
            const accountId = caipAccount.split(':').pop()!
            return { address: accountId }
        })
    }

    async signAndExecuteTransaction(
        transaction: Transaction,
        signerAccountId?: string
    ): Promise<ExecuteTransactionResult> {
        const accountCaip = signerAccountId
            ? `${this.caipNetworkId}:${signerAccountId}`
            : this.signerAccountId

        const result: ExecuteTransactionResult = await this.provider.request({
            method: HederaJsonRpcMethod.SignAndExecuteTransaction,
            params: {
                signerAccountId: accountCaip,
                transactionList: transactionToBase64String(transaction),
            },
        }, this.caipNetworkId)

        return result
    }

    async signTransaction(
        transaction: Transaction,
        signerAccountId?: string
    ): Promise<SignTransactionResult> {
        const accountCaip = signerAccountId
            ? `${this.caipNetworkId}:${signerAccountId}`
            : this.signerAccountId

        const result: SignTransactionResult = await this.provider.request({
            method: HederaJsonRpcMethod.SignTransaction,
            params: {
                signerAccountId: accountCaip,
                transactionList: transactionToBase64String(transaction),
            },
        }, this.caipNetworkId)

        return result
    }

    async signMessage(
        message: string,
        signerAccountId?: string
    ): Promise<SignMessageResult> {
        const accountCaip = signerAccountId
            ? `${this.caipNetworkId}:${signerAccountId}`
            : this.signerAccountId

        const base64Message = btoa(message)

        const result: SignMessageResult = await this.provider.request({
            method: HederaJsonRpcMethod.SignMessage,
            params: {
                signerAccountId: accountCaip,
                message: base64Message,
            },
        }, this.caipNetworkId)

        return result
    }
}
