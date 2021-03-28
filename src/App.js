import React, {useState} from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from 'react-router-dom';
import styled from 'styled-components';
import { Container, Paper} from '@material-ui/core';

import UserContext from './context/UserContext';
import './stylesheets/App.css';

import Navbar from './components/Navbar'
import SpotifyAuth from './pages/SpotifyAuth';
import UserPlaylists from './pages/UserPlaylists';
import Playlist from './pages/Playlist';
import About from './pages/About';
import Search from './pages/Search';
import RecommendedTracks from './pages/RecommendedTracks';

const Main = styled.div`
  padding: 10px;
  margin-bottom: 10px;
`


function App() {
  const [ token, setToken ] = useState(false);
  const [ playlist, setPlaylist] = useState(false);
  const [ playlists, setPlaylists] = useState([]);
  const [ tracks, setTracks ] = useState(false);
  const [ sortedTracks, setSortedTracks ] = useState(false);
  const [ username, setUsername ] = useState(false);
  const [recommendedTrack, setRecommendedTrack] = useState(false);
  const [lastClickedTrack, setLastClickedTrack] = useState(false);

  const resetStates = (resetRecommended=false) => {
    setPlaylist(false);
    // setPlaylists([]);
    setTracks(false);
    setSortedTracks(false);
    setRecommendedTrack(false);
    setLastClickedTrack(false);
    resetRecommended && setRecommendedTrack(false);
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
          tracks,
          setTracks,
          sortedTracks,
          setSortedTracks,
          username,
          setUsername,
          resetStates,
          recommendedTrack,
          setRecommendedTrack,
          lastClickedTrack, 
          setLastClickedTrack
         }}
        >
          <Container maxWidth='md' id='main' style={{marginBottom: "24px", marginTop: "24px"}}>
            <Navbar resetStates={resetStates} />
            <Paper variant='outlined' className='main-paper' style={{}}>
              <Switch>
                <Main>
                  {!token ? (
                      <Route
                        exact path='/'
                        render={(props) => (
                          <SpotifyAuth
                            location={props.location}
                          />
                        )}
                      />
                  ) : (
                    <>
                      <Route exact path='/' component={UserPlaylists} />
                      <Route exact path='/about' component={About} />
                      <Route exact path='/search' component={Search} />
                      <Route exact path='/playlist' component={Playlist} />
                      <Route exact path='/recommended' component={RecommendedTracks} />
                    </>
                  )}

                  <Redirect to='/' />
                </Main>
              </Switch>
            </Paper>
          </Container>
        </UserContext.Provider>
      </Router>
    </div>
  );
}

export default App;
