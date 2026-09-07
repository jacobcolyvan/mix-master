import { Autocomplete, TextField } from "@mui/material";

// NOTE: this file can be updated from this link --
//       https://developer.spotify.com/console/get-available-genre-seeds/
import genres from "../utils/genres.json";

interface InputProps {
  value: string;
  error?: string;
  onChange: (value: string) => void;
}

const RecTweaksGenre: React.FC<InputProps> = ({ value, error, onChange }) => (
  <div className="rec-tweaks-input__div rec-tweaks-input__genre">
    <Autocomplete
      fullWidth
      id="Genre-Autocomplete"
      options={genres.genres}
      value={value || null}
      inputValue={value}
      onChange={(_, next) => onChange(next ?? "")}
      onInputChange={(_, next, reason) => {
        if (reason === "input" || reason === "clear") onChange(next);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Genre"
          variant="outlined"
          error={!!error}
          helperText={error}
        />
      )}
      style={{ margin: "8px 0" }}
      freeSolo
    />
  </div>
);

export default RecTweaksGenre;
