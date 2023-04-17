import { Tabs, Tab } from '@material-ui/core';
import RecTweaksInput from '../atoms/RecTweaksInput';
import RecTweaksGenre from '../atoms/RecTweaksGenre';
import { AttributeChoiceDetails, SeedAttributes } from '../types';

interface RecTweaksTabsProps {
  currentTab: number;
  handleTabChange: (
    event: React.ChangeEvent<{}>,
    newValue: React.SetStateAction<number>
  ) => void;
  attributeChoices: AttributeChoiceDetails[];
  attributes: SeedAttributes;
}

const RecTweaksTabs: React.FC<RecTweaksTabsProps> = ({
  currentTab,
  handleTabChange,
  attributeChoices,
  attributes,
}) => {
  return (
    <>
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
            key={inputItem.input_name}
            className="rec-tweaks__tab"
          />
        ))}
        <Tab label="Genre" key="genre" className="rec-tweaks__tab" />
      </Tabs>

      {attributeChoices.map((inputItem, index) => (
        <div
          role="tabpanel"
          hidden={currentTab !== index}
          id={`full-width-tabpanel-${index}`}
          key={index}
          className="rec-tweaks__tab-input"
        >
          <RecTweaksInput
            inputItem={inputItem}
            paramValue={attributes[inputItem.input_name]}
          />
        </div>
      ))}

      <div
        role="tabpanel"
        hidden={currentTab !== attributeChoices.length}
        id={`full-width-tabpanel-${attributeChoices.length}`}
        key={attributeChoices.length}
        className="rec-tweaks__tab-input"
      >
        <RecTweaksGenre genre={attributes['genre']} />
      </div>
    </>
  );
};

export default RecTweaksTabs;
