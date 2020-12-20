import React from 'react';
import ReactDOM from 'react-dom';
import './stylesheets/index.css';
import App from './App';
import dotenv from 'dotenv';



dotenv.config();
ReactDOM.render(<App />, document.getElementById('root'));