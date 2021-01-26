import React, { ReactNode } from "react";
import { Form, Container, Row, Col, Navbar, FormControl, Button, Table } from "react-bootstrap";
import { ClientQuote, ClientQuotes, ResetTimer } from "tasty";
import { ClientContext } from "../ClientContext";
import { Client, ClientEvents } from "../lib/Client";

interface State {
    quotes: ClientQuotes;
}

export class Quotes extends React.Component<any, State> {
    static contextType = ClientContext;
    private timer?: ResetTimer = undefined;

    constructor(props: any) {
        super(props);

        this.state = {
            quotes: {}
        };
    }

    private quotes: ClientQuotes = {};

    componentDidMount() {
        (this.context as Client).on(ClientEvents.onQuote, (data) => {
            const quotes = this.quotes;
            for (const key of Object.keys(data)) {
                quotes[key] = {
                    ...(quotes[key] || {}),
                    ...data[key]
                };
            }

            this.timer = this.timer || new ResetTimer(() => {
                this.setState({
                    quotes: this.quotes
                });
            });

            this.timer.start(1000);
        });
    }

    render() {
        return this.buildTable();
    }

    buildTable = (): ReactNode => {
        const quotes = this.state.quotes;
        const syms = Object.keys(quotes);
        if (!syms.length) return <div>No Data yet</div>;

        const rows = syms
            .map(sym => {
                const quote: ClientQuote = (quotes as ClientQuotes)[sym];
                return (<tr key={sym}>
                    <td>{sym}</td>
                    <td>{quote.prevDayVolume}</td>
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

