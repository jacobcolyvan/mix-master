import { useEffect } from "react";

import { useAppDispatch, useAppSelector } from "../app/store";
import Loading from "../atoms/Loading";
import PlaylistItems from "../atoms/PlaylistItems";
import { getUserPlaylists } from "../slices/itemsSlice";
import { getUsername, selectSpotifyToken } from "../slices/settingsSlice";

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

const GeneratedPlaylists = ({ generatedPlaylists }) => {
  return (
    <>
      {generatedPlaylists.length > 0 && (
        <div className="playlist-list__header" id="generated-playlists">
          <h3>Generated</h3>
        </div>
      )}
      <PlaylistItems playlistsToRender={generatedPlaylists} />
      <br />
    </>
  );
};

const UserPlaylists: React.FC = () => {
  const dispatch = useAppDispatch();
  const { sortedPlaylists } = useAppSelector((state) => state.itemsSlice);
  const spotifyToken = useAppSelector(selectSpotifyToken);

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
          <GeneratedPlaylists generatedPlaylists={sortedPlaylists.generated} />
        </div>
      )}
    </div>
  ) : (
    <Loading />
  );
};

export default UserPlaylists;
