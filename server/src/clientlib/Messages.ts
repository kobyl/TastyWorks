import { Account } from '../models/Account';
import { OptionChain, OptionData } from '../models/OptionChain';

export enum IncomingType {
    Login = "dologin",
    GetOptions = 'getOptionChains',
}

export enum OutgoingTypes {
    Login = "dologin",
    GetOptions = 'getOptionChains',
}

export interface BaseMessage {
    requestId: string;
}

export interface TypedMessage extends BaseMessage {
    type: IncomingType;
}

export interface ServerNotification {
    messages: string[];
}

export interface GetOptionsRequest extends TypedMessage {
    underlyings: string[];
}

export interface LoginRequest extends TypedMessage {
    username: string;
    password: string;
}

export interface BaseResponse {
    errors?: string[];
    requestId?: string;
}

export interface GetOptionsResponse extends BaseResponse {
    chains: {[symbol:string]: OptionData};
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


