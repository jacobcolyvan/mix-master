import { Tab, Tabs } from "@mui/material";

import RecTweaksGenre from "../atoms/RecTweaksGenre";
import RecTweaksInput from "../atoms/RecTweaksInput";
import { AttributeChoiceDetails, SeedAttributeDetails, SeedAttributes } from "../types";

interface RecTweaksTabsProps {
  currentTab: number;
  handleTabChange: (
    event: React.ChangeEvent<object>,
    newValue: React.SetStateAction<number>
  ) => void;
  attributeChoices: AttributeChoiceDetails[];
  attributes: SeedAttributes;
  errors: Partial<Record<keyof SeedAttributes, string>>;
  onChange: (name: keyof SeedAttributes, value: SeedAttributeDetails) => void;
}

const RecTweaksTabs: React.FC<RecTweaksTabsProps> = ({
  currentTab,
  handleTabChange,
  attributeChoices,
  attributes,
  errors,
  onChange,
}) => {
  return (
    <>
      <Tabs
        value={currentTab}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons={true}
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
            error={errors[inputItem.input_name]}
            onChange={(value) => onChange(inputItem.input_name, value)}
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
        <RecTweaksGenre
          value={attributes.genre.value}
          error={errors.genre}
          onChange={(value) => onChange("genre", { value, maxOrMinFilter: "target" })}
        />
      </div>
    </>
  );
};

export default RecTweaksTabs;
