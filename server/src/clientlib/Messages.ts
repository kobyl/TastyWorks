import { OutgoingMessage } from 'http';
import { ActionType } from '../lib/executeOrder';
import { Account } from '../models/Account';
import { OptionData } from '../models/OptionChain';
import { Order, OrderStatus } from '../models/Order';

export enum MessageType {
    Login = "dologin",
    GetOptions = 'getOptionChains',
    FlashOrder = 'flashOrder',
    LiveOrders = "liveOrders",
    Quote = "quote",
    OrderNotifcation = "orderNotifciaton",
}

export interface BaseMessage {
    requestId: string;
}

export interface TypedMessage extends BaseMessage {
    type: MessageType;
    errors?: any;
}

export interface TypedNotification extends TypedMessage{
    data: any;
}

export interface OrderStatusNotification {
    orderId: string,
    status: OrderStatus,
}

export interface ServerNotification {
    messages: string[];
}

export interface DxData {
    type: MessageType;
    quotes: { [symbol: string]: Partial<ClientQuote> };
    trades: { [symbol: string]: Partial<ClientTrade> };
}

export interface FlashOrderRequest extends TypedMessage {
    symbol: string;
    account: string;
    action: ActionType;
}

export interface FlashOrderResponse extends TypedMessage {
    orderId: string;
    status: string;
}

export interface LoginRequest extends TypedMessage {
    username: string;
    password: string;
}

export interface LiveOrdersRequest extends TypedMessage {
    accounts: string[];
}

export interface LiveOrdersResponse extends TypedMessage {
    orders: Order[];
}

export interface BaseResponse {
    errors?: string[];
    requestId?: string;
    type?: string;
}

export interface GetOptionsRequest extends TypedMessage {
    underlyings: string[];
}

export interface GetOptionsResponse extends BaseResponse {
    chains: { [symbol: string]: OptionData };
}

export class LoginResponse implements BaseResponse {
    accounts: Account[] = [];
    sessionToken: string = '';
    errors?: string[] = [];
    requestId?: string = '';
}

export interface SubscribeRequest {
    sessionToken: string;
    symbols: string[];
}

export interface SubscribeResponse {
}

export interface UnsubscribeRequest extends SubscribeRequest { }
export interface UnsubcribeRespsonse extends SubscribeRequest { }

export interface ClientQuotes {
    [symbol: string]: ClientQuote;
}

export class ClientQuote {
    officialSymbol: string;
    eventSymbol: string;
    underlying: string;
    bidPrice: number;
    askPrice: number;
    bidTime: string;
    askTime; string;

    prevDayVolume: number;
    dayHighPrice: number;
    dayLowPrice: number;
}

export class ClientTrade {
    underlying: string;
    eventSymbol: string;
    dayVolume: number;
    tradePrice: number;
    tradeTime: string;
    tickDirection: string;
}
