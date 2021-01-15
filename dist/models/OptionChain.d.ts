export interface OptionChain {
    data: OptionWrapper;
    context: string;
}
export interface OptionWrapper {
    items: OptionData[];
}
export interface OptionData {
    "underlying-symbol": string;
    "root-symbol": string;
    "option-chain-type": string;
    "shares-per-contract": number;
    "tick-sizes": TickSize[];
    deliverables: Deliverable[];
    expirations: Expiration[];
}
export interface Deliverable {
    id: number;
    "root-symbol": string;
    "deliverable-type": string;
    description: string;
    amount: string;
    symbol: string;
    "instrument-type": string;
    percent: string;
}
export interface Expiration {
    "expiration-type": ExpirationType;
    "expiration-date": string;
    "days-to-expiration": number;
    "settlement-type": SettlementType;
    strikes: Strike[];
}
export declare enum ExpirationType {
    Regular = "Regular",
    Weekly = "Weekly"
}
export declare enum SettlementType {
    Pm = "PM"
}
export interface Strike {
    "strike-price": string;
    call: string;
    put: string;
}
export interface TickSize {
    value: string;
    threshold?: string;
}
export declare const optionSymbolToObject: (symbol: string) => {
    underlyingSymbol: any;
    expirationDate: any;
    daysToExpiration: any;
    callOrPut: any;
    strikePrice: any;
    realTradingSymbol: any;
    optionChainType: any;
    miniFlag: any;
    rawOptionChainType: any;
    multiplier: any;
    dateRaw: any;
    strikePriceRaw: any;
    rootSymbol: any;
    expirationKey: any;
    futureOptionRootSymbol: any;
};
