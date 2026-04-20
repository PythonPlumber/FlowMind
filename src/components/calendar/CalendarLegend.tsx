import { Badge } from "@/components/ui/badge";

export function CalendarLegend() {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge variant="period">Period</Badge>
      <Badge variant="warning">Predicted</Badge>
      <Badge variant="fertile">Fertile</Badge>
      <Badge variant="muted">Today</Badge>
    </div>
  );
}
