import { useState } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';
import { Container } from '@material-ui/core';
import { useCookies } from 'react-cookie';

import UserContext from './context/UserContext';
import Navbar from './components/Navbar';
import TokenExpired from './components/TokenExpired';
import SpotifyAuth from './pages/SpotifyAuth';
import UserPlaylists from './pages/UserPlaylists';
import Playlist from './pages/Playlist';
import About from './pages/About';
import Search from './pages/Search';
import RecommendedTracks from './pages/RecommendedTracks';

const App = () => {
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
    genre: false,
  });
  const [matchRecsToSeedTrackKey, setMatchRecsToSeedTrackKey] = useState(false);
  const [cookies, setCookie] = useCookies(['token']);

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

  const handleAuthError = () => {
    if (cookies.token && cookies.token !== token) {
      setToken(cookies.token);
      setAuthError(false);
    } else {
      setAuthError(true);
    }
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
            handleAuthError,
            seedParams,
            setSeedParams,
            matchRecsToSeedTrackKey,
            setMatchRecsToSeedTrackKey,
            cookies,
            setCookie,
          }}
        >
          <Container maxWidth="lg" className="main-div" id="main">
            <Navbar />
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
};

export default App;
