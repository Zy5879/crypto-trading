import { View, Text, StyleSheet } from "react-native";

type Row = { label: string; value: string };

export default function CoinInfoTable({ rows }: { rows: Row[] }) {
  return (
    <View style={s.box}>
      <Text style={s.header}>Info</Text>
      {rows.map((r, i) => (
        <View
          key={r.label}
          style={[s.row, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth }]}
        >
          <Text style={s.label}>{r.label}</Text>
          <Text style={s.value} numberOfLines={1}>
            {r.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  box: {
    marginTop: 16,
    borderRadius: 14,
    backgroundColor: "#f5f6f8",
    overflow: "hidden",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
    color: "#6b7280",
    fontWeight: "700",
  },
  row: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
    fontWeight: "bold",
  },
  label: { color: "#374151" },
  value: { color: "#111827", fontWeight: "600" },
});
