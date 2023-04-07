import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import Tracks from '../components/Tracks';
import SortBy from '../components/SortBy';
import KeySelect from '../components/KeySelect';
import { selectUsername } from '../features/settingsSlice';
import { getTracks } from '../features/itemsSlice';
import PlaylistDescription from '../components/PlaylistDescription';

const Playlist = () => {
  const username = useSelector(selectUsername);
  const history: any = useHistory();
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
