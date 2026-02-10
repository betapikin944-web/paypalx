import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Camera, User, Phone, Mail, Loader2, Globe, Search, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import { SUPPORTED_CURRENCIES, getCurrencySymbol } from '@/lib/currencies';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  const queryClient = useQueryClient();

  const [displayName, setDisplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [currencySearch, setCurrencySearch] = useState('');
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [savingCurrency, setSavingCurrency] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setPhoneNumber(profile.phone_number || '');
      setSelectedCurrency(profile.preferred_currency || 'USD');
    }
  }, [profile]);

  const filteredCurrencies = SUPPORTED_CURRENCIES.filter(c =>
    c.code.toLowerCase().includes(currencySearch.toLowerCase()) ||
    c.name.toLowerCase().includes(currencySearch.toLowerCase())
  );

  const currentCurrency = SUPPORTED_CURRENCIES.find(c => c.code === selectedCurrency);

  const handleCurrencyChange = async (code: string) => {
    setSelectedCurrency(code);
    setShowCurrencyPicker(false);
    setCurrencySearch('');
    setSavingCurrency(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ preferred_currency: code })
        .eq('user_id', user!.id);
      if (error) throw error;

      const { error: balError } = await supabase
        .from('balances')
        .update({ currency: code })
        .eq('user_id', user!.id);
      if (balError) throw balError;

      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      toast.success(`Currency changed to ${code}`);
    } catch (error: any) {
      toast.error('Failed to update currency: ' + error.message);
      setSelectedCurrency(profile?.preferred_currency || 'USD');
    } finally {
      setSavingCurrency(false);
    }
  };

  const handleSave = () => {
    updateProfile.mutate({
      display_name: displayName || null,
      phone_number: phoneNumber || null,
    });
  };

  const getInitials = () => {
    if (profile?.display_name) {
      return profile.display_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background"
    >
      {/* Header */}
      <div className="bg-white border-b border-border px-4 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-xl font-semibold text-foreground">Edit Profile</h1>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Avatar Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col items-center"
        >
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt="Avatar" 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-white">{getInitials()}</span>
              )}
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg">
              <Camera className="w-4 h-4 text-white" />
            </button>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">Tap to change photo</p>
        </motion.div>

        {/* Form Fields */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="displayName" className="text-sm font-medium text-foreground">
              Display Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your name"
                className="pl-10 h-12 bg-white border-border"
              />
            </div>
          </div>

          {/* Email (read-only) */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-foreground">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="email"
                value={user?.email || ''}
                disabled
                className="pl-10 h-12 bg-muted border-border text-muted-foreground"
              />
            </div>
            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-foreground">
              Phone Number
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="pl-10 h-12 bg-white border-border"
              />
            </div>
          </div>

          {/* Preferred Currency */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">
              Preferred Currency
            </Label>
            <button
              type="button"
              onClick={() => setShowCurrencyPicker(!showCurrencyPicker)}
              className="w-full flex items-center gap-3 h-12 px-3 bg-white border border-border rounded-md hover:bg-muted/50 transition-colors"
            >
              <Globe className="w-5 h-5 text-muted-foreground" />
              <span className="flex-1 text-left text-sm">
                {currentCurrency ? `${currentCurrency.symbol} ${currentCurrency.code} — ${currentCurrency.name}` : selectedCurrency}
              </span>
              {savingCurrency ? (
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              ) : (
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showCurrencyPicker ? 'rotate-180' : ''}`} />
              )}
            </button>

            {showCurrencyPicker && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="border border-border rounded-lg overflow-hidden"
              >
                <div className="relative p-2 border-b border-border">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search currencies..."
                    value={currencySearch}
                    onChange={(e) => setCurrencySearch(e.target.value)}
                    className="pl-8 h-9"
                    autoFocus
                  />
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {filteredCurrencies.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => handleCurrencyChange(c.code)}
                      className={`w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-muted transition-colors ${
                        selectedCurrency === c.code ? 'bg-primary/10 text-primary font-medium' : ''
                      }`}
                    >
                      <span className="font-mono w-12 text-xs">{c.code}</span>
                      <span className="text-muted-foreground w-8">{c.symbol}</span>
                      <span className="flex-1 truncate">{c.name}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
            <p className="text-xs text-muted-foreground">Your balance and transactions will display in this currency</p>
          </div>
        </motion.div>

        {/* Save Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            onClick={handleSave}
            disabled={updateProfile.isPending}
            className="w-full h-12 bg-primary hover:bg-primary-dark text-white font-semibold rounded-full"
          >
            {updateProfile.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Save Changes'
            )}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
