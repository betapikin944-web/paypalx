import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLinkCard, useLinkedCards } from "@/hooks/useLinkedCards";
import { CreditCard, Check, Trash2 } from "lucide-react";
import { useDeleteLinkedCard } from "@/hooks/useLinkedCards";

interface LinkCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LinkCardDialog({ open, onOpenChange }: LinkCardDialogProps) {
  const [cardHolderName, setCardHolderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [showForm, setShowForm] = useState(false);

  const { data: linkedCards, isLoading } = useLinkedCards();
  const linkCard = useLinkCard();
  const deleteCard = useDeleteLinkedCard();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await linkCard.mutateAsync({
      cardHolderName,
      cardNumber: cardNumber.replace(/\s/g, ""),
      expiryMonth,
      expiryYear,
    });

    // Reset form
    setCardHolderName("");
    setCardNumber("");
    setExpiryMonth("");
    setExpiryYear("");
    setShowForm(false);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(" ");
    } else {
      return value;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Add Money - Link Card
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Existing Cards */}
          {!isLoading && linkedCards && linkedCards.length > 0 && !showForm && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Your linked cards:</p>
              {linkedCards.map((card) => (
                <div
                  key={card.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-6 bg-gradient-to-br from-[#003087] to-[#0070BA] rounded flex items-center justify-center">
                      <CreditCard className="h-3 w-3 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        •••• {card.last_four}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {card.card_holder_name} • {card.expiry_month}/{card.expiry_year}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteCard.mutate(card.id)}
                    disabled={deleteCard.isPending}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Add New Card Button or Form */}
          {!showForm ? (
            <Button
              onClick={() => setShowForm(true)}
              className="w-full"
              variant="outline"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Link a New Card
            </Button>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardHolderName">Cardholder Name</Label>
                <Input
                  id="cardHolderName"
                  placeholder="John Doe"
                  value={cardHolderName}
                  onChange={(e) => setCardHolderName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  maxLength={19}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryMonth">Expiry Month</Label>
                  <Input
                    id="expiryMonth"
                    placeholder="MM"
                    value={expiryMonth}
                    onChange={(e) => setExpiryMonth(e.target.value.slice(0, 2))}
                    maxLength={2}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiryYear">Expiry Year</Label>
                  <Input
                    id="expiryYear"
                    placeholder="YY"
                    value={expiryYear}
                    onChange={(e) => setExpiryYear(e.target.value.slice(0, 2))}
                    maxLength={2}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={linkCard.isPending}
                  className="flex-1"
                >
                  {linkCard.isPending ? "Linking..." : "Link Card"}
                </Button>
              </div>
            </form>
          )}

          {linkedCards && linkedCards.length > 0 && !showForm && (
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <Check className="h-4 w-4 text-green-600" />
              <p className="text-sm text-muted-foreground">
                You can add money from your linked cards
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
