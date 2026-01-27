export function normalizeTrading80Call(call: any) {
  return {
    externalCallId: call.id,
    symbol: call.sname,
    side: call.type,
    entryPrice: Number(String(call.tprice).replace(/,/g, "")),
    target: call.potential
      ? Number(String(call.potential).replace(/,/g, ""))
      : null,
    stopLoss: Number(String(call.SL).replace(/,/g, "")),
    createdAtTrading80: new Date(call.calltime),
    rawPayload: call,
  };
}
