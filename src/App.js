import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';
import { Container } from '@material-ui/core';

import UserContext from './context/UserContext';
import Navbar from './components/Navbar';
import TokenExpired from './components/TokenExpired';
import SpotifyAuth from './pages/SpotifyAuth';
import UserPlaylists from './pages/UserPlaylists';
import Playlist from './pages/Playlist';
import About from './pages/About';
import Search from './pages/Search';
import RecommendedTracks from './pages/RecommendedTracks';

function App() {
  const [token, setToken] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [tracks, setTracks] = useState(false);
  const [sortedTracks, setSortedTracks] = useState(false);
  const [username, setUsername] = useState(false);
  const [recommendedTrack, setRecommendedTrack] = useState(false);
  const [lastClickedTrack, setLastClickedTrack] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [seedParams, setSeedParams] = useState({
    tempo: false,
    energy: false,
    duration: false,
    popularity: false,
    intrumentalness: false,
    valence: false,
    danceability: false,
    liveness: false,
    speechiness: false,
    acousticness: false,
  });
  const [matchRecsToSeedTrackKey, setMatchRecsToSeedTrackKey] = useState(true);

  const [searchOptionValues, setSearchOptionValues] = useState({
    albumSearchQuery: '',
    artist: '',
    playlistSearchQuery: '',
    searchType: 'track',
    trackSearchQuery: '',
  });

  const [searchResultValues, setSearchResultValues] = useState({
    albums: false,
    playlistSearchResults: '',
    tracks: false,
  });

  const resetStates = (resetRecommended = false) => {
    setTracks(false);
    setSortedTracks(false);
    setRecommendedTrack(false);
    setLastClickedTrack(false);
    // setSeedParams()
    resetRecommended && setRecommendedTrack(false);
  };

  const pushPlaylistToState = (history, playlist) => {
    resetStates();
    history.push(
      {
        pathname: '/playlist',
        search: `?id=${playlist.id}`,
      },
      {
        playlist: playlist,
        // tracks: tracks,
        // sortedTracks: sortedTracks
      }
    );
  };

  return (
    <div>
      <Router>
        <UserContext.Provider
          value={{
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
            setAuthError,
            seedParams,
            setSeedParams,
            matchRecsToSeedTrackKey,
            setMatchRecsToSeedTrackKey,
          }}
        >
          <Container maxWidth="lg" className="main-div" id="main">
            <Navbar resetStates={resetStates} authError />
            <div className="main-div__inner">
              {/* TODO: rethink switch logic */}
              <div className="main-content__div">
                <Switch>
                  {!token ? (
                    <Route
                      exact
                      path="/"
                      render={(props) => (
                        <SpotifyAuth location={props.location} />
                      )}
                    />
                  ) : !authError ? (
                    <Switch>
                      <Route exact path="/" component={UserPlaylists} />
                      <Route exact path="/about" component={About} />
                      <Route path="/search" component={Search} />
                      <Route path="/playlist" component={Playlist} />
                      <Route
                        path="/recommended"
                        component={RecommendedTracks}
                      />
                    </Switch>
                  ) : (
                    <Route path="/" component={TokenExpired} />
                  )}

                  <Redirect to="/" />
                </Switch>
              </div>
            </div>
          </Container>
        </UserContext.Provider>
      </Router>
    </div>
  );
}

export default App;
