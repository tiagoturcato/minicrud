import { getDashboardBIData } from "./actions";
import BIClient from "./bi-client";

export default async function BIPage() {
  const data = await getDashboardBIData();
  return <BIClient data={data} />;
}
