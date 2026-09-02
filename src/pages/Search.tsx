import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "../app/store";
import Loading from "../atoms/Loading";
import SearchOptions from "../components/SearchOptions";
import SearchResults from "../components/SearchResults";
import { resetSearchState, setCurrentSearchQueries } from "../slices/controlsSlice";
import { getAlbumTracks, getSearchResults, invalidateTracksRequest } from "../slices/itemsSlice";
import { parseSearchRoute, searchFormFromQuery } from "../utils/searchRoute";

const Search: React.FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();

  const { isSearching, hasCurrentSearchResults } = useAppSelector((state) => state.controlsSlice);

  useLayoutEffect(() => {
    const route = parseSearchRoute(location.search);

    dispatch(resetSearchState());

    if (route?.kind === "albumTracks") {
      dispatch(getAlbumTracks(route.albumId));
    } else if (route) {
      dispatch(setCurrentSearchQueries(searchFormFromQuery(route)));
      dispatch(getSearchResults(route));
    }

    return () => {
      dispatch(invalidateTracksRequest());
    };
  }, [dispatch, location.key, location.search]);

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
