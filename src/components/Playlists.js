import React, { useEffect, useContext } from 'react';
import axios from 'axios';
import styled from 'styled-components'
import UserContext from '../context/UserContext';

const PlaylistLi = styled.li`
  border: 1px solid #c4c4c4;
  border-radius: 4px;
  padding: 10px 4px;

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

const PlaylistsTitle = styled.h3`
  text-decoration: underline;
  font-style: italic;
`


const Playlists = () => {
  const {token, setPlaylist, playlists, setPlaylists} = useContext(UserContext);

  useEffect(() => {
    let playlistTotalAmount = 0;
    let allPlaylists = false;
    let tempPlaylistArray = []
    let offset = 0;


    const getAllPlaylists = async () => {
      try {
        while (!allPlaylists) {
          const response = await axios({
            method: 'get',
            url: `https://api.spotify.com/v1/me/playlists?limit=50&offset=${offset}`,
            headers: {
              Authorization: 'Bearer ' + token,
              'Content-Type': 'application/json'
            }
          });

          playlistTotalAmount = response.data.total;
          playlistTotalAmount > tempPlaylistArray.length ? offset += 50 : allPlaylists = true;

          tempPlaylistArray = [...tempPlaylistArray, ...response.data.items];
        }


        setPlaylists(tempPlaylistArray);
      } catch (err) {
        console.log(err.message);
      }
    };

    getAllPlaylists();
  }, [token, setPlaylists]);

  const savePlaylist = (index) => {
    setPlaylist(playlists[index]);
    // history.push(`/playlists/${index}`)
  };


  if (playlists.length > 0) {
    return (
      <div>
        <PlaylistsTitle>Playlists</PlaylistsTitle>
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
        <p><i>Loading.</i></p>
      </div>
    );
  }
}

export default Playlists
