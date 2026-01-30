import axios from "axios";
import type { Request, Response } from "express";
import { normalizeTrading80Call } from "../utils/trading80.mapper.js";
import { Trading80Call } from "../Models/trading80.model.js";

async function fetchCallAlerts(sessionCookie: string) {
  try {
     const response = await axios.post(
    "https://frapi.trading80.com/callsapi/getCallAlerts",
    {},
    {
      headers: {
        Cookie: `session_cookie=${sessionCookie}`,
      },
      timeout: 10000,
    }
  );
  return response.data;
  } catch (error) {
    console.log("Getting error in fetching call Alerts",error);
  }
}


export const Agent = {
  syncCalls: async (req: Request, res: Response) => {
  try {
    const sessionCookie =process.env.session_cookie;
    if (!sessionCookie) {
      return res.status(400).json({ error: "session_cookie required" });
    }

    const data = await fetchCallAlerts(sessionCookie);

    const activeCalls = data?.data?.new ?? [];
    const changes = data?.data?.changes ?? [];

    const activeExternalIds = new Set<string>();

    // 1️⃣ UPSERT ACTIVE CALLS
    for (const call of activeCalls) {
      const normalized = normalizeTrading80Call(call);
      activeExternalIds.add(normalized.providerCallId);

      await Trading80Call.findOneAndUpdate(
        { providerCallId: normalized.providerCallId },
        {
          $set: {
            ...normalized,
            tradeStatus: "ACTIVE",
            lastSyncedAt: new Date(),
          },
        },
        { upsert: true }
      );
    }

    // 2️⃣ HANDLE CLOSED / REVERSED
    for (const call of changes) {
      const status =
        call.reason?.includes("TARGET") ||
        call.reason?.includes("STOP")
          ? "CLOSED"
          : "REVERSED";

      await Trading80Call.findOneAndUpdate(
        { providerCallId: call.id },
        {
          $set: {
            tradeStatus:status,
            lastSyncedAt: new Date(),
          },
        }
      );
    }

    // 3️⃣ MARK MISSING ACTIVE CALLS AS CLOSED
    await Trading80Call.updateMany(
      {
        tradeStatus: "ACTIVE",
        providerCallId: { $nin: Array.from(activeExternalIds) },
      },
      {
        $set: {
          tradeStatus: "CLOSED",
          lastSyncedAt: new Date(),
        },
      }
    );

    res.json({
      success: true,
      activeSynced: activeCalls.length,
      closedUpdated: changes.length,
    });
  } catch (err) {
    console.error("Trading80 sync failed:", err);
    res.status(500).json({ error: "Sync failed" });
  }
},

  fetch: async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string || "ACTIVE";

    const query: any = {};
    if (status) query.tradeStatus = status;

    const calls = await Trading80Call.find(query)
      .sort({ createdAtTrading80: -1 })
      .lean();

    res.json({
      success: true,
      count: calls.length,
      data: calls,
    });
  } catch (error) {
    console.error("Fetch failed:", error);
    res.status(500).json({ error: "Failed to fetch calls" });
  }
}

};
