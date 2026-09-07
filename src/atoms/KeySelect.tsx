import { MenuItem, Select } from "@mui/material";

import { KeyOptionTypes } from "../types";

type KeySelectProps = {
  value: KeyOptionTypes;
  onChange: (value: KeyOptionTypes) => void;
};

const KeySelect = ({ value, onChange }: KeySelectProps) => (
  <div className="key-select__div">
    <Select
      inputProps={{ "aria-label": "Key notation" }}
      id="key-select"
      value={value}
      onChange={(event) => onChange(event.target.value as KeyOptionTypes)}
      fullWidth
      variant="outlined"
    >
      <MenuItem value="camelot">Camelot Key</MenuItem>
      <MenuItem value="standard">Standard Key</MenuItem>
    </Select>
  </div>
);

export default KeySelect;
