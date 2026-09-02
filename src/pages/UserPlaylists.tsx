import { useEffect, useMemo } from "react";

import { useAppDispatch, useAppSelector } from "../app/store";
import Loading from "../atoms/Loading";
import PlaylistItems from "../atoms/PlaylistItems";
import { getUserPlaylists } from "../slices/itemsSlice";
import { selectUsername } from "../slices/settingsSlice";
import { groupPlaylists } from "../utils/collectionTransforms";

const CreatedPlaylists = ({ createdPlaylists }) => {
  return (
    <>
      {createdPlaylists.length > 0 && (
        <div className="playlist-list__header" id="created-playlists">
          <h3>Created</h3>
        </div>
      )}
      <PlaylistItems playlistsToRender={createdPlaylists} />
      <br />
    </>
  );
};

const FollowedPlaylists = ({ followedPlaylists }) => {
  return (
    <>
      {followedPlaylists.length > 0 && (
        <div className="playlist-list__header" id="followed-playlists">
          <h3>Followed</h3>
        </div>
      )}
      <PlaylistItems playlistsToRender={followedPlaylists} />
      <br />
    </>
  );
};

const UserPlaylists: React.FC = () => {
  const dispatch = useAppDispatch();
  const userPlaylists = useAppSelector((state) => state.itemsSlice.userPlaylists);
  const username = useAppSelector(selectUsername);

  useEffect(() => {
    dispatch(getUserPlaylists());
  }, []);

  // Null until the fetch lands, which is what drives the Loading gate below.
  const sortedPlaylists = useMemo(
    () => (userPlaylists ? groupPlaylists(userPlaylists, username) : null),
    [userPlaylists, username]
  );

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
          Playlists are automatically separated into ones you&apos;ve{" "}
          <a href="#created-playlists" className="subpage-link">
            created
          </a>
          , and ones you{" "}
          <a href="#followed-playlists" className="subpage-link">
            follow
          </a>
          .
        </p>
      </div>

      {typeof sortedPlaylists === "object" && (
        <div>
          <CreatedPlaylists createdPlaylists={sortedPlaylists.created} />
          <FollowedPlaylists followedPlaylists={sortedPlaylists.followed} />
        </div>
      )}
    </div>
  ) : (
    <Loading />
  );
};

export default UserPlaylists;
