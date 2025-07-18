import { Button, FormControlLabel, Switch } from "@mui/material";
import { useState } from "react";

import { useAppDispatch, useAppSelector } from "../app/store";
import RecTweaksParams from "../atoms/RecTweaksParams";
import { invertMatchRecsToSeedTrackKey } from "../slices/controlsSlice";
import { getRecommendedTracks } from "../slices/itemsSlice";
import { Track } from "../types";
import { attributeChoices } from "../utils/commonVariables";
import RecTweaksTabs from "./RecTweaksTabs";

interface RecTweakProps {
  recommendedTrack: Track;
}

const RecTweaks: React.FC<RecTweakProps> = ({ recommendedTrack }) => {
  const dispatch = useAppDispatch();
  const { matchRecsToSeedTrackKey, seedAttributes } = useAppSelector(
    (state) => state.controlsSlice
  );
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (
    _: React.ChangeEvent<object>,
    newValue: React.SetStateAction<number>
  ): void => {
    setCurrentTab(newValue);
  };

  return (
    <div className="rec-tweaks__div">
      <h4>Tweak the recommendations below:</h4>

      <FormControlLabel
        control={
          <Switch
            checked={matchRecsToSeedTrackKey}
            onChange={() => dispatch(invertMatchRecsToSeedTrackKey())}
            name="match-key__switch"
          />
        }
        label="Match recommendations to key of chosen track?"
        className="match-key__switch"
      />
      <RecTweaksTabs
        currentTab={currentTab}
        handleTabChange={handleTabChange}
        attributeChoices={attributeChoices}
        attributes={seedAttributes}
      />
      <Button
        variant="outlined"
        color="primary"
        onClick={() => dispatch(getRecommendedTracks(recommendedTrack))}
        className="button rec-tweaks__button"
      >
        Refresh Recommendations
      </Button>
      <RecTweaksParams attributes={seedAttributes} />
    </div>
  );
};

export default RecTweaks;
