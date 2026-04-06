import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getClientHomeData } from "@/lib/data/client";
import { formatFullDate } from "@/lib/utils";

export default async function ClientMessagesPage() {
  const data = await getClientHomeData();

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Coach messages</CardTitle>
          <CardDescription>
            Encouraging feedback and shared notes stay visible here so progress feels supported.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.feedbackMessages.length || data.sharedCoachNotes.length ? (
            <>
              {data.feedbackMessages.map((message) => (
                <div key={message.id} className="surface-muted p-4">
                  <Badge tone="accent">Message</Badge>
                  <p className="mt-3 text-sm text-slate-700">{message.message}</p>
                  <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-500">
                    {formatFullDate(message.createdAt)}
                  </p>
                </div>
              ))}
              {data.sharedCoachNotes.map((note) => (
                <div key={note.id} className="surface-muted p-4">
                  <Badge tone="neutral">Coach note</Badge>
                  <p className="mt-3 text-sm text-slate-700">{note.note}</p>
                  <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-500">
                    {formatFullDate(note.createdAt)}
                  </p>
                </div>
              ))}
            </>
          ) : (
            <div className="surface-muted p-5 text-sm text-slate-700">
              No coach messages yet. When feedback is added, it will show up here.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
