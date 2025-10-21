export function simpleSwap({
  amountFrom,
  priceFromUSD,
  priceToUSD,
  fee = 0.002,
  slippage = 0.005,
}) {
  const usd = amountFrom * priceFromUSD;
  const receive = (usd * (1 - fee)) / priceToUSD;
  const minReceive = receive * (1 - slippage);
  return {
    receive,
    minReceive,
    usd,
    effectiveRate: (priceFromUSD / priceToUSD) * (1 - fee),
  };
}
