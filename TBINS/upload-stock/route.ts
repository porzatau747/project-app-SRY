import { NextResponse } from "next/server";
import { buildInventoryFromWorkbooks } from "../../../services/inventory";
import { updatePlannerState } from "../../../services/storage";

export async function POST(request: Request) {
  const formData = await request.formData();
  const stockFile = formData.get("stockFile");
  const priceFile = formData.get("priceFile");

  if (!(stockFile instanceof File) || !(priceFile instanceof File)) {
    return NextResponse.json({ error: "Please upload both stockFile and priceFile." }, { status: 400 });
  }

  const { inventory, summary } = buildInventoryFromWorkbooks(
    await stockFile.arrayBuffer(),
    await priceFile.arrayBuffer(),
    stockFile.name,
    priceFile.name
  );

  const state = await updatePlannerState((current) => ({
    ...current,
    inventory,
    summary,
    analysis: null,
    weeklyPlan: []
  }));

  return NextResponse.json(state);
}
