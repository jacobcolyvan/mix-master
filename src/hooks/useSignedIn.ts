import { useSyncExternalStore } from "react";

import { isSignedIn, subscribe } from "../auth";

export const useSignedIn = (): boolean => useSyncExternalStore(subscribe, isSignedIn);
