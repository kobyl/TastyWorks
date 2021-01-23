import { Quote, Trade, Summary, Profile } from './Tickers';

export interface QuoteSet {
    [symbodl:string]: LiveEquityInfo;
}

export interface LiveEquityInfo {
    quote: Quote;
    trade: Trade;
    summary: Summary;
    profile: Profile;
}