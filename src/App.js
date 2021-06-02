import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from 'react-router-dom';
import styled from 'styled-components';
import { Container } from '@material-ui/core';

import UserContext from './context/UserContext';
import './stylesheets/App.css';

import Navbar from './components/Navbar'
import TokenExpired from './components/TokenExpired'
import SpotifyAuth from './pages/SpotifyAuth';
import UserPlaylists from './pages/UserPlaylists';
import Playlist from './pages/Playlist';
import About from './pages/About';
import Search from './pages/Search';
import RecommendedTracks from './pages/RecommendedTracks';

const Content = styled.div`
  padding: 10px;
  margin-bottom: 10px;
`


function App() {
  const [ token, setToken ] = useState(false);
  const [ playlists, setPlaylists] = useState([]);
  const [ tracks, setTracks ] = useState(false);
  const [ sortedTracks, setSortedTracks ] = useState(false);
  const [ username, setUsername ] = useState(false);
  const [ recommendedTrack, setRecommendedTrack ] = useState(false);
  const [ lastClickedTrack, setLastClickedTrack ] = useState(false);
  const [ authError, setAuthError ] = useState(false);

  const [ searchOptionValues, setSearchOptionValues ] = useState({
    albumSearchQuery: '',
    artist: '',
    playlistSearchQuery: '',
    searchType: 'track',
    trackSearchQuery: '',
  });

  const [ searchResultValues, setSearchResultValues ] = useState({
    albums: false,
    playlistSearchResults: '',
    tracks: false,
  });

  const resetStates = (resetRecommended=false) => {
    setTracks(false);
    setSortedTracks(false);
    setRecommendedTrack(false);
    setLastClickedTrack(false);
    resetRecommended && setRecommendedTrack(false);
  }

  const pushPlaylistToState = (history, playlist) => {
    resetStates();
    history.push({
      pathname: '/playlist',
      search: `?id=${playlist.id}`
    },
    {
      playlist: playlist,
      // tracks: tracks,
      // sortedTracks: sortedTracks
    })

  }

  return (
    <div>
      <Router>
        <UserContext.Provider value={{
          token,
          setToken,
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
          setLastClickedTrack,
          searchOptionValues,
          setSearchOptionValues,
          searchResultValues,
          setSearchResultValues,
          pushPlaylistToState,
          setAuthError
        }}
        >
          <Container maxWidth='md' id='main' style={{ marginBottom: "24px", marginTop: "24px" }}>
            <Navbar resetStates={resetStates} authError />
            <div className='main-paper' style={{ border: "1px solid #424242"}}>
                <>
                  <Switch>
                    <Content>
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

                        !authError ? (

                          <>
                            <Route exact path='/' component={UserPlaylists} />
                            <Route exact path='/about' component={About} />
                            <Route path='/search' component={Search} />
                            <Route path='/playlist' component={Playlist} />
                            <Route path='/recommended' component={RecommendedTracks} />
                          </>

                        ) : (
                          <TokenExpired/>
                        )
                      )}

                      <Redirect to='/' />
                    </Content>
                  </Switch>
                  {/* Tab to the bottom of the page */}
                  <div tabIndex="0" style={{display: "block", margin: "0", padding: "0"}}/>
                </>
            </div>
          </Container>
        </UserContext.Provider>
      </Router>
    </div>
  );
}

export default App;
