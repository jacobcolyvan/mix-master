import Albums from './Albums';
import Tracks from './Tracks';
import PlaylistItems from '../atoms/PlaylistItems';
import SortBy from '../atoms/SortBy';
import KeySelect from '../atoms/KeySelect';

import { useSelector } from 'react-redux';
import { selectAlbumName, selectSearchResultValues } from '../slices/controlsSlice';
import { selectPlaylist, selectTracks } from '../slices/itemsSlice';

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
  const playlist = useSelector(selectPlaylist);

  // TODO: this feels a little convoluted
  const { albumResults, trackResults, playlistResults } = searchResultValues;
  const hasAlbumResults = albumResults && !trackResults;
  const hasTrackResults = !playlist && !playlistResults && tracks;

  return (
    <div>
      {hasAlbumResults && <Albums />}
      {hasTrackResults && <TrackResults albumName={albumName} />}
      {playlistResults && <PlaylistResults playlistsToRender={playlistResults} />}
    </div>
  );
};

export default SearchResults;
