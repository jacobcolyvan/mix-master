import React, { useState } from 'react';
import styled from 'styled-components';

import RecTweaksInput from './RecTweaksInput';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Button from '@material-ui/core/Button';

const RecTweaksDiv = styled.div`
    margin: 2rem 0;
    border: 1px solid #424242;

    .rec-tweaks__tabs {
        border-top: 1px solid #424242;
        border-bottom: 1px solid #424242;
    }

    .rec-tweaks__tab {
        font-size: 0.85rem;
        text-transform: capitalize;
    }

    .rec-tweaks__tab-input {
        margin: 1rem;
    }

    .rec-tweaks__button {
        font-size: 0.85rem;
        margin: 0.6rem 1rem 2rem 1rem;
    }

    h4 {
        margin-left: 4px;
        font-style: italic;
    }
`

const inputChoices = [
    {input_name: "tempo", extra_text: false, range_limit: 240, takes_whole_numbers: true},
    {input_name: "energy", extra_text: false, range_limit: 1, takes_whole_numbers: false},
    {input_name: "duration", extra_text: " seconds", range_limit: 3600, takes_whole_numbers: true},
    {input_name: "popularity", extra_text: false, range_limit: 100, takes_whole_numbers: true},
    {input_name: "intrumentalness", extra_text: false, range_limit: 1, takes_whole_numbers: false},
    {input_name: "valence", extra_text: false, range_limit: 1, takes_whole_numbers: false},
    {input_name: "danceability", extra_text: false, range_limit: 1, takes_whole_numbers: false},
    {input_name: "liveness", range_limit: 1, takes_whole_numbers: false},
    {input_name: "speechiness", range_limit: 1, takes_whole_numbers: false},
    {input_name: "acousticness", range_limit: 1, takes_whole_numbers: false},
    // // Loudness is an available param but has a weird input raneg (db's)
    // {input_name: "loudness", range_limit: 1, takes_whole_numbers: false},
]


const CustomTrackSeeds = ({ activeParams, setActiveParams, getTracks, recommendedTrack }) => {
    const [currentTab, setCurrentTab] = useState(0);

    const saveActiveParam = (paramName, value, limit, maxOrMin) => {
        let tempList = activeParams;

        if (!value) {
          delete tempList[paramName];
          setActiveParams(tempList);
        } else if (value >= 0 && value <= limit) {
            // convert seconds to ms
            if (paramName==="duration") value = value * 1000;
            tempList[paramName] = [ value, maxOrMin ];

          setActiveParams(tempList);
        }
    };

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
      };

    return (
        <RecTweaksDiv>
            <h4>Tweak the recommendations below:</h4>
            <Tabs
                value={currentTab}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="on"
                className="rec-tweaks__tabs"
            >
                {inputChoices.map((inputArray, index) => (
                    <Tab label={inputArray.input_name} key={`tab-panel-${index}`}  className="rec-tweaks__tab"/>
                ))}
            </Tabs>

            {inputChoices.map((inputArray, index) => (
                <div
                    role="tabpanel"
                    hidden={currentTab !== index}
                    id={`full-width-tabpanel-${index}`}
                    key={`tab-input-${index}`}
                    className="rec-tweaks__tab-input"
                >
                    <RecTweaksInput
                        saveParam={saveActiveParam}
                        title={inputArray.input_name}
                        limit={inputArray.range_limit}
                        wholeNumber={inputArray.takes_whole_numbers}
                        extra_text={inputArray.extra_text}
                    />
                </div>
            ))}

            <Button
              variant='outlined'
              color='primary'
              onClick={() => getTracks(recommendedTrack)}
              className="button rec-tweaks__button"
            >
                Refresh Recommendations
            </Button>
        </RecTweaksDiv>
    )
}

export default CustomTrackSeeds
