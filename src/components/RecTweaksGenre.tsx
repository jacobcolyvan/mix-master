import React from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';

// NOTE: this file can be updated from this link --
//       https://developer.spotify.com/console/get-available-genre-seeds/
import genres from '../utils/genres.json';

interface InputProps {
  saveParam: (
    paramName: string,
    value: any,
    limit: number,
    maxOrMin: string
  ) => void;
  genre: { [key: string]: any } | boolean;
}

const RecTweaksGenre = ({ saveParam, genre }: InputProps) => {
  return (
    <div className="rec-tweaks-input__div rec-tweaks-input__genre">
      <Autocomplete
        fullWidth
        id="Genre-Autocomplete"
        options={genres.genres}
        value={typeof genre === 'boolean' ? '' : genre.value}
        onChange={(_, newValue) => {
          saveParam('genre', newValue, 0, 'target');
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
