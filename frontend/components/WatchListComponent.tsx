import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import type { Favorite } from "../hooks/useFavorites";
import { useNavigation } from "@react-navigation/native";

export default function WatchlistComponent({ items }: { items: Favorite[] }) {
  if (!items.length) return null;

  type Favorite = { id: string; name: string; symbol: string; image?: string };
  const nav = useNavigation<any>();

  const goToCoin = (c: Favorite) => {
    // 1) switch to the Market tab and ensure the stack root is mounted
    nav.navigate("Market", { screen: "MarketStack" });
    // 2) push Coin on the next frame so it sits on top of MarketStack
    requestAnimationFrame(() => {
      nav.navigate("Market", {
        screen: "Coin",
        params: {
          id: c.id,
          name: c.name,
          symbol: c.symbol,
          image: c.image ?? "",
        },
      });
    });
  };

  //   const goToCoin = (c: Favorite) => {
  //     nav.navigate("Market", {
  //       screen: "Coin", // <-- nested stack screen
  //       params: {
  //         id: c.id,
  //         name: c.name,
  //         symbol: c.symbol,
  //         image: c.image ?? "",
  //       },
  //     });
  //   };

  return (
    <View style={s.wrap}>
      <Text style={s.title}>WATCHLIST</Text>
      <FlatList
        horizontal
        data={items}
        keyExtractor={(i) => i.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={s.card}
            activeOpacity={0.7}
            onPress={() => goToCoin(item)}
          >
            {item.image ? (
              <Image source={{ uri: item.image }} style={s.logo} />
            ) : (
              <View style={s.logoFallback}>
                <Text style={s.logoText}>{item.symbol?.[0] ?? "?"}</Text>
              </View>
            )}
            <Text style={s.name} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={s.symbol}>{item.symbol}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginTop: 8 },
  title: { marginLeft: 16, marginBottom: 8, fontSize: 16, fontWeight: "700" },
  card: { width: 92, marginRight: 12, alignItems: "center" },
  logo: { width: 40, height: 40, borderRadius: 20, marginBottom: 6 },
  logoFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  logoText: { fontWeight: "800" },
  name: { fontSize: 12, fontWeight: "700" },
  symbol: { fontSize: 11, color: "#666" },
});
