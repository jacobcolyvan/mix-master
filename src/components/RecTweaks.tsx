import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Tabs,
  Tab,
  Button,
  FormControlLabel,
  Switch,
  IconButton,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';

import { RootState } from '../app/store';
import { attributeChoices } from '../utils/commonVariables';
import {
  invertMatchRecsToSeedTrackKey,
  saveSeedAttribute,
} from '../slices/controlsSlice';
import RecTweaksInput from '../atoms/RecTweaksInput';
import RecTweaksGenre from '../atoms/RecTweaksGenre';
import { getRecommendedTracks } from '../slices/itemsSlice';
import { Track } from '../types';

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
      <Tabs
        value={currentTab}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="on"
        className="rec-tweaks__tabs"
      >
        {attributeChoices.map((inputItem) => (
          <Tab
            label={inputItem.input_name}
            key={`tab-panel-${inputItem.input_name}`}
            className="rec-tweaks__tab"
          />
        ))}
        <Tab label="Genre" key={`tab-panel-genre`} className="rec-tweaks__tab" />
      </Tabs>

      {attributeChoices.map((inputItem, index) => (
        <div
          role="tabpanel"
          hidden={currentTab !== index}
          id={`full-width-tabpanel-${index}`}
          key={`tab-input-${index}`}
          className="rec-tweaks__tab-input"
        >
          <RecTweaksInput
            inputItem={inputItem}
            paramValue={seedAttributes[`${inputItem.input_name}`]}
          />
        </div>
      ))}

      <div
        role="tabpanel"
        hidden={currentTab !== attributeChoices.length}
        id={`full-width-tabpanel-${attributeChoices.length}`}
        key={`tab-input-${attributeChoices.length}`}
        className="rec-tweaks__tab-input"
      >
        <RecTweaksGenre genre={seedAttributes['genre']} />
      </div>

      <Button
        variant="outlined"
        color="primary"
        onClick={() => dispatch(getRecommendedTracks(recommendedTrack))}
        className="button rec-tweaks__button"
      >
        Refresh Recommendations
      </Button>

      <div className="currently-selected-params-div">
        <label>Currently selected inputs are:</label>
        <ul>
          {Object.keys(seedAttributes).map(
            (attribute) =>
              seedAttributes[attribute].value && (
                <li key={`currently-selected-attribute-li__${attribute}`}>
                  {`– ${
                    seedAttributes[attribute].maxOrMin &&
                    seedAttributes[attribute].maxOrMin
                  } ${attribute}: ${seedAttributes[attribute].value}`}
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
    </div>
  );
};

export default RecTweaks;
