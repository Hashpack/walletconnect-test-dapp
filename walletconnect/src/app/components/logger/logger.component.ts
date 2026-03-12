import { Component } from '@angular/core';
import { LogMessageComponent } from "./log-message/log-message.component";
import { CommonModule } from '@angular/common';
import { LoggerService } from './logger.service';

@Component({
  selector: 'app-logger',
  imports: [LogMessageComponent, CommonModule],
  templateUrl: './logger.component.html',
  styleUrl: './logger.component.scss'
})
export class LoggerComponent {

  constructor(public loggerService: LoggerService) { }

}
