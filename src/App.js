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
  const [ tracks, setTracks ] = useState(false);
  const [ sortedTracks, setSortedTracks ] = useState(false);
  const [ username, setUsername ] = useState(false);

  const resetStates = () => {
    setPlaylist(false);
    setTracks(false);
    setSortedTracks(false);
  }

  const loadPlaylists = () => {
    setAbout(false);
    setSearch(false);
    resetStates();
  }

  const loadAbout = () => {
    setAbout(true);
    setSearch(false);
    resetStates();
  }

  const loadSearch = () => {
    setSearch(true);
    setAbout(false);
    resetStates();
  }

  return (
    <div>
      <Router>
        <UserContext.Provider value={{
          token,
          setToken,
          playlist,
          setPlaylist,
          playlists,
          setPlaylists,
          about,
          search,
          tracks,
          setTracks,
          sortedTracks,
          setSortedTracks,
          username,
          setUsername }}
        >
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
