import { Alert } from "@mui/material";
import { useMemo } from "react";

import Loading from "../atoms/Loading";
import Offline from "../atoms/Offline";
import PlaylistItems from "../atoms/PlaylistItems";
import { useUserPlaylists } from "../queries/playlistQueries";
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

const UserPlaylists = ({ username }: { username: string }) => {
  const { data: userPlaylists, isError, isPending, isPaused } = useUserPlaylists();

  const sortedPlaylists = useMemo(
    () => (userPlaylists ? groupPlaylists(userPlaylists, username) : null),
    [userPlaylists, username]
  );

  if (isError && !userPlaylists) {
    return <Alert severity="error">Unable to load playlists from Spotify. Please try again.</Alert>;
  }

  if (!userPlaylists && isPaused) return <Offline />;
  if (isPending || !sortedPlaylists) return <Loading />;

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

      <div>
        <CreatedPlaylists createdPlaylists={sortedPlaylists.created} />
        <FollowedPlaylists followedPlaylists={sortedPlaylists.followed} />
      </div>
    </div>
  );
};

export default UserPlaylists;
