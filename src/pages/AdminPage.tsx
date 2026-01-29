import { useState } from 'react';
import { ArrowLeft, Users, DollarSign, ArrowUpDown, Search, Edit2, Check, X, Plus, Ban, Lock, AlertTriangle, Shield, ShieldCheck, ShieldOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAllUsers, useAllTransactions, useIsAdmin } from '@/hooks/useAdmin';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { format } from 'date-fns';

const AdminPage = () => {
  const navigate = useNavigate();
  const { user: adminUser } = useAuth();
  const { data: users, isLoading: usersLoading } = useAllUsers();
  const { data: transactions, isLoading: transactionsLoading } = useAllTransactions();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editBalance, setEditBalance] = useState('');
  
  // Add funds modal state
  const [addFundsModal, setAddFundsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [addAmount, setAddAmount] = useState('');
  const [addDescription, setAddDescription] = useState('');
  const [isAddingFunds, setIsAddingFunds] = useState(false);

  // Suspend modal state
  const [suspendModal, setSuspendModal] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [isSuspending, setIsSuspending] = useState(false);

  // PIN modal state
  const [pinModal, setPinModal] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [isSettingPin, setIsSettingPin] = useState(false);

  // Restriction modal state  
  const [restrictModal, setRestrictModal] = useState(false);
  const [restrictionMessage, setRestrictionMessage] = useState('');
  const [isRestricting, setIsRestricting] = useState(false);

  // Promote admin modal state
  const [promoteModal, setPromoteModal] = useState(false);
  const [isPromoting, setIsPromoting] = useState(false);

  // Filter users
  const filteredUsers = users?.filter(user => {
    if (!searchTerm.trim()) return true;
    const search = searchTerm.toLowerCase();
    const name = user.display_name?.toLowerCase() || '';
    const phone = user.phone_number || '';
    const email = (user as any).email?.toLowerCase() || '';
    const id = user.user_id.toLowerCase();
    return name.includes(search) || phone.includes(search) || email.includes(search) || id.includes(search);
  });

  const handleEditBalance = (userId: string, currentBalance: number) => {
    setEditingUserId(userId);
    setEditBalance(currentBalance.toString());
  };

  const handleSaveBalance = async (userId: string) => {
    const newAmount = parseFloat(editBalance);
    if (isNaN(newAmount) || newAmount < 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const { error } = await supabase
      .from('balances')
      .update({ amount: newAmount })
      .eq('user_id', userId);

    if (error) {
      toast.error('Failed to update balance');
      console.error(error);
    } else {
      toast.success('Balance updated successfully');
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    }
    setEditingUserId(null);
  };

  const openAddFundsModal = (user: any) => {
    setSelectedUser(user);
    setAddAmount('');
    setAddDescription('Admin deposit');
    setAddFundsModal(true);
  };

  const handleAddFunds = async () => {
    if (!selectedUser || !adminUser) return;
    
    const amount = parseFloat(addAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount greater than 0');
      return;
    }

    setIsAddingFunds(true);
    try {
      const newBalance = selectedUser.balance + amount;
      const { error: balanceError } = await supabase
        .from('balances')
        .update({ amount: newBalance })
        .eq('user_id', selectedUser.user_id);

      if (balanceError) throw balanceError;

      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          sender_id: adminUser.id,
          recipient_id: selectedUser.user_id,
          amount: amount,
          description: addDescription || 'Admin deposit',
          status: 'completed',
          currency: 'USD'
        });

      if (transactionError) throw transactionError;

      toast.success(`Successfully added $${amount.toFixed(2)} to ${selectedUser.display_name || selectedUser.email || 'user'}'s account`);
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      queryClient.invalidateQueries({ queryKey: ['allTransactions'] });
      setAddFundsModal(false);
    } catch (error) {
      console.error('Error adding funds:', error);
      toast.error('Failed to add funds');
    } finally {
      setIsAddingFunds(false);
    }
  };

  // Suspend/Unsuspend user
  const openSuspendModal = (user: any) => {
    setSelectedUser(user);
    setSuspendReason(user.suspension_reason || '');
    setSuspendModal(true);
  };

  const handleToggleSuspend = async () => {
    if (!selectedUser) return;
    
    setIsSuspending(true);
    try {
      const isSuspended = !(selectedUser as any).is_suspended;
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_suspended: isSuspended,
          suspension_reason: isSuspended ? suspendReason : null
        })
        .eq('user_id', selectedUser.user_id);

      if (error) throw error;

      toast.success(isSuspended ? 'Account suspended' : 'Account unsuspended');
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      setSuspendModal(false);
    } catch (error) {
      console.error('Error updating suspension:', error);
      toast.error('Failed to update account status');
    } finally {
      setIsSuspending(false);
    }
  };

  // Set Transfer PIN
  const openPinModal = (user: any) => {
    setSelectedUser(user);
    setNewPin('');
    setPinModal(true);
  };

  const handleSetPin = async () => {
    if (!selectedUser) return;
    
    if (newPin && (newPin.length < 4 || newPin.length > 6 || !/^\d+$/.test(newPin))) {
      toast.error('PIN must be 4-6 digits');
      return;
    }

    setIsSettingPin(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ transfer_pin: newPin || null })
        .eq('user_id', selectedUser.user_id);

      if (error) throw error;

      toast.success(newPin ? 'Transfer PIN set' : 'Transfer PIN removed');
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      setPinModal(false);
    } catch (error) {
      console.error('Error setting PIN:', error);
      toast.error('Failed to set PIN');
    } finally {
      setIsSettingPin(false);
    }
  };

  // Restrict transfers
  const openRestrictModal = (user: any) => {
    setSelectedUser(user);
    setRestrictionMessage((user as any).transfer_restriction_message || '');
    setRestrictModal(true);
  };

  const handleToggleRestriction = async () => {
    if (!selectedUser) return;
    
    setIsRestricting(true);
    try {
      const isRestricted = !(selectedUser as any).is_transfer_restricted;
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_transfer_restricted: isRestricted,
          transfer_restriction_message: isRestricted ? restrictionMessage : null
        })
        .eq('user_id', selectedUser.user_id);

      if (error) throw error;

      toast.success(isRestricted ? 'Transfer restricted' : 'Transfer restriction removed');
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      setRestrictModal(false);
    } catch (error) {
      console.error('Error updating restriction:', error);
      toast.error('Failed to update restriction');
    } finally {
      setIsRestricting(false);
    }
  };

  // Promote/Demote admin
  const openPromoteModal = (user: any) => {
    setSelectedUser(user);
    setPromoteModal(true);
  };

  const handleToggleAdmin = async () => {
    if (!selectedUser) return;
    
    setIsPromoting(true);
    try {
      if ((selectedUser as any).is_admin) {
        // Demote: Remove admin role
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', selectedUser.user_id)
          .eq('role', 'admin');

        if (error) throw error;
        toast.success('Admin privileges removed');
      } else {
        // Promote: Add admin role
        const { error } = await supabase
          .from('user_roles')
          .insert({
            user_id: selectedUser.user_id,
            role: 'admin'
          });

        if (error) throw error;
        toast.success('User promoted to admin');
      }
      
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      setPromoteModal(false);
    } catch (error) {
      console.error('Error updating admin status:', error);
      toast.error('Failed to update admin status');
    } finally {
      setIsPromoting(false);
    }
  };

  const totalBalance = users?.reduce((sum, user) => sum + (user.balance || 0), 0) || 0;
  const totalTransactions = transactions?.length || 0;
  const totalVolume = transactions?.reduce((sum, t) => sum + t.amount, 0) || 0;

  const getUserName = (userId: string | null) => {
    if (!userId) return 'System';
    const user = users?.find(u => u.user_id === userId);
    return user?.display_name || user?.email || userId.slice(0, 8) + '...';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-primary-foreground hover:bg-primary/80"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <h1 className="text-xl font-semibold">Admin Dashboard</h1>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6 pb-24">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-6 w-6 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold">{users?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Users</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <DollarSign className="h-6 w-6 mx-auto text-emerald-600 mb-2" />
              <p className="text-2xl font-bold">${totalBalance.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground">Total Balance</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <ArrowUpDown className="h-6 w-6 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold">{totalTransactions}</p>
              <p className="text-xs text-muted-foreground">Transactions</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Users List */}
            {usersLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : !filteredUsers || filteredUsers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No users found</p>
            ) : (
              <div className="space-y-3">
                {filteredUsers.map((user) => (
                  <Card key={user.id} className={(user as any).is_suspended ? 'border-destructive/50 bg-destructive/5' : ''}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.avatar_url || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {user.display_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium truncate">
                              {user.display_name || user.email?.split('@')[0] || 'Unnamed User'}
                            </p>
                            {(user as any).is_admin && (
                              <Badge className="text-xs bg-primary text-primary-foreground">
                                <ShieldCheck className="h-3 w-3 mr-1" />
                                Admin
                              </Badge>
                            )}
                            {(user as any).is_suspended && (
                              <Badge variant="destructive" className="text-xs">Suspended</Badge>
                            )}
                            {(user as any).is_transfer_restricted && (
                              <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800">Restricted</Badge>
                            )}
                            {(user as any).transfer_pin && (
                              <Badge variant="outline" className="text-xs">PIN Set</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {user.email || user.phone_number || user.user_id.slice(0, 8) + '...'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Joined {format(new Date(user.created_at), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>

                      {/* Balance Section */}
                      <div className="mt-3 pt-3 border-t border-border">
                        <div className="flex items-center justify-between">
                          <div>
                            {editingUserId === user.user_id ? (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">$</span>
                                <Input
                                  type="number"
                                  value={editBalance}
                                  onChange={(e) => setEditBalance(e.target.value)}
                                  className="w-24 h-8 text-right"
                                  autoFocus
                                />
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-emerald-600"
                                  onClick={() => handleSaveBalance(user.user_id)}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-destructive"
                                  onClick={() => setEditingUserId(null)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-lg">${user.balance?.toFixed(2)}</p>
                                <Badge variant="secondary" className="text-xs">{user.currency}</Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-3 grid grid-cols-4 gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                          onClick={() => openAddFundsModal(user)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditBalance(user.user_id, user.balance)}
                        >
                          <Edit2 className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-amber-600 border-amber-200 hover:bg-amber-50"
                          onClick={() => openRestrictModal(user)}
                        >
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {(user as any).is_transfer_restricted ? 'Unrestr' : 'Restrict'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className={(user as any).is_suspended ? 'text-emerald-600 border-emerald-200' : 'text-destructive border-destructive/30'}
                          onClick={() => openSuspendModal(user)}
                        >
                          <Ban className="h-3 w-3 mr-1" />
                          {(user as any).is_suspended ? 'Activate' : 'Suspend'}
                        </Button>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          onClick={() => openPinModal(user)}
                        >
                          <Lock className="h-3 w-3 mr-1" />
                          {(user as any).transfer_pin ? 'Change PIN' : 'Set Transfer PIN'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className={(user as any).is_admin ? 'text-destructive border-destructive/30' : 'text-primary border-primary/30'}
                          onClick={() => openPromoteModal(user)}
                        >
                          {(user as any).is_admin ? (
                            <>
                              <ShieldOff className="h-3 w-3 mr-1" />
                              Demote
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="h-3 w-3 mr-1" />
                              Make Admin
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Transactions</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Total volume: ${totalVolume.toFixed(2)}
                </p>
              </CardHeader>
              <CardContent>
                {transactionsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  </div>
                ) : !transactions || transactions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No transactions yet</p>
                ) : (
                  <div className="space-y-3">
                    {transactions.map((transaction) => (
                      <div 
                        key={transaction.id} 
                        className="flex items-center justify-between py-3 border-b last:border-0"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {transaction.description || 'Transfer'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            From: {getUserName(transaction.sender_id)} → To: {getUserName(transaction.recipient_id)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(transaction.created_at), 'MMM d, yyyy h:mm a')}
                          </p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {transaction.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            ${transaction.amount.toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {transaction.currency}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Funds Dialog */}
      <Dialog open={addFundsModal} onOpenChange={setAddFundsModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Funds</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {selectedUser?.display_name?.charAt(0)?.toUpperCase() || selectedUser?.email?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{selectedUser?.display_name || selectedUser?.email || 'Unnamed User'}</p>
                <p className="text-sm text-muted-foreground">
                  Current balance: ${selectedUser?.balance?.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount to Add ($)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Admin deposit"
                value={addDescription}
                onChange={(e) => setAddDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddFundsModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddFunds} disabled={isAddingFunds}>
              {isAddingFunds ? 'Adding...' : 'Add Funds'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend Dialog */}
      <Dialog open={suspendModal} onOpenChange={setSuspendModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{(selectedUser as any)?.is_suspended ? 'Unsuspend Account' : 'Suspend Account'}</DialogTitle>
            <DialogDescription>
              {(selectedUser as any)?.is_suspended 
                ? 'This will reactivate the user account and allow them to use the platform.'
                : 'Suspending will prevent the user from sending or receiving money.'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {selectedUser?.display_name?.charAt(0)?.toUpperCase() || selectedUser?.email?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{selectedUser?.display_name || selectedUser?.email || 'Unnamed User'}</p>
                <p className="text-sm text-muted-foreground">{selectedUser?.email}</p>
              </div>
            </div>
            {!(selectedUser as any)?.is_suspended && (
              <div className="space-y-2">
                <Label htmlFor="suspendReason">Reason for Suspension</Label>
                <Textarea
                  id="suspendReason"
                  placeholder="Enter reason for suspension..."
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  rows={3}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspendModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleToggleSuspend} 
              disabled={isSuspending}
              variant={(selectedUser as any)?.is_suspended ? 'default' : 'destructive'}
            >
              {isSuspending ? 'Processing...' : ((selectedUser as any)?.is_suspended ? 'Unsuspend' : 'Suspend Account')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PIN Dialog */}
      <Dialog open={pinModal} onOpenChange={setPinModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Transfer PIN</DialogTitle>
            <DialogDescription>
              Set a 4-6 digit PIN that the user must enter before sending money.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {selectedUser?.display_name?.charAt(0)?.toUpperCase() || selectedUser?.email?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{selectedUser?.display_name || selectedUser?.email || 'Unnamed User'}</p>
                <p className="text-sm text-muted-foreground">
                  {(selectedUser as any)?.transfer_pin ? 'Current PIN: ****' : 'No PIN set'}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPin">New PIN (4-6 digits)</Label>
              <Input
                id="newPin"
                type="password"
                placeholder="Enter PIN..."
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
              />
              <p className="text-xs text-muted-foreground">Leave empty to remove PIN</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPinModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSetPin} disabled={isSettingPin}>
              {isSettingPin ? 'Saving...' : (newPin ? 'Set PIN' : 'Remove PIN')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restriction Dialog */}
      <Dialog open={restrictModal} onOpenChange={setRestrictModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{(selectedUser as any)?.is_transfer_restricted ? 'Remove Transfer Restriction' : 'Restrict Transfers'}</DialogTitle>
            <DialogDescription>
              {(selectedUser as any)?.is_transfer_restricted 
                ? 'This will allow the user to send money again.'
                : 'The user will see this message when they try to send money.'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {selectedUser?.display_name?.charAt(0)?.toUpperCase() || selectedUser?.email?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{selectedUser?.display_name || selectedUser?.email || 'Unnamed User'}</p>
                <p className="text-sm text-muted-foreground">{selectedUser?.email}</p>
              </div>
            </div>
            {!(selectedUser as any)?.is_transfer_restricted && (
              <div className="space-y-2">
                <Label htmlFor="restrictionMessage">Restriction Message</Label>
                <Textarea
                  id="restrictionMessage"
                  placeholder="Your account has been restricted. Please contact support."
                  value={restrictionMessage}
                  onChange={(e) => setRestrictionMessage(e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">This message will be shown to the user when they try to send money</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestrictModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleToggleRestriction} 
              disabled={isRestricting}
              variant={(selectedUser as any)?.is_transfer_restricted ? 'default' : 'destructive'}
            >
              {isRestricting ? 'Processing...' : ((selectedUser as any)?.is_transfer_restricted ? 'Remove Restriction' : 'Restrict Transfers')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Promote/Demote Admin Dialog */}
      <Dialog open={promoteModal} onOpenChange={setPromoteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {(selectedUser as any)?.is_admin ? (
                <>
                  <ShieldOff className="h-5 w-5 text-destructive" />
                  Remove Admin Privileges
                </>
              ) : (
                <>
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  Promote to Admin
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {(selectedUser as any)?.is_admin 
                ? 'This will remove admin privileges from this user.'
                : 'This will grant admin privileges to this user, allowing them to manage all users and transactions.'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {selectedUser?.display_name?.charAt(0)?.toUpperCase() || selectedUser?.email?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{selectedUser?.display_name || selectedUser?.email || 'Unnamed User'}</p>
                <p className="text-sm text-muted-foreground">{selectedUser?.email}</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPromoteModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleToggleAdmin} 
              disabled={isPromoting}
              variant={(selectedUser as any)?.is_admin ? 'destructive' : 'default'}
            >
              {isPromoting ? 'Processing...' : ((selectedUser as any)?.is_admin ? 'Remove Admin' : 'Make Admin')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPage;
