import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";

import { usePageTitle } from "../app/usePageTitle";
import SearchOptions from "../components/SearchOptions";
import SearchResults from "../components/SearchResults";
import { searchQueryOptions } from "../queries/searchQueries";
import {
  buildSearchUrl,
  parseSearchRoute,
  searchFormFromRoute,
  searchQueryFromForm,
} from "../utils/searchRoute";

const Search: React.FC = () => {
  usePageTitle("Search");
  const history = useHistory();
  const location = useLocation();
  const client = useQueryClient();
  const route = useMemo(() => parseSearchRoute(location.search), [location.search]);
  const [searchDraft, setSearchDraft] = useState(() => searchFormFromRoute(route));

  useEffect(() => {
    // A new history entry discards edits even when its URL is unchanged.
    setSearchDraft(searchFormFromRoute(route));
  }, [route, location.key]);

  const submit = () => {
    const query = searchQueryFromForm(searchDraft);
    const target = query ? buildSearchUrl(query) : "/search";
    setSearchDraft(searchFormFromRoute(query));

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
      <SearchOptions value={searchDraft} onChange={setSearchDraft} onSubmit={submit} />
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
