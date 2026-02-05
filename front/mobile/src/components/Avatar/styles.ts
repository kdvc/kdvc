import { StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

export const styles = StyleSheet.create({
  container: {
    width: 38,
    height: 38,
    borderRadius: 20,
    backgroundColor: colors.genericAvatar, 
    alignItems: "center",
    justifyContent: "center",
  },

  text: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: 14,
  },
});
