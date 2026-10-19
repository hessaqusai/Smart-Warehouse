export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: "Electrical" | "Heavy Machinery" | "Safety Gear" | "Electronics" | "Chemicals" | "Tools" | "Packaging";
  quantity: number;
  minStockLevel: number;
  zone: string;
  shelf: string;
  weight: string;
  dimensions: string;
  lastUpdated: string;
  notes?: string;
  source: "QR Code" | "RFID Tag" | "Manual Input" | "AI Camera Scan";
  accessFrequency: "High" | "Medium" | "Low";
  status?: "In Stock" | "Low Stock" | "Out of Stock";
}

export interface Shipment {
  id: string;
  type: "Incoming" | "Outgoing";
  itemTitle: string;
  quantity: number;
  carrier: string;
  status: "In Transit" | "Pending" | "Completed";
  date: string;
  dockNo: string;
}

export interface AlertNotification {
  id: string;
  type: "danger" | "warning" | "info" | "success";
  title: string;
  description: string;
  timestamp: string;
  category: "Low Stock" | "Equipment" | "Discrepancy" | "Shipment";
  resolved: boolean;
}

export interface Equipment {
  id: string;
  name: string;
  modelNo: string;
  status: "Operational" | "Maintenance Required" | "Down";
  healthScore: number;
  runHours: number;
  temperature: number; // in Celsius
  vibrationLevel: number; // in mm/s
  lastServiceDate: string;
  predictedFailurePoints?: string;
  daysToServicePrediction?: number;
  failureRiskPrediction?: "Low" | "Medium" | "High" | "Critical";
  servicePlan?: string;
}

export interface WarehouseMetrics {
  inventoryCount: number;
  alertsCount: number;
  alertsResolved: number;
  scanSpeed: number;
  zoneUtilization: { [key: string]: number };
  recentActions: string[];
}
