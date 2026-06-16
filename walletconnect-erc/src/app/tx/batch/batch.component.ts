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
    // this.createBatch();

  }

  // async createBatch() {
  //   let acc1339Key = PrivateKey.fromStringED25519("<redacted>")
  //   let secondAccountKey = PrivateKey.fromStringED25519("<redacted>") //0.0.5332767

  //   let client = await Client.forTestnet();
  //   client.setOperator("0.0.1339", acc1339Key)

  //   let testTransfer = await new TransferTransaction()
  //   .addHbarTransfer("0.0.800", 1)
  //   .addHbarTransfer("0.0.1339", -1)
  //   .setBatchKey(PublicKey.fromString("988680b5666612bbb9eb24e9a2ded47162d8aa0bf1ad137f95aaab735fdcdadb"))
  //   .freezeWith(client)
  //   .sign(secondAccountKey)

  //   let testTransfer2 = await new TransferTransaction()
  //   .addHbarTransfer("0.0.800", 1)
  //   .addHbarTransfer("0.0.1339", -1)
  //   .setBatchKey(PublicKey.fromString("988680b5666612bbb9eb24e9a2ded47162d8aa0bf1ad137f95aaab735fdcdadb"))
  //   .freezeWith(client)
  //   .sign(secondAccountKey)

  //   this.batch = await new BatchTransaction()
  //     .addInnerTransaction(testTransfer)
  //     .addInnerTransaction(testTransfer2)
  //     .freezeWith(client)
  //     .sign(secondAccountKey)

  //     this.batch.innerTransactions 
  // }

  // async onConfirm() {
  //   let txResponse = await this.walletConnectService.signAndExecuteTx(this.batch);
  //   this.logger.addMessage(new LogMessage("Batch Tx executed", "", txResponse));

  //   // let response = await this.walletConnectService.signAndReturnTx(this.batch);
  //   // debugger
  // }
}
