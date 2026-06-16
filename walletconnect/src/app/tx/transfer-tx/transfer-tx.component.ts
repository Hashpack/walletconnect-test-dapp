import { Component, OnInit } from '@angular/core';
import { LoggerService } from '../../components/logger/logger.service';
import { WalletconnectService } from '../../services/walletconnect.service';
import { MatDialogRef } from '@angular/material/dialog';
import { SharedModule } from '../../shared.module';
import { TransferTransaction, PublicKey, Client, PrivateKey, TransactionId, NetworkName, AccountId } from '@hiero-ledger/sdk';

@Component({
  selector: 'app-transfer-tx',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './transfer-tx.component.html',
  styleUrl: './transfer-tx.component.scss'
})
export class TransferTxComponent implements OnInit {
    constructor(
        private logger: LoggerService,
        private walletConnectService: WalletconnectService,
        private dialogRef: MatDialogRef<TransferTxComponent>
    ) { }
    
    formInputs: {
        transfers: {
            amount: number,
            from: string,
            to: string,
        }[],
        memo: string,
    } = {
        transfers: [],
        memo: '',
    }

    ngOnInit(): void {
        this.addTransfer();
    }
    
    addTransfer() {
        this.formInputs.transfers.push({
            amount: 0,
            from: '',
            to: '',
        });
    }

    async onConfirm() {    

        
        let client = await Client.forNetwork("testnet" as any);
        
        let trans = await new TransferTransaction()
        .setTransactionId(TransactionId.generate(this.walletConnectService.currentAccount.accountId))
        .addHbarTransfer("0.0.800", 1)
        .setNodeAccountIds([new AccountId(0, 0, 8)])
        .addHbarTransfer("0.0.1339", -1)
        .freezeWith(client);

        let signedTx = await this.walletConnectService.signAndReturnTx(trans);
debugger

        await signedTx.execute(client);
        
        debugger
    }
}
