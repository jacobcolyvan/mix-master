import { Button, FormControlLabel, Switch } from "@mui/material";
import { useState } from "react";

import RecTweaksParams from "../atoms/RecTweaksParams";
import { SeedAttributeDetails, SeedAttributes } from "../types";
import { attributeChoices } from "../utils/commonVariables";
import { RecommendationTuning } from "../utils/recommendationTuning";
import RecTweaksTabs from "./RecTweaksTabs";

interface RecTweakProps {
  value: RecommendationTuning;
  errors: Partial<Record<keyof SeedAttributes, string>>;
  onAttributeChange: (name: keyof SeedAttributes, value: SeedAttributeDetails) => void;
  onMatchKeyChange: (value: boolean) => void;
  onReset: () => void;
  onAction: () => void;
  actionLabel: string;
  actionDisabled: boolean;
}

const RecTweaks: React.FC<RecTweakProps> = ({
  value,
  errors,
  onAttributeChange,
  onMatchKeyChange,
  onReset,
  onAction,
  actionLabel,
  actionDisabled,
}) => {
  const [currentTab, setCurrentTab] = useState(0);
  return (
    <div className="rec-tweaks__div">
      <h4>Tweak the recommendations below:</h4>

      <FormControlLabel
        control={
          <Switch
            checked={value.matchKey}
            onChange={(_, checked) => onMatchKeyChange(checked)}
            name="match-key__switch"
          />
        }
        label="Match recommendations to key of chosen track?"
        className="match-key__switch"
      />
      <RecTweaksTabs
        currentTab={currentTab}
        handleTabChange={(_, tab) => setCurrentTab(tab)}
        attributeChoices={attributeChoices}
        attributes={value.attributes}
        errors={errors}
        onChange={onAttributeChange}
      />
      <div className="rec-tweaks__actions">
        <Button
          variant="outlined"
          color="primary"
          onClick={onAction}
          disabled={actionDisabled}
          className="button rec-tweaks__button"
        >
          {actionLabel}
        </Button>
        <Button
          variant="outlined"
          color="error"
          onClick={onReset}
          className="button rec-tweaks__button"
        >
          Reset tuning
        </Button>
      </div>
      <RecTweaksParams
        attributes={value.attributes}
        onRemove={(name) => onAttributeChange(name, { value: "", maxOrMinFilter: "target" })}
      />
    </div>
  );
};

export default RecTweaks;
