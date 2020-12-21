import React, {useState} from 'react';
import UserContext from './context/UserContext';
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
import Navbar from './components/Navbar'


function App() {
  const [ token, setToken ] = useState(false);
  const [ playlist, setPlaylist] = useState(false);
  const [ playlists, setPlaylists] = useState([]);

  const clearPlaylist = () => {
    setPlaylist(false)
  }

  return (
    <div>
      <Router>
        <UserContext.Provider value={{ token, setToken, playlist, setPlaylist, playlists, setPlaylists }}>
          <Container maxWidth='md' id='main' style={{marginBottom: "30px"}}>
            <Navbar clearPlaylist={clearPlaylist} />
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
        </UserContext.Provider>
      </Router>
    </div>
  );
}

export default App;
