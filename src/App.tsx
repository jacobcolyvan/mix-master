import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import { Container } from '@mui/material';
import { useSelector } from 'react-redux';

import Navbar from './atoms/Navbar';
import TokenExpired from './atoms/TokenExpired';
import SpotifyAuth from './pages/SpotifyAuth';
import UserPlaylists from './pages/UserPlaylists';
import Playlist from './pages/Playlist';
import About from './pages/About';
import Search from './pages/Search';
import RecommendedTracks from './pages/RecommendedTracks';
import { selectSpotifyToken, selectAuthError } from './slices/settingsSlice';

const App = () => {
  const token = useSelector(selectSpotifyToken);
  const authError = useSelector(selectAuthError);

  const renderSwitchRoutes = () => {
    if (!token) {
      return <Route exact path="/" component={SpotifyAuth} />;
    }

    if (token && !authError) {
      return (
        <>
          <Route exact path="/" component={UserPlaylists} />
          <Route exact path="/about" component={About} />
          <Route path="/search" component={Search} />
          <Route path="/playlist" component={Playlist} />
          <Route path="/recommended" component={RecommendedTracks} />
        </>
      );
    }

    if (authError) {
      return <Route path="/" component={TokenExpired} />;
    }
  };

  return (
    <div>
      <Router>
        <Container maxWidth="lg" className="main-div" id="main">
          <Navbar />
          <div className="main-div__inner">
            <div className="main-content__div">
              <Switch>
                {renderSwitchRoutes()}
                <Redirect to="/" />
              </Switch>
            </div>
          </div>
        </Container>
      </Router>
    </div>
  );
};

export default App;
