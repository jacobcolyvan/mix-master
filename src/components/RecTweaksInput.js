import React, {useState, useEffect} from 'react';
import styled from 'styled-components';

import TextField from '@material-ui/core/TextField';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';

const RecTweaksInputDiv = styled.div`
    .rec-tweaks__radio-group {
        margin-top: 2rem;

        .MuiTypography-root {
            font-size: 1.1em;
        }
    }

    .rec-tweaks__textfield {
        margin-top: 0.8rem;
        color: white;
    }
`


const Input = ({ title, saveParam, limit, wholeNumber, extra_text }) => {
    const [error, setError] = useState(false)
    const [maxOrMin, setMaxOrMin] = useState("min")
    const [inputValue, setInputValue] = useState(false)
    const [inputLabel, setInputLabel] = useState(`min ${title} (0 – ${limit}${extra_text || ""})`)

    const handleRadioChange = (event) => {
        setMaxOrMin(event.target.value);
        setInputLabel(`${event.target.value} ${title} (0 – ${limit}${extra_text || ""})`)
    };

    const handleInputChange = (event) => {
        setInputValue(event.target.value);
    }

    useEffect(() => {
        const validateInput = () => {
            if (inputValue && inputValue !== "0") {
                if (inputValue && wholeNumber && !Number.isInteger(parseFloat(inputValue))) {
                    setError(true)
                    // saveParam(title, false, limit, maxOrMin)
                } else if (!(inputValue > 0 && inputValue < limit)) {
                    setError(true)
                    // saveParam(title, false, limit)
                } else {
                    setError(false)
                    saveParam(title, inputValue, limit, maxOrMin)
                }
            } else if (inputValue === "0") {
                saveParam(title, false, limit, maxOrMin)
                setError(true)
            } else {
                saveParam(title, false, limit, maxOrMin)
                setError(false)
            }
        }

        validateInput()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inputValue, maxOrMin])


    return (
        <RecTweaksInputDiv>
            <RadioGroup
                aria-label="maxOrMinValueGroup"
                className="rec-tweaks__radio-group"
                name="maxOrMinValueGroup"
                value={maxOrMin}
                onChange={handleRadioChange}
            >
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
                type='number'
                className="rec-tweaks__textfield"
                onChange={handleInputChange}
                error={error}
                helperText={error ? "Invalid range value" : false}
            />
        </RecTweaksInputDiv>
    );
};

export default Input;
