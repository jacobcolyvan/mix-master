import { Button } from '@mui/material';
import { useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { useDispatch } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';

import InfoOverview from '../atoms/info/InfoOverview';
import { setSpotifyToken } from '../slices/settingsSlice';
import { createSpotifyAuthHREF } from '../utils/requestUtils';

const SpotifyAuth = () => {
  const [cookies, setCookie] = useCookies(['token']);
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();

  useEffect(() => {
    if (cookies.token) {
      dispatch(setSpotifyToken(cookies.token));
    }
  }, []);

  useEffect(() => {
    if (location?.hash.split('=')[1]) {
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
      <InfoOverview />
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
