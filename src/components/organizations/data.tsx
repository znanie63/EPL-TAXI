export interface Organization {
  id: string;
  name: string;
  driversCount: number;
  activeEmployees: number;
}

export const organizations: Organization[] = [
  {
    id: "1",
    name: "ООО Автопарк",
    driversCount: 45,
    activeEmployees: 32,
  },
  {
    id: "2",
    name: "ИП Иванов",
    driversCount: 12,
    activeEmployees: 8,
  },
  {
    id: "3",
    name: "Такси Город",
    driversCount: 78,
    activeEmployees: 65,
  },
  {
    id: "4",
    name: "Грузоперевозки Плюс",
    driversCount: 25,
    activeEmployees: 18,
  },
  {
    id: "5",
    name: "Транспортная Компания",
    driversCount: 56,
    activeEmployees: 42,
  },
];