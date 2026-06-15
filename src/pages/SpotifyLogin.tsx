import { Alert, Button } from "@mui/material";

import InfoOverview from "../atoms/info/InfoOverview";
import { getLogoutMessage, login } from "../auth";

const SpotifyLogin = () => {
  const logoutMessage = getLogoutMessage();

  return (
    <div>
      {logoutMessage && (
        <Alert severity="warning" className="spotify-login__alert">
          {logoutMessage}
        </Alert>
      )}
      <InfoOverview />
      <p>
        <i>Authorise Spotify to start: </i>
      </p>
      <Button variant="outlined" color="primary" fullWidth onClick={login}>
        Authorise Spotify
      </Button>
    </div>
  );
};

export default SpotifyLogin;
