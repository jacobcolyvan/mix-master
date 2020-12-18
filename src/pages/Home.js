import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import SpotifyAuth from '../components/SpotifyAuth';

import Playlists from '../components/Playlists'
import Playlist from '../components/Playlist'

// import UserContext from '../context/UserContext';

const Home = ({ location }) => {
  const history = useHistory();
  const [ token, setToken ] = useState(false)
  const [ playlistId, setPlaylistId] = useState(false)

  useEffect(() => {
    if (location.hash.split('=')[1]) {
      setToken(location.hash.split('=')[1].split('&token')[0]);
      console.log(location.hash.split('=')[1].split('&token')[0]);
      history.push('/');
    }
  }, [setToken, token, history, location.hash]);

  return (
    <div>
      <p>This is a website to:</p>
      <p>
        Compare and sort your playlists by their genre or bpm.
        Intended to help a user make better flowing playlists,
        or mixes.
      </p>

      {(token) &&  (
        <>
          <h3>Playlists</h3>
          <Playlists token={token} setPlaylistId={setPlaylistId} />
        </>


      )}
      {(token && playlistId) &&  (
        <>
          <h3>Playlist Name</h3>
          <Playlist token={token} />
        </>
      )}

      <br/>
      <p><i>Authorise Spotify to start: </i></p>
      <SpotifyAuth />
    </div>
  );
};

export default Home;
