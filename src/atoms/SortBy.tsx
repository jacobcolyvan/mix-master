import { MenuItem, Select } from "@mui/material";

import { TrackSortByChoices } from "../types";

const SortBy = ({
  value,
  onChange,
}: {
  value: TrackSortByChoices;
  onChange: (value: TrackSortByChoices) => void;
}) => {
  return (
    <div>
      <Select
        inputProps={{ "aria-label": "Sort by" }}
        id="sort-by-select"
        value={value}
        onChange={(event) => onChange(event.target.value as TrackSortByChoices)}
        fullWidth
        variant="outlined"
      >
        <MenuItem value={"default"}>Original Order</MenuItem>
        <MenuItem value={"duration"}>Sort by Duration</MenuItem>
        <MenuItem value={"popularity"}>Sort by Popularity</MenuItem>
        <MenuItem value={"valence"}>Sort by Valence</MenuItem>
        <MenuItem value={"tempo"}>Sort by Tempo</MenuItem>
        <MenuItem value={"energy"}>Sort by Energy</MenuItem>
        <MenuItem value={"durationThenKey"}>Sort by Duration, then Key</MenuItem>
        <MenuItem value={"major/minor"}>Sort by Major/Minor</MenuItem>
        <MenuItem value={"energyThenKey"}>Sort by Energy, then Key</MenuItem>
        <MenuItem value={"tempoThenKey"}>Sort by Tempo, then Key</MenuItem>
        <MenuItem value={"valenceThenKey"}>Sort by Valence, then Key</MenuItem>
      </Select>
    </div>
  );
};

export default SortBy;
