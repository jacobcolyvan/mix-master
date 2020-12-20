import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import SpotifyAuth from '../components/SpotifyAuth';

import Playlists from '../components/Playlists'
import Playlist from '../components/Playlist'
import styled from 'styled-components'

const Main = styled.div`
  padding: 10px;
  margin-bottom: 30px;
`

const Info = styled.div`
  margin-bottom: 32px;

  p {
    margin: 0px;
  }

  #info-header {
    margin-bottom: 16px;
    margin-top: 16px;
  }

  #info-points {
    margin-left: 32px;
  }
`

// import UserContext from '../context/UserContext';

const Home = ({ location }) => {
  const history = useHistory();
  const [ token, setToken ] = useState(false)
  const [ playlist, setPlaylist] = useState(false)

  useEffect(() => {
    if (location.hash.split('=')[1]) {
      setToken(location.hash.split('=')[1].split('&token')[0]);
      console.log(location.hash.split('=')[1].split('&token')[0]);
      history.push('/');
    }
  }, [setToken, token, history, location.hash]);

  // const setPlaylist = (id) => {
  //   setPlaylistId(is)
  // }





  return (
    <Main>
      <Info>
        <p id='info-header'>This is a website to:</p>
        <p id='info-points'>
          – Compare and sort your playlists by their genre or bpm.
        </p>
        <p id="info-points">* Intended to help a user make better flowing playlists,
          or mixes.</p>
      </Info>

      <br/>
      {!token && <SpotifyAuth />}

      {(token && playlist) && <Playlist token={token} playlist={playlist} />}
      {(token && !playlist) && <Playlists token={token} setPlaylist={setPlaylist} />}

    </Main>
  );
};

export default Home;
