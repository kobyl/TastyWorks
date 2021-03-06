import { resolve } from 'dns';
import { Assert, LoginRequest, TypedMessage, GetOptionsRequest, GetOptionsResponse, FlashOrderRequest, FlashOrderResponse, DxData, OrderStatusNotification, TypedNotification } from 'tasty';
import { ActionType, LiveOrdersRequest, LiveOrdersResponse, MessageType, BaseResponse, LoginResponse, } from 'tasty';

export enum ClientEvents {
    connectedToServer,
    disconnectedFromServer,
    loggedIn,
    onQuote,
    onTrade,
    onOrderUpdate,
};

export class Client {
    private socket: any;
    private isOpen: boolean = false;
    private url: string = '';
    private listeners: { [key: string]: { (data: any): void }[] } = {};
    private requestId = 0;

    public connected = () => this.isOpen;

    connect = (url: string = "ws://localhost:8081") => {
        return new Promise(((res: any, rej: any) => {
            if (this.isOpen) res();

            try {
                this.url = url;
                this.socket = new WebSocket(this.url);
                this.socket.onopen = () => {
                    this.registerAll();
                    console.log("Connected to:" + this.url);
                    this.isOpen = true;
                    res();
                    this.fire(ClientEvents.connectedToServer, null);
                };

                this.socket.onclose = this.unregisterAll;

            } catch (e) {
                rej(e);
            }
        }).bind(this))
    }

    on = (ev: ClientEvents, cb: (data: any) => void) => {
        this.listeners[ev] = this.listeners[ev] || [];
        this.listeners[ev].push(cb);
    }

    private fire = (ev: ClientEvents, data:any) => {
        for(const cb of (this.listeners[ev] || [])) {
            cb && cb(data);
        }
    }

    private registerAll = () => {
        this.isOpen = true;
        this.socket.onmessage = this.onMessage;
    }

    private unregisterAll = () => {
        this.isOpen = false;
        this.socket.onmessage = null;
        this.fire(ClientEvents.disconnectedFromServer, null);
        setTimeout(() => {
            this.connect();
        }, 1000);
    }

    private onMessage = (msg: MessageEvent) => {
        if (!msg || !msg.data) {
            Assert(false, "msg and data must not be null");
            return;
        }
        const start = performance.now();
        try {
            const data: BaseResponse = JSON.parse(msg.data);
            const rid = data.requestId || -1;
            
            if (this.outstandings[rid]) {
                this.outstandings[rid](data);
                delete this.outstandings[rid];
            }else if(data.type === MessageType.Quote) {
                const quotes = (data as DxData).quotes;
                for(const l of this.listeners[ClientEvents.onQuote] || []) {
                    l(quotes); 
                }
                const trades = (data as DxData).trades;
                for(const l of this.listeners[ClientEvents.onTrade] || []) {
                    l(trades); 
                }
                // debugger;
            }else if (data.type === MessageType.OrderNotifcation) {
                const notification: OrderStatusNotification = (data as TypedNotification).data;
                for(const l of this.listeners[ClientEvents.onOrderUpdate] || []) {
                    l(notification);
                }
            }


        } catch (e) {
            console.warn("Unexpected non json data: " + msg.data);
        }
        const end = performance.now();
    }

    private outstandings: { [key: string]: (result: any) => void } = {};

    send = (request: Partial<TypedMessage>, callback?: (result: any) => void) => {
        let requestId = -1;
        if (callback) {
            requestId = ++this.requestId;
            this.outstandings[requestId + ''] = callback;
        }

        request.requestId = requestId + '';

        this.socket.send(JSON.stringify(request));
    }

    getLiveOrders = (accounts:string[]): Promise<LiveOrdersResponse> => new Promise(
        (res, rej) => {
            let req: Partial<LiveOrdersRequest> = {
                type: MessageType.LiveOrders,
                accounts
            };

            this.send(req, (result: LiveOrdersResponse) => {
                res(result);
            });
        }
    );

    // TODO: Wire up response properly
    flash = (symbol:string, account:string, action: ActionType): Promise<any> => {
        return new Promise<any>((res:any, rej:any) => {
            const request: Partial<FlashOrderRequest> = {
                type: MessageType.FlashOrder,
                symbol,
                account,
                action
            };

            this.send(request, (result: FlashOrderResponse) => {
                res(result);
            });
        });

    }
    getOptions = (underlyings: string[]): Promise<GetOptionsResponse> => {
        return new Promise<GetOptionsResponse>((resolve: any, reject: any) => {
            if (!underlyings || !underlyings.length) {
                reject();
                return;
            }

            const request: Partial<GetOptionsRequest> = {
                type: MessageType.GetOptions,
                underlyings
            };
            this.send(request,
                (result: GetOptionsResponse) => {
                    resolve(result);
                });
        });
    }

    login = (username: string, password: string): Promise<LoginResponse> => {
        return new Promise((resolve: any, reject: any) => {
            const req: Partial<LoginRequest> = {
                type: MessageType.Login,
                username,
                password
            };
            this.send(req,
                (result: LoginResponse) => {
                    if (result.errors && result.errors.length) {
                        console.log("TW Login failed...");
                        reject(result);
                    } else {
                        this.fire(ClientEvents.loggedIn, result);
                        resolve(result);
                    }
                });
        }
        );
    }
}