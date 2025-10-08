import React from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import CustomNavBar from "../components/CustomTopBarComponent";
import { useGetMarketQuery } from "../store/api/marketApi";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MarketStackParamList } from "../screens/MarketStack";

type Props = NativeStackScreenProps<MarketStackParamList, "MarketStack">;

// Row shape used by the FlatList
type RowItem = {
  id: string;
  name: string;
  symbol: string;
  image: string;
  price: number;
  pct24h: number;
};

export default function MarketScreen({ navigation }) {
  const {
    data: market, // MarketCoin[] | undefined
    isLoading,
    isFetching,
    isError,
    error, // FetchBaseQueryError | SerializedError | undefined
    refetch,
  } = useGetMarketQuery(
    { category: "layer-1", perPage: 250, vs: "usd" },
    {
      refetchOnMountOrArgChange: false,
    }
  );

  // Map API -> RowItem[]
  const rows: RowItem[] = React.useMemo(
    () =>
      (market ?? []).map((c) => ({
        id: c.id,
        name: (c as any).name, // if your type includes name
        symbol: (c as any).symbol?.toUpperCase?.() ?? "",
        image: (c as any).image ?? "",
        price: (c as any).current_price ?? 0,
        pct24h: (c as any).price_change_percentage_24h_in_currency ?? 0,
      })),
    [market]
  );

  // RTK Query error formatter
  const formatErr = (e: unknown) => {
    if (!e) return "Unknown error";
    if (typeof e === "object" && e && "status" in e) {
      const fe = e as { status: number | string; data?: unknown };
      if (typeof fe.data === "string") return `${fe.status}: ${fe.data}`;
      if (fe.data && typeof fe.data === "object" && "message" in fe.data) {
        return String((fe.data as any).message);
      }
      return `HTTP ${fe.status}`;
    }
    if (typeof e === "object" && e && "message" in e) {
      return String((e as any).message ?? "Unknown error");
    }
    return "Unknown error";
  };

  if (isLoading && !market) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.err}>Fetch failed: {formatErr(error)}</Text>
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
        data={rows}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
              navigation.navigate("Coin", {
                id: item.id,
                name: item.name,
                symbol: item.symbol,
                image: item.image,
              })
            }
          >
            <Row {...item} />
          </TouchableOpacity>
        )}
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
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  err: { color: "#cc0000", marginBottom: 6 },
  retry: { color: "#3366ff", textDecorationLine: "underline" },
  fetching: { color: "#666", textAlign: "center", marginBottom: 8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eaeaea",
  },
  logo: { width: 32, height: 32, borderRadius: 16, marginRight: 12 },
  name: { fontSize: 16, fontWeight: "700" },
  sub: { fontSize: 12, marginTop: 2, color: "#555" },
  price: { fontSize: 16, fontWeight: "700" },
  pct: { marginTop: 2, fontSize: 12, fontWeight: "800" },
});
