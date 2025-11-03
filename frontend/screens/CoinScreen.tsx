import { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MarketStackParamList } from "../screens/MarketStack";
import {
  useGetMarketByIdsQuery,
  useGetMarketChartQuery,
  useGetCoinDetailsQuery,
} from "../store/api/marketApi";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import BuySheet from "../components/BuySheet";
import Chart from "../components/Chart";
import { Star } from "lucide-react-native";
import { auth, db } from "../services/firebase";
import {
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import CoinInfoTable from "../components/CoinInfoTable";

type Props = NativeStackScreenProps<MarketStackParamList, "Coin">;

const usd = (n?: number) =>
  n == null
    ? "—"
    : n.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        notation: "compact",
      });

const numShort = (n?: number | null) =>
  n == null
    ? "—"
    : Intl.NumberFormat("en-US", {
        notation: "compact",
        maximumFractionDigits: 2,
      }).format(n);

export default function CoinScreen({ route }: Props) {
  const { id, name, symbol, image } = route.params;
  const { data, isLoading } = useGetMarketByIdsQuery({ ids: [id], vs: "usd" });
  const { data: details, isLoading: loadingDetails } = useGetCoinDetailsQuery({
    id,
  });
  const coin = data?.[0];
  const sign24h = coin?.price_change_percentage_24h_in_currency ?? 0;

  const [isFavorite, setIsFavorite] = useState(false);

  const { data: series, isFetching: chartLoading } = useGetMarketChartQuery({
    id,
    days: 7,
    vs: "usd",
  });

  useEffect(() => {
    const u = auth.currentUser;
    if (!u) return;
    const favRef = doc(db, `users/${u.uid}/favorites/${id}`);
    const unsub = onSnapshot(favRef, (snap) => setIsFavorite(snap.exists()));
    return unsub;
  }, [id]);

  // Toggle favorite
  const toggleFav = async () => {
    const u = auth.currentUser;
    if (!u) return;
    const favRef = doc(db, `users/${u.uid}/favorites/${id}`);
    if (isFavorite) {
      await deleteDoc(favRef);
    } else {
      await setDoc(favRef, {
        id,
        name,
        symbol,
        image: image ?? "",
        createdAt: serverTimestamp(),
      });
    }
  };

  const sheetRef = useRef<BottomSheetModal>(null);
  const openBuy = () =>
    requestAnimationFrame(() => sheetRef.current?.present());

  if (isLoading && !coin) {
    return (
      <View style={s.center}>
        <ActivityIndicator />
      </View>
    );
  }

  const rows = [
    { label: "Name", value: details?.name ?? name },
    { label: "Symbol", value: (details?.symbol ?? symbol ?? "").toUpperCase() },
    {
      label: "Network",
      value: details?.asset_platform_id
        ? details.asset_platform_id
        : details?.name ?? name,
    },
    { label: "Market Cap", value: usd(details?.market_data?.market_cap?.usd) },
    {
      label: "Total Supply",
      value: numShort(details?.market_data?.total_supply),
    },
    {
      label: "Circulating Supply",
      value: numShort(details?.market_data?.circulating_supply),
    },
  ];

  return (
    <View style={s.wrap}>
      <View style={s.header}>
        <View style={s.headerLeft}>
          {image ? <Image source={{ uri: image }} style={s.logo} /> : null}
          <View style={s.headerLeft}>
            <Text style={s.title}>{coin?.name ?? name}</Text>
            <Text style={s.sub}>
              {(coin?.symbol ?? symbol ?? "").toUpperCase()}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={toggleFav}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel={
            isFavorite ? "Remove from favorites" : "Add to favorites"
          }
        >
          <Star
            size={22}
            stroke={isFavorite ? "#f59e0b" : "#9ca3af"}
            fill={isFavorite ? "#f59e0b" : "transparent"}
          />
        </TouchableOpacity>
      </View>

      <Text style={s.price}>
        {coin?.current_price?.toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
        })}
      </Text>
      <Text
        style={[
          s.pct,
          {
            color:
              (coin?.price_change_percentage_24h_in_currency ?? 0) >= 0
                ? "#22c55e"
                : "#ef4444",
          },
        ]}
      >
        {(coin?.price_change_percentage_24h_in_currency ?? 0).toFixed(2)}%
      </Text>

      <View style={{ marginTop: 12 }}>
        {chartLoading && !series ? (
          <ActivityIndicator />
        ) : (
          <Chart
            values={series ?? []}
            height={160}
            colorSignOverride={sign24h}
          />
        )}
      </View>

      <TouchableOpacity style={s.oneWeekBtn}>
        <Text style={s.oneWeekText}>1W</Text>
      </TouchableOpacity>

      {/* Buy button */}
      <TouchableOpacity style={s.buyBtn} onPress={openBuy}>
        <Text style={s.buyText}>Buy</Text>
      </TouchableOpacity>

      {/* Info section */}
      {loadingDetails ? (
        <View style={{ paddingVertical: 10 }}>
          <ActivityIndicator />
        </View>
      ) : (
        <CoinInfoTable rows={rows} />
      )}

      {/* Bottom sheet (search or preset) */}
      <BuySheet ref={sheetRef} preset={{ id, name, symbol, image }} />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, padding: 16, backgroundColor: "#fff" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flexShrink: 1,
  },
  logo: { width: 40, height: 40, borderRadius: 20 },
  title: { fontSize: 20, fontWeight: "800" },
  sub: { color: "#666", textTransform: "uppercase", marginTop: 2 },
  price: { fontSize: 28, fontWeight: "800", marginTop: 12 },
  pct: { marginTop: 6, fontWeight: "800" },
  buyBtn: {
    marginTop: 16,
    backgroundColor: "#6d5cff",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  oneWeekBtn: {
    alignSelf: "center", // don't stretch, center horizontally
    width: 44, // square
    height: 32,
    borderRadius: 8,
    backgroundColor: "#6d5cff",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  oneWeekText: {
    color: "#fff",
    fontWeight: "700",
  },
  buyText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
