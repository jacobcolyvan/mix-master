import React, {useState} from 'react';
import TextField from '@material-ui/core/TextField';

const Input = ({ title, saveParam, limit, wholeNumber, extra_text }) => {
    const [error, setError] = useState(false)
    let label = `min ${title} (0 – ${limit}${extra_text || ""})`


    const validateInput = (event) => {
        let value = event.target.value

        if (value && value !== "0") {
            if (wholeNumber && !Number.isInteger(parseFloat(value))) {
                setError(true)
            } else if (!(value && (value >= 0 && value < limit))) {
                setError(true)
            } else {
                setError(false)
                // convert seconds to ms
                if (title==="duration") value *= 1000;

                saveParam(title, value, limit)
            }
        } else if (value === "0") {
            setError(true)
        } else {
            setError(false)
        }
    }

    return (
        <TextField
            fullWidth
            label={label}
            type='number'
            onChange={validateInput}
            style={{ flex: 1, margin: '4px 20px 0 0', color: 'white'}}
            error={error}
            helperText={error ? "Invalid range value" : false}
        />
    );
};

export default Input;
