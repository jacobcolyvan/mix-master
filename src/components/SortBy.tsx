import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

interface SortByProps {
  sortOption: string;
  setSortOption: React.Dispatch<React.SetStateAction<string>>;
}

const SortBy = ({ sortOption, setSortOption }: SortByProps) => {
  const sortOptionChange = (
    event: React.ChangeEvent<{ name?: string | undefined; value: unknown }>
  ) => {
    if (event && typeof event.target.value === 'string')
      setSortOption(event.target.value);
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
        <MenuItem value={'default'}>Original Order</MenuItem>
        <MenuItem value={'duration'}>Sort by Duration</MenuItem>
        <MenuItem value={'popularity'}>Sort by Popularity</MenuItem>

        <MenuItem value={'valence'}>Sort by Valence</MenuItem>
        <MenuItem value={'tempo'}>Sort by Tempo</MenuItem>
        <MenuItem value={'durationThenKey'}>
          Sort by Duration, then Key
        </MenuItem>
        <MenuItem value={'major/minor'}>Sort by Major/Minor</MenuItem>
        <MenuItem value={'energyThenKey'}>Sort by Energy, then Key</MenuItem>
        <MenuItem value={'tempoThenKey'}>Sort by Tempo, then Key</MenuItem>
      </Select>
    </div>
  );
};

export default SortBy;
