import Albums from './Albums';
import Tracks from './Tracks';
import PlaylistItems from './PlaylistItems';
import SortBy from './SortBy';
import KeySelect from './KeySelect';

import { useSelector } from 'react-redux';
import { selectAlbumName, selectSearchResultValues } from '../features/controlsSlice';
import { selectPlaylist, selectTracks } from '../features/itemsSlice';

const SearchResults = () => {
  const albumName = useSelector(selectAlbumName);
  const searchResultValues = useSelector(selectSearchResultValues);
  const tracks = useSelector(selectTracks);
  const playlist = useSelector(selectPlaylist);

  return (
    <div>
      {searchResultValues.albumResults && !searchResultValues.trackResults && (
        <Albums />
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
          <PlaylistItems playlistsToRender={searchResultValues.playlistResults} />
        </>
      )}
    </div>
  );
};

export default SearchResults;
