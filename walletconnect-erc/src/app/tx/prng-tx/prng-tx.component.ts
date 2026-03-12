import { Component, Inject } from '@angular/core';
import { LoggerService } from '../../components/logger/logger.service';
import { MatDialogRef } from '@angular/material/dialog';
import { WalletconnectService } from '../../services/walletconnect.service';
import { LogMessage } from '../../classes/log-message';
import { SharedModule } from '../../shared.module';
import { PrngTransaction } from '@hiero-ledger/sdk';

@Component({
  selector: 'app-prng-tx',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './prng-tx.component.html',
  styleUrls: ['./prng-tx.component.scss']
})
export class PrngTxComponent {
  constructor(
    private logger: LoggerService,
    private walletConnectService: WalletconnectService,
    public dialogRef: MatDialogRef<PrngTxComponent>
  ) { }

  range: number = 1;

  // async onConfirm(): Promise<void> {
  //   this.logger.addMessage(new LogMessage("Sending pRNG Tx", ""))

  //   let transaction = new PrngTransaction().setRange(this.range);
  //   let txResponse = await this.walletConnectService.signAndExecuteTx(transaction);
  //   this.logger.addMessage(new LogMessage("pRNG Tx executed", "", txResponse));
  // }
}
