'use client';

import Settings from '@/components/Settings';
import { useAuth } from '@/context/AuthContext';

export default function SettingsPage() {
  const { token } = useAuth();
  return token ? <Settings token={token} /> : null;
} 