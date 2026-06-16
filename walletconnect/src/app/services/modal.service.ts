import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ComponentType } from '@angular/cdk/portal';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  constructor(private dialog: MatDialog) { }

  openDialog<T>(component: ComponentType<T>, config?: MatDialogConfig): T {
    const dialogRef = this.dialog.open(component, {
      width: '500px',
      ...config
    });
    return dialogRef.componentInstance;
  }
}
