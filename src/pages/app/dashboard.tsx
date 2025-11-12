import { SelectResident } from "@/components/visitors/select-resident";

export function Dashboard() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center">
      <title>Dashboard</title>
      <div className="">
        <SelectResident />
      </div>
    </div>
  );
}
