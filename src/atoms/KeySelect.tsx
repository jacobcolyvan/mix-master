import { MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";

import { selectKeyDisplayOption, setKeyDisplayOption } from "../slices/settingsSlice";

const KeySelect = () => {
  const dispatch = useDispatch();
  const keyDisplayOption = useSelector(selectKeyDisplayOption);

  const handleKeySettingChange = (event: SelectChangeEvent<any>) => {
    if (event?.target.value) dispatch(setKeyDisplayOption(event.target.value));
  };

  return (
    <div className="key-select__div">
      <Select
        labelId="Key Select"
        id="key-select"
        value={keyDisplayOption}
        onChange={handleKeySettingChange}
        fullWidth
        variant="outlined"
      >
        <MenuItem value={"camelot"}>Camelot Key</MenuItem>
        <MenuItem value={"standard"}>Standard Key</MenuItem>
      </Select>
    </div>
  );
};

export default KeySelect;
