import { useState } from "react";
import { Package, Truck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePhysicalCardRequest, PhysicalCardRequest } from "@/hooks/usePhysicalCardRequest";

interface PhysicalCardRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cardId: string;
  cardHolderName: string;
}

export function PhysicalCardRequestDialog({
  open,
  onOpenChange,
  cardId,
  cardHolderName,
}: PhysicalCardRequestDialogProps) {
  const { latestRequest, hasPendingRequest, requestPhysicalCard, isRequesting } = usePhysicalCardRequest();
  
  const [formData, setFormData] = useState({
    full_name: cardHolderName,
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    requestPhysicalCard({
      card_id: cardId,
      ...formData,
    });
    onOpenChange(false);
  };

  const getStatusStep = (status: string) => {
    switch (status) {
      case 'pending':
      case 'processing':
        return 1;
      case 'shipped':
        return 2;
      case 'delivered':
        return 3;
      default:
        return 0;
    }
  };

  // Show request status if there's a pending request
  if (hasPendingRequest && latestRequest) {
    const step = getStatusStep(latestRequest.status);
    
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Physical Card Status</DialogTitle>
            <DialogDescription>
              Track your physical card delivery
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6">
            {/* Status Timeline */}
            <div className="flex items-center justify-between mb-8">
              <StatusStep 
                icon={Package} 
                label="Processing" 
                active={step >= 1} 
                complete={step > 1}
              />
              <div className={`flex-1 h-1 mx-2 ${step > 1 ? 'bg-primary' : 'bg-muted'}`} />
              <StatusStep 
                icon={Truck} 
                label="Shipped" 
                active={step >= 2} 
                complete={step > 2}
              />
              <div className={`flex-1 h-1 mx-2 ${step > 2 ? 'bg-primary' : 'bg-muted'}`} />
              <StatusStep 
                icon={CheckCircle2} 
                label="Delivered" 
                active={step >= 3} 
                complete={step >= 3}
              />
            </div>

            {/* Shipping Details */}
            <div className="p-4 rounded-xl bg-muted space-y-2">
              <p className="text-sm font-medium text-foreground">{latestRequest.full_name}</p>
              <p className="text-sm text-muted-foreground">{latestRequest.address_line1}</p>
              {latestRequest.address_line2 && (
                <p className="text-sm text-muted-foreground">{latestRequest.address_line2}</p>
              )}
              <p className="text-sm text-muted-foreground">
                {latestRequest.city}, {latestRequest.state} {latestRequest.postal_code}
              </p>
              {latestRequest.tracking_number && (
                <p className="text-sm font-medium text-primary mt-3">
                  Tracking: {latestRequest.tracking_number}
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request Physical Card</DialogTitle>
          <DialogDescription>
            Get a physical card mailed to your address. Free shipping!
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <Input
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="John Doe"
              className="h-12 rounded-xl"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Address Line 1</label>
            <Input
              value={formData.address_line1}
              onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
              placeholder="123 Main Street"
              className="h-12 rounded-xl"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Address Line 2 (Optional)</label>
            <Input
              value={formData.address_line2}
              onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
              placeholder="Apt 4B"
              className="h-12 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">City</label>
              <Input
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="New York"
                className="h-12 rounded-xl"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">State</label>
              <Input
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="NY"
                className="h-12 rounded-xl"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">ZIP Code</label>
            <Input
              value={formData.postal_code}
              onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
              placeholder="10001"
              className="h-12 rounded-xl"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isRequesting}
            className="w-full h-12 bg-primary hover:bg-primary-light text-primary-foreground rounded-full font-semibold mt-4"
          >
            {isRequesting ? 'Submitting...' : 'Request Physical Card'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface StatusStepProps {
  icon: React.ElementType;
  label: string;
  active: boolean;
  complete: boolean;
}

function StatusStep({ icon: Icon, label, active, complete }: StatusStepProps) {
  return (
    <div className="flex flex-col items-center">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
        complete ? 'bg-primary text-primary-foreground' : 
        active ? 'bg-primary/20 text-primary' : 
        'bg-muted text-muted-foreground'
      }`}>
        <Icon className="w-5 h-5" />
      </div>
      <span className={`text-xs mt-2 ${active ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
        {label}
      </span>
    </div>
  );
}
