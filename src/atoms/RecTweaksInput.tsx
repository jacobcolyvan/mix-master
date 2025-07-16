import { FormControlLabel, Radio, RadioGroup, TextField } from "@mui/material";
import { useEffect, useState } from "react";

import { useAppDispatch } from "../app/store";
import { saveSeedAttribute } from "../slices/controlsSlice";
import { AttributeChoiceDetails } from "../types";

interface InputProps {
  paramValue: any;
  inputItem: AttributeChoiceDetails;
}

const RecTweaksInput: React.FC<InputProps> = ({ paramValue, inputItem }) => {
  const dispatch = useAppDispatch();

  const { input_name, extra_text, range_limit, validateField } = inputItem;

  const [validationError, setValidationError] = useState(false);
  const [maxOrMin, setMaxOrMin] = useState(paramValue?.maxOrMin || "target");
  const [inputValue, setInputValue] = useState(paramValue?.value);
  const [inputLabel, setInputLabel] = useState(getMaxOrMinInputLabel(maxOrMin));

  function getMaxOrMinInputLabel(value: string): string {
    return `${value} ${input_name} (0 – ${range_limit}${extra_text || ""})`;
  }

  // Handle updates from outside the component
  useEffect(() => {
    setInputValue(paramValue && paramValue.value);
  }, [paramValue]);

  // Validate input value on change, update state and dispatch actions
  const handleValueUpdate = (value: string) => {
    const valueIsValid = validateField(parseFloat(value));

    if (valueIsValid) {
      dispatch(saveSeedAttribute(input_name, value, maxOrMin));
      setValidationError(false);
    } else {
      // Avoid empty inputs raising validation error
      if (value === "0") {
        setValidationError(true);
      } else {
        setValidationError(false);
      }
      dispatch(saveSeedAttribute(input_name, false));
    }
  };

  useEffect(() => {
    handleValueUpdate(inputValue);
  }, [inputValue]);

  const handleRadioChange = (event: React.ChangeEvent<{ [key: string]: any }>) => {
    const newValue = event.target.value;
    setMaxOrMin(newValue);
    setInputLabel(getMaxOrMinInputLabel(newValue));
  };

  const handleInputChange = (event: React.ChangeEvent<{ [key: string]: any }>) => {
    setInputValue(event.target.value);
  };

  return (
    <div className="rec-tweaks-input__div">
      <RadioGroup
        aria-label="maxOrMinValueGroup"
        className="rec-tweaks__radio-group"
        name="maxOrMinValueGroup"
        value={maxOrMin}
        onChange={handleRadioChange}
      >
        <FormControlLabel value="target" control={<Radio color="primary" />} label="Target" />
        <FormControlLabel value="min" control={<Radio color="primary" />} label="Min" />
        <FormControlLabel value="max" control={<Radio color="primary" />} label="Max" />
      </RadioGroup>

      <TextField
        fullWidth
        label={inputLabel}
        value={inputValue}
        type="number"
        className="rec-tweaks__textfield"
        onChange={handleInputChange}
        error={validationError}
        helperText={validationError ? "Invalid range value" : false}
      />
    </div>
  );
};

export default RecTweaksInput;
