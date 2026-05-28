import PlannerApp from "./PlannerApp";
import { readPlannerState } from "../services/storage";

export default async function HomePage() {
  const initialState = await readPlannerState();

  return <PlannerApp initialState={initialState} />;
}
