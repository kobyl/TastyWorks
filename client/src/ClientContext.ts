import React from 'react';
import { Client } from './lib/Client';

export const client = new Client();
client.connect();

export const ClientContext = React.createContext(client);
