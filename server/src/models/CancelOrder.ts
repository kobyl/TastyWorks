export interface CancelOrderResponse {
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
