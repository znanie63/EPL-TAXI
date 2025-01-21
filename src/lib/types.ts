import { Timestamp, DocumentReference } from 'firebase/firestore';

export type UserRole = 'Super' | 'Driver' | 'Parthner';
export type Status = 'active' | 'inactive' | 'pending';

export interface User {
  id: string;
  email: string;
  display_name: string;
  photo_url?: string;
  uid: string;
  created_time: Timestamp;
  phone_number?: string;
  balance: number;
  employeeNumber?: string;
  snils?: string;
  licenseNumber?: string;
  licenseIssuedDate?: Timestamp;
  licenseExpiryDate?: Timestamp;
  organizationRef?: DocumentReference;
  status: Status;
  signature_link?: string;
  qr_link?: string;
  role: UserRole;
  super_admin_ref?: DocumentReference;
  parthners_uid?: string[];
  phone_help?: string;
  tg_link?: string;
  note?: string;
  epl_price?: number;
  inn?: string;
  car_make?: string;
  car_plate?: string;
  garage_number?: string;
  car_class?: string;
  driver_parthner_uid?: string;
  numerId?: string;
  osgop?: string;
  permitNumber?: string;
}

export interface Organization {
  id: string;
  name: string;
  address: string;
  phone: string;
  inn: string;
  ogrn: string;
  created_time: Timestamp;
  status: Status;
  employeesRefs?: DocumentReference[];
  driversRefs?: DocumentReference[];
  partner_ref?: DocumentReference;
  super_admin_ref: DocumentReference;
  partner_uid?: string;
  med_ref?: DocumentReference;
  teh_ref?: DocumentReference;
  travelSheetForm?: string;
}

export interface SavedReport {
  id: string;
  name: string;
  type: 'epl' | 'partner';
  parthner_uid: string;
  created_time: Timestamp;
  columns: string[];
  filters: any[];
  dateRange: {
    from: string | null;
    to: string | null;
  };
  showTotals: boolean;
}

export interface SavedReportData {
  name: string;
  type: 'epl' | 'partner';
  columns: string[];
  filters: any[];
  dateRange: {
    from: string | null;
    to: string | null;
  };
  showTotals: boolean;
}
export interface Employee {
  id: string;
  name: string;
  position: string;
  phone: string;
  signature?: string;
  created_time: Timestamp;
  status: Status;
  parthner_ref?: DocumentReference;
  super_admin_ref: DocumentReference;
  parthner_uid?: string;
  organization_ref: DocumentReference;
  description?: string;
  valid_from_date?: Timestamp;
  valid_to_date?: Timestamp;
  type?: string;
}

export interface GeneratedPdf {
  id: string;
  userRef: DocumentReference;
  pdf_link: string;
  created_time: Timestamp;
  status: Status;
  numerId: number;
  nameMed?: string;
  positionMed?: string;
  signatureMed?: string;
  commentMed?: string;
  nameTeh?: string;
  positionTeh?: string;
  signatureTeh?: string;
  commentTeh?: string;
  odometerBefore?: string;
  medDescriptionBefore?: string;
  tehDescriptionBefore?: string;
  driverPartnerUid?: string;
  eplPrice?: number;
}