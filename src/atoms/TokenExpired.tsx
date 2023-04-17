import { Button } from '@material-ui/core';
import { createSpotifyAuthHREF } from '../utils/requestUtils';

const TokenExpired = () => {
  return (
    <div>
      <p>
        Your Spotify token has expired. Reauthorise by reloading the page or by clicking
        the link below.
      </p>

      <p>
        <i>Authorise Spotify: </i>
      </p>

      <a href={createSpotifyAuthHREF()}>
        <Button variant="outlined" color="primary" fullWidth>
          Authorise Spotify
        </Button>
      </a>
    </div>
  );
};

export default TokenExpired;
