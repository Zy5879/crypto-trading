// src/components/SendSheet.tsx
import React, {
  forwardRef,
  useMemo,
  useState,
  useCallback,
  useEffect,
} from "react";
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
  Alert,
} from "react-native";
import { useAppSelector } from "../store/hooks";
import { sendTokenViaServer } from "../services/transfer";

type CoinRef = { id: string; name?: string; symbol?: string; image?: string };
type Props = { preset?: CoinRef | null };

const SendSheet = forwardRef<BottomSheetModal, Props>(({ preset }, ref) => {
  const holdings = useAppSelector((s) => s.portfolio.holdings); // [{id,name,symbol,image?,amount}]
  const [selected, setSelected] = useState<CoinRef | null>(preset ?? null);
  const [toUid, setToUid] = useState("");
  const [units, setUnits] = useState("");
  const [busy, setBusy] = useState(false);

  // keep selected in sync if parent changes preset between openings
  useEffect(() => {
    setSelected(preset ?? null);
  }, [preset]);

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

  const onConfirm = async () => {
    if (!selected?.id) return;
    const amt = Number(units);
    if (!toUid.trim() || !Number.isFinite(amt) || amt <= 0) return;
    if (amt > available) {
      Alert.alert("Not enough balance", "Reduce the amount and try again.");
      return;
    }
    try {
      setBusy(true);
      await sendTokenViaServer({
        toUid: toUid.trim(),
        coinId: selected.id,
        amount: amt,
        image: selected.image, // helps set recipient image if they don't have one
      });
      (ref as React.RefObject<BottomSheetModal>).current?.dismiss();
      setUnits("");
      setToUid("");
    } catch (e: any) {
      Alert.alert("Send failed", e?.message ?? "Please try again.");
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
                    <Image source={{ uri: item.image }} style={s.logo} />
                  ) : (
                    <View style={s.placeholder}>
                      <Text style={s.placeholderTxt}>
                        {item.symbol?.[0]?.toUpperCase?.() ?? "?"}
                      </Text>
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={s.name}>{item.name}</Text>
                    <Text style={s.sub}>
                      {item.symbol?.toUpperCase?.()} • {item.amount}
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
            {/* Selected asset header with image */}
            <View style={s.assetHeader}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {selected.image ? (
                  <Image source={{ uri: selected.image }} style={s.logoLg} />
                ) : (
                  <View style={[s.placeholder, { marginRight: 10 }]}>
                    <Text style={s.placeholderTxt}>
                      {selected.symbol?.[0]?.toUpperCase?.() ?? "?"}
                    </Text>
                  </View>
                )}
                <View>
                  <Text style={s.name}>{selected.name ?? selected.id}</Text>
                  <Text style={s.sub}>{selected.symbol?.toUpperCase()}</Text>
                </View>
              </View>
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
              returnKeyType="next"
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
              onChangeText={(t) => {
                // sanitize numeric string (allow one dot)
                const cleaned = t.replace(/[^0-9.]/g, "");
                const parts = cleaned.split(".");
                setUnits(
                  parts.length > 2
                    ? parts[0] + "." + parts.slice(1).join("")
                    : cleaned
                );
              }}
              returnKeyType="done"
            />

            <TouchableOpacity
              style={[s.btn, (!toUid || !units || busy) && { opacity: 0.5 }]}
              disabled={!toUid || !units || busy}
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
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  logo: { width: 28, height: 28, borderRadius: 14, marginRight: 10 },
  logoLg: { width: 32, height: 32, borderRadius: 16, marginRight: 10 },
  placeholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 10,
    backgroundColor: "#ececec",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderTxt: { fontWeight: "800", color: "#666" },
  name: { fontSize: 16, fontWeight: "700" },
  sub: { color: "#666", marginTop: 2 },
  assetHeader: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
