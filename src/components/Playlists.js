import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';

import styled from 'styled-components'

const PlaylistLi = styled.li`
  border: 1px solid #c4c4c4;
  /* padding: 6px 4px; */
  border-radius: 4px;

  padding: 10px 5px;

  &:hover {
    color: #2882e9;
    cursor: pointer;
  }

  div {
    display: flex;
    justify-content: space-between;
    align-items: center;


  }
`


// import Playlist from './Playlist'

// import sortBy from './components/SortBy'

const Playlists = ({token, setPlaylist}) => {
  const [playlists, setPlaylists] = useState(false);

  useEffect(() => {
    const getPlaylists = async () => {
      try {
        const response = await axios({
          method: 'get',
          url: `https://api.spotify.com/v1/me/playlists?limit=50&offset=${0}`,
          headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json'
          }
        });

        console.log(response.data.items)
        // setPlaylistTotalAmount(response.data.total)
        setPlaylists(response.data.items);
      } catch (err) {
        console.log(err.message);
      }
    };

    getPlaylists();
    // if (!token) {
    //   history.push('/');
    // } else {
    //   getPlaylists();
    // }
  }, [token]);

  const savePlaylist = (index) => {
    setPlaylist(playlists[index]);
    console.log(playlists[index]);
    // history.push(`/playlists/${index}`)
  };


  if (playlists) {
    return (
      <div>
        <h3>Playlists</h3>
        {playlists.length > 0 && (
          <ul>
            {playlists.map((playlist, index) => (
              <PlaylistLi
                className='playlist item'
                key={`track${index}`}
                onClick={() => savePlaylist(index)}
              >
                <div className='single-playlist-div'>
                  <div className='playlist-name'>{playlist.name}</div>
                  {playlist.images[0] && <img src={playlist.images[0].url} alt={`playlist img`} width="60" height="60" className='playlist-image'/>}
                </div>
              </PlaylistLi>
            ))}
          </ul>
        )}
      </div>
    );
  } else {
    return (
      <div>
        <p>Put playlists here / LOADING.</p>
      </div>
    );
  }
}

export default Playlists
