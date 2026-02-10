import { useState } from 'react';
import { Mail, Phone, MessageCircle, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import {
  useAllSupportContacts,
  useAddSupportContact,
  useUpdateSupportContact,
  useDeleteSupportContact,
} from '@/hooks/useSupportContacts';

const contactTypeIcons = {
  email: Mail,
  phone: Phone,
  chat: MessageCircle,
};

const contactTypeLabels = {
  email: 'Email',
  phone: 'Phone',
  chat: 'Live Chat',
};

export function SupportContactsAdmin() {
  const { data: contacts, isLoading } = useAllSupportContacts();
  const addContact = useAddSupportContact();
  const updateContact = useUpdateSupportContact();
  const deleteContact = useDeleteSupportContact();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newType, setNewType] = useState<string>('email');
  const [newLabel, setNewLabel] = useState('');
  const [newValue, setNewValue] = useState('');

  const handleAdd = () => {
    if (!newLabel || !newValue) return;
    addContact.mutate(
      { contact_type: newType, label: newLabel, value: newValue },
      {
        onSuccess: () => {
          setShowAddDialog(false);
          setNewType('email');
          setNewLabel('');
          setNewValue('');
        },
      }
    );
  };

  const handleToggleActive = (id: string, currentActive: boolean) => {
    updateContact.mutate({ id, is_active: !currentActive });
  };

  return (
    <Card>
      <CardHeader className="p-3 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs">Support Contacts</CardTitle>
          <Button size="sm" className="h-7 text-[10px]" onClick={() => setShowAddDialog(true)}>
            <Plus className="h-3 w-3 mr-1" />
            Add Contact
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        {isLoading ? (
          <div className="text-center py-6">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto" />
          </div>
        ) : !contacts || contacts.length === 0 ? (
          <p className="text-center text-[10px] text-muted-foreground py-6">
            No support contacts configured. Add one to display across the site.
          </p>
        ) : (
          <div className="space-y-2">
            {contacts.map((contact) => {
              const Icon = contactTypeIcons[contact.contact_type as keyof typeof contactTypeIcons] || Mail;
              return (
                <div
                  key={contact.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-medium truncate">{contact.label}</p>
                      <Badge variant="secondary" className="text-[8px] h-4 px-1">
                        {contactTypeLabels[contact.contact_type as keyof typeof contactTypeLabels]}
                      </Badge>
                      {!contact.is_active && (
                        <Badge variant="outline" className="text-[8px] h-4 px-1 text-muted-foreground">
                          Inactive
                        </Badge>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate">{contact.value}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Switch
                      checked={contact.is_active}
                      onCheckedChange={() => handleToggleActive(contact.id, contact.is_active)}
                      className="scale-75"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => deleteContact.mutate(contact.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      {/* Add Contact Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Support Contact</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Contact Type</Label>
              <Select value={newType} onValueChange={setNewType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="chat">Live Chat Link</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Label</Label>
              <Input
                placeholder={newType === 'email' ? 'Email Support' : newType === 'phone' ? 'Phone Support' : 'WhatsApp Chat'}
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Value</Label>
              <Input
                placeholder={newType === 'email' ? 'support@example.com' : newType === 'phone' ? '+1 234 567 8900' : 'https://wa.me/1234567890'}
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={addContact.isPending || !newLabel || !newValue}>
              {addContact.isPending ? 'Adding...' : 'Add Contact'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
