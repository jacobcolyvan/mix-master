import { Autocomplete } from "@mui/material";
import { TextField } from "@mui/material";

import { useAppDispatch } from "../app/store";
import { saveSeedAttribute } from "../slices/controlsSlice";
// NOTE: this file can be updated from this link --
//       https://developer.spotify.com/console/get-available-genre-seeds/
import genres from "../utils/genres.json";

interface InputProps {
  genre: { [key: string]: any } | false;
}

const RecTweaksGenre: React.FC<InputProps> = ({ genre }) => {
  const dispatch = useAppDispatch();

  const handleGenreChange = (_: any, newValue: string | null) => {
    if (newValue) {
      dispatch(saveSeedAttribute("genre", newValue));
    }
  };

  return (
    <div className="rec-tweaks-input__div rec-tweaks-input__genre">
      <Autocomplete
        fullWidth
        id="Genre-Autocomplete"
        options={genres.genres}
        value={genre === false ? "" : genre.value}
        onChange={handleGenreChange}
        renderInput={(params) => <TextField {...params} label="Genre" variant="outlined" />}
        style={{ margin: "8px 0" }}
        freeSolo
        // multiple
      />
    </div>
  );
};

export default RecTweaksGenre;
