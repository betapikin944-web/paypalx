import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  User,
  CreditCard,
  Building2,
  Edit2,
  Save,
  X,
  Key,
  Mail,
  Phone,
  Calendar,
  Shield,
} from 'lucide-react';

interface UserDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
  linkedCards: any[];
  withdrawals: any[];
}

export function UserDetailsDialog({
  open,
  onOpenChange,
  user,
  linkedCards,
  withdrawals,
}: UserDetailsDialogProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    display_name: user?.display_name || '',
    phone_number: user?.phone_number || '',
    email: user?.email || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: editForm.display_name || null,
          phone_number: editForm.phone_number || null,
          email: editForm.email || null,
        })
        .eq('user_id', user.user_id);

      if (error) throw error;

      toast.success('Profile updated successfully');
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (!user?.email) {
      toast.error('User does not have an email address');
      return;
    }

    setIsResettingPassword(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast.success(`Password reset email sent to ${user.email}`);
    } catch (error) {
      console.error('Error sending reset email:', error);
      toast.error('Failed to send password reset email');
    } finally {
      setIsResettingPassword(false);
    }
  };

  if (!user) return null;

  const userLinkedCards = linkedCards.filter((c) => c.user_id === user.user_id);
  const userWithdrawals = withdrawals.filter((w) => w.user_id === user.user_id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            User Details
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="cards">
              Cards ({userLinkedCards.length})
            </TabsTrigger>
            <TabsTrigger value="withdrawals">
              Banks ({userWithdrawals.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4 mt-4">
            {/* User Header */}
            <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-xl">
                  {user.display_name?.charAt(0)?.toUpperCase() ||
                    user.email?.charAt(0)?.toUpperCase() ||
                    'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-lg">
                    {user.display_name || 'Unnamed User'}
                  </h3>
                  {user.is_admin && (
                    <Badge className="bg-primary text-primary-foreground">
                      <Shield className="h-3 w-3 mr-1" />
                      Admin
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <p className="text-lg font-bold mt-1">
                  ${user.balance?.toFixed(2)} {user.currency}
                </p>
              </div>
            </div>

            {/* Edit Toggle */}
            <div className="flex justify-end">
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditForm({
                      display_name: user.display_name || '',
                      phone_number: user.phone_number || '',
                      email: user.email || '',
                    });
                    setIsEditing(true);
                  }}
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveProfile} disabled={isSaving}>
                    <Save className="h-4 w-4 mr-1" />
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              )}
            </div>

            {/* Profile Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Display Name
                </Label>
                {isEditing ? (
                  <Input
                    value={editForm.display_name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, display_name: e.target.value })
                    }
                    placeholder="Enter display name"
                  />
                ) : (
                  <p className="text-sm p-2 bg-muted/50 rounded">
                    {user.display_name || 'Not set'}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                {isEditing ? (
                  <Input
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                    placeholder="Enter email"
                  />
                ) : (
                  <p className="text-sm p-2 bg-muted/50 rounded">
                    {user.email || 'Not set'}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </Label>
                {isEditing ? (
                  <Input
                    value={editForm.phone_number}
                    onChange={(e) =>
                      setEditForm({ ...editForm, phone_number: e.target.value })
                    }
                    placeholder="Enter phone number"
                  />
                ) : (
                  <p className="text-sm p-2 bg-muted/50 rounded">
                    {user.phone_number || 'Not set'}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Member Since
                </Label>
                <p className="text-sm p-2 bg-muted/50 rounded">
                  {format(new Date(user.created_at), 'MMMM d, yyyy')}
                </p>
              </div>

              {/* Status Badges */}
              <div className="flex flex-wrap gap-2 pt-2">
                {user.is_suspended && (
                  <Badge variant="destructive">Suspended</Badge>
                )}
                {user.is_transfer_restricted && (
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                    Transfer Restricted
                  </Badge>
                )}
                {user.transfer_pin && (
                  <Badge variant="outline">PIN Set</Badge>
                )}
              </div>
            </div>

            {/* Password Reset */}
            <div className="pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleResetPassword}
                disabled={isResettingPassword || !user.email}
                className="w-full"
              >
                <Key className="h-4 w-4 mr-2" />
                {isResettingPassword
                  ? 'Sending...'
                  : 'Send Password Reset Email'}
              </Button>
              {!user.email && (
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  User must have an email to reset password
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="cards" className="space-y-3 mt-4">
            {userLinkedCards.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No linked cards
              </p>
            ) : (
              userLinkedCards.map((card) => (
                <Card key={card.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-8 bg-gradient-to-br from-[#003087] to-[#0070BA] rounded flex items-center justify-center">
                        <CreditCard className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{card.card_holder_name}</p>
                        <p className="text-sm text-muted-foreground font-mono">
                          {card.card_number}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Expires: {card.expiry_month}/{card.expiry_year}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Added: {format(new Date(card.created_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="withdrawals" className="space-y-3 mt-4">
            {userWithdrawals.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No withdrawal requests
              </p>
            ) : (
              userWithdrawals.map((withdrawal) => (
                <Card key={withdrawal.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{withdrawal.bank_name}</p>
                          <Badge
                            variant={
                              withdrawal.status === 'completed'
                                ? 'default'
                                : withdrawal.status === 'rejected'
                                ? 'destructive'
                                : 'secondary'
                            }
                          >
                            {withdrawal.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {withdrawal.account_holder_name}
                        </p>
                        <p className="text-sm font-mono">
                          ****{withdrawal.account_number.slice(-4)} | Routing:{' '}
                          {withdrawal.routing_number}
                        </p>
                        <div className="flex justify-between items-center mt-1">
                          <p className="font-semibold">
                            ${withdrawal.amount.toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(withdrawal.created_at), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
