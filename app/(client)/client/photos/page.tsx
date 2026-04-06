import Image from "next/image";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getClientHomeData } from "@/lib/data/client";
import { formatFullDate } from "@/lib/utils";

export default async function ClientPhotosPage() {
  const data = await getClientHomeData();

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Progress photos</CardTitle>
          <CardDescription>
            Photos are part of the daily flow in version one, but they stay optional and lightweight.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.progressPhotos.length ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {data.progressPhotos.map((photo) => (
                <div key={photo.id} className="surface-muted overflow-hidden">
                  {photo.imageUrl.startsWith("http") ? (
                    <Image
                      src={photo.imageUrl}
                      alt={photo.note ?? "Progress photo"}
                      width={800}
                      height={1000}
                      className="h-72 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-72 items-center justify-center bg-sand-100 text-sm text-slate-500">
                      Signed URL will render here once storage is configured.
                    </div>
                  )}
                  <div className="p-4">
                    <p className="font-semibold text-slate-900">{photo.note ?? "Progress photo"}</p>
                    <p className="mt-2 text-sm text-slate-600">{formatFullDate(photo.date)}</p>
                  </div>
                </div>
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
