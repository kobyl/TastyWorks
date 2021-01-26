import React, { ReactNode } from "react";
import { Form, Container, Row, Col, Navbar, FormControl, Button, Table } from "react-bootstrap";
import { ResetTimer, ClientQuote, ClientQuotes, ClientTrade } from "tasty";
import { ClientContext } from "../ClientContext";
import { Client, ClientEvents } from "../lib/Client";

interface State {
    counter: boolean;
}

export class Actives extends React.Component<any, State> {
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

    componentDidMount() {
        (this.context as Client).on(ClientEvents.onQuote, (data) => {
            this.handleQuotes(data);
        });

        (this.context as Client).on(ClientEvents.onTrade, (data) => {
            this.handleTrades(data);
        });
    }

    private handleTrades = (data: any) => {
        for (const sym in data) {
            this.latestTrades.set(sym, data);
        }

        this.timer = this.timer || new ResetTimer(() => {
            // Debounce so we're not constatly churning
            this.setState({ counter: !this.state.counter });
        }, 500)
    }

    private handleQuotes = (data: any) => {
        for (const sym in data) {
            const quote: ClientQuote = data[sym];

            this.latestQuotes.set(sym, quote);
        }
    }

    render() {

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
        const quotes: Map<string, ClientTrade> = this.latestQuotes;
        const trades: Map<string, ClientTrade> = this.latestTrades;

        if (!trades.size) return <div>No Data yet</div>;

        const rows = trades
            .sort((s1, s2) => {
                return trades.get(s1)?.tradeTime - trades.get(s2)?.tradeTime;
            })
            .map(sym => {
                const quote: ClientQuote = (quotes as ClientQuotes)[sym];
                return (<tr key={sym}>
                    <td>{sym}</td>
                    <td>{quote.prevDayVolume}</td>
                    <td>{quote.dayVolume}</td>
                    <td>{quote.bidPrice}</td>
                    <td>{quote.askPrice}</td>
                    <td>{(quote.askPrice - quote.bidPrice).toFixed(2)}</td>
                    <td>{quote.bidTime}</td>
                </tr>);
            });

        return <Table>
            <thead><tr>
                <th>Symbol:</th>
                <th>P Day Vol:</th>
                <th>Day Vol:</th>
                <th>Bid:</th>
                <th>Ask:</th>
                <th>Spread:</th>
                <th>Bid Time:</th>
            </tr></thead>
            <tbody>
                {rows}
            </tbody>
        </Table>
    }
}

