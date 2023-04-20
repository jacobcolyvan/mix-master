import { useHistory } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Select, MenuItem, SelectChangeEvent } from '@mui/material';

import SearchBar from '../atoms/SearchBar';
import {
  saveSearchQueryChange,
  selectCurrentSearchQueries,
} from '../slices/controlsSlice';
import { getSearchResults } from '../slices/itemsSlice';

const PlaylistSearch = ({ getResults, playlistSearchQuery }) => (
  <SearchBar
    label={'playlist name'}
    param={playlistSearchQuery}
    paramName={'playlistSearchQuery'}
    getResults={getResults}
  />
);

const AlbumSearch = ({ getResults, albumSearchQuery, artistSearchQuery }) => (
  <>
    <SearchBar
      label={'artist'}
      param={artistSearchQuery}
      paramName={'artistSearchQuery'}
      getResults={getResults}
    />
    <SearchBar
      label={'album name'}
      paramName={'albumSearchQuery'}
      param={albumSearchQuery}
      getResults={getResults}
    />
  </>
);

const TrackSearch = ({ getResults, trackSearchQuery, artistSearchQuery }) => (
  <>
    <SearchBar
      label={'artist'}
      param={artistSearchQuery}
      paramName={'artistSearchQuery'}
      getResults={getResults}
    />
    <SearchBar
      label={'track name'}
      param={trackSearchQuery}
      paramName={'trackSearchQuery'}
      getResults={getResults}
    />
  </>
);

const SearchOptions = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  const currentSearchQueries = useSelector(selectCurrentSearchQueries);
  const { playlistSearchQuery, albumSearchQuery, trackSearchQuery, artistSearchQuery } =
    currentSearchQueries;

  const dispatchGetSearchResults = async () => {
    await dispatch(getSearchResults(history));
  };

  return (
    <div className="search-options__div">
      <Select
        labelId="Search Type"
        id="search-type"
        value={currentSearchQueries.searchType}
        onChange={(event: SelectChangeEvent<any>) =>
          dispatch(saveSearchQueryChange('searchType', event.target.value))
        }
        fullWidth
        variant="outlined"
      >
        <MenuItem value={'track'}>Tracks</MenuItem>
        <MenuItem value={'album'}>Albums</MenuItem>
        <MenuItem value={'playlist'}>Playlists</MenuItem>
      </Select>

      <div className="searchbar__div">
        {currentSearchQueries.searchType === 'playlist' && (
          <PlaylistSearch
            getResults={dispatchGetSearchResults}
            playlistSearchQuery={playlistSearchQuery}
          />
        )}
        {currentSearchQueries.searchType === 'album' && (
          <AlbumSearch
            getResults={dispatchGetSearchResults}
            albumSearchQuery={albumSearchQuery}
            artistSearchQuery={artistSearchQuery}
          />
        )}
        {currentSearchQueries.searchType === 'track' && (
          <TrackSearch
            getResults={dispatchGetSearchResults}
            trackSearchQuery={trackSearchQuery}
            artistSearchQuery={artistSearchQuery}
          />
        )}
      </div>

      <div className="search-button__div">
        <Button
          variant="outlined"
          color="primary"
          onClick={dispatchGetSearchResults}
          className="button"
          fullWidth
        >
          Search
        </Button>
      </div>
    </div>
  );
};

export default SearchOptions;
