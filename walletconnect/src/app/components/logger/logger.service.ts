import { Injectable } from '@angular/core';
import { LogMessage } from '../../classes/log-message';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {

  constructor() { }

  messages: LogMessage[] = [];

  addMessage(message: LogMessage) {
    this.messages.unshift(message);
  }
  
  
}
