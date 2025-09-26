import React, { useState } from "react";
import { View, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Menu, Search, Bell } from "lucide-react-native";

export default function CustomNavBar() {
  const [searchText, setSearchText] = useState("");

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.nav}>
        <TouchableOpacity style={styles.iconButton} hitSlop={8}>
          <Menu size={22} />
        </TouchableOpacity>

        <View style={styles.search}>
          <Search size={16} style={styles.searchIcon} />
          <TextInput
            placeholder="Search"
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#888"
            style={styles.input}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>

        <TouchableOpacity style={styles.iconButton} hitSlop={8}>
          <Bell size={22} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    width: "100%",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: "#fff",
  },
  nav: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconButton: {
    height: 36,
    width: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
  },
  search: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eee",
    borderRadius: 18,
    height: 36,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
});
