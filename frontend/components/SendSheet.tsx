import { forwardRef, useState, useMemo, useCallback } from "react";
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
  ActivityIndicator,
  Image,
} from "react-native";
import { useAppSelector } from "../store/hooks";
import { sendToken } from "../services/send";

type CoinRef = { id: string; name?: string; symbol?: string; image?: string };
type Props = { preset?: CoinRef | null };

const SendSheet = forwardRef<BottomSheetModal, Props>(({ preset }, ref) => {
  const holdings = useAppSelector((s) => s.portfolio.holdings); // [{id,name,symbol,amount,...}]
  const [selected, setSelected] = useState<CoinRef | null>(preset ?? null);
  const [toUid, setToUid] = useState("");
  const [units, setUnits] = useState("");
  const [busy, setBusy] = useState(false);

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

  const available = useMemo(() => {
    if (!selected) return 0;
    const row = holdings.find((h) => h.id === selected.id);
    return Number(row?.amount ?? 0);
  }, [selected, holdings]);

  const amt = Number(units) || 0;
  const disabled =
    !selected?.id || !toUid || amt <= 0 || amt > available || busy;

  const onConfirm = async () => {
    if (!selected?.id) return;
    try {
      setBusy(true);
      await sendToken({
        toUid: toUid.trim(),
        coinId: selected.id,
        amount: amt,
      });
      (ref as React.RefObject<BottomSheetModal>).current?.dismiss();
      setUnits("");
      setToUid("");
    } catch (e: any) {
      console.warn("send failed", e?.message || e);
    } finally {
      setBusy(false);
    }
  };

  // if no preset, let user pick a coin from their holdings
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
        <Text style={s.title}>Send Token</Text>

        {showPicker ? (
          <>
            <Text style={s.label}>Choose asset</Text>
            <FlatList
              data={holdings}
              keyExtractor={(i) => i.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={s.row}
                  onPress={() =>
                    setSelected({
                      id: item.id,
                      name: item.name,
                      symbol: item.symbol,
                      image: item.image,
                    })
                  }
                >
                  {item.image ? (
                    <Image source={{ uri: item.image }} />
                  ) : (
                    <View>
                      <Text>{item.symbol?.[0] ?? "?"}</Text>
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={s.name}>{item.name}</Text>
                    <Text style={s.sub}>
                      {item.symbol} • {item.amount}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={s.sub}>No holdings to send.</Text>
              }
            />
          </>
        ) : (
          <>
            <View style={s.assetLine}>
              <Text style={s.name}>{selected.name ?? selected.id}</Text>
              <TouchableOpacity onPress={() => setSelected(null)}>
                <Text style={s.link}>Change</Text>
              </TouchableOpacity>
            </View>

            <Text style={s.label}>Recipient UID</Text>
            <BottomSheetTextInput
              style={s.input}
              placeholder="paste uid…"
              placeholderTextColor="#888"
              autoCapitalize="none"
              value={toUid}
              onChangeText={setToUid}
            />

            <Text style={s.label}>
              Amount ({selected.symbol?.toUpperCase()}) • Available: {available}
            </Text>
            <BottomSheetTextInput
              style={s.input}
              placeholder="0.0"
              placeholderTextColor="#888"
              keyboardType="decimal-pad"
              value={units}
              onChangeText={setUnits}
            />

            <TouchableOpacity
              style={[s.btn, disabled && { opacity: 0.5 }]}
              disabled={disabled}
              onPress={onConfirm}
            >
              {busy ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={s.btnText}>Confirm Send</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </BottomSheetView>
    </BottomSheetModal>
  );
});

export default SendSheet;

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
  row: { paddingVertical: 10 },
  name: { fontSize: 16, fontWeight: "700", textTransform: "uppercase" },
  sub: { color: "#666", marginTop: 2 },
  assetLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  link: { color: "#4f46e5", fontWeight: "700" },
  btn: {
    marginTop: 12,
    backgroundColor: "#6d5cff",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
