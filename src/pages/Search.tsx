import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useHistory, useLocation } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "../app/store";
import SearchOptions from "../components/SearchOptions";
import SearchResults from "../components/SearchResults";
import { searchQueryOptions } from "../queries/searchQueries";
import {
  resetSearchQueries,
  selectCurrentSearchQueries,
  setCurrentSearchQueries,
} from "../slices/controlsSlice";
import {
  buildSearchUrl,
  parseSearchRoute,
  searchFormFromQuery,
  searchQueryFromForm,
} from "../utils/searchRoute";

const Search: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const client = useQueryClient();
  const route = useMemo(() => parseSearchRoute(location.search), [location.search]);
  const dispatch = useAppDispatch();
  const searchDraft = useAppSelector(selectCurrentSearchQueries);

  useEffect(() => {
    if (route && route.kind !== "albumTracks") {
      dispatch(setCurrentSearchQueries(searchFormFromQuery(route)));
    } else {
      dispatch(resetSearchQueries());
    }
  }, [dispatch, route, location.key]);

  const submit = () => {
    const query = searchQueryFromForm(searchDraft);
    const target = query ? buildSearchUrl(query) : "/search";

    if (query && route && route.kind !== "albumTracks" && target === buildSearchUrl(route)) {
      // fetchQuery reuses fresh success and retries stale or failed results.
      client.fetchQuery(searchQueryOptions(query)).catch(() => {
        // SearchResults displays the query error; only handle the rejected promise here.
      });
    } else if (target !== `${location.pathname}${location.search}`) {
      history.push(target);
    }
  };

  return (
    <div>
      <h1 className="search-page-title">Search</h1>
      <SearchOptions
        value={searchDraft}
        onChange={(value) => dispatch(setCurrentSearchQueries(value))}
        onSubmit={submit}
      />
      {route && (
        <div>
          <hr className="search-page-results__hr" />
          <SearchResults route={route} />
        </div>
      )}
    </div>
  );
};

export default Search;
