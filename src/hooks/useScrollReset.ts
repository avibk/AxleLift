import { useEffect, RefObject } from "react";

export function useScrollReset<T extends HTMLElement>(
  ref: RefObject<T | null>,
  deps: React.DependencyList
) {
  useEffect(() => {
    ref.current?.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, deps);
}
