export interface EPL {
  id: string;
  number: string;
  issueDate: string;
  expiryDate: string;
  status: "active" | "revoked";
  driverId: string;
}

export const eplList: EPL[] = [
  {
    id: "1",
    number: "EPL-2024-001",
    issueDate: "2024-01-01",
    expiryDate: "2024-12-31",
    status: "active",
    driverId: "1",
  },
  {
    id: "2",
    number: "EPL-2024-002",
    issueDate: "2024-01-15",
    expiryDate: "2024-12-31",
    status: "revoked",
    driverId: "1",
  },
  {
    id: "3",
    number: "EPL-2024-003",
    issueDate: "2024-02-01",
    expiryDate: "2024-12-31",
    status: "active",
    driverId: "2",
  },
];