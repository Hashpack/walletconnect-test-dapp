import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { WalletconnectService } from '../../services/walletconnect.service';
import { LoggerService } from '../../components/logger/logger.service';
import { TokenAssociateTransaction } from '@hiero-ledger/sdk';
import { LogMessage } from '../../classes/log-message';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-associate-token-tx',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    FormsModule,
    CommonModule
  ],
  templateUrl: './associate-token-tx.component.html',
  styleUrl: './associate-token-tx.component.scss'
})
export class AssociateTokenTxComponent {
  tokenIds: { id: string}[] = [];

  constructor(
    private dialogRef: MatDialogRef<AssociateTokenTxComponent>,
    private walletConnectService: WalletconnectService,
    private loggerService: LoggerService
  ) {}

  addTokenId() {
    this.tokenIds.push({ id: '' });
  }

  async onConfirm(): Promise<void> {
    let trans = await new TokenAssociateTransaction();

    let tokenIds: string[] = [];
    this.tokenIds.forEach(token => {
      tokenIds.push(token.id);
    })

    trans.setTokenIds(tokenIds);
    trans.setAccountId(this.walletConnectService.currentAccount.accountId);

    let tx = await this.walletConnectService.signAndExecuteTx(trans);
    this.loggerService.addMessage(new LogMessage('Associate Token', '', tx.receipt));
    this.dialogRef.close();
  }
}
