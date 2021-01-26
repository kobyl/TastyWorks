import React from "react";
import { Form, Container, Row, Col, Navbar, FormControl, Button } from "react-bootstrap";
import { LoginResponse } from "tasty/node/clientlib/Messages";
import { ClientContext } from "../ClientContext";
import { Client } from "../lib/Client";
import { Quotes } from './Quotes';
import { Account } from 'tasty';
import { Actives } from "./Actives";

interface Props {
    loginResponse?: LoginResponse;
}

export class Body extends React.Component<Props> {
    static contextType = ClientContext;
    private symbols: string = '';
    private orderSym: string = '';
    private account:string = '';

    render() {
        console.log(this.context);
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

        return <Container fluid>
            <Row>
                <Col>
                    <Navbar>
                        <Form inline>
                            <Form.Group>
                                <FormControl placeholder="Symbols" onBlur={(e: any) => { this.symbols = e.target.value; }} />
                                &nbsp;<Button variant='primary' onClick={() => this.subscribe(this.symbols)}>Go</Button>
                            </Form.Group>
                            <Form.Group>
                                <FormControl placeholder="Order" onBlur={(e: any) => { this.orderSym = e.target.value; }} />
                                <Form.Control as="select" onChange={e => { this.account = e.target.value}}>
                                    {getSelections()}
                                </Form.Control>
                                &nbsp;<Button variant='primary' onClick={() => this.flash(this.orderSym, this.account)}>Flash</Button>
                            </Form.Group>
                        </Form>
                    </Navbar>
                </Col>
            </Row>
            <Row> <Col><Actives/></Col></Row>
        </Container>
    }

    subscribe = async (symbols: string) => {
        const client: Client = this.context;
        const response = await client.getOptions(symbols.split(',').map(s => s.trim()));
    }

    flash = async (symbol: string, account:string) => {
        const client: Client = this.context;
        const response = await client.flash(symbol, account);
        console.log(response);
    }


}

Body.contextType = ClientContext;
