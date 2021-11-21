import React from 'react';
import Button from '@material-ui/core/Button';
import { scopes } from '../utils/CommonVariables';

const AuthError = () => {
  return (
    <div>
      <p>
        Your Spotify token has expired. Reauthorise by reloading the page or by
        clicking the link below.
      </p>

      <p>
        <i>Authorise Spotify: </i>
      </p>
      <a
        href={`https://accounts.spotify.com/authorize?response_type=token&client_id=${
          process.env.REACT_APP_SPOTIFY_CLIENT_ID2
        }&scope=${scopes.join('%20')}&redirect_uri=${encodeURIComponent(
          process.env.REACT_APP_SPOTIFY_CALLBACK_URI || "missing-callback-uri"
        )}&show_dialog=false`}
      >
        <Button variant="outlined" color="primary" fullWidth>
          Authorise Spotify
        </Button>
      </a>
    </div>
  );
};

export default AuthError;
