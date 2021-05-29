import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import UserContext from '../context/UserContext';

const PlaylistLi = styled.li`
  border: 1px solid #424242;
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

const PlaylistItems = ({ playlistsToRender, showOnlyPlaylistTracks,  }) => {
  const history = useHistory();
  const {pushPlaylistToState} = useContext(UserContext);

  const addPlaylistQuery = (playlist) => {
    pushPlaylistToState(history, playlist);

    // Playlist Search display cleaning
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
              {playlist.images[0] && (
                <img
                  src={playlist.images[0].url}
                  alt={`playlist img`}
                  width="60"
                  height="60"
                  className='playlist-image'
                  style={{ border: "1px solid #424242" }}
                />
              )}
            </div>
          </PlaylistLi>
        ))}
      </ul>
  )
};

export default PlaylistItems;
