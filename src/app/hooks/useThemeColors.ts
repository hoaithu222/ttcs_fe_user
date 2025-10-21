import { useSelector } from "react-redux";
import { RootState } from "../store";
import { themeRootSelector } from "../store/slices/theme/selectors";
import colors from "@/foundation/styles/color/colors.json";

export const useThemeColors = () => {
  const { theme } = useSelector((state: RootState) => themeRootSelector(state));
  const themeColors = colors[theme as keyof typeof colors];

  return {
    theme,
    colors: themeColors,
  };
};
