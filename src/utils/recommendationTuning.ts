import { SeedAttributeDetails, SeedAttributes } from "../types";
import { attributeChoices } from "./commonVariables";
import genres from "./genres.json";
import { parseViewOptions, setViewOptions, ViewOptions } from "./viewOptions";

export type RecommendationTuning = {
  attributes: SeedAttributes;
  matchKey: boolean;
};

// Empty inputs leave recommendations unrestricted; return fresh values for each draft.
export const emptyRecommendationAttributes = (): SeedAttributes => {
  const attributeNames = [...attributeChoices.map(({ input_name }) => input_name), "genre"];
  const emptyCriteria = attributeNames.map((name) => [
    name,
    { value: "", maxOrMinFilter: "target" },
  ]);
  return Object.fromEntries(emptyCriteria) as SeedAttributes;
};

const isValidNumberInput = (
  value: string,
  filter: SeedAttributeDetails["maxOrMinFilter"],
  validateRange: (value: number) => boolean
) => {
  // Accept decimal input only: Number alone also accepts hex and exponent notation.
  const isDecimal = /^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(value);
  const hasValidRange = validateRange(Number(value));
  const hasValidFilter = ["min", "max", "target"].includes(filter);
  return isDecimal && hasValidRange && hasValidFilter;
};

// Report invalid inputs so the form can block Apply, and return cleaned-up valid values.
// When reading a URL, we keep those valid values and ignore the errors.
export const validateRecommendationTuning = (draft: RecommendationTuning) => {
  const attributes = emptyRecommendationAttributes();
  const errors: Partial<Record<keyof SeedAttributes, string>> = {};

  for (const choice of attributeChoices) {
    const name = choice.input_name;
    const criterion = draft.attributes[name];
    const value = criterion?.value.trim() ?? "";
    if (!value) continue;

    if (!isValidNumberInput(value, criterion.maxOrMinFilter, choice.validateField)) {
      errors[name] = "Invalid range value";
      continue;
    }
    // Treat different spellings of the same number, such as "01" and "1", as equal.
    attributes[name] = { value: String(Number(value)), maxOrMinFilter: criterion.maxOrMinFilter };
  }

  const genre = draft.attributes.genre?.value.trim().toLowerCase() ?? "";
  if (genre && !genres.genres.includes(genre)) {
    errors.genre = "Choose a supported genre";
  } else {
    attributes.genre.value = genre;
  }
  return {
    tuning: { attributes, matchKey: draft.matchKey },
    errors,
    valid: Object.keys(errors).length === 0,
  };
};

// Restore tuning from the URL, ignoring invalid values and using defaults where needed.
// Reading a link never changes the URL or adds a browser history entry.
export const parseRecommendationSearch = (search: string) => {
  const params = new URLSearchParams(search);
  const attributes = emptyRecommendationAttributes();

  for (const { input_name: name } of attributeChoices) {
    const encodedCriterion = params.get(name);
    if (encodedCriterion === null) continue;
    const [filter, ...valueParts] = encodedCriterion.split(":");
    attributes[name] = {
      value: valueParts.join(":"),
      maxOrMinFilter: filter as SeedAttributeDetails["maxOrMinFilter"],
    };
  }
  attributes.genre.value = params.get("genre") ?? "";

  const { tuning: applied } = validateRecommendationTuning({
    attributes,
    matchKey: params.get("matchKey") === "true",
  });
  return { id: params.get("id"), applied, ...parseViewOptions(search) };
};

// Build a shareable URL with valid tuning values, leaving out empty inputs and default options.
export const serialiseRecommendationSearch = (
  id: string | null,
  tuning: RecommendationTuning,
  options: ViewOptions = { sort: "default", keyNotation: "camelot" }
) => {
  const { tuning: normalised } = validateRecommendationTuning(tuning);
  const params = new URLSearchParams();
  if (id !== null) params.set("id", id);
  if (normalised.matchKey) params.set("matchKey", "true");

  for (const { input_name: name } of attributeChoices) {
    const criterion = normalised.attributes[name];
    if (criterion.value === "") continue;
    params.set(name, `${criterion.maxOrMinFilter}:${criterion.value}`);
  }

  if (normalised.attributes.genre.value) params.set("genre", normalised.attributes.genre.value);
  return setViewOptions(params.toString(), options);
};
