import { FormControlLabel, Radio, RadioGroup, TextField } from "@mui/material";

import { AttributeChoiceDetails, SeedAttributeDetails } from "../types";

interface InputProps {
  paramValue: SeedAttributeDetails;
  inputItem: AttributeChoiceDetails;
  error?: string;
  onChange: (value: SeedAttributeDetails) => void;
}

const RecTweaksInput: React.FC<InputProps> = ({ paramValue, inputItem, error, onChange }) => {
  const { input_name, extra_text, range_limit } = inputItem;
  return (
    <div className="rec-tweaks-input__div">
      <RadioGroup
        aria-label={`${input_name} constraint`}
        className="rec-tweaks__radio-group"
        name={`${input_name}-constraint`}
        value={paramValue.maxOrMinFilter}
        onChange={(event) =>
          onChange({
            ...paramValue,
            maxOrMinFilter: event.target.value as SeedAttributeDetails["maxOrMinFilter"],
          })
        }
      >
        <FormControlLabel value="target" control={<Radio color="primary" />} label="Target" />
        <FormControlLabel value="min" control={<Radio color="primary" />} label="Min" />
        <FormControlLabel value="max" control={<Radio color="primary" />} label="Max" />
      </RadioGroup>

      <TextField
        fullWidth
        label={`${paramValue.maxOrMinFilter} ${input_name} (0 – ${range_limit}${extra_text || ""})`}
        value={paramValue.value}
        type="text"
        slotProps={{ htmlInput: { inputMode: "decimal" } }}
        className="rec-tweaks__textfield"
        onChange={(event) => onChange({ ...paramValue, value: event.target.value })}
        error={!!error}
        helperText={error}
      />
    </div>
  );
};

export default RecTweaksInput;
