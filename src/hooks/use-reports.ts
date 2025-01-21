import { useState, useEffect, useMemo } from 'react';
import { useDrivers } from './use-drivers';
import { useOrganizations } from './use-organizations';
import { generatedPdfsService } from '@/lib/services/generated-pdfs';
import { useProfile } from '@/hooks/use-profile';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useStore } from '@/lib/store';

interface Filter {
  field: string;
  operator: string;
  value: string;
}

export function useReports() {
  const [loading, setLoading] = useState(true);
  const [rawData, setRawData] = useState<any[]>([]);
  const [processedData, setProcessedData] = useState<any[]>([]);
  const { drivers } = useDrivers();
  const { organizations } = useOrganizations();
  const { 
    reportFilters,
    eplColumns,
    eplDateRange,
    eplShowTotals
  } = useStore();
  const { profile } = useProfile();

  // Fetch initial raw data
  useEffect(() => {
    const generateReport = async () => {
      try {
        // Filter drivers based on profile role
        let filteredDrivers = drivers;
        if (profile?.role === 'Parthner') {
          filteredDrivers = drivers.filter(d => d.driver_parthner_uid === profile.uid);
        }

        const reportRows = await Promise.all(
          filteredDrivers.map(async (driver) => {
            const epls = await generatedPdfsService.getByDriverId(driver.id);
            const organization = organizations.find(
              org => org.id === driver.organizationRef?.id
            );
            
            // Get balance history for payment type breakdown
            const balanceHistory = await getDocs(query(
              collection(db, 'balance_history'),
              where('driver_id', '==', driver.id),
              where('type', '==', 'topup')
            ));
            
            // Calculate totals by payment type
            const balanceRecords = balanceHistory.docs.map(doc => ({
              ...doc.data(),
              id: doc.id
            }));
            
            const cashTopups = balanceRecords
              .filter(record => record.payment_type === 'cash')
              .reduce((sum, record) => sum + record.amount, 0);
              
            const cardTopups = balanceRecords
              .filter(record => record.payment_type === 'card')
              .reduce((sum, record) => sum + record.amount, 0);
            
            // Get the latest EPL price from the most recent EPL
            const latestEpl = epls.sort((a, b) => 
              b.created_time.seconds - a.created_time.seconds
            )[0];
            const currentEplPrice = latestEpl?.eplPrice || driver.epl_price || 0;
            
            // Calculate total amount based on individual EPL prices
            const totalEplAmount = epls.reduce((sum, epl) => {
              const price = epl.eplPrice || currentEplPrice;
              return sum + price;
            }, 0);

            return {
              'Организация': organization?.name || 'Не указана',
              'ФИО': driver.display_name,
              'Телефон': driver.phone_number || 'Не указан',
              'Баланс': driver.balance || 0,
              'Пополнения наличными': cashTopups,
              'Пополнения картой': cardTopups,
              'Количество ЭПЛ': epls.length,
              'Цена ЭПЛ': currentEplPrice,
              'Сумма выпущенных ЭПЛ': totalEplAmount,
              balanceHistory: balanceRecords,
              id: driver.id,
              epls: epls,
            };
          })
        );

        setRawData(reportRows);
      } catch (error) {
        console.error('Error generating report:', error);
      } finally {
        setLoading(false);
      }
    };

    generateReport();
  }, [drivers, organizations, profile]);

  // Process data with filters and date range
  useEffect(() => {
    const processData = () => {
      let filteredData = [...rawData];

      // Apply date range filter
      if (eplDateRange.from || eplDateRange.to) {
        filteredData = filteredData.map(row => {
          // Filter EPLs by date
          const processedRow = { ...row };
          const filteredEpls = row.epls.filter(epl => {
            const eplDate = new Date(epl.created_time.seconds * 1000);
            const fromDate = eplDateRange.from ? new Date(eplDateRange.from) : null;
            const toDate = eplDateRange.to ? new Date(eplDateRange.to) : null;
            
            if (fromDate && eplDate < fromDate) return false;
            if (toDate) {
              const endOfDay = new Date(toDate);
              endOfDay.setHours(23, 59, 59, 999);
              if (eplDate > endOfDay) return false;
            }
            return true;
          });
          
          // Filter existing balance history by date
          const balanceHistory = row.balanceHistory || [];
          
          // Filter balance records by date
          const filteredHistory = balanceHistory.filter(record => {
            const recordDate = new Date(record.created_time.seconds * 1000);
            const fromDate = eplDateRange.from ? new Date(eplDateRange.from) : null;
            const toDate = eplDateRange.to ? new Date(eplDateRange.to) : null;
            
            if (fromDate && recordDate < fromDate) return false;
            if (toDate) {
              const endOfDay = new Date(toDate);
              endOfDay.setHours(23, 59, 59, 999);
              if (recordDate > endOfDay) return false;
            }
            return true;
          });
          
          // Calculate totals by payment type for filtered period
          const cashTopups = filteredHistory
            .filter(record => record.type === 'topup' && record.payment_type === 'cash')
            .reduce((sum, record) => sum + record.amount, 0);
            
          const cardTopups = filteredHistory
            .filter(record => record.type === 'topup' && record.payment_type === 'card')
            .reduce((sum, record) => sum + record.amount, 0);
          
          const currentEplPrice = row['Цена ЭПЛ'];
          const totalEplAmount = filteredEpls.length * currentEplPrice;
          
          return {
            ...processedRow,
            'Пополнения наличными': cashTopups,
            'Пополнения картой': cardTopups,
            'Количество ЭПЛ': filteredEpls.length,
            'Цена ЭПЛ': currentEplPrice,
            'Сумма выпущенных ЭПЛ': totalEplAmount,
          };
        });
      }

      // Apply filters
      // Apply filters sequentially with conditions
      if (reportFilters.length > 0) {
        filteredData = filteredData.filter(row => {
          let result = true;
          
          reportFilters.forEach((filter, index) => {
            if (!filter.field || !filter.operator) return;
            
            const condition = index > 0 ? filter.condition || 'and' : null;
            let matches = false;
              
            // Get field value and convert to lowercase for text comparison
            const fieldValue = String(row[filter.field]).toLowerCase();
            const filterValue = filter.value ? String(filter.value).toLowerCase() : '';
            const filterValue2 = filter.value2 ? String(filter.value2).toLowerCase() : '';
            
            // Handle empty/not empty operators
            if (filter.operator === 'empty') {
              matches = !fieldValue || fieldValue === '';
            } else if (filter.operator === 'not_empty') {
              matches = fieldValue && fieldValue !== '';
            }
            // Handle numeric operators
            else if (typeof row[filter.field] === 'number') {
              const numValue = Number(filterValue);
              const numValue2 = Number(filterValue2);
              const numFieldValue = row[filter.field];

              switch (filter.operator) {
                case 'eq':
                  matches = numFieldValue === numValue;
                  break;
                case 'neq':
                  matches = numFieldValue !== numValue;
                  break;
                case 'gt':
                  matches = numFieldValue > numValue;
                  break;
                case 'gte':
                  matches = numFieldValue >= numValue;
                  break;
                case 'lt':
                  matches = numFieldValue < numValue;
                  break;
                case 'lte':
                  matches = numFieldValue <= numValue;
                  break;
                case 'between':
                  matches = numFieldValue >= numValue && numFieldValue <= numValue2;
                  break;
              }
            }
            // Handle text operators
            else {
              switch (filter.operator) {
                case 'eq':
                  matches = fieldValue === filterValue;
                  break;
                case 'neq':
                  matches = fieldValue !== filterValue;
                  break;
                case 'contains':
                  matches = fieldValue.includes(filterValue);
                  break;
                case 'not_contains':
                  matches = !fieldValue.includes(filterValue);
                  break;
              }
            }
            
            // Apply condition
            if (condition === 'or') {
              result = result || matches;
            } else {
              result = result && matches;
            }
          });
          
          return result;
        });
      }

      // Apply column selection
      if (eplColumns.length > 0) {
        filteredData = filteredData.map(row => {
          const filteredRow: any = {};
          eplColumns.forEach(column => {
            filteredRow[column] = row[column];
          });
          return filteredRow;
        });
      }


      setProcessedData(filteredData);
    };

    processData();
  }, [rawData, reportFilters, eplColumns, eplDateRange]);

  // Get unique values for filter dropdowns
  const getFieldValues = (field: string) => {
    // Special handling for organizations
    if (field === 'Организация') {
      return organizations.map(org => org.name).sort();
    }
    // Default handling for other fields
    return Array.from(new Set(rawData.map(row => String(row[field])))).sort();
  };

  return {
    loading,
    reportData: processedData,
    getFieldValues,
    rawData
  };
}