import { TextField } from "@mui/material";

import { useAppDispatch } from "../app/store";
import { saveSearchQueryChange } from "../slices/controlsSlice";
import { CurrentSearchQueryOptionsKeys } from "../types";

interface SearchBarProps {
  label: string;
  param: string;
  paramName: CurrentSearchQueryOptionsKeys;
  getResults: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ label, param, paramName, getResults }) => {
  const dispatch = useAppDispatch();
  const searchOnEnter = (event: React.KeyboardEvent) => {
    if (event?.key === "Enter") getResults();
  };

  return (
    <TextField
      className="searchbar-textfield"
      fullWidth
      label={label}
      onChange={(e) => dispatch(saveSearchQueryChange(paramName, e.target.value))}
      value={param}
      onKeyDown={searchOnEnter}
    />
  );
};

export default SearchBar;
