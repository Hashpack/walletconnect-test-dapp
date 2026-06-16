import { Component, Input } from '@angular/core';
import { LogMessage } from '../../../classes/log-message';
import { MatExpansionModule } from '@angular/material/expansion';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-log-message',
  standalone: true,
  imports: [CommonModule, MatExpansionModule],
  templateUrl: './log-message.component.html',
  styleUrl: './log-message.component.scss'
})
export class LogMessageComponent {

  @Input() message: LogMessage;

}
