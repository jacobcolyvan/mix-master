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
            primary: "#ADBAC7",
            secondary: "#ADBAC7",
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