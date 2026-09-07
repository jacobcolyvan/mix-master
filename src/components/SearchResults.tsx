import { Alert } from "@mui/material";

import KeySelect from "../atoms/KeySelect";
import Loading from "../atoms/Loading";
import Offline from "../atoms/Offline";
import PlaylistItems from "../atoms/PlaylistItems";
import SortBy from "../atoms/SortBy";
import { useAlbumTracks, useSearchResults } from "../queries/searchQueries";
import { Track } from "../types";
import { SearchRoute } from "../utils/searchRoute";
import Albums from "./Albums";
import Tracks from "./Tracks";

interface TrackResultsProps {
  albumName: string | null;
  tracks: Track[] | null;
  isPending: boolean;
  isPaused: boolean;
  error: Error | null;
}

const TrackResults: React.FC<TrackResultsProps> = ({
  albumName,
  tracks,
  isPending,
  isPaused,
  error,
}) => (
  <>
    {albumName ? (
      <h3 className="results-page-title">{albumName}</h3>
    ) : (
      <h3 className="results-page-title">Track Results</h3>
    )}
    <KeySelect />
    <br />
    <SortBy />
    <br />
    <Tracks tracks={tracks} isPending={isPending} isPaused={isPaused} error={error} />
  </>
);

const PlaylistResults = ({ playlistsToRender }): JSX.Element => (
  <>
    <h3 className="results-page-title">Playlist Results</h3>
    <PlaylistItems playlistsToRender={playlistsToRender} />
  </>
);

const SEARCH_ERROR = "Unable to load results from Spotify. Please try again.";

type SearchResultsProps = { route: SearchRoute };

const SearchResults: React.FC<SearchResultsProps> = ({ route }) => {
  const isAlbumView = route.kind === "albumTracks";

  const searchQuery = useSearchResults(isAlbumView ? null : route);
  const albumQuery = useAlbumTracks(isAlbumView ? route.albumId : null);

  if (isAlbumView) {
    return (
      <TrackResults
        albumName={albumQuery.data?.albumName ?? null}
        tracks={albumQuery.data?.tracks ?? null}
        isPending={albumQuery.isPending}
        isPaused={albumQuery.isPaused}
        error={albumQuery.error}
      />
    );
  }

  if (route.kind !== "track") {
    if (!searchQuery.data && searchQuery.isPaused) return <Offline />;
    if (searchQuery.isPending) return <Loading />;
    if (searchQuery.isError && !searchQuery.data)
      return <Alert severity="error">{SEARCH_ERROR}</Alert>;
  }

  const data = searchQuery.data;

  return (
    <div>
      {data?.kind === "album" && <Albums albums={data.albums} />}
      {route.kind === "track" && (
        <TrackResults
          albumName={null}
          tracks={data?.kind === "track" ? data.tracks : null}
          isPending={searchQuery.isPending}
          isPaused={searchQuery.isPaused}
          error={searchQuery.error}
        />
      )}
      {data?.kind === "playlist" && <PlaylistResults playlistsToRender={data.playlists} />}
    </div>
  );
};

export default SearchResults;
