import { NextResponse } from "next/server";
import { canvaCsvFileName, promotionBatchToCanvaCsv } from "../../../../../services/canva-csv-exporter";
import { validatePromotionBatchForExport } from "../../../../../services/promotion-export-validator";
import { getPromotionBatch, markBatchExported } from "../../../../../services/promotion-storage";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const batchId = searchParams.get("batchId") || "";
  const batch = await getPromotionBatch(batchId);

  if (!batch) return NextResponse.json({ error: "Batch not found" }, { status: 404 });

  const validation = validatePromotionBatchForExport(batch);
  if (!validation.ok) {
    return NextResponse.json({ error: "Promotion batch is not ready to export", details: validation.errors }, { status: 400 });
  }

  const csv = promotionBatchToCanvaCsv(batch);
  await markBatchExported(batch.id);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${canvaCsvFileName(batch)}"`
    }
  });
}
