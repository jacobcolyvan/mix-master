// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import { createMemoryHistory } from "history";
import { PropsWithChildren } from "react";
import { Router } from "react-router-dom";
import { afterEach, expect, it } from "vitest";

import { useRecommendationTuning } from "../hooks/useRecommendationTuning";
import { setRecommendationSort } from "../utils/recommendationTuning";

afterEach(cleanup);

// A real memory history exposes push/replace/POP behaviour without page or query setup.
const renderTuning = (path = "/recommended/?id=seed") => {
  const history = createMemoryHistory({ initialEntries: [path] });
  const wrapper = ({ children }: PropsWithChildren) => (
    <Router history={history}>{children}</Router>
  );
  return { history, ...renderHook(useRecommendationTuning, { wrapper }) };
};

it("applies valid edits to the URL and rejects invalid ones", () => {
  const { history, result } = renderTuning();

  act(() => result.current.editAttribute("tempo", { value: "bad", maxOrMinFilter: "min" }));
  act(() => result.current.apply());

  expect(result.current.valid).toBe(false);
  expect(result.current.applied.attributes.tempo.value).toBe("");
  expect(history.length).toBe(1);
  expect(history.location.search).toBe("?id=seed");

  act(() => result.current.editAttribute("tempo", { value: "0126", maxOrMinFilter: "min" }));
  expect(result.current.changed).toBe(true);
  act(() => result.current.apply());

  expect(history.action).toBe("PUSH");
  expect(history.length).toBe(2);
  expect(result.current.applied.attributes.tempo.value).toBe("126");
  expect(result.current.draft.attributes.tempo.value).toBe("126");
  expect(result.current.changed).toBe(false);
  act(() => result.current.apply());
  expect(history.length).toBe(2);
});

it("discards edits when sorting or moving Back and Forward", () => {
  const { history, result } = renderTuning("/recommended/?id=seed&tempo=min:120");
  act(() => result.current.editAttribute("tempo", { value: "unfinished", maxOrMinFilter: "max" }));

  act(() =>
    history.replace({
      ...history.location,
      search: setRecommendationSort(history.location.search, "energy"),
    })
  );

  expect(history.action).toBe("REPLACE");
  expect(history.length).toBe(1);
  expect(result.current.draft.attributes.tempo.value).toBe("120");
  act(() => result.current.editAttribute("tempo", { value: "130", maxOrMinFilter: "target" }));
  act(() => result.current.apply());
  act(() => result.current.editAttribute("tempo", { value: "140", maxOrMinFilter: "max" }));
  act(() => history.goBack());

  expect(result.current.draft.attributes.tempo).toEqual({ value: "120", maxOrMinFilter: "min" });
  act(() => history.goForward());
  expect(result.current.draft.attributes.tempo).toEqual({ value: "130", maxOrMinFilter: "target" });
  expect(result.current.sort).toBe("energy");

  act(() => result.current.editAttribute("tempo", { value: "150", maxOrMinFilter: "max" }));
  act(() => history.replace("/recommended/?id=seed&tempo=target:130&sort=tempo"));
  expect(result.current.draft.attributes.tempo.value).toBe("130");
});
