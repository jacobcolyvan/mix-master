import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { RootState } from '../app/store';
import Loading from '../atoms/Loading';
import SearchOptions from '../components/SearchOptions';
import SearchResults from '../components/SearchResults';
import { updateSearchStateFromBrowserState } from '../slices/controlsSlice';

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
