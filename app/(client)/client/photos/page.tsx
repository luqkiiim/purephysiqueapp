import Image from "next/image";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getClientPhotosPageData } from "@/lib/data/client";
import { formatFullDate } from "@/lib/utils";

export default async function ClientPhotosPage() {
  const data = await getClientPhotosPageData();

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Progress photos</CardTitle>
          <CardDescription>
            Photos are part of the daily flow in version one, but they stay optional and
            lightweight.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="surface-muted p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Saved photos</p>
              <p className="mt-2 text-2xl font-display text-slate-900">
                {data.progressPhotos.length}
              </p>
            </div>
            <div className="surface-muted p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Upload style</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">Optional from check-in</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Keep uploads quick and consistent rather than overproduced.
              </p>
            </div>
          </div>

          {data.progressPhotos.length ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {data.progressPhotos.map((photo, index) => (
                <article key={photo.id} className="surface-muted overflow-hidden">
                  {photo.imageUrl.startsWith("http") ? (
                    <Image
                      src={photo.imageUrl}
                      alt={photo.note ?? "Progress photo"}
                      width={800}
                      height={1000}
                      priority={index < 2}
                      className="aspect-[4/5] w-full object-cover"
                    />
                  ) : (
                    <div className="flex aspect-[4/5] items-center justify-center bg-sand-100 px-6 text-center text-sm leading-6 text-slate-500">
                      Signed URL will render here once storage is configured.
                    </div>
                  )}
                  <div className="space-y-2 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      {formatFullDate(photo.date)}
                    </p>
                    <p className="font-semibold text-slate-900">
                      {photo.note ?? "Progress photo"}
                    </p>
                    <p className="text-sm leading-6 text-slate-600">
                      Logged from the daily check-in flow.
                    </p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="surface-muted p-5 text-sm text-slate-700">
              No progress photos yet. Upload one from the daily check-in whenever you are ready.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
