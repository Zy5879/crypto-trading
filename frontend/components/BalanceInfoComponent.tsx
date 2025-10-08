import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SendHorizontal, Shuffle, DollarSign } from "lucide-react-native";

type Props = {
  /** Portfolio total USD value right now */
  balanceUSD: number;
  /** 24h change in USD (positive = gain, negative = loss) */
  deltaUSD: number;
  /** 24h percent change (e.g. -3.42 means -3.42%) */
  deltaPct: number;
  /** Optional quick actions */
  onSend?: () => void;
  onSwap?: () => void;
  onBuy?: () => void;
};

const fmtUSD = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(n);

export default function BalanceInfoComponent({
  balanceUSD,
  deltaUSD,
  deltaPct,
  onSend,
  onSwap,
  onBuy,
}: Props) {
  const isDown = deltaUSD < 0 || deltaPct < 0;
  const changeColor = isDown ? "#ef4444" : "#22c55e";
  const pillBg = isDown ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.15)";

  return (
    <View style={styles.wrap}>
      {/* Big balance */}
      <Text style={styles.balance}>{fmtUSD(balanceUSD)}</Text>

      {/* Pills: Δ $ and Δ % */}
      <View style={styles.pillsRow}>
        <Text style={[styles.deltaText, { color: changeColor }]}>
          {deltaUSD >= 0 ? "+" : "-"}
          {fmtUSD(Math.abs(deltaUSD))}
        </Text>

        <View style={[styles.pill, { backgroundColor: pillBg }]}>
          <Text style={[styles.pillText, { color: changeColor }]}>
            {deltaPct >= 0 ? "+" : "-"}
            {Math.abs(deltaPct).toFixed(2)}%
          </Text>
        </View>
      </View>

      {/* Quick actions */}
      <View style={styles.actionsRow}>
        <ActionCard label="Send" onPress={onSend}>
          <SendHorizontal size={22} color="#b79dfc" />
        </ActionCard>
        <ActionCard label="Swap" onPress={onSwap}>
          <Shuffle size={22} color="#b79dfc" />
        </ActionCard>
        <ActionCard label="Buy" onPress={onBuy}>
          <DollarSign size={22} color="#b79dfc" />
        </ActionCard>
      </View>
    </View>
  );
}

function ActionCard({
  children,
  label,
  onPress,
}: {
  children: React.ReactNode;
  label: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={onPress}>
      {children}
      <Text style={styles.cardLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: {
    padding: 45,
    // If you switch to dark, uncomment:
    // backgroundColor: "#0f0f10",
  },
  balance: {
    textAlign: "center",
    // color: "#fff", // enable for dark theme
    fontSize: 40,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  pillsRow: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  deltaText: {
    fontSize: 18,
    fontWeight: "700",
  },
  pill: {
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  pillText: {
    fontSize: 16,
    fontWeight: "800",
  },
  actionsRow: {
    marginTop: 18,
    flexDirection: "row",
    gap: 12,
  },
  card: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    // backgroundColor: "#1b1b1e", // enable for dark theme
    borderRadius: 18,
  },
  cardLabel: {
    color: "black", // "#c9c9ce" for dark theme
    fontSize: 14,
    fontWeight: "600",
  },
});
