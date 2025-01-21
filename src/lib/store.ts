import { create } from 'zustand';
import type { User, Organization, Employee } from '@/lib/types';

const initialState = {
  // Profile caching
  profile: null,

  // Navigation
  currentPage: 'organizations',
  
  // Data caching
  drivers: [],
  organizations: [],
  employees: [],
  partners: [],
  
  // UI state
  sidebarCollapsed: false,
  
  // Common report state
  reportFilters: [],
   
  // EPL Report state
  eplColumns: [
    'ФИО',
    'Телефон', 
    'Организация',
    'Баланс',
    'Пополнения наличными',
    'Пополнения картой',
    'Количество ЭПЛ',
    'Цена ЭПЛ',
    'Сумма выпущенных ЭПЛ'
  ],
  eplShowTotals: true,
  eplDateRange: { from: null, to: null },
  
  // Partner Report state
  partnerColumns: [
    'Партнер',
    'Email',
    'Количество организаций',
    'Количество водителей',
    'Количество ЭПЛ',
    'Цена ЭПЛ',
    'Сумма выпущенных ЭПЛ'
  ],
  partnerShowTotals: true,
  partnerDateRange: { from: null, to: null },
  
  // Saved Reports
  savedReports: [],
};

interface AppState {
  // Profile caching
  profile: User | null;
  setProfile: (profile: User | null) => void;
  resetStore: () => void;

  // Navigation
  currentPage: string;
  setCurrentPage: (page: string) => void;
  
  // Data caching
  drivers: User[];
  setDrivers: (drivers: User[]) => void;
  organizations: Organization[];
  setOrganizations: (organizations: Organization[]) => void;
  employees: Employee[];
  setEmployees: (employees: Employee[]) => void;
  partners: User[];
  setPartners: (partners: User[]) => void;
  
  // UI state
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  
  // Common report state
  reportFilters: any[];
  setReportFilters: (filters: any[]) => void;
   
  // EPL Report state
  eplColumns: string[];
  setEplColumns: (columns: string[]) => void;
  eplShowTotals: boolean;
  setEplShowTotals: (show: boolean) => void;
  eplDateRange: {
    from: string | null;
    to: string | null;
  };
  setEplDateRange: (range: { from: string | null; to: string | null }) => void;
  
  // Partner Report state
  partnerColumns: string[];
  setPartnerColumns: (columns: string[]) => void;
  partnerShowTotals: boolean;
  setPartnerShowTotals: (show: boolean) => void;
  partnerDateRange: {
    from: string | null;
    to: string | null;
  };
  setPartnerDateRange: (range: { from: string | null; to: string | null }) => void;
  
  // Saved Reports
  savedReports: SavedReport[];
  setSavedReports: (reports: SavedReport[]) => void;
  loadSavedReport: (report: SavedReport) => void;
}

export const useStore = create<AppState>((set) => ({
  ...initialState,
  setProfile: (profile) => set({ profile }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setDrivers: (drivers) => set({ drivers }),
  setOrganizations: (organizations) => set({ organizations }),
  setEmployees: (employees) => set({ employees }),
  setPartners: (partners) => set({ partners }),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setReportFilters: (filters) => set({ reportFilters: filters }),
  setEplColumns: (columns) => set({ eplColumns: columns }),
  setEplShowTotals: (show) => set({ eplShowTotals: show }),
  setEplDateRange: (range) => set({ eplDateRange: range }),
  setPartnerColumns: (columns) => set({ partnerColumns: columns }),
  setPartnerShowTotals: (show) => set({ partnerShowTotals: show }),
  setPartnerDateRange: (range) => set({ partnerDateRange: range }),
  setSavedReports: (reports) => set({ savedReports: reports }),
  loadSavedReport: (report) => set({
    eplColumns: report.type === 'epl' ? report.columns : initialState.eplColumns,
    partnerColumns: report.type === 'partner' ? report.columns : initialState.partnerColumns,
    reportFilters: report.filters,
    eplDateRange: report.type === 'epl' ? report.dateRange : initialState.eplDateRange,
    partnerDateRange: report.type === 'partner' ? report.dateRange : initialState.partnerDateRange,
    eplShowTotals: report.type === 'epl' ? report.showTotals : initialState.eplShowTotals,
    partnerShowTotals: report.type === 'partner' ? report.showTotals : initialState.partnerShowTotals,
  }),
  resetStore: () => set(initialState),
}));