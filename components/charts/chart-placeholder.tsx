import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function ChartPlaceholder() {
  return (
    <Card>
      <CardHeader className="space-y-2">
        <div className="h-5 w-36 rounded-full bg-slate-200" />
        <div className="h-4 w-56 rounded-full bg-slate-100" />
      </CardHeader>
      <CardContent className="h-60 px-4 sm:h-72">
        <div className="h-full w-full rounded-[1.3rem] bg-slate-100/90 sm:rounded-3xl" />
      </CardContent>
    </Card>
  );
}
