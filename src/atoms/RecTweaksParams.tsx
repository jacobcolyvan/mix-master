import CloseIcon from "@mui/icons-material/Close";
import { IconButton } from "@mui/material";

import { SeedAttributes } from "../types";

interface RecTweaksParamsProps {
  attributes: SeedAttributes;
  onRemove: (name: keyof SeedAttributes) => void;
}

const RecTweaksParams: React.FC<RecTweaksParamsProps> = ({ attributes, onRemove }) => (
  <div className="currently-selected-params-div">
    <label>Currently selected inputs are:</label>
    <ul>
      {(Object.keys(attributes) as (keyof SeedAttributes)[]).map(
        (name) =>
          attributes[name].value !== "" && (
            <li key={name}>
              {`– ${name === "genre" ? "" : attributes[name].maxOrMinFilter} ${name}: ${attributes[name].value}`}
              <IconButton
                aria-label={`Remove ${name}`}
                onClick={() => onRemove(name)}
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

export default RecTweaksParams;
