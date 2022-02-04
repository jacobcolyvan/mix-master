import React, { useState, useEffect } from 'react';
import TextField from '@material-ui/core/TextField';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';

interface InputProps {
  paramValue: any;
  inputItem: {
    input_name: string;
    extra_text: string | boolean;
    range_limit: number;
    takes_whole_numbers: boolean;
  };
  saveParam: (
    paramName: string,
    value: any,
    limit: number,
    maxOrMin: string
  ) => void;
}

const RecTweaksInput = ({ saveParam, paramValue, inputItem }: InputProps) => {
  const { input_name, extra_text, range_limit, takes_whole_numbers } =
    inputItem;
  const [error, setError] = useState(false);
  const [maxOrMin, setMaxOrMin] = useState(paramValue.maxOrMin || 'target');
  const [inputValue, setInputValue] = useState(paramValue.value || false);
  const [inputLabel, setInputLabel] = useState(
    `min ${input_name} (0 – ${range_limit}${extra_text || ''})`
  );

  const handleRadioChange = (
    event: React.ChangeEvent<{ [key: string]: any }>
  ) => {
    setMaxOrMin(event.target.value);
    setInputLabel(
      `${event.target.value} ${input_name} (0 – ${range_limit}${
        extra_text || ''
      })`
    );
  };

  const handleInputChange = (
    event: React.ChangeEvent<{ [key: string]: any }>
  ) => {
    setInputValue(event.target.value);
  };

  // for when inputs are updated from outside the component
  useEffect(() => {
    setInputValue(paramValue.value || false);
  }, [paramValue]);

  useEffect(() => {
    const validateInput = () => {
      if (inputValue && inputValue !== '0') {
        if (
          inputValue &&
          takes_whole_numbers &&
          !Number.isInteger(parseFloat(inputValue))
        ) {
          setError(true);
        } else if (!(inputValue > 0 && inputValue < range_limit)) {
          setError(true);
        } else {
          setError(false);
          saveParam(input_name, inputValue, range_limit, maxOrMin);
        }
      } else if (inputValue === '0') {
        saveParam(input_name, false, range_limit, maxOrMin);
        setError(true);
      } else {
        saveParam(input_name, false, range_limit, maxOrMin);
        setError(false);
      }
    };

    validateInput();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue, maxOrMin]);

  return (
    <div className="rec-tweaks-input__div">
      <RadioGroup
        aria-label="maxOrMinValueGroup"
        className="rec-tweaks__radio-group"
        name="maxOrMinValueGroup"
        value={maxOrMin}
        onChange={handleRadioChange}
      >
        <FormControlLabel
          value="target"
          control={<Radio color="primary" />}
          label="Target"
        />
        <FormControlLabel
          value="min"
          control={<Radio color="primary" />}
          label="Min"
        />
        <FormControlLabel
          value="max"
          control={<Radio color="primary" />}
          label="Max"
        />
      </RadioGroup>

      <TextField
        fullWidth
        label={inputLabel}
        value={inputValue}
        type="number"
        className="rec-tweaks__textfield"
        onChange={handleInputChange}
        error={error}
        helperText={error ? 'Invalid range value' : false}
      />
    </div>
  );
};

export default RecTweaksInput;
