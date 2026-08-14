import { useState } from "react";
import { Building2, Plus, Users } from "lucide-react";
import { useVenuesList } from "@/hooks/use-platform";
import { formatUzDate } from "@/lib/uz-date";
import { emailToLogin } from "@/lib/login-id";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateVenueDialog } from "./create-venue-dialog";

export function VenuesPage() {
  const { data: venues, isLoading } = useVenuesList();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div>
      <PageHeader
        title="To'yxonalar"
        description="Platformadagi barcha to'yxonalar va ularning egalari"
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus /> Yangi to'yxona
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      ) : venues && venues.length > 0 ? (
        <div className="grid animate-slide-up gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {venues.map((venue) => (
            <Card key={venue.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                    <Building2 className="size-5" />
                  </div>
                  <Badge variant="outline" className="gap-1">
                    <Users className="size-3" /> {venue.staff_count}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <p className="font-semibold">{venue.name}</p>
                <p className="text-sm text-muted-foreground">
                  {venue.owner_name || "Egasi tayinlanmagan"}
                  {venue.owner_email && ` · ${emailToLogin(venue.owner_email)}`}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatUzDate(venue.created_at.slice(0, 10))} sanasida yaratilgan
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Building2}
          title="Hali to'yxona yaratilmagan"
          description="Birinchi to'yxonani yarating va egasiga login/parol bering."
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus /> Yangi to'yxona
            </Button>
          }
        />
      )}

      <CreateVenueDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
