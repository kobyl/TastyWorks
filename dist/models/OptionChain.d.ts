export interface OptionChain {
    data: OptionData;
    context: string;
}
export interface OptionData {
    items: Item[];
}
export interface Item {
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
