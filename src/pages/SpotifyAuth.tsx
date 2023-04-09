import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import { useDispatch } from 'react-redux';
import { setSpotifyToken } from '../slices/settingsSlice';
import { useCookies } from 'react-cookie';

import Info from '../atoms/Info';
import { createSpotifyAuthHREF } from '../utils/requestUtils';

interface AuthProps {
  location: { hash: string };
}

const SpotifyAuth = ({ location }: AuthProps) => {
  const [cookies, setCookie] = useCookies(['token']);
  const dispatch = useDispatch();
  const history = useHistory();

  useEffect(() => {
    if (cookies.token) {
      dispatch(setSpotifyToken(cookies.token));
    }
  }, []);

  useEffect(() => {
    if (location && location.hash.split('=')[1]) {
      const newToken = location.hash.split('=')[1].split('&token')[0];
      dispatch(setSpotifyToken(newToken));

      setCookie('token', newToken, {
        path: '/',
        maxAge: 3600,
        secure: false,
        sameSite: 'lax',
      });
      history.replace('/');
    }
  }, [location]);

  return (
    <div>
      <Info />
      <p>
        <i>Authorise Spotify to start: </i>
      </p>
      <a href={createSpotifyAuthHREF()}>
        <Button variant="outlined" color="primary" fullWidth>
          Authorise Spotify
        </Button>
      </a>
    </div>
  );
};

export default SpotifyAuth;
