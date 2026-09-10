import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import cors from "cors";
import { z } from "zod";

admin.initializeApp();

const corsMiddleware = cors({ origin: true });

async function verifyAuthHeader(headers: any): Promise<admin.auth.DecodedIdToken> {
  const authHeader = headers.authorization || headers.Authorization || "";
  if (!authHeader.startsWith("Bearer ")) {
    throw new functions.https.HttpsError("unauthenticated", "No Bearer token provided");
  }
  const token = authHeader.substring(7);
  return await admin.auth().verifyIdToken(token);
}

// Endpoint: Get financial summary/report
export const getFinancialSummary = functions
  .region("auto")
  .runWith({ memory: "256MB", timeoutSeconds: 60 })
  .https.onRequest(async (req, res) => {
    return corsMiddleware(req, res, async () => {
      try {
        const auth = await verifyAuthHeader(req.headers);

        if (req.method !== "POST") {
          res.status(405).json({ error: "POST required" });
          return;
        }

        // Validate request
        const reportSchema = z.object({
          businessId: z.string().optional(),
          startDate: z.string().optional(),
          endDate: z.string().optional(),
        });

        try {
          const parsed = reportSchema.parse(req.body);

          let query = admin.firestore().collection("transactions").where("uid", "==", auth.uid);

          if (parsed.businessId) {
            query = query.where("businessId", "==", parsed.businessId);
          }

          if (parsed.startDate) {
            query = query.where("transactionDate", ">=", parsed.startDate);
          }

          if (parsed.endDate) {
            query = query.where("transactionDate", "<=", parsed.endDate);
          }

          const snapshot = await query.get();

          let incomeTotal = 0;
          let expenseTotal = 0;
          const byCategory: Record<string, { income: number; expense: number }> = {};
          const bySource: Record<string, { income: number; expense: number }> = {};

          snapshot.forEach((doc: any) => {
            const data = doc.data();
            const amount = data.amount ?? 0;
            const type = data.type ?? "expense";
            const category = data.category ?? "Lainnya";
            const source = data.source ?? "manual";

            if (type === "income") {
              incomeTotal += amount;
            } else {
              expenseTotal += amount;
            }

            // Accumulate by category
            const catType = data.type as "income" | "expense" ?? "expense";
            if (!byCategory[category]) {
              byCategory[category] = { income: 0, expense: 0 };
            }
            byCategory[category][catType] += amount;

            // Accumulate by source
            const srcType = data.type as "income" | "expense" ?? "expense";
            if (!bySource[source]) {
              bySource[source] = { income: 0, expense: 0 };
            }
            bySource[source][srcType] += amount;
          });

          // Convert to array format for frontend
          const byCategoryArray = Object.entries(byCategory).map(([cat, totals]) => ({
            category: cat,
            type: "mixed",
            total: totals.income + totals.expense,
            income: totals.income,
            expense: totals.expense,
          }));

          const bySourceArray = Object.entries(bySource).map(([src, totals]) => ({
            source: src,
            type: "mixed",
            total: totals.income + totals.expense,
            income: totals.income,
            expense: totals.expense,
          }));

          const netTotal = incomeTotal - expenseTotal;

          res.json({
            success: true,
            data: {
              incomeTotal,
              expenseTotal,
              netTotal,
              transactionsCount: snapshot.size,
              byCategory: byCategoryArray,
              bySource: bySourceArray,
            },
          });
        } catch (err) {
          res.status(400).json({ error: (err as Error).message });
        }
      } catch (err: any) {
        const code = err.code || "internal";
        const message = err.message || "Internal error";
        res.status(401).json({ error: message });
      }
    });
  });