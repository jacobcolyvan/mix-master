import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { History } from 'history';

import SearchOptions from '../components/SearchOptions';
import SearchResults from '../components/SearchResults';
import Loading from '../components/Loading';

import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../app/store';
import { updateSearchStateFromBrowserState } from '../features/controlsSlice';

const Search = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  const { isSearching, hasCurrentSearchResults } = useSelector(
    (state: RootState) => state.controlsSlice
  );

  // Refresh state on search re-render
  useEffect(() => {
    dispatch(updateSearchStateFromBrowserState(history));
  }, [history.location.state]);

  return (
    <div>
      <h1 className="search-page-title">Search</h1>
      <SearchOptions />

      {hasCurrentSearchResults && (
        <div>
          <hr className="search-page-results__hr" />
          <SearchResults />
        </div>
      )}
      {isSearching && <Loading />}
    </div>
  );
};

export default Search;
