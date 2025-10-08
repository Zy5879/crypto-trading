import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MarketScreen from "../screens/Market";
import CoinScreen from "../screens/CoinScreen";

export type MarketStackParamList = {
  MarketStack: undefined;
  Coin: { id: string; name?: string; symbol?: string; image?: string };
};

const Stack = createNativeStackNavigator<MarketStackParamList>();

export default function MarketStack() {
  return (
    <Stack.Navigator id={undefined}>
      <Stack.Screen
        name="MarketStack"
        component={MarketScreen}
        options={{ headerShown: false, title: "Back to Market" }}
      />
      <Stack.Screen
        name="Coin"
        component={CoinScreen}
        options={{ title: "" }}
      />
    </Stack.Navigator>
  );
}
