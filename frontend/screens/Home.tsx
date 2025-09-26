import React from "react";
import { View, Text, FlatList } from "react-native";
import BalanceInfoComponent from "../components/BalanceInfoComponent";
import HoldingTokenCard from "../components/HoldingTokenCard";
import CustomNavBar from "../components/CustomTopBarComponent";

const TOKENS = [
  {
    id: "sol",
    name: "Solana",
    symbol: "SOL",
    amount: 2.41274,
    valueUsd: 533.01,
    deltaUsd24h: -38.61,
  },
  // more…
];

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <CustomNavBar />
      <FlatList
        data={TOKENS}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <HoldingTokenCard
            name={item.name}
            symbol={item.symbol}
            amount={item.amount}
            valueUsd={item.valueUsd}
            deltaUsd24h={item.deltaUsd24h}
          />
        )}
        ListHeaderComponent={
          <View>
            <BalanceInfoComponent />
            <Text style={{ padding: 14, fontWeight: "bold" }}>TOKENS</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 32, backgroundColor: "#fff" }}
        style={{ flex: 1, backgroundColor: "#fff" }}
        bounces={false} // no gray bounce when short
        alwaysBounceVertical={false}
      />
    </View>
  );
}
