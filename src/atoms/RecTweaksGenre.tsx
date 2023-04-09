import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';

// NOTE: this file can be updated from this link --
//       https://developer.spotify.com/console/get-available-genre-seeds/
import genres from '../utils/genres.json';
import { useDispatch } from 'react-redux';
import { saveSeedAttribute } from '../slices/controlsSlice';

interface InputProps {
  genre: { [key: string]: any } | false;
}

const RecTweaksGenre = ({ genre }: InputProps) => {
  const dispatch = useDispatch();

  return (
    <div className="rec-tweaks-input__div rec-tweaks-input__genre">
      <Autocomplete
        fullWidth
        id="Genre-Autocomplete"
        options={genres.genres}
        value={genre === false ? '' : genre.value}
        onChange={(_, newValue) => {
          dispatch(saveSeedAttribute('genre', newValue));
        }}
        renderInput={(params) => (
          <TextField {...params} label="Genre" variant="outlined" />
        )}
        style={{ margin: '8px 0' }}
        freeSolo
        // multiple
      />
    </div>
  );
};

export default RecTweaksGenre;
