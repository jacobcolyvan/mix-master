import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
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

import { useDispatch, useSelector } from 'react-redux';
import {
  setSpotifyToken,
  setAuthError,
  selectSpotifyToken,
  selectAuthError,
} from './features/settingsSlice';
import { resetItemStates } from './features/itemsSlice';

const App = () => {
  const dispatch = useDispatch();
  const [cookies, setCookie] = useCookies(['token']); // ????

  const token = useSelector(selectSpotifyToken);
  const authError = useSelector(selectAuthError);

  const pushPlaylistToState = (history, playlist) => {
    dispatch(resetItemStates);
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
    // this should handle what type of error it is
    if (cookies.token && cookies.token !== token) {
      dispatch(setSpotifyToken(cookies.token));
      dispatch(setAuthError(false));
    } else {
      dispatch(setAuthError(false));
    }
  };

  return (
    <div>
      <Router>
        <UserContext.Provider
          value={{
            pushPlaylistToState,
            handleAuthError,
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
                        <SpotifyAuth
                          location={props.location}
                          cookies={cookies}
                          setCookie={setCookie}
                        />
                      )}
                    />
                  ) : !authError ? (
                    <>
                      <Route exact path="/" component={UserPlaylists} />
                      <Route exact path="/about" component={About} />
                      <Route path="/search" component={Search} />
                      <Route path="/playlist" component={Playlist} />
                      <Route path="/recommended" component={RecommendedTracks} />
                    </>
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
