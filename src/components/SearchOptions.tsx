import { Button, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { useHistory } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "../app/store";
import SearchBar from "../atoms/SearchBar";
import { saveSearchQueryChange, selectCurrentSearchQueries } from "../slices/controlsSlice";
import { buildSearchUrl, searchQueryFromForm } from "../utils/searchRoute";

const PlaylistSearch = ({ getResults, playlistSearchQuery }) => (
  <SearchBar
    label="Playlist"
    param={playlistSearchQuery}
    paramName="playlistSearchQuery"
    getResults={getResults}
  />
);

const AlbumSearch = ({ getResults, albumSearchQuery, artistSearchQuery: _artistSearchQuery }) => (
  <SearchBar
    label="Album"
    param={albumSearchQuery}
    paramName="albumSearchQuery"
    getResults={getResults}
  />
);

const ArtistSearch = ({ getResults, artistSearchQuery }) => (
  <SearchBar
    label="Artist"
    param={artistSearchQuery}
    paramName="artistSearchQuery"
    getResults={getResults}
  />
);

const TrackSearch = ({ getResults, trackSearchQuery, artistSearchQuery: _artistSearchQuery }) => (
  <SearchBar
    label="Track"
    param={trackSearchQuery}
    paramName="trackSearchQuery"
    getResults={getResults}
  />
);

const SearchOptions: React.FC = () => {
  const dispatch = useAppDispatch();
  const history = useHistory();

  const currentSearchQueries = useAppSelector(selectCurrentSearchQueries);
  const { playlistSearchQuery, albumSearchQuery, trackSearchQuery, artistSearchQuery } =
    currentSearchQueries;

  const submitSearch = () => {
    const query = searchQueryFromForm(currentSearchQueries);
    const target = query ? buildSearchUrl(query) : "/search";
    const currentUrl = `${history.location.pathname}${history.location.search}`;

    if (target === currentUrl) {
      history.replace(target);
    } else {
      history.push(target);
    }
  };

  return (
    <div className="search-options__div">
      <Select
        labelId="Search Type"
        id="search-type"
        value={currentSearchQueries.searchType}
        onChange={(event: SelectChangeEvent<any>) =>
          dispatch(saveSearchQueryChange("searchType", event.target.value))
        }
        fullWidth
        variant="outlined"
      >
        <MenuItem value={"track"}>Tracks</MenuItem>
        <MenuItem value={"album"}>Albums</MenuItem>
        <MenuItem value={"playlist"}>Playlists</MenuItem>
      </Select>

      <div className="searchbar__div">
        {currentSearchQueries.searchType === "playlist" && (
          <PlaylistSearch getResults={submitSearch} playlistSearchQuery={playlistSearchQuery} />
        )}
        {currentSearchQueries.searchType === "album" && (
          <>
            <ArtistSearch getResults={submitSearch} artistSearchQuery={artistSearchQuery} />
            <AlbumSearch
              getResults={submitSearch}
              albumSearchQuery={albumSearchQuery}
              artistSearchQuery={artistSearchQuery}
            />
          </>
        )}
        {currentSearchQueries.searchType === "track" && (
          <TrackSearch
            getResults={submitSearch}
            trackSearchQuery={trackSearchQuery}
            artistSearchQuery={artistSearchQuery}
          />
        )}
      </div>

      <div className="search-button__div">
        <Button
          variant="outlined"
          color="primary"
          onClick={submitSearch}
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
