import PromotionPlannerApp from "./PromotionPlannerApp";
import { readPlannerState } from "../../services/storage";
import { buildPromotionCandidates } from "../../services/promotion-engine";

export default async function PromotionsPage() {
  const state = await readPlannerState();
  const initialCandidates = buildPromotionCandidates(state.inventory, 50);

  return <PromotionPlannerApp initialCandidates={initialCandidates} />;
}

