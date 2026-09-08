import { TextField } from "@mui/material";

interface SearchBarProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ label, value, onChange }) => (
  <TextField
    className="searchbar-textfield"
    fullWidth
    label={label}
    onChange={(event) => onChange(event.target.value)}
    value={value}
  />
);

export default SearchBar;
