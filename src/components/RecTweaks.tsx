import React, { useState, useContext } from 'react';
import UserContext from '../context/UserContext';

import RecTweaksInput from './RecTweaksInput';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Button from '@material-ui/core/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';

const inputChoices = [
  {
    input_name: 'tempo',
    extra_text: false,
    range_limit: 240,
    takes_whole_numbers: true,
  },
  {
    input_name: 'energy',
    extra_text: false,
    range_limit: 1,
    takes_whole_numbers: false,
  },
  {
    input_name: 'duration',
    extra_text: ' seconds',
    range_limit: 3600,
    takes_whole_numbers: true,
  },
  {
    input_name: 'popularity',
    extra_text: false,
    range_limit: 100,
    takes_whole_numbers: true,
  },
  {
    input_name: 'intrumentalness',
    extra_text: false,
    range_limit: 1,
    takes_whole_numbers: false,
  },
  {
    input_name: 'valence',
    extra_text: false,
    range_limit: 1,
    takes_whole_numbers: false,
  },
  {
    input_name: 'danceability',
    extra_text: false,
    range_limit: 1,
    takes_whole_numbers: false,
  },
  {
    input_name: 'liveness',
    extra_text: false,
    range_limit: 1,
    takes_whole_numbers: false,
  },
  {
    input_name: 'speechiness',
    extra_text: false,
    range_limit: 1,
    takes_whole_numbers: false,
  },
  {
    input_name: 'acousticness',
    extra_text: false,
    range_limit: 1,
    takes_whole_numbers: false,
  },
  // // Loudness is an available param but has a weird input raneg (db's)
  // {input_name: "loudness", range_limit: 1, takes_whole_numbers: false},
];

interface RecTweakProps {
  getTracks: (recommendedTrack: { [key: string]: any }) => void;
  recommendedTrack: { [key: string]: any };
}

const RecTweaks = ({ getTracks, recommendedTrack }: RecTweakProps) => {
  const {
    setSeedParams,
    seedParams,
    matchRecsToSeedTrackKey,
    setMatchRecsToSeedTrackKey,
  } = useContext(UserContext);
  const [currentTab, setCurrentTab] = useState(0);

  const saveSeedParam = (
    paramName: string,
    value: any,
    limit: number,
    maxOrMin: string
  ) => {
    if (!value) {
      setSeedParams({ ...seedParams, [paramName]: false });
    } else if (value >= 0 && value <= limit) {
      // convert seconds to ms
      if (paramName === 'duration') value = value * 1000;
      setSeedParams({
        ...seedParams,
        [paramName]: { value: value, maxOrMin: maxOrMin },
      });
    }
  };

  // const parseParamDurationValue = (param_name, param_value) => {
  //     if (param_name === "duration"  && param_value) {
  //         return param_value
  //     } else {
  //         return param_value
  //     }

  // }

  const handleMatchKeyChange = () => {
    setMatchRecsToSeedTrackKey(!matchRecsToSeedTrackKey);
  };

  const handleTabChange = (_: any, newValue: React.SetStateAction<number>) => {
    setCurrentTab(newValue);
  };

  return (
    <div className="rec-tweaks__div">
      <h4>Tweak the recommendations below:</h4>
      <FormControlLabel
        control={
          <Switch
            checked={matchRecsToSeedTrackKey}
            onChange={handleMatchKeyChange}
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
        {inputChoices.map((inputItem) => (
          <Tab
            label={inputItem.input_name}
            key={`tab-panel-${inputItem.input_name}`}
            className="rec-tweaks__tab"
          />
        ))}
      </Tabs>

      {inputChoices.map((inputItem, index) => (
        <div
          role="tabpanel"
          hidden={currentTab !== index}
          id={`full-width-tabpanel-${index}`}
          key={`tab-input-${index}`}
          className="rec-tweaks__tab-input"
        >
          <RecTweaksInput
            // TODO: pass whole inputItem instead of breaking it up
            title={inputItem.input_name}
            extra_text={inputItem.extra_text}
            limit={inputItem.range_limit}
            wholeNumber={inputItem.takes_whole_numbers}
            paramValue={seedParams[`${inputItem.input_name}`]}
            saveParam={saveSeedParam}
            getTracks={getTracks}
            recommendedTrack={recommendedTrack}
          />
        </div>
      ))}

      <Button
        variant="outlined"
        color="primary"
        onClick={() => getTracks(recommendedTrack)}
        className="button rec-tweaks__button"
      >
        Refresh Recommendations
      </Button>

      <div className="currently-selected-params-div">
        <label>Currently selected inputs are:</label>
        <ul>
          {Object.keys(seedParams).map(
            (param) =>
              seedParams[param] && (
                <li key={`currently-selected-param-li__${param}`}>
                  – {seedParams[param].maxOrMin} {param}{' '}
                  {seedParams[param].value}
                </li>
              )
          )}
        </ul>
      </div>
    </div>
  );
};

export default RecTweaks;