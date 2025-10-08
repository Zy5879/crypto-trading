import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import CustomNavBar from "../components/CustomTopBarComponent";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import { clearUser } from "../store/slices/userSlice";
import { clearPortfolio } from "../store/slices/portfolioSlice";

export default function ProfileScreen() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.user); // { uid, email, name }

  const display = user?.displayName || user?.email || "User";
  const initials = (
    user?.displayName?.trim()?.[0] ??
    user?.email?.trim()?.[0] ??
    "?"
  ).toUpperCase();

  const onLogout = () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: async () => {
          // optional: clear locally for instant UI response
          dispatch(clearPortfolio());
          dispatch(clearUser());
          try {
            await signOut(auth); // onAuthStateChanged will also clear routes
          } catch (e: any) {
            Alert.alert("Logout failed", e?.message ?? "Please try again.");
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.wrap}>
      <CustomNavBar />

      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{display}</Text>
          {user?.email ? <Text style={styles.sub}>{user.email}</Text> : null}
          <Text style={styles.sub}>{user.uid}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 8,
    gap: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#e9e9ef",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 22, fontWeight: "800" },
  name: { fontSize: 20, fontWeight: "800" },
  sub: { marginTop: 2, color: "#666" },

  logoutBtn: {
    marginTop: 24,
    marginHorizontal: 16,
    backgroundColor: "#1f2937", // dark gray
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  logoutText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
