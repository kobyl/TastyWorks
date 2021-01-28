import React, { ReactNode } from "react";
import { Form, Container, Row, Col, Navbar, FormControl, Button, Table } from "react-bootstrap";
import { ResetTimer, ClientQuote, ClientQuotes, ClientTrade } from "tasty";
import { ClientContext } from "../ClientContext";
import { Client, ClientEvents } from "../lib/Client";

interface State {
    counter: boolean;
}

export interface ActivesFilter {
    minVol?: number;
    lastTradeSeconds?: number;
    spread?: number;
    symbol?: string;
}

export interface Prop {
    filter?: ActivesFilter;
    freeze?: boolean;
}

var renders = 0;
export class Actives extends React.Component<Prop, State> {
    static contextType = ClientContext;
    constructor(props: any) {
        super(props);

        this.state = {
            counter: true
        };
    }

    private timer?: ResetTimer = undefined;
    private latestQuotes = new Map<string, ClientQuote>();
    private latestTrades = new Map<string, ClientTrade>();
    private displayedTrades = new Map<string, ClientTrade>();

    componentDidMount() {
        (this.context as Client).on(ClientEvents.onQuote, (data) => {
            this.handleQuotes(data);
        });

        (this.context as Client).on(ClientEvents.onTrade, (data) => {
            this.handleTrades(data);
        });
    }

    shouldComponentUpdate(nextProps: Prop, nextState: State) {
        return !nextProps.freeze && (nextState.counter != this.state.counter) || this.props !== nextProps;
    }

    private handleTrades = (data: any) => {
        if (!Object.keys(data).length) return;

        const start = performance.now();
        for (const sym in data) {
            this.latestTrades.set(sym, data[sym]);
        }

        this.resetTimer();
        const duration = performance.now() - start;
    }

    private resetTimer = () => {
        this.timer = this.timer || new ResetTimer(() => {
            // Debounce so we're not constatly churning
            this.setState({ counter: !this.state.counter });
            this.timer?.stop();
            if (this.props.filter?.lastTradeSeconds) {
                const next = Math.min(this.props.filter.lastTradeSeconds, 1);
                this.timer?.start(next * 1000);
            }
        });

        this.timer.start(2000);
    }

    private handleQuotes = (data: any) => {
        if (!Object.keys(data).length) return;

        const start = performance.now();
        for (const sym in data) {
            const quote: ClientQuote = data[sym];

            if (this.latestQuotes.has(sym)) {
                const cached = this.latestQuotes.get(sym);

            }
            this.latestQuotes.set(sym, quote);
        }

        this.resetTimer();
        const duration = performance.now() - start;
        // console.trace(`HandleQuotes took ${duration}`)
    }

    render() {
        console.debug(`Renders: ${++renders}`);

        return <Container fluid>
            <Row>
                <Col>
                    {
                        this.buildTable()
                    }
                </Col>
            </Row>
        </Container>
    }

    buildTable = (): ReactNode => {
        const start = performance.now();
        const quotes: Map<string, ClientQuote> = this.latestQuotes;
        const latestTrades: Map<string, ClientTrade> = this.latestTrades;
        const displays = this.displayedTrades;

        if (!latestTrades.size) return <div>No Data yet</div>;

        const rows = [];

        // Conver to milliseconds
        let lastTradeSeconds = 0;
        const filter = this.props.filter;
        if (filter) {
            lastTradeSeconds = filter.lastTradeSeconds || lastTradeSeconds;
        }

        lastTradeSeconds = lastTradeSeconds * 1000;
        const now = new Date().getTime();

        for (const [sym, trade] of this.latestTrades) {
            if (!displays.has(sym)) {
                const quote = quotes.get(sym)!;

                if (!quote) continue;

                const spread = (quote.askPrice - quote.bidPrice).toFixed(2);
                if (this.shouldDisplay(trade, sym, spread)) {
                    displays.set(sym, trade);
                }
            }
        }

        for (const [sym, oldTrade] of displays) {
            const quote = quotes.get(sym)!;
            const trade = latestTrades.get(sym)!;

            // We sometimes get data out of order. Just ignore for now.
            if (!quote) continue;
            if (!trade) continue;

            const spread = (quote.askPrice - quote.bidPrice).toFixed(2);
            const spreadLastTrade = (trade.tradePrice - quote.bidPrice).toFixed(2);
            const secondsAgo = ((now - Number(trade.tradeTime)) / 1000).toFixed(0);

            let display = this.shouldDisplay(trade, sym, spread);
            if (display) {
                let newVol: any = trade.dayVolume;
                const existingVol = oldTrade.dayVolume;

                if (existingVol !== newVol) {
                    newVol = <b>{`${existingVol} -> ${trade.dayVolume}`}</b>;
                } else {
                    newVol = trade.dayVolume;
                }

                const row = (<tr key={sym}>
                    <td>{sym}</td>
                    <td>{secondsAgo}</td>
                    <td>{newVol}</td>
                    <td>{trade.tradePrice}</td>
                    <td>{quote.bidPrice}</td>
                    <td>{quote.askPrice}</td>
                    <td>{spread}</td>
                    <td>{spreadLastTrade}</td>
                </tr>);
                rows.push(row);
                displays.set(sym, trade);
            } else {
                displays.delete(sym);
            }
        }

        const duration = performance.now() - start;
        // console.log(`Building table took ${duration} milliseconds`);

        return (<Table>
            <thead><tr>
                <th>Symbol:</th>
                <th>Seconds Ago:</th>
                <th>Day Vol:</th>
                <th>Trade Price:</th>
                <th>Bid:</th>
                <th>Ask:</th>
                <th>Spread:</th>
                <th>Spread Last Trade:</th>
            </tr></thead>
            <tbody>
                {rows}
            </tbody>
        </Table>);
    }

    shouldDisplay = (trade: ClientTrade, sym: string, spread: string) => {
        let minVol = 0;
        let lastTradeSeconds = 0;
        let minSpread = 0;
        const now = new Date().getDate();

        const filter = this.props.filter;
        if (filter) {
            minVol = filter.minVol || minVol;
            lastTradeSeconds = filter.lastTradeSeconds || lastTradeSeconds;
            minSpread = filter.spread || 0;
        }

        const lastTradeTime = lastTradeSeconds !== 0 ? now - (lastTradeSeconds) : 0;

        if ((trade.dayVolume || 0) >= minVol) {
            if ((Number(trade.tradeTime) || 0) >= lastTradeTime) {
                if (Number(spread) >= minSpread) {
                    if (!filter || !filter.symbol || sym.includes(filter.symbol)) {
                        return true;
                    }
                }
            }
        }
        return false;

    }
}


