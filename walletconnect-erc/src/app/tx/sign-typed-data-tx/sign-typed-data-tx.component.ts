import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { WalletconnectService } from '../../services/walletconnect.service';

interface TypedDataPreset {
  label: string;
  payload: unknown;
}

const CHAIN_ID = 296; // Hedera testnet

const PRESETS: TypedDataPreset[] = [
  {
    label: 'Minimal (issue #705)',
    payload: {
      domain: { name: 'Demo', version: '1', chainId: CHAIN_ID },
      types: { Message: [{ name: 'contents', type: 'string' }] },
      primaryType: 'Message',
      message: { contents: 'Hello' },
    },
  },
  {
    label: 'Flat fields',
    payload: {
      domain: { name: 'Demo', version: '1', chainId: CHAIN_ID },
      types: {
        Person: [
          { name: 'name', type: 'string' },
          { name: 'wallet', type: 'address' },
          { name: 'age', type: 'uint256' },
        ],
      },
      primaryType: 'Person',
      message: {
        name: 'Alice',
        wallet: '0x0000000000000000000000000000000000000001',
        age: 30,
      },
    },
  },
  {
    label: 'Nested (EIP-712 Mail)',
    payload: {
      domain: {
        name: 'Ether Mail',
        version: '1',
        chainId: CHAIN_ID,
        verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCccccccCCC',
      },
      types: {
        Person: [
          { name: 'name', type: 'string' },
          { name: 'wallet', type: 'address' },
        ],
        Mail: [
          { name: 'from', type: 'Person' },
          { name: 'to', type: 'Person' },
          { name: 'contents', type: 'string' },
        ],
      },
      primaryType: 'Mail',
      message: {
        from: { name: 'Cow', wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826' },
        to: { name: 'Bob', wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB' },
        contents: 'Hello, Bob!',
      },
    },
  },
  {
    label: 'Array',
    payload: {
      domain: { name: 'Demo', version: '1', chainId: CHAIN_ID },
      types: {
        Person: [
          { name: 'name', type: 'string' },
          { name: 'wallet', type: 'address' },
        ],
        Group: [
          { name: 'name', type: 'string' },
          { name: 'members', type: 'Person[]' },
        ],
      },
      primaryType: 'Group',
      message: {
        name: 'Founders',
        members: [
          { name: 'Alice', wallet: '0x0000000000000000000000000000000000000001' },
          { name: 'Bob', wallet: '0x0000000000000000000000000000000000000002' },
        ],
      },
    },
  },
];

@Component({
  selector: 'app-sign-typed-data-tx',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './sign-typed-data-tx.component.html',
  styleUrl: './sign-typed-data-tx.component.scss',
})
export class SignTypedDataTxComponent {
  presets = PRESETS;
  selectedPreset = PRESETS[0];
  typedDataJson = JSON.stringify(PRESETS[0].payload, null, 2);
  error: string | null = null;

  constructor(
    private dialogRef: MatDialogRef<SignTypedDataTxComponent>,
    private walletConnectService: WalletconnectService,
  ) {}

  onPresetChange() {
    this.error = null;
    this.typedDataJson = JSON.stringify(this.selectedPreset.payload, null, 2);
  }

  async onConfirm() {
    this.error = null;

    let parsed: any;
    try {
      parsed = JSON.parse(this.typedDataJson);
    } catch (e) {
      this.error = 'Invalid JSON: ' + (e as Error).message;
      return;
    }

    try {
      await this.walletConnectService.signTypedData({
        domain: parsed.domain,
        types: parsed.types,
        primaryType: parsed.primaryType,
        message: parsed.message,
      });
      this.dialogRef.close();
    } catch (e) {
      this.error = (e as Error).message;
    }
  }
}
