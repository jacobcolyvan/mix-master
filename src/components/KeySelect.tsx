import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

interface KeySelectProps {
  keyOption: string;
  setKeyOption: React.Dispatch<React.SetStateAction<string>>;
}

const KeySelect = ({ keyOption, setKeyOption }: KeySelectProps) => {
  const keyOptionChange = (
    event: React.ChangeEvent<{ name?: string | undefined; value: unknown }>
  ) => {
    if (event && typeof event.target.value === 'string')
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
