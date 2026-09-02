import { useSelector } from "react-redux";

import KeySelect from "../atoms/KeySelect";
import PlaylistItems from "../atoms/PlaylistItems";
import SortBy from "../atoms/SortBy";
import { selectAlbumName, selectSearchResultValues } from "../slices/controlsSlice";
import { selectTracks } from "../slices/itemsSlice";
import Albums from "./Albums";
import Tracks from "./Tracks";

const TrackResults = ({ albumName }): JSX.Element => (
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
    <Tracks />
  </>
);

const PlaylistResults = ({ playlistsToRender }): JSX.Element => (
  <>
    <h3 className="results-page-title">Playlist Results</h3>
    <PlaylistItems playlistsToRender={playlistsToRender} />
  </>
);

const SearchResults = () => {
  const albumName = useSelector(selectAlbumName);
  const searchResultValues = useSelector(selectSearchResultValues);
  const tracks = useSelector(selectTracks);

  const { albumResults, trackResults, playlistResults } = searchResultValues;
  const hasAlbumResults = albumResults && !trackResults;
  const hasTrackResults = !playlistResults && tracks;

  return (
    <div>
      {hasAlbumResults && <Albums />}
      {hasTrackResults && <TrackResults albumName={albumName} />}
      {playlistResults && <PlaylistResults playlistsToRender={playlistResults} />}
    </div>
  );
};

export default SearchResults;
