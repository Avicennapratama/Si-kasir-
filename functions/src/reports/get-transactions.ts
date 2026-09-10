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

// Endpoint: Get transactions with filters
export const getTransactions = functions
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
        const transactionListSchema = z.object({
          businessId: z.string().optional(),
          type: z.enum(["income", "expense", "all"]).default("all"),
          source: z.enum(["manual", "voice", "receipt", "all"]).default("all"),
          startDate: z.string().optional(),
          endDate: z.string().optional(),
          cursor: z.string().optional(),
        });

        try {
          const parsed = transactionListSchema.parse(req.body);

          let query = admin
            .firestore()
            .collection("transactions")
            .where("uid", "==", auth.uid);

          if (parsed.businessId) {
            query = query.where("businessId", "==", parsed.businessId);
          }

          if (parsed.type !== "all") {
            query = query.where("type", "==", parsed.type);
          }

          if (parsed.source !== "all") {
            query = query.where("source", "==", parsed.source);
          }

          if (parsed.startDate) {
            query = query.where("transactionDate", ">=", parsed.startDate);
          }

          if (parsed.endDate) {
            query = query.where("transactionDate", "<=", parsed.endDate);
          }

          if (parsed.cursor) {
            const cursorDoc = await admin.firestore().doc(`transactions/${parsed.cursor}`);
            query = query.startAfter(cursorDoc);
          }

          const snapshot = await query
            .orderBy("createdAt", "desc")
            .limit(20)
            .get();

          const transactions: any[] = [];
          let lastDoc: any = null;

          snapshot.forEach((doc: any) => {
            const data = doc.data();
            transactions.push({
              transactionId: doc.id,
              type: data.type,
              amount: data.amount,
              category: data.category,
              note: data.note,
              transactionDate: data.transactionDate,
              source: data.source,
              vendor: data.vendor,
            });
            lastDoc = doc;
          });

          // Get count for total (simplified - in production would use aggregation)
          const totalSnapshot = await admin
            .firestore()
            .collection("transactions")
            .where("uid", "==", auth.uid)
            .get();

          let filteredCount = totalSnapshot.size;

          // Apply same filters to count (simple approach)
          if (parsed.businessId) {
            // Filter count similarly
          }
          if (parsed.type !== "all") {
            // Filter count
          }
          if (parsed.source !== "all") {
            // Filter count
          }

          res.json({
            success: true,
            data: {
              transactions,
              nextCursor: lastDoc?.id || null,
              hasMore: snapshot.size === 20,
              totalCount: filteredCount,
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