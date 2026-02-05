import { StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

export const styles = StyleSheet.create({
  container: {
    width: 340,
    height: 80,
    borderRadius: 12,
    backgroundColor: colors.background,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 12,
    borderColor: colors.border,
    borderWidth: 1
  },

  textContainer: {
    flex: 1,
  },

  title: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.textPrimary,
  },

  subtitle: {
    fontSize: 14,
    color: colors.textPrimary,
    marginTop: 2,
    fontWeight: "400"
  },
});
