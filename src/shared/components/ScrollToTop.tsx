import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Scrolls viewport to top whenever the pathname changes.
 * Keeps behavior consistent across navigations coming from router actions.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;

