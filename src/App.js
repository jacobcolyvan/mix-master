import React from 'react';
import { Container} from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from 'react-router-dom';
import './stylesheets/App.css';

import Home from './pages/Home'


function App() {
  // const theme = useTheme();
  // const isMobile = useMediaQuery(theme.breakpoints.down('xs'));

  return (
    <div>
      <Router>
        <Container maxWidth='md' id='main'>
          <h1>Playlist Sorter</h1>
          <Paper variant='outlined' className='main-paper' style={{}}>
            <Switch>
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
