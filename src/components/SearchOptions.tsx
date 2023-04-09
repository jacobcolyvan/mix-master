import { useHistory } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import SearchBar from './SearchBar';
import {
  saveSearchQueryChange,
  selectCurrentSearchQueries,
} from '../features/controlsSlice';
import { getSearchResults } from '../features/itemsSlice';

const SearchOptions = () => {
  const currentSearchQueries = useSelector(selectCurrentSearchQueries);
  const dispatch = useDispatch();
  const history = useHistory();

  const dispatchGetSearchResults = async () => {
    await dispatch(getSearchResults(history));
  };

  const createSearchBars = () => {
    let searchBars;
    if (currentSearchQueries.searchType === 'playlist') {
      searchBars = (
        <SearchBar
          label={'playlist name'}
          param={currentSearchQueries.playlistSearchQuery}
          paramName={'playlistSearchQuery'}
          getResults={dispatchGetSearchResults}
        />
      );
    } else {
      searchBars = (
        <div>
          <SearchBar
            label={'artist'}
            param={currentSearchQueries.artistSearchQuery}
            paramName={'artistSearchQuery'}
            getResults={dispatchGetSearchResults}
          />

          {currentSearchQueries.searchType === 'album' ? (
            <SearchBar
              label={'album name'}
              paramName={'albumSearchQuery'}
              param={currentSearchQueries.albumSearchQuery}
              getResults={dispatchGetSearchResults}
            />
          ) : (
            <SearchBar
              label={'track name'}
              param={currentSearchQueries.trackSearchQuery}
              paramName={'trackSearchQuery'}
              getResults={dispatchGetSearchResults}
            />
          )}
        </div>
      );
    }

    return searchBars;
  };

  return (
    <div className="search-options__div">
      <Select
        labelId="Search Type"
        id="search-type"
        value={currentSearchQueries.searchType}
        onChange={(e: React.ChangeEvent<{ value: string | unknown }>) =>
          dispatch(saveSearchQueryChange('searchType', e.target.value))
        }
        fullWidth
        variant="outlined"
      >
        <MenuItem value={'track'}>Tracks</MenuItem>
        <MenuItem value={'album'}>Albums</MenuItem>
        <MenuItem value={'playlist'}>Playlists</MenuItem>
      </Select>

      <div className="searchbar__div">{createSearchBars()}</div>

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
