import { useHistory, useLocation } from "react-router-dom";

import { KeyOptionTypes, TrackSortByChoices } from "../types";
import { parseViewOptions, setViewOptions, ViewOptions } from "../utils/viewOptions";

export const useViewOptions = () => {
  const history = useHistory();
  const location = useLocation();
  const replaceOptions = (options: Partial<ViewOptions>) => {
    const current = history.location;
    history.replace({ ...current, search: setViewOptions(current.search, options) });
  };

  return {
    ...parseViewOptions(location.search),
    setSort: (sort: TrackSortByChoices) => replaceOptions({ sort }),
    setKeyNotation: (keyNotation: KeyOptionTypes) => replaceOptions({ keyNotation }),
  };
};
