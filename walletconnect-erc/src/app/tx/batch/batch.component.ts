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
  //   let acc1339Key = PrivateKey.fromStringED25519("302e020100300506032b657004220420d006e0fac3151c1218e72182ec06a18bc1d71098328daae8caac29b59b029e60")
  //   let secondAccountKey = PrivateKey.fromStringED25519("94a7dcaef635249a9d83d325f605f83b8c50b1275e5cfd96234e0cac356e46dd") //0.0.5332767

  //   let client = await Client.forTestnet();
  //   client.setOperator("0.0.1339", acc1339Key)

  //   // client.setOperator("0.0.5332767", PrivateKey.fromStringED25519("94a7dcaef635249a9d83d325f605f83b8c50b1275e5cfd96234e0cac356e46dd"))
    
  //   let testTransfer = await new TransferTransaction()
  //   .addHbarTransfer("0.0.800", 1)
  //   .addHbarTransfer("0.0.1339", -1)
  //   .setBatchKey(PublicKey.fromString("988680b5666612bbb9eb24e9a2ded47162d8aa0bf1ad137f95aaab735fdcdadb"))
  //   .freezeWith(client)
  //   .sign( PrivateKey.fromStringED25519("94a7dcaef635249a9d83d325f605f83b8c50b1275e5cfd96234e0cac356e46dd"))
  //   // .batchify(client, PublicKey.fromString("302a300506032b65700321008fef004074116a90717fbafc446c1d754f0dd562847cb12068a55a93376b964c"))

  //   let testTransfer2 = await new TransferTransaction()
  //   .addHbarTransfer("0.0.800", 1)
  //   .addHbarTransfer("0.0.1339", -1)
  //   .setBatchKey(PublicKey.fromString("988680b5666612bbb9eb24e9a2ded47162d8aa0bf1ad137f95aaab735fdcdadb"))
  //   .freezeWith(client)
  //   .sign( PrivateKey.fromStringED25519("94a7dcaef635249a9d83d325f605f83b8c50b1275e5cfd96234e0cac356e46dd"))

  //   // .batchify(client, PublicKey.fromString("302a300506032b65700321008fef004074116a90717fbafc446c1d754f0dd562847cb12068a55a93376b964c"))

  //   // let testAccCreate = await new AccountCreateTransaction()
  //   //   .setInitialBalance(10)
  //   //   .setKeyWithoutAlias(secondAccountKey.publicKey)
  //   //   .setBatchKey(secondAccountKey.publicKey)
  //   //   .freezeWith(client)
  //   //   .sign(secondAccountKey)
  //   // .batchify(client, PublicKey.fromString("302a300506032b65700321008fef004074116a90717fbafc446c1d754f0dd562847cb12068a55a93376b964c"))

  //   // await testAccCreate.sign(acc1339Key)

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
