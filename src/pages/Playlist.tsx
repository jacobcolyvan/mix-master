import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { History } from 'history';

import Tracks from '../components/Tracks';
import SortBy from '../atoms/SortBy';
import KeySelect from '../atoms/KeySelect';
import { selectUsername } from '../slices/settingsSlice';
import { getTracks } from '../slices/itemsSlice';
import PlaylistDescription from '../atoms/PlaylistDescription';

const Playlist = () => {
  const username = useSelector(selectUsername);
  const history: History = useHistory();
  const dispatch = useDispatch();

  // TODO: rethink this
  const playlist = history.location.state.playlist;

  useEffect(() => {
    dispatch(getTracks(playlist));
  }, []);

  return (
    <div>
      <KeySelect />
      <SortBy />

      {playlist && <h3 className="playlist-page-title">{playlist.name}</h3>}
      {playlist.description && (
        <PlaylistDescription description={playlist.description} />
      )}
      {playlist.owner.display_name !== username && (
        <p className="playlist-page-description">({playlist.owner.display_name}).</p>
      )}

      <Tracks />
    </div>
  );
};

export default Playlist;
