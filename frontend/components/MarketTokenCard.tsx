import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";

type MarketTokenCardProps = {
  logoUri?: string;
  name: string; // "Solana"
  symbol: string; // "SOL"
  priceUsd: number; // 220.15
  pctChange24h: number; // -3.47  (red/green)
};

const usd = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(n);

export default function MarketTokenCard({
  logoUri,
  name,
  symbol,
  priceUsd,
  pctChange24h,
}: MarketTokenCardProps) {
  const down = pctChange24h < 0;
  const pctColor = down ? "#ef4444" : "#22c55e";
  const pillBg = down ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.15)";

  return (
    <View style={styles.card}>
      <Image
        source={
          logoUri ? { uri: logoUri } : require("./assets/placeholder-coin.png")
        }
        style={styles.logo}
      />

      <View style={styles.left}>
        <Text style={styles.name}>
          {name} <Text style={styles.symbol}>{symbol.toUpperCase()}</Text>
        </Text>
      </View>

      <View style={styles.right}>
        <Text style={styles.value}>{usd(priceUsd)}</Text>
        <View style={[styles.pill, { backgroundColor: pillBg }]}>
          <Text style={[styles.pillText, { color: pctColor }]}>
            {down ? "" : "+"}
            {pctChange24h.toFixed(2)}%
          </Text>
        </View>
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
    backgroundColor: "#222325",
  },
  logo: { width: 36, height: 36, borderRadius: 18, marginRight: 12 },
  left: { flex: 1 },
  name: { color: "#fff", fontSize: 16, fontWeight: "700" },
  symbol: { color: "#a8a8ad", fontSize: 13, fontWeight: "600" },
  right: { alignItems: "flex-end" },
  value: { color: "#fff", fontSize: 16, fontWeight: "700" },
  pill: {
    marginTop: 4,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  pillText: { fontSize: 12, fontWeight: "800" },
});
