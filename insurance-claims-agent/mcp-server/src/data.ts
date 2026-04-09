export interface Claim {
  id: string;
  claimNumber: string;
  policyHolderName: string;
  status: string;
  type: string;
  dateOfLoss: string;
  dateFiled: string;
  description: string;
  propertyAddress: string;
  estimatedAmount: number;
  approvedAmount: number | null;
  adjuster: string;
  notes: string[];
}

export interface Inspection {
  id: string;
  claimId: string;
  claimNumber: string;
  status: string;
  taskType: string;
  priority: string;
  scheduledDate: string;
  inspectorId: string;
  property: string;
  findings: string;
  recommendedActions: string[];
  instructions: string;
}

export interface Contractor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  preferred: boolean;
  phone: string;
  email: string;
  completedJobs: number;
  availability: string;
}

export interface PurchaseOrder {
  id: string;
  claimId: string;
  claimNumber: string;
  contractorId: string;
  contractorName: string;
  description: string;
  amount: number;
  status: string;
  createdDate: string;
  note: string;
}

export interface Inspector {
  id: string;
  name: string;
  specialization: string;
  phone: string;
  email: string;
  activeInspections: number;
}

export const claims: Claim[] = [
  {
    id: "1", claimNumber: "CN202504990", policyHolderName: "Sarah Johnson",
    status: "Open", type: "Water Damage", dateOfLoss: "2025-03-15", dateFiled: "2025-03-16",
    description: "Burst pipe in basement causing flooding to finished living area",
    propertyAddress: "1234 Oak Street, Springfield, IL 62701",
    estimatedAmount: 45000, approvedAmount: null, adjuster: "Mike Rivera",
    notes: ["Initial report filed", "Photos submitted"]
  },
  {
    id: "2", claimNumber: "CN202504991", policyHolderName: "Robert Chen",
    status: "Approved", type: "Fire Damage", dateOfLoss: "2025-03-10", dateFiled: "2025-03-11",
    description: "Kitchen fire causing smoke and structural damage to second floor",
    propertyAddress: "567 Maple Ave, Chicago, IL 60601",
    estimatedAmount: 120000, approvedAmount: 115000, adjuster: "Lisa Park",
    notes: ["Fire department report obtained", "Structural assessment complete", "Approved for repair"]
  },
  {
    id: "3", claimNumber: "CN202504992", policyHolderName: "Maria Garcia",
    status: "Pending", type: "Roofing", dateOfLoss: "2025-03-20", dateFiled: "2025-03-21",
    description: "Hail damage to roof shingles and gutters from severe storm",
    propertyAddress: "890 Pine Road, Naperville, IL 60540",
    estimatedAmount: 28000, approvedAmount: null, adjuster: "Mike Rivera",
    notes: ["Awaiting inspection report"]
  },
  {
    id: "4", claimNumber: "CN202504993", policyHolderName: "James Wilson",
    status: "Denied", type: "Water Damage", dateOfLoss: "2025-02-28", dateFiled: "2025-03-05",
    description: "Gradual water seepage in basement walls over several months",
    propertyAddress: "321 Elm Court, Evanston, IL 60201",
    estimatedAmount: 15000, approvedAmount: 0, adjuster: "Lisa Park",
    notes: ["Claim denied - gradual damage not covered under policy", "Appeal option provided"]
  },
  {
    id: "5", claimNumber: "CN202504994", policyHolderName: "Emily Davis",
    status: "Closed", type: "Fire Damage", dateOfLoss: "2025-01-15", dateFiled: "2025-01-16",
    description: "Electrical fire in garage, contained to one wall",
    propertyAddress: "456 Birch Lane, Aurora, IL 60505",
    estimatedAmount: 35000, approvedAmount: 32000, adjuster: "Mike Rivera",
    notes: ["Repair completed", "Final inspection passed", "Claim closed"]
  },
  {
    id: "6", claimNumber: "CN202504995", policyHolderName: "David Thompson",
    status: "Open", type: "Roofing", dateOfLoss: "2025-04-01", dateFiled: "2025-04-02",
    description: "Wind damage tore off section of roof during tornado warning",
    propertyAddress: "789 Cedar Drive, Joliet, IL 60432",
    estimatedAmount: 55000, approvedAmount: null, adjuster: "Lisa Park",
    notes: ["Emergency tarp placed", "Full inspection scheduled"]
  }
];

