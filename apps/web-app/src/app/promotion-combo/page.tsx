import { readPlannerState } from "../../services/storage";
import PromotionComboApp from "./PromotionComboApp";

export default async function PromotionComboPage() {
  const initialState = await readPlannerState();

  return <PromotionComboApp initialState={initialState} />;
}
