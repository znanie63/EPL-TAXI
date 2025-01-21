import { useEffect } from 'react';
import { useStore } from '@/lib/store';
import { reportsService } from '@/lib/services/reports';
import { useToast } from '@/hooks/use-toast';
import type { SavedReport, SavedReportData } from '@/lib/types';
import { useProfile } from './use-profile';

export function useSavedReports() {
  const { savedReports, setSavedReports } = useStore();
  const { toast } = useToast();
  const { profile } = useProfile();

  useEffect(() => {
    if (!profile) return;

    let unsubscribe: (() => void) | undefined;

    const setupSubscription = async () => {
      try {
        const unsubscribePromise = await reportsService.subscribeToReports((data) => {
          setSavedReports(data);
        });
        unsubscribe = unsubscribePromise;
      } catch (err) {
        toast({
          title: "Ошибка загрузки",
          description: "Не удалось загрузить список сохраненных отчетов",
          variant: "destructive",
        });
      }
    };

    setupSubscription();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [profile, toast, setSavedReports]);

  const saveReport = async (data: SavedReportData) => {
    if (!profile) return;

    if (profile.role !== 'Parthner') {
      toast({
        title: "Ошибка",
        description: "Только партнеры могут сохранять отчеты",
        variant: "destructive",
      });
      throw new Error('Only partners can save reports');
    }

    try {
      const reportData = {
        ...data,
        parthner_uid: profile.uid,
      };

      await reportsService.create(reportData);
      
      toast({
        title: "Успешно",
        description: "Отчет успешно сохранен",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить отчет",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteReport = async (id: string) => {
    try {
      await reportsService.delete(id);
    } catch (error) {
      throw error;
    }
  };

  return {
    savedReports,
    saveReport,
    deleteReport,
  };
}