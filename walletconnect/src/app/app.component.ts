import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WalletconnectService } from './services/walletconnect.service';
import { LoggerComponent } from "./components/logger/logger.component";
import { ActionButtonsComponent } from "./components/action-buttons/action-buttons.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    LoggerComponent, 
    ActionButtonsComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  constructor(
    public walletConnectService: WalletconnectService
  ) {}

  ngOnInit() {
    this.walletConnectService.init();
  }
}
