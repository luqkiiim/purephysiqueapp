import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getClientMessagesPageData } from "@/lib/data/client";
import { formatFullDate } from "@/lib/utils";

export default async function ClientMessagesPage() {
  const data = await getClientMessagesPageData();
  const totalItems = data.feedbackMessages.length + data.sharedCoachNotes.length;

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Messages</CardTitle>
          <CardDescription>
            Coach feedback and shared notes stay visible here so progress still feels supported
            between check-ins.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="surface-muted p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Feedback</p>
              <p className="mt-2 text-2xl font-display text-slate-900">
                {data.feedbackMessages.length}
              </p>
            </div>
            <div className="surface-muted p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Shared notes</p>
              <p className="mt-2 text-2xl font-display text-slate-900">
                {data.sharedCoachNotes.length}
              </p>
            </div>
          </div>

          {totalItems ? (
            <div className="space-y-5">
              {data.feedbackMessages.length ? (
                <section className="space-y-3">
                  <div className="space-y-1">
                    <p className="eyebrow">Coach feedback</p>
                    <p className="text-sm leading-6 text-slate-600">
                      Short coach messages saved for the client to revisit anytime.
                    </p>
                  </div>
                  {data.feedbackMessages.map((message) => (
                    <div key={message.id} className="surface-muted p-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <Badge tone="accent" className="self-start">
                          Message
                        </Badge>
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                          {formatFullDate(message.createdAt)}
                        </p>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-700">{message.message}</p>
                    </div>
                  ))}
                </section>
              ) : null}

              {data.sharedCoachNotes.length ? (
                <section className="space-y-3">
                  <div className="space-y-1">
                    <p className="eyebrow">Shared notes</p>
                    <p className="text-sm leading-6 text-slate-600">
                      Coaching context that your coach chose to keep visible in the app.
                    </p>
                  </div>
                  {data.sharedCoachNotes.map((note) => (
                    <div key={note.id} className="surface-muted p-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <Badge tone="neutral" className="self-start">
                          Coach note
                        </Badge>
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                          {formatFullDate(note.createdAt)}
                        </p>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-700">{note.note}</p>
                    </div>
                  ))}
                </section>
              ) : null}
            </div>
          ) : (
            <div className="surface-muted p-5 text-sm text-slate-700">
              No messages yet. When feedback or shared notes are added, they will show up here.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
