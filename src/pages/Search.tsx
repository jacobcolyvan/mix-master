import { useEffect } from "react";
import { useHistory } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "../app/store";
import Loading from "../atoms/Loading";
import SearchOptions from "../components/SearchOptions";
import SearchResults from "../components/SearchResults";
import { updateSearchStateFromBrowserState } from "../slices/controlsSlice";

const Search: React.FC = () => {
  const dispatch = useAppDispatch();
  const history = useHistory();

  const { isSearching, hasCurrentSearchResults } = useAppSelector((state) => state.controlsSlice);

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
