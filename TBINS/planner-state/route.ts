import { NextResponse } from "next/server";
import { readPlannerState } from "../../../services/storage";

export async function GET() {
  return NextResponse.json(await readPlannerState());
}