export const inspections: Inspection[] = [
  {
    id: "insp-001", claimId: "1", claimNumber: "CN202504990", status: "completed",
    taskType: "initial", priority: "high", scheduledDate: "2025-03-18",
    inspectorId: "inspector-001", property: "1234 Oak Street, Springfield, IL 62701",
    findings: "Significant water damage to basement. Drywall, flooring, and electrical affected.",
    recommendedActions: ["Replace drywall in basement", "Install new flooring", "Rewire affected electrical"],
    instructions: "Full basement assessment required"
  },
  {
    id: "insp-002", claimId: "3", claimNumber: "CN202504992", status: "scheduled",
    taskType: "initial", priority: "medium", scheduledDate: "2025-04-05",
    inspectorId: "inspector-002", property: "890 Pine Road, Naperville, IL 60540",
    findings: "", recommendedActions: [],
    instructions: "Assess hail damage to roof and gutters"
  },
  {
    id: "insp-003", claimId: "6", claimNumber: "CN202504995", status: "open",
    taskType: "initial", priority: "high", scheduledDate: "2025-04-08",
    inspectorId: "inspector-003", property: "789 Cedar Drive, Joliet, IL 60432",
    findings: "", recommendedActions: [],
    instructions: "Emergency roof damage assessment - tarp in place"
  }
];

export const contractors: Contractor[] = [
  { id: "cont-001", name: "ABC Roofing Co.", specialty: "Roofing", rating: 4.8, preferred: true, phone: "555-0101", email: "info@abcroofing.com", completedJobs: 145, availability: "Available" },
  { id: "cont-002", name: "WaterPro Restoration", specialty: "Water Damage", rating: 4.9, preferred: true, phone: "555-0102", email: "jobs@waterpro.com", completedJobs: 210, availability: "Available" },
  { id: "cont-003", name: "FireGuard Repairs", specialty: "Fire", rating: 4.7, preferred: true, phone: "555-0103", email: "dispatch@fireguard.com", completedJobs: 89, availability: "Busy - 1 week" },
  { id: "cont-004", name: "Summit Builders", specialty: "Roofing", rating: 4.3, preferred: false, phone: "555-0104", email: "hello@summitbuilders.com", completedJobs: 67, availability: "Available" },
  { id: "cont-005", name: "FloodMaster Inc.", specialty: "Water Damage", rating: 4.5, preferred: false, phone: "555-0105", email: "service@floodmaster.com", completedJobs: 120, availability: "Available" },
  { id: "cont-006", name: "Phoenix Fire Restoration", specialty: "Fire", rating: 4.6, preferred: false, phone: "555-0106", email: "team@phoenixfire.com", completedJobs: 55, availability: "Available" }
];

export const purchaseOrders: PurchaseOrder[] = [
  { id: "po-001", claimId: "2", claimNumber: "CN202504991", contractorId: "cont-003", contractorName: "FireGuard Repairs", description: "Kitchen fire structural repair and smoke remediation", amount: 95000, status: "approved", createdDate: "2025-03-25", note: "Priority repair - family displaced" },
  { id: "po-002", claimId: "5", claimNumber: "CN202504994", contractorId: "cont-003", contractorName: "FireGuard Repairs", description: "Garage wall repair and electrical rework", amount: 28000, status: "completed", createdDate: "2025-02-01", note: "" },
  { id: "po-003", claimId: "1", claimNumber: "CN202504990", contractorId: "cont-002", contractorName: "WaterPro Restoration", description: "Basement water damage restoration", amount: 42000, status: "pending", createdDate: "2025-04-01", note: "Awaiting claim approval" }
];

export const inspectors: Inspector[] = [
  { id: "inspector-001", name: "Tom Bradley", specialization: "Water Damage, Structural", phone: "555-0201", email: "tbradley@inspections.com", activeInspections: 3 },
  { id: "inspector-002", name: "Angela Martinez", specialization: "Roofing, Wind Damage", phone: "555-0202", email: "amartinez@inspections.com", activeInspections: 2 },
  { id: "inspector-003", name: "Kevin O'Brien", specialization: "Fire Damage, Electrical", phone: "555-0203", email: "kobrien@inspections.com", activeInspections: 4 },
  { id: "inspector-004", name: "Patricia Nguyen", specialization: "General, Multi-peril", phone: "555-0204", email: "pnguyen@inspections.com", activeInspections: 1 }
];
