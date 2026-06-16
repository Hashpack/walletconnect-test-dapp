import { Component } from '@angular/core';
import { LoggerService } from '../../components/logger/logger.service';
import { WalletconnectService } from '../../services/walletconnect.service';
import { MatDialogRef } from '@angular/material/dialog';
import { SharedModule } from '../../shared.module';
import { AccountId, BatchTransaction, Client, TransactionId, TransferTransaction, Timestamp, PublicKey, PrivateKey, TokenAssociateTransaction, AccountCreateTransaction } from '@hiero-ledger/sdk';
import { LogMessage } from '../../classes/log-message';

@Component({
  selector: 'app-batch',
  imports: [SharedModule],
  templateUrl: './batch.component.html',
  styleUrl: './batch.component.scss',
  standalone: true,
})
export class BatchComponent {
  batch: BatchTransaction;

  constructor(
    private logger: LoggerService,
    private walletConnectService: WalletconnectService,
    private dialogRef: MatDialogRef<BatchComponent>
  ) {
    this.createBatch();

  }

  async createBatch() {
    let testTransfer = await new TransferTransaction()
    .addHbarTransfer("0.0.800", 1)
    .addHbarTransfer(this.walletConnectService.currentAccount.accountId, -1)
    .setBatchKey(PublicKey.fromString(this.walletConnectService.currentAccount.publicKey))
    .setTransactionId(TransactionId.generate(this.walletConnectService.currentAccount.accountId))
    .freeze()
    
    let testTransfer2 = await new TransferTransaction()
    .addHbarTransfer("0.0.800", 1)
    .addHbarTransfer(this.walletConnectService.currentAccount.accountId, -1)
    .setBatchKey(PublicKey.fromString(this.walletConnectService.currentAccount.publicKey))
    .setTransactionId(TransactionId.generate(this.walletConnectService.currentAccount.accountId))
    .freeze()

    this.batch = await new BatchTransaction()
      .addInnerTransaction(testTransfer)
      .addInnerTransaction(testTransfer2)
      .setTransactionId(TransactionId.generate(this.walletConnectService.currentAccount.accountId))


      // this.batch.innerTransactions 
  }

  async onConfirm() {
    let txResponse = await this.walletConnectService.signAndExecuteTx(this.batch);
    this.logger.addMessage(new LogMessage("Batch Tx executed", "", txResponse));

    // let response = await this.walletConnectService.signAndReturnTx(this.batch);
    // debugger
  }
}
