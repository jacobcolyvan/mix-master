import React, { useEffect, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import UserContext from '../context/UserContext';

import SpotifyAuth from '../components/SpotifyAuth';
import Playlists from '../components/Playlists'
import Playlist from '../components/Playlist'
import Info from '../components/Info'


const Main = styled.div`
  padding: 10px;
  margin-bottom: 10px;
`


const Home = ({ location }) => {
  const history = useHistory();
  const { token, setToken, playlist } = useContext(UserContext);

  useEffect(() => {
    if (location.hash.split('=')[1]) {
      setToken(location.hash.split('=')[1].split('&token')[0]);
      history.push('/');
    }
  }, [setToken, token, history, location.hash]);

  return (
    <Main>
      {!playlist && <Info />}

      {/* <br/> */}
      {!token && <SpotifyAuth />}

      {(token && playlist) && <Playlist />}
      {(token && !playlist) && <Playlists />}

    </Main>
  );
};

export default Home;
