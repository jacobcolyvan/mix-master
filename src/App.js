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
// import Search from './pages/Search';


function App() {
  const [ token, setToken ] = useState(false);
  const [ playlist, setPlaylist] = useState(false);
  const [ about, setAbout] = useState(false);
  const [ search, setSearch] = useState(false);
  const [ playlists, setPlaylists] = useState([]);

  const loadPlaylists = () => {
    setPlaylist(false);
    setAbout(false);
    setSearch(false);
  }

  const loadAbout = () => {
    setAbout(true);
    setPlaylist(false);
    setSearch(false);
  }

  const loadSearch = () => {
    setSearch(true);
    setPlaylist(false);
    setAbout(false);
  }

  return (
    <div>
      <Router>
        <UserContext.Provider value={{ token, setToken, playlist, setPlaylist, playlists, setPlaylists, about, search }}>
          <Container maxWidth='md' id='main' style={{marginBottom: "24px", marginTop: "24px"}}>
            <Navbar loadPlaylists={loadPlaylists} loadAbout={loadAbout} loadSearch={loadSearch} />
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

                {/* <Route exact path='/search' component={Search} /> */}

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
