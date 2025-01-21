import { useState, useEffect } from 'react';
import { generatedPdfsService } from '@/lib/services/generated-pdfs';
import { useToast } from '@/hooks/use-toast';
import type { GeneratedPdf } from '@/lib/types';

export function useEPL(driverId: string) {
  const [epls, setEpls] = useState<GeneratedPdf[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchEPLs = async () => {
      try {
        const data = await generatedPdfsService.getByDriverId(driverId);
        setEpls(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch EPLs'));
        toast({
          title: "Ошибка загрузки",
          description: "Не удалось загрузить список ЭПЛ",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (driverId) {
      fetchEPLs();
    }
  }, [driverId, toast]);

  return {
    epls,
    loading,
    error,
  };
}