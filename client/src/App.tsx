import React from 'react';
import './App.css';
import { Header } from './components/Header';
// import 'bootstrap.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Body } from './components/Page';
import { Status } from './components/Status';
import { ClientContext } from './ClientContext';
import { LoginResponse } from 'tasty';

interface State {
  loginResponse?: LoginResponse;
  freeze?: boolean;
}

class App extends React.Component<any, State> {
  static contextType = ClientContext;

  state: State = {};

  render() {
    return (
      <>
        <Header login={async (username, password) => {
          const response: LoginResponse = await this.context.login(username, password);
          this.setState({ loginResponse: response });
        }} />
        <Status freeze={chkd => this.setState({ freeze: chkd})}/>
        <Body loginResponse={this.state.loginResponse} freeze={this.state.freeze!}/>
      </>
    );
  }
}

export default App;
