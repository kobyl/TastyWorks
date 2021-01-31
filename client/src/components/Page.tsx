import React from "react";
import { Form, Container, Row, Col, Navbar, FormControl, Button } from "react-bootstrap";
import { FlashOrderResponse, LoginResponse } from "tasty/node/clientlib/Messages";
import { ClientContext } from "../ClientContext";
import { Client } from "../lib/Client";
import { Quotes } from './Quotes';
import { Account, ActionType, OrderStatus } from 'tasty';
import { Actives, ActivesFilter } from "./Actives";

interface Props {
    loginResponse?: LoginResponse;
    freeze: boolean;
}

interface State {
    activesFilter?: ActivesFilter;
    orders?: any;
    orderFired?: boolean;
}

export class Body extends React.Component<Props, State> {
    static contextType = ClientContext;
    private symbols: string = '';
    private orderSym: string = '';
    private account: string = '';
    private orderRef: any = React.createRef();

    constructor(props: any) {
        super(props);

        this.state = {};
    }

    render() {
        const response = this.props.loginResponse;
        const accounts = {};

        const getSelections = () => {
            if (response) {
                let acc: Account[] = response.accounts;
                return (acc || []).map(acc =>
                    <option value={acc['account-number']}>{acc['nickname']} - {acc['account-number']}</option>
                )
            }
            return <option>No Accounts found</option>;
        };

        const that: any = this;

        return <Container fluid>
            <Row>
                <Col>
                    {this.state.orders && "Orders: " + this.state.orders.reduce((acc: number, c: any) => acc + c.length, 0)}
                </Col>
            </Row>
            <Row>
                <Col>
                    <Navbar className='justify-content-between'>
                        <Form inline>
                            <Form.Group>
                                <FormControl placeholder="Symbols" onBlur={(e: any) => { this.symbols = e.target.value; }} />
                                &nbsp;<Button variant='primary' onClick={() => this.subscribe(this.symbols)}>Go</Button>
                            </Form.Group>
                        </Form>
                        <Form inline>
                            <Form.Group>
                                <FormControl size='sm' maxLength={3} placeholder="Last Trade(sec)" onBlur={(e: any) => {
                                    const filter: ActivesFilter = this.state.activesFilter || {};
                                    filter.lastTradeSeconds = Number(e.target.value);
                                    this.setState({
                                        activesFilter: {
                                            ...filter
                                        }
                                    });
                                }} />
                                <FormControl placeholder="Min Vol" onBlur={(e: any) => {
                                    const filter: ActivesFilter = this.state.activesFilter || {};
                                    filter.minVol = Number(e.target.value);
                                    this.setState({
                                        activesFilter: {
                                            ...filter
                                        }
                                    });
                                }} />
                                <FormControl placeholder="Min Spread" onBlur={(e: any) => {
                                    const filter: ActivesFilter = this.state.activesFilter || {};
                                    filter.spread = Number(e.target.value);
                                    this.setState({
                                        activesFilter: {
                                            ...filter
                                        }
                                    });
                                }} />
                            </Form.Group>
                        </Form>
                        <Form inline>
                            <Form.Group>
                                <FormControl placeholder="Order" ref={(r: any) => {
                                    this.orderRef = r;
                                }} onChange={(e: any) => {
                                    this.handleBlur(e.target.value);
                                }} />
                                <Form.Control as="select" onChange={e => { this.account = e.target.value }}>
                                    {getSelections()}
                                </Form.Control>
                                &nbsp;<Button variant='primary' disabled={this.state.orderFired} onClick={() => this.flash(this.orderSym, this.account, ActionType.BTO)}>Buy</Button>
                                &nbsp;<Button variant='primary' disabled={this.state.orderFired} onClick={() => this.flash(this.orderSym, this.account, ActionType.STC)}>Sell</Button>
                            </Form.Group>
                        </Form>
                    </Navbar>
                </Col>
            </Row>
            <Row> <Col><Actives freeze={this.props.freeze} filter={this.state.activesFilter} rowClicked={(sym) => {
                that.orderRef.value = sym;
                that.handleBlur(sym);
            }} /></Col></Row>
        </Container>
    }

    handleBlur = (sym: string) => {
        const filter: ActivesFilter = this.state.activesFilter || {};
        filter.symbol = sym;
        this.setState({
            activesFilter: {
                ...filter
            }
        });

        this.orderSym = sym;
    }

    subscribe = async (symbols: string) => {
        const client: Client = this.context;
        const response = await client.getOptions(symbols.split(',').map(s => s.trim()));
    }

    flash = async (symbol: string, account: string, action: ActionType) => {
        this.setState({ orderFired: true });
        const client: Client = this.context;
        const response: FlashOrderResponse = await client.flash(symbol, account, action);

        try {
            if (this.props.loginResponse?.accounts) {
                const orders = await client.getLiveOrders(this.props.loginResponse?.accounts.map(a => a["account-number"]));
                this.setState({ orders: orders.orders });
            }
        } finally {
            this.setState({ orderFired: false });
            console.log(response);
        }
    }
}

Body.contextType = ClientContext;
