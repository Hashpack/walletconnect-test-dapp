import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommonModule } from '@angular/common';
import { TokenId, NftId, AccountAllowanceApproveTransaction } from '@hiero-ledger/sdk';
import { WalletconnectService } from '../../services/walletconnect.service';
import { LoggerService } from '../../components/logger/logger.service';

interface HbarAllowance {
    ownerAccountId: string;
    spenderAccountId: string;
    amount: number;
}

interface NFTAllowance {
    tokenId: string;
    serial: number;
    ownerAccountId: string;
    spenderAccountId: string;
}

interface TokenAllowance {
    tokenId: string;
    ownerAccountId: string;
    spenderAccountId: string;
    amount: number;
}

@Component({
    selector: 'app-allowance-approve-tx',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatDialogModule,
        MatInputModule,
        MatCheckboxModule
    ],
    templateUrl: './allowance-approve-tx.component.html',
    styleUrl: './allowance-approve-tx.component.scss'
})
export class AllowanceApproveTxComponent {
    constructor(
        private walletConnectService: WalletconnectService,
        private loggerService: LoggerService,
        public dialogRef: MatDialogRef<AllowanceApproveTxComponent>,
    ) { }
    data: {
        hbarAllowance: boolean,
        hbarAllowances: HbarAllowance[],
        nftAllowance: boolean,
        nftAllowances: NFTAllowance[],
        tokenAllowance: boolean,
        tokenAllowances: TokenAllowance[]
    } = {
            hbarAllowance: false,
            hbarAllowances: [],
            nftAllowance: false,
            nftAllowances: [],
            tokenAllowance: false,
            tokenAllowances: []
        };

    addHbarAllowance() {
        this.data.hbarAllowances.push({
            ownerAccountId: this.walletConnectService.currentAccount.accountId,
            spenderAccountId: '0.0.800',
            amount: 1
        });
    }

    addNFTAllowance() {
        this.data.nftAllowances.push({
            tokenId: '',
            serial: 0,
            ownerAccountId: this.walletConnectService.currentAccount.accountId,
            spenderAccountId: '0.0.800'
        });
    }

    addTokenAllowance() {
        this.data.tokenAllowances.push({
            tokenId: '',
            ownerAccountId: this.walletConnectService.currentAccount.accountId,
            spenderAccountId: '0.0.800',
            amount: 1
        });
    }

    async onConfirm() {
        let trans = new AccountAllowanceApproveTransaction();

        if (this.data.hbarAllowance) {
            this.data.hbarAllowances.forEach(allowance => {
                trans.approveHbarAllowance(allowance.ownerAccountId, allowance.spenderAccountId, allowance.amount);
            })
        }

        if (this.data.nftAllowance) {
            this.data.nftAllowances.forEach(allowance => {
                let raw = allowance.tokenId.split('.');
                let tokenId: TokenId = new TokenId(parseInt(raw[0]), parseInt(raw[1]), parseInt(raw[2]));
                let nftId = new NftId(tokenId, allowance.serial);
                trans.approveTokenNftAllowance(nftId, allowance.ownerAccountId, allowance.spenderAccountId);
            })
        }

        if (this.data.tokenAllowance) {
            this.data.tokenAllowances.forEach(allowance => {
                trans.approveTokenAllowance(allowance.tokenId, allowance.ownerAccountId, allowance.spenderAccountId, allowance.amount);
            })
        }

        let tx = await this.walletConnectService.signAndExecuteTx(trans);
    }
}
