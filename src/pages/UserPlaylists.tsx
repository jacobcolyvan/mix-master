import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '../app/store';
import { getUserPlaylists } from '../slices/itemsSlice';
import { getUsername, selectSpotifyToken } from '../slices/settingsSlice';

import PlaylistList from '../atoms/PlaylistItems';
import Loading from '../atoms/Loading';

const CreatedPlaylists = ({ createdPlaylists }) => {
  if (createdPlaylists.length === 0) return null;
  return (
    <>
      <div className="playlists-title__div" id="created-playlists" tabIndex={0}>
        <h3>Created</h3>
      </div>
      <PlaylistList playlistsToRender={createdPlaylists} />
      <br />
    </>
  );
};

const FollowedPlaylists = ({ followedPlaylists }) => {
  if (followedPlaylists.length === 0) return null;
  return (
    <>
      <div className="playlists-title__div" id="followed-playlists" tabIndex={0}>
        <h3>Followed</h3>
      </div>
      <PlaylistList playlistsToRender={followedPlaylists} />
      <br />
    </>
  );
};

const GeneratedPlaylists = ({ generatedPlaylists }) => {
  if (generatedPlaylists.length === 0) return null;
  return (
    <>
      <div className="playlists-title__div" id="generated-playlists" tabIndex={0}>
        <h3>Generated</h3>
      </div>
      <PlaylistList playlistsToRender={generatedPlaylists.generated} />
      <br />
    </>
  );
};

const UserPlaylists = () => {
  const dispatch = useDispatch();
  const { sortedPlaylists } = useSelector((state: RootState) => state.itemsSlice);
  const spotifyToken = useSelector(selectSpotifyToken);

  const dispatchPlaylists = async () => {
    await dispatch(getUsername());
    dispatch(getUserPlaylists());
  };

  useEffect(() => {
    dispatchPlaylists();
  }, [spotifyToken]);

  return sortedPlaylists ? (
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
          <CreatedPlaylists createdPlaylists={sortedPlaylists.created} />
          <FollowedPlaylists followedPlaylists={sortedPlaylists.followed} />
          <GeneratedPlaylists generatedPlaylists={sortedPlaylists.generated} />
        </div>
      )}
    </div>
  ) : (
    <Loading />
  );
};

export default UserPlaylists;
