import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { LoggerService } from '../../components/logger/logger.service';
import { WalletconnectService } from '../../services/walletconnect.service';
import { AccountUpdateTransaction } from '@hiero-ledger/sdk';
import { PublicKey } from '@hiero-ledger/sdk';
import { LogMessage } from '../../classes/log-message';

@Component({
    selector: 'app-account-update-tx',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatDialogModule,
        MatButtonModule,
        MatInputModule
    ],
    templateUrl: './account-update-tx.component.html',
    styleUrl: './account-update-tx.component.scss'
})
export class AccountUpdateTxComponent {
    data = {
        newPublicKey: '',
        maxAutomaticTokenAssociations: -1,
        accountMemo: '',
        transMemo: ''
    };

    constructor(
        private loggerService: LoggerService,
        private walletConnectService: WalletconnectService,
        public dialogRef: MatDialogRef<AccountUpdateTxComponent>,
    ) { }

    async onConfirm(): Promise<void> {
        let trans = await new AccountUpdateTransaction();

        trans.setAccountId(this.walletConnectService.currentAccount.accountId);
        trans.setMaxAutomaticTokenAssociations(this.data.maxAutomaticTokenAssociations);
        trans.setAccountMemo(this.data.accountMemo);
        trans.setTransactionMemo(this.data.transMemo);

        
        if (this.data.newPublicKey != "")
            trans.setKey(PublicKey.fromString(this.data.newPublicKey))
        
        this.loggerService.addMessage(new LogMessage('Sending Account Update Tx', '', trans));

        let tx = await this.walletConnectService.signAndExecuteTx(trans);

        this.dialogRef.close(this.data);
    }
}
