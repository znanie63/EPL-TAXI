export interface Employee {
  id: string;
  fullName: string;
  organization: string;
  isAvailable: boolean;
}

export const employees: Employee[] = [
  {
    id: "1",
    fullName: "Смирнов Алексей Петрович",
    organization: "ООО Автопарк",
    isAvailable: true,
  },
  {
    id: "2",
    fullName: "Козлова Мария Ивановна",
    organization: "ИП Иванов",
    isAvailable: false,
  },
  {
    id: "3",
    fullName: "Новиков Дмитрий Александрович",
    organization: "Такси Город",
    isAvailable: true,
  },
  {
    id: "4",
    fullName: "Морозова Елена Сергеевна",
    organization: "Грузоперевозки Плюс",
    isAvailable: false,
  },
  {
    id: "5",
    fullName: "Попов Игорь Владимирович",
    organization: "Транспортная Компания",
    isAvailable: true,
  },
];