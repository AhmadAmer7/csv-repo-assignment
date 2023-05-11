import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

// Import and configure Amplify
import { API,Amplify } from 'aws-amplify';
import awsconfig from './aws-exports';
Amplify.configure(awsconfig);
API.configure(awsconfig);

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);