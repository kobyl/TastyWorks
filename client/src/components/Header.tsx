import * as React from 'react';
import { Navbar, Nav, NavDropdown, Form, FormControl, Button } from 'react-bootstrap';

interface props {
    login: (username:string, password:string) => void;
}

export class Header extends React.Component<props> {

    private username: string = '';
    private password: string = '';

    updateUsername = (ev: any) => {
        this.username = ev.target.value;
    }
    updatePassword = (ev: any) => {
        this.password = ev.target.value;
    }

    render() {
        let click: any = () => {
            this.props.login(this.username, this.password);
        }
        
        return <Navbar bg="light" expand="lg">
            <Navbar.Brand href="#home">Tasty Tool</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="mr-auto">
                    {/* 
            <Nav.Link href="#home">Home</Nav.Link>
            <Nav.Link href="#link">Link</Nav.Link>
            <NavDropdown title="Dropdown" id="basic-nav-dropdown">
              <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
              <NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>
              <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
            </NavDropdown>
          */}
                </Nav>
                <Form inline>
                    <FormControl type="text" no-autocomplete placeholder="username" className="mr-sm-2" onChange={this.updateUsername} />
                    <FormControl type="password" className="mr-sm-2" onChange={this.updatePassword} />
                    <Button variant="outline-success" onClick={click}>Login</Button>
                </Form>
            </Navbar.Collapse>
        </Navbar>
    }
}