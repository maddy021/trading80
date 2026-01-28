function parseCallDate(calltime:string) {
  const currentYear = new Date().getFullYear();
  return new Date(`${calltime} ${currentYear}`);
}
export function normalizeTrading80Call(call: any) {
  return {
    providerCallId: call.id,
    symbol: call.sname,
    side: call.type,
    entryPrice: Number(String(call.tprice).replace(/,/g, "")),
    targetReturnPercent: call.potential
      ? Number(String(call.potential).replace(/,/g, ""))
      : null,
    stopLossPrice: Number(String(call.SL).replace(/,/g, "")),
    signalGeneratedAt: parseCallDate(call.calltime),
  };
}
