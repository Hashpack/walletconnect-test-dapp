import { Injectable } from '@angular/core';
import {
    HederaSessionEvent,
    HederaJsonRpcMethod,
    DAppConnector,
    HederaChainId,
    DAppSigner,
    findExtensions,
    ExecuteTransactionResult,
    transactionToBase64String,
    base64StringToUint8Array,
    transactionListToBase64String,
    ExtensionData,

} from '@hashgraph/hedera-wallet-connect'
import { AccountId, LedgerId, Transaction, TransactionId, TransactionReceipt, TransactionResponse } from '@hiero-ledger/sdk'
import { SessionTypes, SignClientTypes } from '@walletconnect/types'
import { LoggerService } from '../components/logger/logger.service';
import { LogMessage } from '../classes/log-message';

@Injectable({
    providedIn: 'root'
})
export class WalletconnectService {

    constructor(
        private loggerService: LoggerService
    ) { }

    dAppConnector: DAppConnector | undefined;

    metadata: SignClientTypes.Metadata = {
        name: 'dApp Example',
        url: 'https://google.com',
        description: 'An example hedera dApp',
        icons: ['https://cdn-icons-png.flaticon.com/512/2178/2178110.png'],
      };

    projectId = '8cacee4b1b9cd498201a93be98bc7a94';

    initializing = false;
    connected = false;
    sessions: SessionTypes.Struct[] = [];
    signer: DAppSigner | undefined;
    extensions: ExtensionData[] = [];

    currentAccount: {
        accountId: string,
        publicKey: string,
        evmAddress: string,
    } = {
        accountId: null,
        publicKey: null,
        evmAddress: null,
    };

    async init() {
        this.initializing = true;

        //note: the order here matters and must be followed
        await this.initWalletconnect();
        this.registerEvents();
        this.updateSessions();
        this.initExtensions();

        this.initializing = false;
    }

    async initWalletconnect() {
        //Create the WalletConnect connector metadata
        this.dAppConnector = new DAppConnector(
            this.metadata,
            LedgerId.TESTNET,
            this.projectId,
            Object.values(HederaJsonRpcMethod),
            [HederaSessionEvent.ChainChanged, HederaSessionEvent.AccountsChanged],
            [HederaChainId.Testnet]
        );

        //Initialize the WalletConnect connector
        await this.dAppConnector.init({ logger: 'info' });

        this.loggerService.addMessage(new LogMessage('WalletConnect initialized', ''));
    }

    initExtensions() {
        //Find all extensions, or if we are inside a dapp browser iframe
        findExtensions((metadata, isIframe) => {
            console.log('WALLETCONNECT DEMO - Found extension', metadata, isIframe);
            if (this.extensions.some(e => e.id === metadata.id)) return;
            this.extensions.push({
              ...metadata,
              available: true,
              availableInIframe: isIframe,
            })

            //If we are inside a dapp browser iframe, connect to the app immediately
            if(isIframe) {
                //if we are already connected, don't try to automatically connect to an iframe
                if(this.sessions.length > 0) return;

                console.log('WALLETCONNECT DEMO - Found iframe', metadata);
                this.connectToExtension(metadata);
            }
        })
    }

    registerEvents() {
        this.dAppConnector.onSessionIframeCreated = this.dappBrowserPairingEvent;

        this.dAppConnector.walletConnectClient.on('session_update', (args) => {
            console.log('WALLETCONNECT DEMO - Walletconnect session update', args);
            this.updateSessions();
        });

        this.dAppConnector.walletConnectClient.on('session_request', (args) => {
            console.log('WALLETCONNECT DEMO - Walletconnect session request', args);
        });

        this.dAppConnector.walletConnectClient.on('session_event', (args) => {
            console.log('WALLETCONNECT DEMO - Session event', args);
        });

        this.dAppConnector.walletConnectClient.on('session_delete', (args) => {
            //make sure you listen for this event and update sessions for when the user disconnects in the wallet
            console.log('WALLETCONNECT DEMO - Session delete', args);
            this.updateSessions();
        });

        this.loggerService.addMessage(new LogMessage('Events registered', ''));
    }

