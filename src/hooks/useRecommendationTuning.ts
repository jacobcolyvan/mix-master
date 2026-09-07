import { useState } from "react";
import { useHistory, useLocation } from "react-router-dom";

import { SeedAttributeDetails, SeedAttributes } from "../types";
import {
  emptyRecommendationAttributes,
  parseRecommendationSearch,
  RecommendationTuning,
  serialiseRecommendationSearch,
  validateRecommendationTuning,
} from "../utils/recommendationTuning";
import { changesOnlyViewOptions } from "../utils/viewOptions";

export const useRecommendationTuning = () => {
  const history = useHistory();
  const location = useLocation();
  const appliedView = parseRecommendationSearch(location.search);
  const [draftState, setDraftState] = useState({ location, draft: appliedView.applied });

  // Only presentation replacements preserve edits; PUSH and POP always discard them.
  let draft = draftState.draft;
  if (draftState.location !== location) {
    if (history.action !== "REPLACE" || !changesOnlyViewOptions(draftState.location, location)) {
      draft = appliedView.applied;
    }
    setDraftState({ location, draft });
  }

  // Compare cleaned-up values so formatting-only edits don't count as changes.
  const { tuning: validatedDraft, errors, valid } = validateRecommendationTuning(draft);
  const changed = JSON.stringify(validatedDraft) !== JSON.stringify(appliedView.applied);

  // Editing only changes the form; the URL and recommendation request stay untouched.
  const updateDraft = (nextDraft: RecommendationTuning) => {
    setDraftState({ location, draft: nextDraft });
  };

  const editAttribute = (name: keyof SeedAttributes, value: SeedAttributeDetails) => {
    const attributes = { ...draft.attributes, [name]: value };
    updateDraft({ ...draft, attributes });
  };

  const setMatchKey = (matchKey: boolean) => {
    updateDraft({ ...draft, matchKey });
  };

  const reset = () => {
    updateDraft({ ...draft, attributes: emptyRecommendationAttributes() });
  };

  // Apply adds a history entry so Back can restore the previous tuning.
  const apply = () => {
    if (!valid || !changed) return;
    history.push({
      ...location,
      search: serialiseRecommendationSearch(appliedView.id, validatedDraft, appliedView),
    });
  };

  return {
    ...appliedView,
    draft,
    errors,
    valid,
    changed,
    editAttribute,
    setMatchKey,
    reset,
    apply,
  };
};
