import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";

type HoldingTokenCardProps = {
  image: string;
  name: string; // "Solana"
  symbol: string; // "SOL"
  amount: number; // 2.41274
  valueUsd: number; // 533.01
  deltaUsd24h: number; // -38.61  (show red/green)
};

const usd = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(n);

export default function HoldingTokenCard({
  image,
  name,
  symbol,
  amount,
  valueUsd,
  deltaUsd24h,
}: HoldingTokenCardProps) {
  const down = deltaUsd24h < 0;
  const deltaColor = down ? "#ef4444" : "#22c55e";

  return (
    <View style={styles.card}>
      <Image source={{ uri: image }} style={styles.logo} />

      <View style={styles.left}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.sub}>
          {amount.toFixed(5)} {symbol.toUpperCase()}
        </Text>
      </View>

      <View style={styles.right}>
        <Text style={styles.value}>{usd(valueUsd)}</Text>
        <Text style={[styles.deltaUsd, { color: deltaColor }]}>
          {down ? "-" : "+"}
          {usd(Math.abs(deltaUsd24h))}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 18,
    // backgroundColor: "#222325",
  },
  logo: { width: 36, height: 36, borderRadius: 18, marginRight: 12 },
  left: { flex: 1 },
  name: { fontSize: 16, fontWeight: "700" },
  sub: { fontSize: 13, marginTop: 2 },
  right: { alignItems: "flex-end" },
  value: { fontSize: 16, fontWeight: "700" },
  deltaUsd: { marginTop: 2, fontSize: 13, fontWeight: "700" },
});
