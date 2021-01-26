export class Trade {
    static Schema = ["eventSymbol", "eventTime", "time", "timeNanoPart", "sequence", "exchangeCode", "price", "change", "size", "dayVolume", "dayTurnover", "tickDirection", "extendedTradingHours"];

    eventSymbol: string;
    eventTime: string;
    time: string;
    timeNanoPart: string;
    sequence: string;
    exchangeCode: string;
    price: number;
    change: string;
    size: number;
    dayVolume: number;
    dayTurnover: string;
    tickDirection: string;
    extendedTradingHours: string;
}

export class Quote {
    static Schema = ["eventSymbol", "eventTime", "sequence", "timeNanoPart", "bidTime", "bidExchangeCode", "bidPrice", "bidSize", "askTime", "askExchangeCode", "askPrice", "askSize"];

    eventSymbol: string;
    eventTime: string;
    sequence: string;
    timeNanoPart: string;
    bidTime: string;
    bidExchangeCode: string;
    bidPrice: number;
    bidSize: string;
    askTime: string;
    askExchangeCode: string;
    askPrice: number;
    askSize: string;
}

export class Summary {
    static Schema = ["eventSymbol", "eventTime", "dayId", "dayOpenPrice", "dayHighPrice", "dayLowPrice", "dayClosePrice", "dayClosePriceType", "prevDayId", "prevDayClosePrice", "prevDayClosePriceType", "prevDayVolume", "openInterest"]

    eventSymbol: string;
    eventTime: string;
    dayId: string;
    dayOpenPrice: number;
    dayHighPrice: number;
    dayLowPrice: number;
    dayClosePrice: string;
    dayClosePriceType: string;
    prevDayId: string;
    prevDayClosePrice: number;
    prevDayClosePriceType: string;
    prevDayVolume: number;
    openInterest: number;
}

export class Profile {
    static Schema = ["eventSymbol", "eventTime", "description", "shortSaleRestriction", "tradingStatus", "statusReason", "haltStartTime", "haltEndTime", "highLimitPrice", "lowLimitPrice", "high52WeekPrice", "low52WeekPrice"];

    eventSymbol: string;
    eventTime: string;
    description: string;
    shortSaleRestriction: string;
    tradingStatus: string;
    statusReason: string;
    haltStartTime: string;
    haltEndTime: string;
    highLimitPrice: string;
    lowLimitPrice: string;
    high52WeekPrice: string;
    low52WeekPrice: string;

}

export const Schemas = {
    "Trade": Trade.Schema,
    "Quote": Quote.Schema,
    "Summary": Summary.Schema,
    "Profile": Profile.Schema,
}

export const validateSchema = (type: string, schema: string[]) => {
    const knownSchema: string[] = Schemas[type];
    if (!knownSchema) {
        console.warn("Unknown type: " + type);
        debugger;
        return false;
    }

    for (let element of schema) {
        if (!knownSchema.includes(element)) {
            console.warn(type + " schema appears to have changed");
            debugger;
            return false;
        }
    }

    return true;
}
