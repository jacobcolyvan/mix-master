import { Button } from "@mui/material";

import InfoOverview from "../atoms/info/InfoOverview";
import { login } from "../auth";

const SpotifyLogin = () => {
  return (
    <div>
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
