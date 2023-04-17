import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, FormControlLabel, Switch } from '@material-ui/core';

import { RootState } from '../app/store';
import { Track } from '../types';
import { invertMatchRecsToSeedTrackKey } from '../slices/controlsSlice';
import { getRecommendedTracks } from '../slices/itemsSlice';
import { attributeChoices } from '../utils/commonVariables';
import RecTweaksTabs from './RecTweaksTabs';
import RecTweaksParams from '../atoms/RecTweaksParams';

interface RecTweakProps {
  recommendedTrack: Track;
}

const RecTweaks = ({ recommendedTrack }: RecTweakProps) => {
  const dispatch = useDispatch();
  const { matchRecsToSeedTrackKey, seedAttributes } = useSelector(
    (state: RootState) => state.controlsSlice
  );
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (
    _: React.ChangeEvent<{}>,
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
