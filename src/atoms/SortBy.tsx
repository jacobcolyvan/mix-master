import { MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";

import { selectSortTracksBy, setSortTracksBy } from "../slices/controlsSlice";

const SortBy = () => {
  const dispatch = useDispatch();
  const sortOption = useSelector(selectSortTracksBy);

  const sortOptionChange = (event: SelectChangeEvent<any>) => {
    if (event?.target.value) {
      dispatch(setSortTracksBy(event.target.value));
    }
  };

  return (
    <div>
      <Select
        labelId="Sort By:"
        id="sort-by-select"
        value={sortOption}
        onChange={sortOptionChange}
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
