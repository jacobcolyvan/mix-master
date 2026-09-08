import { Alert, Button, Container } from "@mui/material";
import { useEffect, useState } from "react";
import { BrowserRouter as Router, Redirect, Route, Switch } from "react-router-dom";

import Loading from "./atoms/Loading";
import Navbar from "./atoms/Navbar";
import { logout } from "./auth";
import { useSignedIn } from "./hooks/useSignedIn";
import About from "./pages/About";
import Playlist from "./pages/Playlist";
import RecommendedTracks from "./pages/RecommendedTracks";
import Search from "./pages/Search";
import SpotifyLogin from "./pages/SpotifyLogin";
import UserPlaylists from "./pages/UserPlaylists";
import { useCurrentUser } from "./queries/userQueries";

const SignedInRoutes = () => {
  const profileQuery = useCurrentUser();
  const username = profileQuery.data?.display_name;

  if (!username) {
    let message: string;
    if (profileQuery.isError || profileQuery.isPaused) {
      message = "Unable to load your Spotify profile. Please reload the page.";
    } else if (profileQuery.isPending) {
      return <Loading />;
    } else {
      message =
        "Your Spotify profile has no display name. Add one in Spotify, then reload the page.";
    }

    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" onClick={() => logout("signed_out")}>
            Logout
          </Button>
        }
      >
        {message}
      </Alert>
    );
  }

  return (
    <>
      <Route exact path="/" render={() => <UserPlaylists username={username} />} />
      <Route exact path="/about" component={About} />
      <Route path="/search" component={Search} />
      <Route path="/playlist" render={() => <Playlist username={username} />} />
      <Route path="/recommended" component={RecommendedTracks} />
    </>
  );
};

const App = ({ ready }: { ready: Promise<void> }) => {
  const signedIn = useSignedIn();
  const [startupReady, setStartupReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function finishStartup() {
      await ready;

      if (!cancelled) {
        setStartupReady(true);
      }
    }

    finishStartup();

    // Ignore startup completion after unmount or when this effect is replaced.
    return () => {
      cancelled = true;
    };
  }, [ready]);

  const renderSwitchRoutes = () => {
    if (!startupReady) return <Loading />;

    if (!signedIn) {
      return <Route exact path="/" component={SpotifyLogin} />;
    }

    return <SignedInRoutes />;
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
                {/* logout() writes ?reason= via replaceState; use window.location.search, not RR location */}
                <Redirect to={{ pathname: "/", search: window.location.search }} />
              </Switch>
            </div>
          </div>
        </Container>
      </Router>
    </div>
  );
};

export default App;
