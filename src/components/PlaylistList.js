import React from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

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

  .playlist-name {
    padding-left: 4px;
  }
`

const PlaylistItems = ({ playlistsToRender, showOnlyPlaylistTracks }) => {
  const history = useHistory();

  const addPlaylistQuery = (playlist) => {
    history.push({
      pathname: '/playlist',
      search: `?id=${playlist.id}`
    },
    { 
      playlist: playlist
    })

    showOnlyPlaylistTracks && showOnlyPlaylistTracks()
  }

  return (
      <ul>
        {playlistsToRender.map((playlist, index) => (
          <PlaylistLi
            className='playlist item'
            key={`track${index}`}
            onClick={() => {
              addPlaylistQuery(playlist)
            }}
          >
            <div className='single-playlist-div'>
              <div className='playlist-name'>{playlist.name}</div>
              {playlist.images[0] && <img src={playlist.images[0].url} alt={`playlist img`} width="60" height="60" className='playlist-image'/>}
            </div>
          </PlaylistLi>
        ))}
      </ul>
  )
};

export default PlaylistItems;
