import { useEffect, useRef, useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import CustomNavBar from "../components/CustomTopBarComponent";
import BalanceInfoComponent from "../components/BalanceInfoComponent";
import HoldingTokenCard from "../components/HoldingTokenCard";
import { useAppSelector } from "../store/hooks";
import { useGetMarketQuery } from "../store/api/marketApi";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import BuySheet from "../components/BuySheet";
import SendSheet from "../components/SendSheet";
import SwapSheet from "../components/SwapSheet";

export default function HomeScreen() {
  const holdings = useAppSelector((s) => s.portfolio.holdings);

  const [selected, setSelected] = useState<{
    id: string;
    name?: string;
    symbol?: string;
    image?: string;
  } | null>(null);
  const sheetRef = useRef<BottomSheetModal>(null);

  const [selectedCoin, setSelectedCoin] = useState<{
    id: string;
    name?: string;
    symbol?: string;
    image?: string;
  } | null>(null);
  const coinSheetRef = useRef<BottomSheetModal>(null);

  const openSend = (coin?: {
    id: string;
    name?: string;
    symbol?: string;
    image?: string;
  }) => {
    setSelectedCoin(coin ?? null);
    // slight delay ensures the state is set before presenting
    requestAnimationFrame(() => coinSheetRef.current?.present());
  };

  const openBuy = (coin?: {
    id: string;
    name?: string;
    symbol?: string;
    image?: string;
  }) => {
    setSelected(coin ?? null);
    // slight delay ensures state is set before presenting
    requestAnimationFrame(() => sheetRef.current?.present());
  };

  //onSwap check

  const swapRef = useRef<BottomSheetModal>(null);
  const openSwap = () =>
    requestAnimationFrame(() => swapRef.current?.present());

  // Same args = same cache across all screens
  const {
    data: market,
    isLoading,
    isFetching,
  } = useGetMarketQuery(
    { category: "layer-1", perPage: 250, vs: "usd" },
    {
      // don't refetch on mount if we already have cache:
      refetchOnMountOrArgChange: false,
    }
  );

  // const sendRef = useRef<BottomSheetModal>(null);
  // const buyRef = useRef<BottomSheetModal>(null);

  const marketMap = useMemo(() => {
    const m = new Map<string, { price: number; pct24: number }>();
    (market ?? []).forEach((c) =>
      m.set(c.id, {
        price: c.current_price ?? 0,
        pct24: c.price_change_percentage_24h_in_currency ?? 0,
      })
    );
    return m;
  }, [market]);

  const rows = useMemo(() => {
    return holdings.map((h) => {
      const coin = marketMap.get(h.id);
      if (!coin) return { ...h, valueUsd: 0, deltaUsd24h: 0 };
      const valueNow = h.amount * coin.price;
      const r = Math.max(coin.pct24 / 100, -0.999);
      const valuePrev = valueNow / (1 + r);
      const deltaUSD = valueNow - valuePrev;
      return { ...h, valueUsd: valueNow, deltaUsd24h: deltaUSD };
    });
  }, [holdings, marketMap]);

  const totals = useMemo(() => {
    const valueNow = rows.reduce((s, r) => s + r.valueUsd, 0);
    const deltaUSD = rows.reduce((s, r) => s + r.deltaUsd24h, 0);
    const valuePrev = valueNow - deltaUSD;
    const deltaPct = valuePrev > 0 ? (deltaUSD / valuePrev) * 100 : 0;
    return { valueNow, deltaUSD, deltaPct };
  }, [rows]);

  if (isLoading && !market) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <CustomNavBar />
      {isFetching ? <Text style={styles.small}>Updating…</Text> : null}

      <FlatList
        data={rows}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <HoldingTokenCard
            image={item.image}
            name={item.name}
            symbol={item.symbol}
            amount={item.amount}
            valueUsd={item.valueUsd}
            deltaUsd24h={item.deltaUsd24h}
          />
        )}
        ListHeaderComponent={
          <View>
            <BalanceInfoComponent
              balanceUSD={totals.valueNow}
              deltaUSD={totals.deltaUSD}
              deltaPct={totals.deltaPct}
              onBuy={() => openBuy()}
              onSend={() => openSend()}
              onSwap={() => openSwap()}
            />
            {rows.length > 0 && <Text style={styles.section}>TOKENS</Text>}
          </View>
        }
        ListEmptyComponent={<Text style={styles.empty}>No holdings yet.</Text>}
        contentContainerStyle={{ paddingBottom: 32 }}
        bounces={rows.length > 0}
        alwaysBounceVertical={false}
      />
      <BuySheet ref={sheetRef} />
      <SendSheet ref={coinSheetRef} />
      <SwapSheet ref={swapRef} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  section: { padding: 14, fontWeight: "bold" },
  small: { textAlign: "center", color: "#666", marginTop: 6 },
  empty: { padding: 16, textAlign: "center" },
});
