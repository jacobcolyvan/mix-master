import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import UserContext from '../context/UserContext';

interface Props {
  playlistsToRender: Array<{ [key: string]: any }> | string;
  showOnlyPlaylistTracks?: () => void;
}

const PlaylistItems: React.FC<Props> = ({
  playlistsToRender,
  showOnlyPlaylistTracks,
}) => {
  const history = useHistory();
  const { pushPlaylistToState } = useContext(UserContext);

  const addPlaylistQuery = (playlist: {}) => {
    pushPlaylistToState(history, playlist);

    // Playlist Search display cleaning
    showOnlyPlaylistTracks && showOnlyPlaylistTracks();
  };

  return (
    <ul>
      {Array.isArray(playlistsToRender) &&
        playlistsToRender.map((playlist, index) => (
          <li
            className="playlist-list__li"
            key={`track${index}`}
            onClick={() => {
              addPlaylistQuery(playlist);
            }}
          >
            <div>
              <div className="playlist-name">{playlist.name}</div>
              {playlist.images[0] && (
                <img
                  src={playlist.images[0].url}
                  alt={`playlist img`}
                  width="60"
                  height="60"
                />
              )}
            </div>
          </li>
        ))}
    </ul>
  );
};

export default PlaylistItems;
