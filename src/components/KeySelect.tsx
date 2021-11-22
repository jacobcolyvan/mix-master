import React from 'react';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

interface Props {
  keyOption: string,
  setKeyOption: React.Dispatch<React.SetStateAction<string | unknown>>
}


const KeySelect: React.FC<Props> = ({ keyOption, setKeyOption }) => {
  const keyOptionChange = (
    event: React.ChangeEvent<{ value: string | unknown }>
  ) => {
    setKeyOption(event.target.value);
  };

  return (
    <div className="key-select__div">
      <Select
        labelId="Key Select"
        id="key-select"
        value={keyOption}
        onChange={keyOptionChange}
        fullWidth
        variant="outlined"
      >
        <MenuItem value={'camelot'}>Camelot Key</MenuItem>
        <MenuItem value={'standard'}>Standard Key</MenuItem>
      </Select>
    </div>
  );
};

export default KeySelect;
