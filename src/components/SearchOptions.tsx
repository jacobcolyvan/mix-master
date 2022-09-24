import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import SearchBar from './SearchBar';
import { useDispatch, useSelector } from 'react-redux';
import {
  saveSearchQueryChange,
  selectCurrentSearchQueries,
} from '../features/controlsSlice';
import { getResults } from '../features/itemsSlice';

const SearchOptions = () => {
  const currentSearchQueries = useSelector(selectCurrentSearchQueries);
  const dispatch = useDispatch();

  const dispatchGetResults = async () => {
    await dispatch(getResults());
  };

  const createSearchBars = () => {
    let searchBars;
    if (currentSearchQueries.searchType === 'playlist') {
      searchBars = (
        <SearchBar
          label={'playlist name'}
          param={currentSearchQueries.playlistSearchQuery}
          paramName={'playlistSearchQuery'}
          getResults={dispatchGetResults}
        />
      );
    } else {
      searchBars = (
        <div>
          <SearchBar
            label={'artist'}
            param={currentSearchQueries.artistSearchQuery}
            paramName={'artistSearchQuery'}
            getResults={dispatchGetResults}
          />

          {currentSearchQueries.searchType === 'album' ? (
            <SearchBar
              label={'album name'}
              paramName={'albumSearchQuery'}
              param={currentSearchQueries.albumSearchQuery}
              getResults={dispatchGetResults}
            />
          ) : (
            <SearchBar
              label={'track name'}
              param={currentSearchQueries.trackSearchQuery}
              paramName={'trackSearchQuery'}
              getResults={dispatchGetResults}
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
          onClick={dispatchGetResults}
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
