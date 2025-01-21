export interface Driver {
  id: string;
  fullName: string;
  organization: string;
  hasEpl: boolean;
}

export const drivers: Driver[] = [
  {
    id: "1",
    fullName: "Иванов Иван Иванович",
    organization: "ООО Автопарк",
    hasEpl: true,
  },
  {
    id: "2",
    fullName: "Петров Петр Петрович",
    organization: "ИП Иванов",
    hasEpl: false,
  },
  {
    id: "3",
    fullName: "Сидоров Сидор Сидорович",
    organization: "Такси Город",
    hasEpl: true,
  },
  {
    id: "4",
    fullName: "Александров Александр Александрович",
    organization: "Грузоперевозки Плюс",
    hasEpl: true,
  },
  {
    id: "5",
    fullName: "Николаев Николай Николаевич",
    organization: "Транспортная Компания",
    hasEpl: false,
  },
];