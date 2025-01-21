import { useState, useEffect } from 'react';
import { usersService } from '@/lib/services/users';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useStore } from '@/lib/store';
import type { User } from '@/lib/types';

interface ProfileUpdateData extends Partial<User> {
  photo_url?: string;
}

export function useProfile() {
  const { profile, setProfile } = useStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user: authUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const loadProfile = async () => {
      // If profile is already cached, just finish loading
      if (profile) {
        setLoading(false);
        return;
      }

      if (!authUser?.uid) return;

      try {
        const users = await usersService.getAll();
        const userProfile = users.find(u => u.uid === authUser.uid);
        
        if (userProfile) {
          setProfile(userProfile);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch profile'));
        toast({
          title: "Ошибка загрузки",
          description: "Не удалось загрузить профиль",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [authUser?.uid, toast, profile, setProfile]);

  const updateProfile = async (data: ProfileUpdateData) => {
    if (!profile?.id) return;

    try {
      await usersService.update(profile.id, data);
      // Update local state immediately after successful API update
      setProfile(prev => prev ? { ...prev, ...data } : null);
      
      toast({
        title: "Успешно",
        description: "Профиль обновлен",
      });
    } catch (err) {
      // Revert local state if API update fails
      setProfile(profile);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить профиль",
        variant: "destructive",
      });
      throw err;
    }
  };

  return {
    profile,
    loading,
    error,
    updateProfile,
    setProfile,
  };
}