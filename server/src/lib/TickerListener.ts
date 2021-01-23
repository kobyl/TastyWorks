import DxFeed from "./dxfeed";
import { MappedData } from "../models/BasePackage";
import { Quote, Trade, Summary, Profile } from "../models/Tickers";
import { Assert } from '../util/Assert';

export class TickerListener {
    private quoteListeners: ((i: Quote) => void)[] = [];
    private tradeListeners: ((i: Trade) => void)[] = [];
    private summaryListeners: ((i: Summary) => void)[] = [];
    private profileListeners: ((i: Profile) => void)[] = [];

    constructor(private cometd: DxFeed) {
        this.cometd.addListener("data", this.process);
    }

    subQuotes = (cb: (quote: Quote) => void) => {
        Assert(!!cb, "Callback required");
        this.quoteListeners.push(cb);
    }

    subTrades = (cb: (item: Trade) => void) => {
        Assert(!!cb, "Callback required");
        this.tradeListeners.push(cb);
    }

    subSummary = (cb: (item: Summary) => void) => {
        Assert(!!cb, "Callback required");
        this.summaryListeners.push(cb);
    }

    subProfile = (cb: (item: Profile) => void) => {
        Assert(!!cb, "Callback required");
        this.profileListeners.push(cb);
    }

    private process = (data: MappedData) => {
        let mapped;
        switch(data.type) {
            case "Trade":
              mapped = Object.assign(new Trade(), data.mappedData);
              (this.tradeListeners || []).map(l => l(mapped));
              break;
            case "Quote":
              mapped = Object.assign(new Quote(), data.mappedData);
              (this.quoteListeners || []).map(l => l(mapped));
              break;
            case "Summary":
              mapped = Object.assign(new Summary(), data.mappedData);
              (this.summaryListeners || []).map(l => l(mapped));
              break;
            case "Profile":
              mapped = Object.assign(new Profile(), data.mappedData);
              (this.profileListeners || []).map(l => l(mapped));
              break;
            default:
              console.warn("Unknown type:" + data.type);
              debugger;
        }
    }
}