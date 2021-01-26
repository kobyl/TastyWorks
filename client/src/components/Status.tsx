import * as React from 'react';
import { Navbar, Nav, NavDropdown, Form, FormControl, Button, Badge } from 'react-bootstrap';
import { ClientContext } from '../ClientContext';
import { Client, ClientEvents } from '../lib/Client';

interface State {
    isConnected: boolean;
    loggedInToTw: boolean;
}

export class Status extends React.Component<any, State> {
    static contextType = ClientContext;
    state: State = {
        isConnected: false,
        loggedInToTw: false,
    };

    componentDidMount() {
        const client: Client = this.context;
        client.on(ClientEvents.connectedToServer, () => {
            this.setState({ isConnected: true });
        });
        client.on(ClientEvents.disconnectedFromServer, () => {
            this.setState({ isConnected: false });
        });
        client.on(ClientEvents.loggedIn, () => {
            this.setState({ loggedInToTw: true });
        });
        this.setState({ isConnected: client.connected() });
    }

    render() {
        const connectedColor = this.state.isConnected ? "success" : "danger";
        const connectedMsg = this.state.isConnected ? "Connected" : "Disconnected";

        const loggedInColor = this.state.loggedInToTw ? "success" : "danger";
        const loggedInMsg = this.state.loggedInToTw ? "TW" : "TW";

        return <Navbar bg="light">
            <Badge variant={connectedColor}>{connectedMsg}</Badge>&nbsp;
            <Badge variant={loggedInColor}> {loggedInMsg}</Badge>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
        </Navbar>
    }
}