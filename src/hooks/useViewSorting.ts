import { useState } from "react";
import { useLocation } from "react-router-dom";

import { TrackSortByChoices } from "../types";

export const useViewSorting = () => {
  const location = useLocation();
  const [sorting, setSorting] = useState<{ location: typeof location; value: TrackSortByChoices }>({
    location,
    value: "default",
  });

  // Local sorting belongs only to this visit, not to a resource or history entry.
  let sort = sorting.value;
  if (sorting.location !== location) {
    sort = "default";
    setSorting({ location, value: sort });
  }

  const setSort = (value: TrackSortByChoices) => setSorting({ location, value });
  return { sort, setSort };
};
