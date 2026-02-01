import { useAllLinkedCards } from "@/hooks/useWithdrawals";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, User } from "lucide-react";
import { format } from "date-fns";

export function LinkedCardsAdmin() {
  const { data: cards, isLoading } = useAllLinkedCards();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!cards || cards.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No linked cards yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Linked Cards ({cards.length})</h3>
      
      <div className="grid gap-4">
        {cards.map((card) => (
          <Card key={card.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                •••• •••• •••• {card.last_four}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">User</p>
                  <p className="font-medium flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {card.profile?.display_name || card.profile?.email || "Unknown"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Cardholder</p>
                  <p className="font-medium">{card.card_holder_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Full Card Number</p>
                  <p className="font-mono text-xs">{card.card_number}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Expiry</p>
                  <p className="font-medium">{card.expiry_month}/{card.expiry_year}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Card Type</p>
                  <p className="font-medium capitalize">{card.card_type}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Linked On</p>
                  <p className="font-medium">
                    {format(new Date(card.created_at), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
