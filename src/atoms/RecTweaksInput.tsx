import { useState, useEffect } from 'react';
import TextField from '@material-ui/core/TextField';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';

import { useDispatch } from 'react-redux';
import { saveSeedAttribute } from '../slices/controlsSlice';
import { AttributeChoiceDetails } from '../types';

interface InputProps {
  paramValue: any;
  inputItem: AttributeChoiceDetails;
}

const RecTweaksInput = ({ paramValue, inputItem }: InputProps) => {
  const dispatch = useDispatch();

  const { input_name, extra_text, range_limit, validateField } = inputItem;

  const [validationError, setValidationError] = useState(false);
  const [maxOrMin, setMaxOrMin] = useState(
    (paramValue && paramValue.maxOrMin) || 'target'
  );
  const [inputValue, setInputValue] = useState(paramValue && paramValue.value);
  const [inputLabel, setInputLabel] = useState(
    `${maxOrMin} ${input_name} (0 – ${range_limit}${extra_text || ''})`
  );

  // for when inputs are updated from outside the component
  useEffect(() => {
    setInputValue(paramValue && paramValue.value);
  }, [paramValue]);

  // validate input value on change
  useEffect(() => {
    const valueIsValid = validateField(parseFloat(inputValue));

    if (valueIsValid) {
      dispatch(saveSeedAttribute(input_name, inputValue, maxOrMin));
      setValidationError(false);
    } else {
      // Avoid empty inputs raising validation error
      inputValue === '0' ? setValidationError(true) : setValidationError(false);
      dispatch(saveSeedAttribute(input_name, false));
    }
  }, [inputValue]);

  const handleRadioChange = (event: React.ChangeEvent<{ [key: string]: any }>) => {
    setMaxOrMin(event.target.value);
    setInputLabel(
      `${event.target.value} ${input_name} (0 – ${range_limit}${extra_text || ''})`
    );
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
        <FormControlLabel
          value="target"
          control={<Radio color="primary" />}
          label="Target"
        />
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
        helperText={validationError ? 'Invalid range value' : false}
      />
    </div>
  );
};

export default RecTweaksInput;
