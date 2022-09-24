import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { useDispatch, useSelector } from 'react-redux';
import { selectKeyDisplayOption, setKeyDisplayOption } from '../features/settingsSlice';

const KeySelect = () => {
  const dispatch = useDispatch();
  const keyDisplayOption = useSelector(selectKeyDisplayOption);

  const keySettingChange = (event: React.ChangeEvent<any>) => {
    if (event && event.target.value) dispatch(setKeyDisplayOption(event.target.value));
  };

  return (
    <div className="key-select__div">
      <Select
        labelId="Key Select"
        id="key-select"
        value={keyDisplayOption}
        onChange={keySettingChange}
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
