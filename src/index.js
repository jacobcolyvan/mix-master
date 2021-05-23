import React from 'react';
import ReactDOM from 'react-dom';
import './stylesheets/index.css';
import App from './App';
import dotenv from 'dotenv';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';

const theme = createMuiTheme({
    palette: {
        type: 'dark',
        background: {
            default: "#1E2327"
        },
        text: {
            primary: "#c1cfde",
            secondary: "#c1cfde",
        },
        primary: {
            main: '#7986cb',
        },
    },
});


dotenv.config();
ReactDOM.render(
    <ThemeProvider theme={theme}>
        <CssBaseline/>
        <App />
    </ThemeProvider>,
    document.getElementById('root')
);