import { useHistory } from "react-router-dom";

import { Playlist } from "../types";

interface Props {
  playlistsToRender: Playlist[];
}

const PlaylistItems: React.FC<Props> = ({ playlistsToRender }) => {
  const history = useHistory();

  const openPlaylist = (playlist: Playlist) => {
    history.push(`/playlist?id=${encodeURIComponent(playlist.id)}`);
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
              onClick={() => openPlaylist(playlist)}
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
