import { Assert, LoginRequest, TypedMessage, GetOptionsRequest, GetOptionsResponse, OutgoingTypes } from 'tasty';
import { IncomingType, BaseResponse, LoginResponse } from 'tasty';

export class Client {
    private socket: any;
    private isOpen: boolean = false;
    private url: string = '';
    private listeners: { [key: string]: (data: any) => void } = {};
    private requestId = 0;

    connect = (url: string = "ws://localhost:8081") => {
        return new Promise(((res: any, rej: any) => {
            if(this.isOpen) res();

            try {
                this.url = url;
                this.socket = new WebSocket(this.url);
                this.socket.onopen = () => {
                    this.registerAll();
                    console.log("Connected to:" + this.url);
                    this.isOpen = true;
                    res();
                };

                this.socket.onclose = this.unregisterAll;

            } catch (e) {
                rej(e);
            }
        }).bind(this))

    }

    registerAll = () => {
        this.isOpen = true;
        this.socket.onmessage = this.onMessage;
    }

    unregisterAll = () => {
        this.isOpen = false;
        this.socket.onmessage = null;
    }

    onMessage = (msg: MessageEvent) => {
        if (!msg || !msg.data) {
            Assert(false, "msg and data must not be null");
            return;
        }
        try {
            const data: BaseResponse = JSON.parse(msg.data);
            const rid = data.requestId || -1;
            console.table(data);
            if (this.outstandings[rid]) {
                this.outstandings[rid](data);
                delete this.outstandings[rid];
            }

        } catch (e) {
            console.warn("Unexpected non json data: " + msg.data);
        }
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

    getOptions = (underlyings: string[]): Promise<GetOptionsResponse> => {
        return new Promise<GetOptionsResponse>((resolve: any, reject: any) => {
            if (!underlyings || !underlyings.length) {
                reject();
                return;
            }

            const request: Partial<GetOptionsRequest> = {
                type: IncomingType.GetOptions,
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
                type: IncomingType.Login,
                username,
                password
            };
            this.send(req,
                (result: LoginResponse) => {
                    if (result.errors && result.errors.length) {
                        console.log("TW Login failed...");
                        reject(result);
                    } else {
                        resolve(result);
                    }
                });
        }
        );
    }
}