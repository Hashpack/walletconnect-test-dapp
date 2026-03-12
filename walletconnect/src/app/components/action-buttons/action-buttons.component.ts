import { Component } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { ModalService } from '../../services/modal.service';
import { TransferTxComponent } from '../../tx/transfer-tx/transfer-tx.component';
import { PrngTxComponent } from '../../tx/prng-tx/prng-tx.component';
import { AccountUpdateTxComponent } from '../../tx/account-update-tx/account-update-tx.component';
import { AllowanceApproveTxComponent } from '../../tx/allowance-approve-tx/allowance-approve-tx.component';
import { SignMessageTxComponent } from '../../tx/sign-message-tx/sign-message-tx.component';
import { AssociateTokenTxComponent } from '../../tx/associate-token-tx/associate-token-tx.component';
import { BatchComponent } from '../../tx/batch/batch.component';

@Component({
  selector: 'app-action-buttons',
  standalone: true,
  imports: [MatExpansionModule, MatButtonModule],
  templateUrl: './action-buttons.component.html',
  styleUrl: './action-buttons.component.scss'
})
export class ActionButtonsComponent {
  // Accordion state
  panelOpenState = false;

  constructor(private modalService: ModalService) { }

  openTransferModal() {
    this.modalService.openDialog(TransferTxComponent);
  }

  openTransferBatchModal() {
    this.modalService.openDialog(BatchComponent);
  }

  openPrngModal() {
    this.modalService.openDialog(PrngTxComponent);
  }

  openAccountUpdateModal() {
    this.modalService.openDialog(AccountUpdateTxComponent);
  }

  openAllowanceApproveModal() {
    this.modalService.openDialog(AllowanceApproveTxComponent);
  }

  openSignMessageModal() {
    this.modalService.openDialog(SignMessageTxComponent);
  }

  openAssociateTokenModal() {
    this.modalService.openDialog(AssociateTokenTxComponent);
  }
}
