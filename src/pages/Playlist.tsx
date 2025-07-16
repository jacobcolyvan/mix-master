import { History } from "history";
import { useEffect } from "react";
import { useHistory } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "../app/store";
import KeySelect from "../atoms/KeySelect";
import PlaylistDescription from "../atoms/PlaylistDescription";
import SortBy from "../atoms/SortBy";
import Tracks from "../components/Tracks";
import { getTracks } from "../slices/itemsSlice";
import { selectUsername } from "../slices/settingsSlice";
import { Playlist as PlaylistType } from "../types";

const Playlist: React.FC = () => {
  const dispatch = useAppDispatch();
  const history: History = useHistory();
  const username = useAppSelector(selectUsername);

  // Type the location state properly
  const locationState = history.location.state as { playlist?: PlaylistType } | undefined;
  const playlist = locationState?.playlist;

  useEffect(() => {
    if (playlist) {
      dispatch(getTracks(playlist));
    }
  }, [dispatch, playlist]);

  return (
    <div>
      <KeySelect />
      <SortBy />

      {playlist && <h3 className="playlist-page-title">{playlist.name}</h3>}
      {playlist?.description && <PlaylistDescription description={playlist.description} />}
      {playlist?.owner.display_name !== username && (
        <p className="playlist-page-description">({playlist?.owner.display_name}).</p>
      )}

      <Tracks />
    </div>
  );
};

export default Playlist;
