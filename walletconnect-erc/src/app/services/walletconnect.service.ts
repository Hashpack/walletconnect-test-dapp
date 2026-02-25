import { Injectable, NgZone } from '@angular/core';
import { LoggerService } from '../components/logger/logger.service';
import { LogMessage } from '../classes/log-message';

import { createAppKit } from '@reown/appkit';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { hedera, hederaTestnet } from '@reown/appkit/networks';
import type { AppKit } from '@reown/appkit';

import { connect as wagmiConnect, getConnection, getConnectors, watchConnectors, sendTransaction, signMessage, disconnect, watchConnection } from '@wagmi/core';
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
                email: false,
                socials: false,
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

        this.loggerService.addMessage(new LogMessage('Reown AppKit initialized', ''));
        this.initializing = false;

        autoConnectWalletConnectInIframe(this.wagmiConfig);
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

/**
 * Auto-connects via WalletConnect when running inside an iframe.
 * Posts the pairing URI to the parent window for native wallet handling.
 * Call once after creating your wagmi config / AppKit instance.
 */
function autoConnectWalletConnectInIframe(wagmiConfig: Config) {
    if (window.self === window.top) return;
    if (getConnection(wagmiConfig).isConnected) return;

    const onConnectors = (connectors: ReturnType<typeof getConnectors>) => {
        const wc = connectors.find(c => c.id === 'walletConnect');
        if (!wc) return;

        wc.getProvider().then((provider: any) => {
            provider.on('display_uri', (uri: string) => {
                window.parent.postMessage({ type: 'hedera-iframe-connect', pairingString: uri }, '*');
            });
            wagmiConnect(wagmiConfig, { connector: wc });
        });
    };

    const connectors = getConnectors(wagmiConfig);
    if (connectors.some(c => c.id === 'walletConnect')) {
        onConnectors(connectors);
    } else {
        watchConnectors(wagmiConfig, { onChange: onConnectors });
    }
}
