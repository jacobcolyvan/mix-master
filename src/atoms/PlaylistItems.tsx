import { useHistory } from "react-router-dom";

import { useAppDispatch } from "../app/store";
import { pushPlaylistToHistory } from "../slices/itemsSlice";
import { Playlist } from "../types";

interface Props {
  playlistsToRender: Playlist[];
}

const PlaylistItems: React.FC<Props> = ({ playlistsToRender }) => {
  const dispatch = useAppDispatch();
  const history = useHistory();

  const dispatchPlaylistHistory = (playlist: Playlist) => {
    dispatch(pushPlaylistToHistory(history, playlist));
  };

  return (
    <ul>
      {Array.isArray(playlistsToRender) &&
        playlistsToRender.map((playlist, index) => {
          const cover = playlist.images.at(-1);

          return (
            <li
              className="playlist-list__li"
              key={`track${index}`}
              onClick={() => dispatchPlaylistHistory(playlist)}
            >
              <div>
                <div className="playlist-name">{playlist.name}</div>
                {cover?.url && (
                  <img
                    src={cover.url}
                    alt={`"${playlist.name}" cover`}
                    width="60"
                    height="60"
                    loading="lazy"
                    decoding="async"
                  />
                )}
              </div>
            </li>
          );
        })}
    </ul>
  );
};

export default PlaylistItems;
