import React, {useEffect, useContext} from 'react';
import { useHistory } from 'react-router-dom';
import Button from '@material-ui/core/Button';

import UserContext from '../context/UserContext';
import Info from '../components/Info'

const SpotifyAuth = ({ location }) => {
  const scopes = [
    'user-read-private',
    'playlist-read-private',
    'user-library-read',
    'user-top-read'
  ];

  const history = useHistory();
  const { token, setToken } = useContext(UserContext);

  useEffect(() => {
    if (location && location.hash.split('=')[1]) {
      const newToken = location.hash.split('=')[1].split('&token')[0]
      setToken(newToken);
      history.replace('/');
    }
  }, [setToken, token, history, location]);

  return (
    <div>
      <Info />
      <p><i>Authorise Spotify: </i></p>
      <a
        href={`https://accounts.spotify.com/authorize?response_type=token&client_id=${
          process.env.REACT_APP_SPOTIFY_CLIENT_ID2
        }&scope=${scopes.join('%20')}&redirect_uri=${encodeURIComponent(
          process.env.REACT_APP_SPOTIFY_CALLBACK_URI
        )}&show_dialog=false`}
      >
        <Button variant='outlined' color='primary' fullWidth>
          Authorise Spotify
        </Button>
      </a>
    </div>
  )
}

export default SpotifyAuth
