import Albums from './Albums';
import Tracks from './Tracks';
import PlaylistList from './PlaylistList';
import SortBy from './SortBy';
import KeySelect from './KeySelect';

import { useSelector } from 'react-redux';
import { selectAlbumName, selectSearchResultValues } from '../features/controlsSlice';
import { selectPlaylist, selectTracks } from '../features/itemsSlice';

interface SearchResultsProps {
  updateUrl: (slug: string, results: any) => void;
}

const SearchResults = ({ updateUrl }: SearchResultsProps) => {
  const albumName = useSelector(selectAlbumName);
  const searchResultValues = useSelector(selectSearchResultValues);
  const tracks = useSelector(selectTracks);
  const playlist = useSelector(selectPlaylist);

  console.log("searchResultValues", searchResultValues);

  return (
    <div>
      {searchResultValues.albumResults && !searchResultValues.trackResults && (
        <Albums updateUrl={updateUrl} />
      )}

      {!playlist && !searchResultValues.playlistResults && tracks && (
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
      )}

      {searchResultValues.playlistResults && (
        <>
          <h3 className="results-page-title">Playlist Results</h3>
          <PlaylistList
            playlistsToRender={searchResultValues.playlistResults}
            // showOnlyPlaylistTracks={showOnlyPlaylistTracks}
          />
        </>
      )}
    </div>
  );
};

export default SearchResults;
