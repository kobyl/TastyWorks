export const Assert: (c: boolean, m: string, context?: any) => void = function (condition: boolean, msg: string, context: any = null) {
    if (!condition) {
        console.error(msg);
        context && console.table(context);
        debugger;
    }
}