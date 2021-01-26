
export class ResetTimer {
    private timeoutId: any;

    constructor(private cb: () => void) { }

    stop = () => {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
    }

    start = (timeout = 100) => {
        if (!this.timeoutId) {
            this.timeoutId = setTimeout(this.cb, timeout);
        }
    }
}