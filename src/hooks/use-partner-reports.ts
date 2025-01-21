import { useState, useEffect } from 'react';
import { usePartners } from './use-partners';
import { useDrivers } from './use-drivers';
import { useOrganizations } from './use-organizations';
import { generatedPdfsService } from '@/lib/services/generated-pdfs';
import { useStore } from '@/lib/store';

export function usePartnerReports() {
  const [loading, setLoading] = useState(true);
  const [rawData, setRawData] = useState<any[]>([]);
  const [processedData, setProcessedData] = useState<any[]>([]);
  const { partners } = usePartners();
  const { drivers } = useDrivers();
  const { organizations } = useOrganizations();
  const { partnerDateRange } = useStore();

  // Fetch initial raw data
  useEffect(() => {
    const generateReport = async () => {
      try {
        const reportRows = await Promise.all(
          partners.map(async (partner) => {
            // Get all drivers for this partner
            const partnerDrivers = drivers.filter(d => 
              d.driver_parthner_uid === partner.uid
            );

            // Get all organizations for this partner
            const partnerOrgs = organizations.filter(org => 
              org.parthner_uid === partner.uid
            );
            
            // Calculate total balance
            const totalBalance = partnerDrivers.reduce((sum, driver) => 
              sum + (driver.balance || 0), 0
            );

            // Get all EPLs for this partner's drivers
            const allEpls = await Promise.all(
              partnerDrivers.map(driver => 
                generatedPdfsService.getByDriverId(driver.id)
              )
            );
            const epls = allEpls.flat();

            // Calculate EPL statistics
            const totalEplAmount = epls.reduce((sum, epl) => {
              const price = epl.eplPrice || 0;
              return sum + price;
            }, 0);

            return {
              'Партнер': partner.display_name,
              'Email': partner.email,
              'Баланс': totalBalance,
              'Количество водителей': partnerDrivers.length,
              'Количество организаций': partnerOrgs.length,
              'Количество ЭПЛ': epls.length,
              'Цена ЭПЛ': partner.epl_price || 0,
              'Сумма выпущенных ЭПЛ': totalEplAmount,
              id: partner.id,
              epls: epls,
            };
          })
        );

        setRawData(reportRows);
      } catch (error) {
        console.error('Error generating partner report:', error);
      } finally {
        setLoading(false);
      }
    };

    generateReport();
  }, [partners, drivers, organizations]);

  // Process data with date range
  useEffect(() => {
    const processData = async () => {
      let filteredData = [...rawData];

      // Apply date range filter
      if (partnerDateRange.from || partnerDateRange.to) {
        filteredData = filteredData.map(row => {
          const processedRow = { ...row };
          const filteredEpls = row.epls.filter(epl => {
            const eplDate = new Date(epl.created_time.seconds * 1000);
            const fromDate = partnerDateRange.from ? new Date(partnerDateRange.from) : null;
            const toDate = partnerDateRange.to ? new Date(partnerDateRange.to) : null;
            
            if (fromDate && eplDate < fromDate) return false;
            if (toDate && eplDate > toDate) return false;
            return true;
          });
          
          const totalEplAmount = filteredEpls.reduce((sum, epl) => {
            const price = epl.eplPrice || 0;
            return sum + price;
          }, 0);

          const avgEplPrice = filteredEpls.length > 0 ? 
            totalEplAmount / filteredEpls.length : 
            0;
          
          return {
            ...processedRow,
            'Количество ЭПЛ': filteredEpls.length,
            'Сумма выпущенных ЭПЛ': totalEplAmount,
            'Средняя цена ЭПЛ': avgEplPrice,
          };
        });
      }

      setProcessedData(filteredData);
    };

    processData();
  }, [rawData, partnerDateRange]);

  return {
    loading,
    reportData: processedData,
  };
}