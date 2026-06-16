export class LogMessage {
    constructor(
        public title: string,
        public message: string,
        public data?: any
    ) {
        this.title = title;
        this.message = message;
        this.data = data;
        this.timestamp = new Date();
    }

    timestamp: Date = new Date();
}
