import { forwardRef, useMemo, useState, useCallback } from "react";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
} from "react-native";
import { useAppSelector } from "../store/hooks";
import { useGetMarketQuery } from "../store/api/marketApi";
import { simpleSwap } from "../helper/simpleSwap";
import { swap } from "../services/swap";

type Coin = {
  id: string;
  name?: string;
  symbol?: string;
  image?: string;
  amount?: number;
};
type Props = {};

const SwapSheet = forwardRef<BottomSheetModal, Props>((_props, ref) => {
  const holdings = useAppSelector((s) => s.portfolio.holdings) as Coin[];
  const { data: market } = useGetMarketQuery({
    category: "layer-1",
    perPage: 250,
    vs: "usd",
  });
  const [fromCoin, setFromCoin] = useState<Coin | null>(null);
  const [toCoin, setToCoin] = useState<Coin | null>(null);
  const [amountFrom, setAmountFrom] = useState("");
  const [busy, setBusy] = useState(false);

  const marketMap = useMemo(() => {
    const m = new Map<string, { price: number }>();
    (market ?? []).forEach((c) => m.set(c.id, { price: c.current_price ?? 0 }));
    return m;
  }, [market]);

  const priceFrom = fromCoin ? marketMap.get(fromCoin.id)?.price ?? 0 : 0;
  const priceTo = toCoin ? marketMap.get(toCoin.id)?.price ?? 0 : 0;
  const aFrom = Number(amountFrom) || 0;
  const quote = useMemo(() => {
    if (!(aFrom > 0 && priceFrom > 0 && priceTo > 0)) return null;
    return simpleSwap({
      amountFrom: aFrom,
      priceFromUSD: priceFrom,
      priceToUSD: priceTo,
    });
  }, [aFrom, priceFrom, priceTo]);

  const canSwap =
    !!fromCoin?.id &&
    !!toCoin?.id &&
    fromCoin!.id !== toCoin!.id &&
    !!quote &&
    aFrom > 0 &&
    aFrom <= Number(holdings.find((h) => h.id === fromCoin?.id)?.amount ?? 0);

  const snapPoints = useMemo(() => ["45%", "90%"], []);
  const backdrop = useCallback(
    (p: any) => (
      <BottomSheetBackdrop
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.4}
        {...p}
      />
    ),
    []
  );

  const onConfirm = async () => {
    if (!canSwap || !quote || !fromCoin || !toCoin) return;
    try {
      setBusy(true);
      await swap({
        fromId: fromCoin.id,
        toId: toCoin.id,
        amountFrom: aFrom,
        amountTo: quote.receive,
        image: toCoin.image ?? null,
        toName: toCoin.name,
        toSymbol: toCoin.symbol,
      });
      (ref as any).current?.dismiss();
      setAmountFrom("");
      setFromCoin(null);
      setToCoin(null);
    } catch (e: any) {
      console.warn("swap failed", e?.message || e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose
      backdropComponent={backdrop}
    >
      <BottomSheetView style={s.wrap}>
        <Text style={s.title}>Swap</Text>

        {/* From selector */}
        <Text style={s.label}>From</Text>
        {!fromCoin ? (
          <FlatList
            data={holdings}
            keyExtractor={(i) => i.id}
            style={{ maxHeight: 140 }}
            renderItem={({ item }) => (
              <TouchableOpacity style={s.row} onPress={() => setFromCoin(item)}>
                {item.image ? (
                  <Image source={{ uri: item.image }} style={s.logo} />
                ) : (
                  <View style={s.blankLogo}>
                    <Text>{item.symbol?.[0] ?? "?"}</Text>
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={s.name}>{item.name}</Text>
                  <Text style={s.sub}>
                    {item.symbol?.toUpperCase()} • {item.amount}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={s.sub}>No assets to swap out.</Text>
            }
          />
        ) : (
          <TouchableOpacity
            style={s.pickLine}
            onPress={() => setFromCoin(null)}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              {fromCoin.image ? (
                <Image source={{ uri: fromCoin.image }} style={s.logo} />
              ) : (
                <View style={s.blankLogo}>
                  <Text>{fromCoin.symbol?.[0] ?? "?"}</Text>
                </View>
              )}
              <Text style={s.name}>{fromCoin.name}</Text>
            </View>
            <Text style={s.link}>Change</Text>
          </TouchableOpacity>
        )}

        {/* To selector */}
        <Text style={s.label}>To</Text>
        {!toCoin ? (
          <FlatList
            data={
              (market ?? []).slice(0, 100).map((c) => ({
                id: c.id,
                name: c.name,
                symbol: c.symbol,
                image: c.image,
              })) as Coin[]
            }
            keyExtractor={(i) => i.id}
            style={{ maxHeight: 140 }}
            renderItem={({ item }) => (
              <TouchableOpacity style={s.row} onPress={() => setToCoin(item)}>
                {item.image ? (
                  <Image source={{ uri: item.image }} style={s.logo} />
                ) : (
                  <View style={s.blankLogo}>
                    <Text>{item.symbol?.[0] ?? "?"}</Text>
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={s.name}>{item.name}</Text>
                  <Text style={s.sub}>{item.symbol?.toUpperCase()}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        ) : (
          <TouchableOpacity style={s.pickLine} onPress={() => setToCoin(null)}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              {toCoin.image ? (
                <Image source={{ uri: toCoin.image }} style={s.logo} />
              ) : (
                <View style={s.blankLogo}>
                  <Text>{toCoin.symbol?.[0] ?? "?"}</Text>
                </View>
              )}
              <Text style={s.name}>{toCoin.name}</Text>
            </View>
            <Text style={s.link}>Change</Text>
          </TouchableOpacity>
        )}

        {/* Amount */}
        <Text style={s.label}>
          Amount ({fromCoin?.symbol?.toUpperCase() ?? "-"})
        </Text>
        <BottomSheetTextInput
          style={s.input}
          placeholder="0.0"
          placeholderTextColor="#888"
          keyboardType="decimal-pad"
          value={amountFrom}
          onChangeText={setAmountFrom}
        />

        {/* Quote */}
        <View style={{ minHeight: 30 }}>
          {quote ? (
            <Text style={s.quote}>
              You receive ~ {quote.receive.toFixed(6)}{" "}
              {toCoin?.symbol?.toUpperCase()} · Rate{" "}
              {quote.effectiveRate.toFixed(6)}
            </Text>
          ) : null}
        </View>

        <TouchableOpacity
          style={[s.btn, !canSwap && { opacity: 0.5 }]}
          disabled={!canSwap || busy}
          onPress={onConfirm}
        >
          {busy ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={s.btnText}>Confirm Swap</Text>
          )}
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

export default SwapSheet;

const s = StyleSheet.create({
  wrap: { padding: 16, gap: 10 },
  title: { fontSize: 20, fontWeight: "800" },
  label: { marginTop: 6, color: "#333", fontWeight: "700" },
  input: {
    backgroundColor: "#f2f2f7",
    padding: 12,
    borderRadius: 10,
    color: "#000",
  },
  row: { paddingVertical: 10, flexDirection: "row", alignItems: "center" },
  logo: { width: 28, height: 28, borderRadius: 14, marginRight: 10 },
  blankLogo: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 10,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
  },
  name: { fontSize: 16, fontWeight: "700" },
  sub: { color: "#666", marginTop: 2 },
  pickLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  link: { color: "#4f46e5", fontWeight: "700" },
  quote: { color: "#111", fontWeight: "600" },
  btn: {
    marginTop: 12,
    backgroundColor: "#6d5cff",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
