// Generated by https://quicktype.io

export interface OrderStreamIncoming {
    type:      string;
    data:      OrderStream;
    timestamp: number;
}

export interface OrderStream {
    id:                           number;
    "account-number":             string;
    "time-in-force":              string;
    "order-type":                 string;
    size:                         number;
    "underlying-symbol":          string;
    "underlying-instrument-type": string;
    price:                        string;
    "price-effect":               string;
    status:                       string;
    cancellable:                  boolean;
    "cancelled-at":               string;
    editable:                     boolean;
    edited:                       boolean;
    "ext-exchange-order-number":  string;
    "ext-client-order-id":        string;
    "ext-global-order-number":    number;
    "received-at":                string;
    "updated-at":                 number;
    "terminal-at":                string;
    legs:                         Leg[];
}

export interface Leg {
    "instrument-type":    string;
    symbol:               string;
    quantity:             number;
    "remaining-quantity": number;
    action:               string;
    fills:                any[];
}
