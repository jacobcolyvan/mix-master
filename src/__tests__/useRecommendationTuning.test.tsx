// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import { createMemoryHistory } from "history";
import { PropsWithChildren } from "react";
import { Router } from "react-router-dom";
import { afterEach, expect, it } from "vitest";

import { useRecommendationTuning } from "../hooks/useRecommendationTuning";
import { useViewOptions } from "../hooks/useViewOptions";

afterEach(cleanup);

// Real memory history exposes push/replace/POP behaviour without page or query setup.
const renderTuning = (path = "/recommended/?id=seed") => {
  const history = createMemoryHistory({ initialEntries: [path] });
  const wrapper = ({ children }: PropsWithChildren) => (
    <Router history={history}>{children}</Router>
  );

  return {
    history,
    ...renderHook(() => ({ tuning: useRecommendationTuning(), view: useViewOptions() }), {
      wrapper,
    }),
  };
};

it("applies valid edits with both view options and rejects invalid ones", () => {
  const { history, result } = renderTuning("/recommended/?id=seed&sort=tempo&keyNotation=standard");

  act(() => result.current.tuning.editAttribute("tempo", { value: "bad", maxOrMinFilter: "min" }));
  act(() => result.current.tuning.apply());

  expect(result.current.tuning.valid).toBe(false);
  expect(result.current.tuning.applied.attributes.tempo.value).toBe("");
  expect(history.length).toBe(1);

  act(() => result.current.tuning.editAttribute("tempo", { value: "0126", maxOrMinFilter: "min" }));
  act(() => result.current.tuning.apply());

  expect(history.action).toBe("PUSH");
  expect(history.length).toBe(2);
  expect(Object.fromEntries(new URLSearchParams(history.location.search))).toEqual({
    id: "seed",
    tempo: "min:126",
    sort: "tempo",
    keyNotation: "standard",
  });
  expect(result.current.tuning.draft.attributes.tempo.value).toBe("126");
  expect(result.current.tuning.changed).toBe(false);
  act(() => result.current.tuning.apply());
  expect(history.length).toBe(2);
});

it("preserves invalid drafts across consecutive selector replacements, but resets on Back and Forward", () => {
  const { history, result } = renderTuning("/recommended/?id=seed&tempo=min:120");
  act(() =>
    result.current.tuning.editAttribute("tempo", { value: "unfinished", maxOrMinFilter: "max" })
  );

  act(() => result.current.view.setSort("energy"));
  act(() => result.current.view.setKeyNotation("standard"));

  expect(history.action).toBe("REPLACE");
  expect(history.length).toBe(1);
  expect(result.current.tuning.draft.attributes.tempo.value).toBe("unfinished");
  expect(result.current.tuning.valid).toBe(false);
  act(() =>
    result.current.tuning.editAttribute("tempo", { value: "130", maxOrMinFilter: "target" })
  );
  act(() => result.current.tuning.apply());
  act(() => result.current.tuning.editAttribute("tempo", { value: "140", maxOrMinFilter: "max" }));
  act(() => history.goBack());

  expect(result.current.tuning.draft.attributes.tempo).toEqual({
    value: "120",
    maxOrMinFilter: "min",
  });
  act(() => history.goForward());
  expect(result.current.tuning.draft.attributes.tempo).toEqual({
    value: "130",
    maxOrMinFilter: "target",
  });
  expect(result.current.view.keyNotation).toBe("standard");
});

it("discards drafts on options-only PUSH and POP even with identical applied tuning", () => {
  const { history, result } = renderTuning();
  act(() => result.current.tuning.editAttribute("tempo", { value: "130", maxOrMinFilter: "min" }));
  act(() => history.push("/recommended/?id=seed&sort=tempo&keyNotation=standard"));
  expect(result.current.tuning.draft.attributes.tempo.value).toBe("");

  act(() => result.current.tuning.editAttribute("tempo", { value: "140", maxOrMinFilter: "min" }));
  act(() => history.goBack());
  expect(result.current.tuning.draft.attributes.tempo.value).toBe("");
  expect(result.current.view.sort).toBe("default");
  act(() => result.current.tuning.editAttribute("tempo", { value: "150", maxOrMinFilter: "min" }));
  act(() => history.goForward());
  expect(result.current.tuning.draft.attributes.tempo.value).toBe("");
  expect(result.current.view.keyNotation).toBe("standard");
});

it.each([
  "/recommended/?id=next&sort=tempo&keyNotation=standard",
  "/recommended/?id=seed&tempo=min:120&sort=tempo",
  "/recommended/?id=seed&other=changed&sort=tempo",
  "/recommended/?id=seed&sort=tempo#changed",
  "/another/?id=seed&sort=tempo",
  "/recommended/?id=seed",
])("discards drafts on non-presentation REPLACE: %s", (destination) => {
  const { history, result } = renderTuning();
  act(() => result.current.tuning.editAttribute("energy", { value: "0.7", maxOrMinFilter: "min" }));

  act(() => history.replace(destination));

  expect(result.current.tuning.draft.attributes.energy.value).toBe("");
});

it("discards drafts when replacement changes location state as well as options", () => {
  const { history, result } = renderTuning();
  act(() => result.current.tuning.editAttribute("tempo", { value: "130", maxOrMinFilter: "min" }));

  act(() => history.replace("/recommended/?id=seed&sort=tempo", { changed: true }));

  expect(result.current.tuning.draft.attributes.tempo.value).toBe("");
});
