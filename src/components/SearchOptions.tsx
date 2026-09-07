import { Button, MenuItem, Select } from "@mui/material";

import SearchBar from "../atoms/SearchBar";
import { CurrentSearchQueryOptions } from "../types";

interface SearchOptionsProps {
  value: CurrentSearchQueryOptions;
  onChange: (value: CurrentSearchQueryOptions) => void;
  onSubmit: () => void;
}

const SearchOptions: React.FC<SearchOptionsProps> = ({ value, onChange, onSubmit }) => {
  const change = (key: keyof CurrentSearchQueryOptions) => (text: string) =>
    onChange({ ...value, [key]: text });

  return (
    <form
      className="search-options__div"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <Select
        inputProps={{ "aria-label": "Search type" }}
        id="search-type"
        value={value.searchType}
        onChange={(event) => change("searchType")(event.target.value)}
        fullWidth
        variant="outlined"
      >
        <MenuItem value="track">Tracks</MenuItem>
        <MenuItem value="album">Albums</MenuItem>
        <MenuItem value="playlist">Playlists</MenuItem>
      </Select>
      <div className="searchbar__div">
        {value.searchType === "playlist" && (
          <SearchBar
            label="Playlist"
            value={value.playlistSearchQuery}
            onChange={change("playlistSearchQuery")}
          />
        )}
        {value.searchType === "album" && (
          <>
            <SearchBar
              label="Artist"
              value={value.artistSearchQuery}
              onChange={change("artistSearchQuery")}
            />
            <SearchBar
              label="Album"
              value={value.albumSearchQuery}
              onChange={change("albumSearchQuery")}
            />
          </>
        )}
        {value.searchType === "track" && (
          <SearchBar
            label="Track"
            value={value.trackSearchQuery}
            onChange={change("trackSearchQuery")}
          />
        )}
      </div>
      <div className="search-button__div">
        <Button variant="outlined" color="primary" type="submit" className="button" fullWidth>
          Search
        </Button>
      </div>
    </form>
  );
};

export default SearchOptions;
