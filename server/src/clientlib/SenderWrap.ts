export class SenderWrap {
    constructor(private sender: { send: (msg: string) => void }) {
    }

    send = (msg: any) => {
        if(!msg) return;

        this.sender.send(JSON.stringify(msg));
    }
}