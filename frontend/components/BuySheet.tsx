// components/BuySheet.tsx
import React from "react";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Image,
} from "react-native";
import {
  useLazySearchCoinsQuery,
  useGetMarketByIdsQuery,
} from "../store/api/marketApi";
import { purchaseToken } from "../services/purchaseToken";

type CoinRef = { id: string; name?: string; symbol?: string; image?: string };
type Props = { preset?: CoinRef | null }; // pass nothing to force search mode

const BuySheet = React.forwardRef<BottomSheetModal, Props>(
  ({ preset }, ref) => {
    const [query, setQuery] = React.useState("");
    const [selected, setSelected] = React.useState<CoinRef | null>(
      preset ?? null
    );
    const [usd, setUsd] = React.useState("100");
    const [busy, setBusy] = React.useState(false);

    // search (debounced)
    const [triggerSearch, searchState] = useLazySearchCoinsQuery();
    React.useEffect(() => {
      if (!query || query.trim().length < 2) return;
      const t = setTimeout(() => triggerSearch({ q: query.trim() }), 300);
      return () => clearTimeout(t);
    }, [query, triggerSearch]);

    // price for chosen coin
    const { data: prices, isFetching: fetchingPrice } = useGetMarketByIdsQuery(
      selected?.id
        ? { ids: [selected.id], vs: "usd" }
        : { ids: [] as string[] },
      { skip: !selected?.id }
    );
    const price = prices?.[0]?.current_price ?? 0;
    const name = selected?.name ?? prices?.[0]?.name ?? selected?.id ?? "Coin";
    const symbol = (
      selected?.symbol ??
      prices?.[0]?.symbol ??
      ""
    ).toUpperCase();
    const image = selected?.image ?? prices?.[0]?.image;
    const qty = price > 0 ? (Number(usd) || 0) / price : 0;
    const disabled = !(selected?.id && price > 0 && Number(usd) > 0) || busy;

    const snapPoints = React.useMemo(() => ["50%", "90%"], []);
    const backdrop = React.useCallback(
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
      if (!selected?.id) return;
      try {
        setBusy(true);
        await purchaseToken({
          coinId: selected.id,
          name,
          symbol,
          image,
          priceUsd: price,
          usdAmount: Number(usd),
        });
        (ref as React.RefObject<BottomSheetModal>).current?.dismiss();
      } finally {
        setBusy(false);
      }
    };

    const showPicker = !selected;

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        backdropComponent={backdrop}
        enablePanDownToClose
      >
        <BottomSheetView style={s.wrap}>
          <Text style={s.title}>
            {showPicker ? "Select Asset" : `Buy ${name}`}
          </Text>

          {showPicker ? (
            <>
              <BottomSheetTextInput
                style={s.input}
                placeholder="Search coin (e.g. sol, bitcoin)"
                placeholderTextColor="#888"
                value={query}
                onChangeText={setQuery}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searchState.isFetching ? (
                <ActivityIndicator style={{ marginTop: 12 }} />
              ) : (
                <FlatList
                  data={searchState.data ?? []}
                  keyExtractor={(i) => i.id}
                  keyboardShouldPersistTaps="handled"
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={s.row}
                      onPress={() => {
                        setSelected(item);
                        setUsd("100");
                      }}
                    >
                      {item.image ? (
                        <Image source={{ uri: item.image }} style={s.logo} />
                      ) : (
                        <View style={[s.logo, s.logoFallback]}>
                          <Text style={s.initials}>
                            {item.symbol?.[0] ?? "?"}
                          </Text>
                        </View>
                      )}
                      <View style={{ flex: 1 }}>
                        <Text style={s.name}>{item.name}</Text>
                        <Text style={s.sub}>{item.symbol}</Text>
                      </View>
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={
                    query.length >= 2 ? (
                      <Text style={s.empty}>No results for “{query}”.</Text>
                    ) : (
                      <Text style={s.empty}>Type at least 2 characters…</Text>
                    )
                  }
                />
              )}
            </>
          ) : (
            <>
              <View style={s.assetRow}>
                {image ? (
                  <Image source={{ uri: image }} style={s.logo} />
                ) : (
                  <View style={[s.logo, s.logoFallback]}>
                    <Text style={s.initials}>{symbol?.[0] ?? "?"}</Text>
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={s.name}>{name}</Text>
                  <Text style={s.sub}>{symbol}</Text>
                </View>
                <TouchableOpacity onPress={() => setSelected(null)}>
                  <Text style={s.change}>Change</Text>
                </TouchableOpacity>
              </View>

              <Text style={s.meta}>
                Price:{" "}
                {fetchingPrice
                  ? "…"
                  : price
                  ? `$${price.toLocaleString()}`
                  : "—"}
              </Text>
              <BottomSheetTextInput
                style={s.input}
                keyboardType="decimal-pad"
                placeholder="USD amount"
                placeholderTextColor="#888"
                value={usd}
                onChangeText={setUsd}
              />
              <Text style={s.meta}>
                Est. Qty: {price ? qty.toFixed(6) : "—"} {symbol}
              </Text>

              <TouchableOpacity
                style={[s.btn, disabled && { opacity: 0.5 }]}
                disabled={disabled}
                onPress={onConfirm}
              >
                {busy ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={s.btnText}>Confirm Buy</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

export default BuySheet;

const s = StyleSheet.create({
  wrap: { padding: 16, gap: 12 },
  title: { fontSize: 20, fontWeight: "800" },
  input: {
    backgroundColor: "#f2f2f7",
    color: "#000",
    padding: 12,
    borderRadius: 10,
  },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  assetRow: { flexDirection: "row", alignItems: "center", paddingVertical: 6 },
  logo: { width: 36, height: 36, borderRadius: 18, marginRight: 12 },
  logoFallback: {
    backgroundColor: "#e9e9ef",
    alignItems: "center",
    justifyContent: "center",
  },
  initials: { fontWeight: "800" },
  name: { fontSize: 16, fontWeight: "700" },
  sub: { color: "#666", marginTop: 2, textTransform: "uppercase" },
  empty: { color: "#777", marginTop: 12 },
  meta: { color: "#444" },
  change: { color: "#4f46e5", fontWeight: "700" },
  btn: {
    marginTop: 8,
    backgroundColor: "#6d5cff",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
