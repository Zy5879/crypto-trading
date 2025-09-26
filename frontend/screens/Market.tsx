import React from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { fetchMarket } from "../services/coingecko";
import CustomNavBar from "../components/CustomTopBarComponent";
import { MarketCoin } from "../models/MarketCoinModel";

// types for the row the FlatList renders
type RowItem = {
  id: string;
  name: string;
  symbol: string;
  image: string;
  price: number;
  pct24h: number;
};

export default function MarketScreen() {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery<
    MarketCoin[],
    Error,
    RowItem[]
  >({
    queryKey: ["market", "layer-1"],
    queryFn: fetchMarket, // must resolve to MarketCoin[]
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000 * 2,
    select: (coins) =>
      coins.map((c) => ({
        id: c.id,
        name: c.name,
        symbol: c.symbol.toUpperCase(),
        image: c.image,
        price: c.current_price,
        pct24h: c.price_change_percentage_24h_in_currency ?? 0, // <-- match Row prop
      })),
  });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.err}>Fetch failed: {error?.message}</Text>
        <Text style={styles.retry} onPress={() => refetch()}>
          Tap to retry
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <CustomNavBar />
      {isFetching && <Text style={styles.fetching}>Updating…</Text>}
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <Row {...item} />}
        contentContainerStyle={{ padding: 10 }}
      />
    </View>
  );
}

function Row({ image, name, symbol, price, pct24h }: RowItem) {
  const down = pct24h < 0;
  return (
    <View style={styles.row}>
      <Image source={{ uri: image }} style={styles.logo} />
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.sub}>{symbol}</Text>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Text style={styles.price}>
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(price)}
        </Text>
        <Text style={[styles.pct, { color: down ? "#ef4444" : "#22c55e" }]}>
          {down ? "" : "+"}
          {pct24h.toFixed(2)}%
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  err: { color: "#fff", marginBottom: 6 },
  retry: { color: "#8ab4ff", textDecorationLine: "underline" },
  fetching: { color: "#aaa", textAlign: "center", marginBottom: 8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#1b1b1b",
  },
  logo: { width: 32, height: 32, borderRadius: 16, marginRight: 12 },
  name: { fontSize: 16, fontWeight: "700" },
  sub: { fontSize: 12, marginTop: 2 },
  price: { fontSize: 16, fontWeight: "700" },
  pct: { marginTop: 2, fontSize: 12, fontWeight: "800" },
});
