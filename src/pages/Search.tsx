import { useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';

import SearchOptions from '../components/SearchOptions';
import SearchResults from '../components/SearchResults';
import Loading from '../components/Loading';

import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../app/store';
import {
  resetSearchState,
  setCurrentSearchQueries,
  setHasCurrentSearchResults,
  setSearchResultValues,
} from '../features/controlsSlice';
import { selectTracks, setSortedTracks, setTracks } from '../features/itemsSlice';

const Search = () => {
  const dispatch = useDispatch();
  const history: any = useHistory();
  const browserState: any = history.location.state;

  const tracks = useSelector(selectTracks);
  const {
    currentSearchQueries,
    searchResultValues,
    isSearching,
    hasCurrentSearchResults,
  } = useSelector((state: RootState) => state.controlsSlice);

  const resetSearch = useCallback(() => {
    dispatch(setTracks(null));
    dispatch(setSortedTracks(null));

    dispatch(resetSearchState);
  }, []);

  const updateHooksFromState = useCallback(() => {
    if (browserState) {
      dispatch(setCurrentSearchQueries(browserState.currentSearchQueries));

      if (history.location.search === '?' || history.location.search === '') {
        // Reset searchValues without resetting searchOptions
        dispatch(resetSearchState(false));
      } else {
        dispatch(setHasCurrentSearchResults(true));
        dispatch(setTracks(browserState.searchResultValues['tracks']));
        dispatch(setSearchResultValues(browserState.searchResultValues));
      }
    } else {
      resetSearch();
    }
  }, [browserState, history.location.search, resetSearch]);

  // Refresh state on search re-render
  useEffect(() => {
    updateHooksFromState();
  }, [history.location, updateHooksFromState]);

  /** Update Browser URL state and local storage */
  // TODO: move this
  const updateBrowserHistory = (slug = 'rand', results = false) => {
    history.push(
      {
        pathname: '/search',
        search: `?${slug}`,
      },
      {
        currentSearchQueries: currentSearchQueries,
        searchResultValues: results || searchResultValues,
        currentSearchResults: hasCurrentSearchResults,
        tracks: tracks,
      }
    );
  };

  return (
    <div>
      <h1 className="search-page-title">Search</h1>
      <SearchOptions />

      {hasCurrentSearchResults && (
        <div>
          <hr className="search-page-results__hr" />
          <SearchResults updateUrl={updateBrowserHistory} />
        </div>
      )}
      {isSearching && <Loading />}
    </div>
  );
};

export default Search;
