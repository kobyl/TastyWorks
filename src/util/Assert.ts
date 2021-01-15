export const Assert = function(condition: boolean, msg: string, context:any = null) {
    if(!condition) {
        console.error(msg);
        context && console.table(context);
        debugger;        
    }
}