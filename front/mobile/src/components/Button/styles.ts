import { StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

export const styles = StyleSheet.create({
  container: {
    width: 340,
    height: 69,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  text: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "500",
  },
});
