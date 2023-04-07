import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '../app/store';
import { getUserPlaylists } from '../features/itemsSlice';
import { getUsername, selectSpotifyToken } from '../features/settingsSlice';

import PlaylistList from '../components/PlaylistItems';
import Loading from '../components/Loading';

const UserPlaylists = () => {
  const dispatch = useDispatch();
  const { sortedPlaylists } = useSelector((state: RootState) => state.itemsSlice);
  const token = useSelector(selectSpotifyToken);

  useEffect(() => {
    const dispatchPlaylists = async () => {
      // HACKY / what does this do?
      await dispatch(getUsername());
      dispatch(getUserPlaylists());
    };

    dispatchPlaylists();
  }, [token]);

  if (sortedPlaylists) {
    return (
      <div>
        <div className="playlists-title__div">
          <h2>Playlists</h2>
        </div>
        <div className="playlists-info__div">
          <p>
            See <i>About</i> for more info about how to use this site.
          </p>
          <p>
            Playlists are automatically separated into ones you've{' '}
            <a href="#created-playlists" className="subpage-link">
              created
            </a>
            , and ones you{' '}
            <a href="#followed-playlists" className="subpage-link">
              follow
            </a>
            .
          </p>
        </div>

        {typeof sortedPlaylists === 'object' && (
          <div>
            <div className="playlists-title__div" id="created-playlists" tabIndex={0}>
              <h3>Created</h3>
            </div>
            <PlaylistList playlistsToRender={sortedPlaylists.created} />

            <br />
            <div className="playlists-title__div" id="followed-playlists" tabIndex={0}>
              <h3>Followed</h3>
            </div>
            <PlaylistList playlistsToRender={sortedPlaylists.followed} />

            <br />

            {sortedPlaylists.generated.length > 0 && (
              <>
                <div
                  className="playlists-title__div"
                  id="generated-playlists"
                  tabIndex={0}
                >
                  <h3>Gena</h3>
                </div>
                <PlaylistList playlistsToRender={sortedPlaylists.generated} />
              </>
            )}
          </div>
        )}
      </div>
    );
  } else {
    return <Loading />;
  }
};

export default UserPlaylists;
