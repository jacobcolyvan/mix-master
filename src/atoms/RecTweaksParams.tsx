import CloseIcon from '@mui/icons-material/Close';
import { IconButton } from '@mui/material';
import { useDispatch } from 'react-redux';

import { saveSeedAttribute } from '../slices/controlsSlice';
import { SeedAttributes } from '../types';

interface RecTweaksParamsProps {
  attributes: SeedAttributes;
}

const RecTweaksParams: React.FC<RecTweaksParamsProps> = ({ attributes }) => {
  const dispatch = useDispatch();

  const getListItemText = (
    attribute: string,
    maxOrMin: string | undefined,
    value: number | undefined
  ): string => {
    return `– ${maxOrMin || ''} ${attribute}: ${value || ''}`;
  };

  return (
    <div className="currently-selected-params-div">
      <label>Currently selected inputs are:</label>
      <ul>
        {Object.keys(attributes).map(
          (attribute) =>
            attributes[attribute].value && (
              <li key={`currently-selected-attribute-li__${attribute}`}>
                {getListItemText(
                  attribute,
                  attributes[attribute].maxOrMin,
                  attributes[attribute].value
                )}
                <IconButton
                  aria-label="close"
                  onClick={() => dispatch(saveSeedAttribute(attribute, false))}
                  size="small"
                  className="close-icon"
                >
                  <CloseIcon />
                </IconButton>
              </li>
            )
        )}
      </ul>
    </div>
  );
};

export default RecTweaksParams;
