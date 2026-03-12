import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { WalletconnectService } from '../../services/walletconnect.service';

@Component({
  selector: 'app-sign-message-tx',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule
  ],
  templateUrl: './sign-message-tx.component.html',
  styleUrl: './sign-message-tx.component.scss'
})
export class SignMessageTxComponent {
  message = 'Hello Hedera!';

  constructor(
    private dialogRef: MatDialogRef<SignMessageTxComponent>,
    private walletConnectService: WalletconnectService,
  ) {}

  async onConfirm() {
    await this.walletConnectService.signMsg(this.message);
    this.dialogRef.close();
  }
}
