import React from 'react';
import './stylesheets/App.css';


import Home from './pages/Home'

// import { useTheme } from '@material-ui/core/styles';
import { Container, useMediaQuery} from '@material-ui/core';
import Paper from '@material-ui/core/Paper';

/// ##### pages should be called /authorise /playlists /playlist

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from 'react-router-dom';

function App() {
  // const theme = useTheme();
  // const [token, setToken] = useState(undefined);
  // const isMobile = useMediaQuery(theme.breakpoints.down('xs'));

  return (
    <div>
      <Router>
          <Container maxWidth='md' id='main'>
            <h1>Playlist Sorter</h1>
            <Paper variant='outlined' className='main-paper' style={{}}>
              <Switch>
                {/* <Route
                  exact path='/'
                  render={(props) => (
                    <Home
                      token={token, set}
                    />
                  )}
                /> */}

                <Route
                  exact path='/'
                  render={(props) => (
                    <Home
                      location={props.location}
                    />
                  )}
                />

                <Route exact path='/' component={Home} />

                <Redirect to='/' />
              </Switch>
            </Paper>
          </Container>
      </Router>
    </div>
  );
}

export default App;
