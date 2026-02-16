import { motion } from "framer-motion";
import { CreditCard, Building2, Clock, CheckCircle, XCircle, Loader2, Plus, Trash2 } from "lucide-react";
import { SubPageLayout } from "@/components/SubPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLinkedCards, useDeleteLinkedCard } from "@/hooks/useLinkedCards";
import { useWithdrawals } from "@/hooks/useWithdrawals";
import { LinkCardDialog } from "@/components/LinkCardDialog";
import { useState } from "react";
import { format } from "date-fns";

const getStatusIcon = (status: string) => {
  switch (status) {
    case "successful":
      return <CheckCircle className="h-4 w-4 text-success" />;
    case "declined":
      return <XCircle className="h-4 w-4 text-destructive" />;
    case "failed":
      return <XCircle className="h-4 w-4 text-orange-500" />;
    default:
      return <Clock className="h-4 w-4 text-warning" />;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "successful":
      return <Badge className="bg-success/10 text-success border-success/20">Successful</Badge>;
    case "declined":
      return <Badge variant="destructive">Declined</Badge>;
    case "failed":
      return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Failed</Badge>;
    default:
      return <Badge className="bg-warning/10 text-warning border-warning/20">Pending</Badge>;
  }
};

export default function WalletPage() {
  const { data: cards, isLoading: cardsLoading } = useLinkedCards();
  const { data: withdrawals, isLoading: withdrawalsLoading } = useWithdrawals();
  const deleteCard = useDeleteLinkedCard();
  const [showLinkCard, setShowLinkCard] = useState(false);

  const getCardIcon = (type: string | null) => {
    const cardType = type?.toLowerCase() || "visa";
    if (cardType === "mastercard") {
      return "💳";
    }
    return "💳";
  };

  return (
    <SubPageLayout title="Wallet">
      <Tabs defaultValue="cards" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="cards">Linked Cards</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
        </TabsList>

        <TabsContent value="cards" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-muted-foreground">
              {cards?.length || 0} card{(cards?.length || 0) !== 1 ? "s" : ""} linked
            </p>
            <Button size="sm" onClick={() => setShowLinkCard(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Add Card
            </Button>
          </div>

          {cardsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : cards && cards.length > 0 ? (
            <div className="space-y-3">
              {cards.map((card, index) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-8 rounded bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-lg">
                            {getCardIcon(card.card_type)}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              •••• •••• •••• {card.last_four}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {card.card_holder_name} · Expires {card.expiry_month}/{card.expiry_year}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {card.is_primary && (
                            <Badge variant="secondary" className="text-xs">Primary</Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => deleteCard.mutate(card.id)}
                            disabled={deleteCard.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">No cards linked yet</p>
                <Button onClick={() => setShowLinkCard(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Link Your First Card
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="withdrawals" className="space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
            {withdrawals?.length || 0} withdrawal request{(withdrawals?.length || 0) !== 1 ? "s" : ""}
          </p>

          {withdrawalsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : withdrawals && withdrawals.length > 0 ? (
            <div className="space-y-3">
              {withdrawals.map((withdrawal, index) => (
                <motion.div
                  key={withdrawal.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-foreground" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{withdrawal.bank_name}</p>
                            <p className="text-xs text-muted-foreground">
                              Account ending in ••••{withdrawal.account_number.slice(-4)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-foreground">${Number(withdrawal.amount).toFixed(2)}</p>
                          {getStatusBadge(withdrawal.status)}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3">
                        <div className="flex items-center gap-1">
                          {getStatusIcon(withdrawal.status)}
                          <span className="capitalize">{withdrawal.status}</span>
                        </div>
                        <span>{format(new Date(withdrawal.created_at), "MMM d, yyyy 'at' h:mm a")}</span>
                      </div>
                      {withdrawal.admin_notes && (
                        <div className="mt-3 p-2 bg-muted rounded-lg">
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium">Note:</span> {withdrawal.admin_notes}
                          </p>
                        </div>
                      )}
                      {withdrawal.processed_at && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Processed: {format(new Date(withdrawal.processed_at), "MMM d, yyyy")}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No withdrawal requests yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Use the Transfer button on your dashboard to withdraw funds
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <LinkCardDialog open={showLinkCard} onOpenChange={setShowLinkCard} />
    </SubPageLayout>
  );
}
