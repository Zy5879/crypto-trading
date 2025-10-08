// screens/CoinScreen.tsx
import React, { useRef } from "react";
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
import { useGetMarketByIdsQuery } from "../store/api/marketApi";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import BuySheet from "../components/BuySheet";

type Props = NativeStackScreenProps<MarketStackParamList, "Coin">;

export default function CoinScreen({ route }: Props) {
  const { id, name, symbol, image } = route.params;
  const { data, isLoading } = useGetMarketByIdsQuery({ ids: [id], vs: "usd" });
  const coin = data?.[0];

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

  return (
    <View style={s.wrap}>
      <View style={s.header}>
        {image ? <Image source={{ uri: image }} style={s.logo} /> : null}
        <View>
          <Text style={s.title}>{coin?.name ?? name}</Text>
          <Text style={s.sub}>
            {(coin?.symbol ?? symbol ?? "").toUpperCase()}
          </Text>
        </View>
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

      {/* Buy button */}
      <TouchableOpacity style={s.buyBtn} onPress={openBuy}>
        <Text style={s.buyText}>Buy</Text>
      </TouchableOpacity>

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
    gap: 12,
    marginBottom: 8,
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
  buyText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
