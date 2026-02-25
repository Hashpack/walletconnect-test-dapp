import { Injectable, NgZone } from '@angular/core';
import { LoggerService } from '../components/logger/logger.service';
import { LogMessage } from '../classes/log-message';

import { createAppKit } from '@reown/appkit';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { hedera, hederaTestnet } from '@reown/appkit/networks';
import type { AppKit } from '@reown/appkit';

import { getConnection, getConnectors, watchConnectors, sendTransaction, signMessage, disconnect, watchConnection } from '@wagmi/core';
import type { Config } from '@wagmi/core';

@Injectable({
    providedIn: 'root'
})
export class WalletconnectService {

    constructor(
        private loggerService: LoggerService,
        private ngZone: NgZone
    ) { }

    private modal: AppKit | undefined;
    private wagmiAdapter: WagmiAdapter | undefined;

    initializing = false;
    connected = false;

    currentAccount: {
        evmAddress: string | null,
    } = {
        evmAddress: null,
    };

    projectId = '8cacee4b1b9cd498201a93be98bc7a94';

    metadata = {
        name: 'Hedera ERC dApp Example',
        url: window.location.origin,
        description: 'An example Hedera dApp using Reown AppKit',
        icons: ['https://cdn-icons-png.flaticon.com/512/2178/2178110.png'],
    };

    get wagmiConfig(): Config {
        return this.wagmiAdapter?.wagmiConfig as Config;
    }

    async init() {
        this.initializing = true;

        this.wagmiAdapter = new WagmiAdapter({
            projectId: this.projectId,
            networks: [hederaTestnet],
        });

        this.modal = createAppKit({
            adapters: [this.wagmiAdapter],
            networks: [hederaTestnet],
            projectId: this.projectId,
            metadata: this.metadata,
            featuredWalletIds: [
                'a29498d225fa4b13468ff4d6cf4ae0ea4adcbd95f07ce8a843a1dee10b632f3f' // HashPack
            ],
            features: {
                analytics: true,
            },
        });

        watchConnection(this.wagmiConfig, {
            onChange: (account) => {
                this.ngZone.run(() => {
                    this.connected = account.isConnected;
                    this.currentAccount.evmAddress = account.address ?? null;

                    if (account.isConnected) {
                        this.loggerService.addMessage(new LogMessage('Connected', '', {
                            address: account.address,
                            chain: account.chain?.name,
                        }));
                    } else {
                        this.loggerService.addMessage(new LogMessage('Disconnected', ''));
                    }
                });
            },
        });

        const connection = getConnection(this.wagmiConfig);
        this.connected = connection.isConnected;
        this.currentAccount.evmAddress = connection.address ?? null;

        this.watchPairingUri();

        this.loggerService.addMessage(new LogMessage('Reown AppKit initialized', ''));
        this.initializing = false;
    }

    private watchPairingUri() {
        const attachListener = (connectors: ReturnType<typeof getConnectors>) => {
            console.log('[watchPairingUri] connectors:', connectors.map(c => c.id));
            const wcConnector = connectors.find(c => c.id === 'walletConnect');
            if (!wcConnector) return false;
            console.log('[watchPairingUri] attached to walletConnect connector');
            wcConnector.emitter.on('message', ({ type, data }) => {
                console.log('[watchPairingUri] message event:', type, data);
                if (type === 'display_uri') {
                    this.ngZone.run(() => {
                        window.parent.postMessage({ type: 'hedera-iframe-connect', pairingString: data as string }, '*');
                    });
                }
            });
            return true;
        };

        if (!attachListener(getConnectors(this.wagmiConfig))) {
            console.log('[watchPairingUri] walletConnect connector not found yet, watching...');
            watchConnectors(this.wagmiConfig, {
                onChange: (connectors) => attachListener(connectors),
            });
        }
    }

    async connect() {
        this.modal?.open();
    }

    async disconnect() {
        await disconnect(this.wagmiConfig);
    }

    async sendTx(params: { to: string; value: bigint; data?: string }) {
        if (!this.connected) {
            throw new Error('Not connected');
        }

        try {
            const hash = await sendTransaction(this.wagmiConfig, {
                to: params.to as `0x${string}`,
                value: params.value,
                data: params.data as `0x${string}` | undefined,
            });

            this.loggerService.addMessage(new LogMessage('Transaction sent', '', { hash }));
            return hash;
        } catch (error) {
            this.loggerService.addMessage(new LogMessage('Transaction failed', '', error));
            throw error;
        }
    }

    async signMsg(message: string) {
        if (!this.connected) {
            throw new Error('Not connected');
        }

        try {
            const signature = await signMessage(this.wagmiConfig, {
                account: this.currentAccount.evmAddress as `0x${string}`,
                message,
            });
            this.loggerService.addMessage(new LogMessage('Message signed', '', { signature }));
            return signature;
        } catch (error) {
            this.loggerService.addMessage(new LogMessage('Sign message failed', '', error));
            throw error;
        }
    }
}