    updateSessions() {
        this.sessions = this.dAppConnector.walletConnectClient.session.getAll();

        if (this.sessions.length > 0) {
            console.log('WALLETCONNECT DEMO - Found sessions', this.sessions);
            this.loggerService.addMessage(new LogMessage('Found sessions', '', this.sessions));
            this.signer = this.dAppConnector.signers[0];
            console.log('WALLETCONNECT DEMO - Got signer', this.signer);
            // this.loggerService.addMessage(new LogMessage('Got signer', '', JSON.stringify(this.signer)));

            const sessionAccount = this.sessions[0].namespaces?.['hedera']?.accounts?.[0]
            const sessionParts = sessionAccount?.split(':')
            const accountId = sessionParts.pop()

            this.currentAccount = {
                accountId: accountId,
                publicKey: this.sessions[0].sessionProperties?.['publicKey'],
                evmAddress: this.sessions[0].sessionProperties?.['evmAddress'],
            }

            this.connected = true;
            // this.loginAuthenticate();
        } else {
            console.log('WALLETCONNECT DEMO - Found no sessions');
            this.loggerService.addMessage(new LogMessage('Found no sessions', ''));
            this.connected = false;
            this.signer = null;
        }

    }

    async disconnect() {
        await this.dAppConnector.disconnectAll();
        this.loggerService.addMessage(new LogMessage('Disconnected', ''));
        this.updateSessions();

    }

    async connect() {
        if (!this.dAppConnector) {
            this.loggerService.addMessage(new LogMessage('DAppConnector not initialized', ''));
            throw new Error('DAppConnector not initialized')
        }

        this.loggerService.addMessage(new LogMessage('Opening modal', ''));

        // Open a modal for the user to connect their wallet
        const session = await this.dAppConnector.openModal()

        this.loggerService.addMessage(new LogMessage('Connected', '', session));

        // Once connected, handle and store the session information
        this.updateSessions();
    }

    async connectToExtension(extension: ExtensionData) {
        console.log('WALLETCONNECT DEMO - Connecting to extension', extension.id);
        const session = await this.dAppConnector.connectExtension(extension.id);
        this.loggerService.addMessage(new LogMessage('Connected to extension', '', session));
        this.updateSessions();
    }

    dappBrowserPairingEvent = (session: SessionTypes.Struct) => {
        //make sure this is an arrow function () => to maintain (this) context
        console.log('WALLETCONNECT DEMO - Connected in dapp browser', session);
        this.loggerService.addMessage(new LogMessage('Connected in dapp browser', '', session));
        this.updateSessions();
    };

    async signAndExecuteTx(tx: Transaction): Promise<{ response:TransactionResponse, receipt:TransactionReceipt }> {
        if (!this.signer) {
            this.loggerService.addMessage(new LogMessage('Signer not initialized', ''));
            throw new Error('Signer not initialized');
        }

        try {
            // let frozen = await tx.freezeWithSigner(this.signer);
            // let frozen = await tx.freezeWithSigner(this.signer);
            
            // let txResponse = await this.dAppConnector.signAndExecuteTransaction({
                //     signerAccountId: this.currentAccount.accountId,
                //     transactionList: transactionToBase64String(tx)
                // })
                
                // let response = TransactionResponse.fromJSON(txResponse.result);
                // let receipt = await response.getReceiptWithSigner(this.signer);
                
            let txResponse = await tx.executeWithSigner(this.signer);
            let receipt = await txResponse.getReceiptWithSigner(this.signer);
            
            return { response: txResponse, receipt: receipt};
        } catch (error) {
            this.loggerService.addMessage(new LogMessage('Error signing and executing tx', '', error));
            throw error;
        }
    }

    async signAndReturnTx(tx: Transaction): Promise<Transaction> {
        if (!this.signer) {
            this.loggerService.addMessage(new LogMessage('Signer not initialized', ''));
            throw new Error('Signer not initialized');
        }

        let txResponse = await tx.signWithSigner(this.signer);
        debugger
        return txResponse;
    }

    async signMessage(message: string) {
        this.loggerService.addMessage(new LogMessage('Signing message', '', message));
        
        try {
          const base64String = btoa(message);
    
          const sigMaps = await this.signer.sign([
            base64StringToUint8Array(base64String),
          ]);

          this.loggerService.addMessage(new LogMessage('Signature success', '', sigMaps));
        } catch (e) {
            this.loggerService.addMessage(new LogMessage('Signature error', '', e));
        }
      }
}
