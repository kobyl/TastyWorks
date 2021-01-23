import React from 'react';
import './App.css';
import { Client } from './lib/Client';
import { Header } from './components/Header';
import 'bootstrap/dist/css/bootstrap.min.css';

export const client = new Client();
client.connect();

const ConnectContext = React.createContext(client);

class App extends React.Component {

  render() {
    return (
      <Header login={(username, password) => {
        client.login(username, password);
      }}
      />);
  }
}

export default App;
