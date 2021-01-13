import React, { useEffect, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import UserContext from '../context/UserContext';

import SpotifyAuth from '../components/SpotifyAuth';
import Playlists from '../components/Playlists';
import Playlist from '../components/Playlist';
import About from '../components/About';
import Search from './Search'


const Main = styled.div`
  padding: 10px;
  margin-bottom: 10px;
`


const Home = ({ location }) => {
  const history = useHistory();
  const { token, setToken, playlist, about, search } = useContext(UserContext);

  useEffect(() => {
    if (location.hash.split('=')[1]) {
      setToken(location.hash.split('=')[1].split('&token')[0]);
      history.push('/');
    }
  }, [setToken, token, history, location.hash]);

  return (
    <Main>
      {!token && <SpotifyAuth />}
      {(about && token) && <About /> }
      {(search && token) && <Search /> }

      {(!about && !search && token && playlist) && <Playlist />}
      {(! about && !search && token && !playlist) && <Playlists />}

    </Main>
  );
};

export default Home;
