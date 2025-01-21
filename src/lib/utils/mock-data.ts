import { faker } from '@faker-js/faker/locale/ru';
import { addDays } from 'date-fns';

export function generateMockDriverData() {
  const now = new Date();
  
  return {
    display_name: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    password: 'Test123!',
    phone_number: faker.phone.number('+7 ### ### ## ##'),
    role: 'Driver',
    balance: faker.number.int({ min: 0, max: 10000 }),
    
    // Documents
    inn: faker.number.int({ min: 100000000000, max: 999999999999 }).toString(),
    snils: faker.number.int({ min: 10000000000, max: 99999999999 }).toString(),
    employeeNumber: faker.number.int({ min: 1000, max: 9999 }).toString(),
    numerId: faker.number.int({ min: 100000, max: 999999 }).toString(),
    
    // License
    licenseNumber: faker.number.int({ min: 1000000, max: 9999999 }).toString(),
    licenseIssuedDate: now.toISOString().split('T')[0],
    licenseExpiryDate: addDays(now, 365 * 3).toISOString().split('T')[0],
    
    // Vehicle
    car_make: faker.vehicle.manufacturer(),
    car_class: faker.helpers.arrayElement(['Эконом', 'Комфорт', 'Бизнес']),
    car_plate: faker.helpers.replaceSymbols('?###??###'),
    garage_number: faker.number.int({ min: 100, max: 999 }).toString(),
    
    // Permits
    permitNumber: faker.number.int({ min: 10000, max: 99999 }).toString(),
    osgop: faker.number.int({ min: 1000000, max: 9999999 }).toString(),
  };
}