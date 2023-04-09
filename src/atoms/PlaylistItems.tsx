import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { pushPlaylistToHistory } from '../slices/itemsSlice';
import { Playlist } from '../types';

interface Props {
  playlistsToRender: Playlist[];
}

const PlaylistItems: React.FC<Props> = ({ playlistsToRender }) => {
  const dispatch = useDispatch();
  const history = useHistory();

  const dispatchPlaylistHistory = (playlist: Playlist) => {
    dispatch(pushPlaylistToHistory(history, playlist));
  };

  return (
    <ul>
      {Array.isArray(playlistsToRender) &&
        playlistsToRender.map((playlist, index) => (
          <li
            className="playlist-list__li"
            key={`track${index}`}
            onClick={() => dispatchPlaylistHistory(playlist)}
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
