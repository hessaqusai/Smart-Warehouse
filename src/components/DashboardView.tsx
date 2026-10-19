import React, { useState } from "react";
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  Truck, 
  ShieldAlert, 
  Info, 
  Settings, 
  User, 
  Activity, 
  CornerDownRight, 
  FlameKindling,
  Thermometer,
  Shield,
  Clock
} from "lucide-react";
import { InventoryItem, Shipment, AlertNotification, Equipment } from "../types";

interface DashboardViewProps {
  items: InventoryItem[];
  shipments: Shipment[];
  alerts: AlertNotification[];
  equipment: Equipment[];
  onNavigate: (tab: string) => void;
  onResolveAlert: (id: string) => void;
}

export default function DashboardView({
  items,
  shipments,
  alerts,
  equipment,
  onNavigate,
  onResolveAlert
}: DashboardViewProps) {
  const [selectedZone, setSelectedZone] = useState<string>("Zone A");

  // Calculations
  const totalStockCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const activeAlertsCount = alerts.filter(a => !a.resolved).length;
  const inTransitCount = shipments.filter(s => s.status === "In Transit").length;
  
  // Zone details
  const zoneMetadata: { [key: string]: { name: string, full: string, occupancy: number, temp: string, activeItems: number, type: string, safety: string, color: string } } = {
    "Zone A": {
      name: "Zone A",
      full: "Zone A - Fast Moving (Near Docks)",
      occupancy: 82,
      temp: "21.5°C",
      activeItems: items.filter(i => i.zone.includes("Zone A")).length,
      type: "High-Frequency Standard Packages",
      safety: "Forklift speed limit: 5mph. Daily sweep required.",
      color: "bg-blue-600"
    },
    "Zone B": {
      name: "Zone B",
      full: "Zone B - Temperature Controlled",
      occupancy: 68,
      temp: "4.2°C (Cold Room)",
      activeItems: items.filter(i => i.zone.includes("Zone B")).length,
      type: "Lithium Batteries & Sensitive Electronics",
      safety: "ESD floor grounding active. Thermo-log monitors hourly.",
      color: "bg-cyan-500"
    },
    "Zone C": {
      name: "Zone C",
      full: "Zone C - Heavy Storage",
      occupancy: 92,
      temp: "22.1°C",
      activeItems: items.filter(i => i.zone.includes("Zone C")).length,
      type: "Heavy Girders, Reels & Fluids",
      safety: "Reinforced support racks. Bottom shelf mandate >100 lbs.",
      color: "bg-amber-600"
    },
    "Zone D": {
      name: "Zone D",
      full: "Zone D - High Value/Secured",
      occupancy: 45,
      temp: "19.8°C",
      activeItems: items.filter(i => i.zone.includes("Zone D")).length,
      type: "Secured Transceivers & Specialized Gear",
      safety: "Badge clearance level 3 required. 24/7 CCTV active.",
      color: "bg-indigo-600"
    },
    "Zone E": {
      name: "Zone E",
      full: "Zone E - Standard Racks",
      occupancy: 55,
      temp: "22.8°C",
      activeItems: items.filter(i => i.zone.includes("Zone E")).length,
      type: "Cartons, Standard Pallets & Packagings",
      safety: "General stacking safety guidelines. Standard access.",
      color: "bg-slate-500"
    }
  };

  const selectedZoneData = zoneMetadata[selectedZone] || zoneMetadata["Zone A"];

  // Low Stock Items
  const lowStockItems = items.filter(item => item.quantity <= item.minStockLevel);

  return (
    <div className="space-y-6">
      {/* 1. Header with greeting and Quick Summary */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 id="dashboard-title" className="text-2xl font-bold tracking-tight text-slate-900">Warehouse Command Console</h1>
          <p className="text-slate-500 text-sm mt-1">Real-time telemetry, automated layout optimization & predictive maintenance logs.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            AI Core: Online
          </span>
          <span className="text-xs text-slate-400 font-mono flex items-center gap-1 bg-slate-50 px-2.5 py-1.5 rounded border border-slate-100">
            <Clock className="w-3 h-3 text-slate-400" />
            Active Shift: UTC 07:56
          </span>
        </div>
      </div>

      {/* 2. Primary KPI grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Active Inventory */}
        <div id="kpi-inventory" className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Quantity In Stock</span>
            <div className="text-2xl font-bold text-slate-950">{totalStockCount.toLocaleString()}</div>
            <div className="text-xs text-blue-600 font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +14% vs last week
            </div>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2: Active Alerts */}
        <div id="kpi-alerts" onClick={() => onNavigate("alerts")} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between cursor-pointer hover:border-red-100 transition-colors">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Active Anomalies</span>
            <div className="text-2xl font-bold text-slate-950">{activeAlertsCount}</div>
            <div className={`text-xs font-medium flex items-center gap-1 ${activeAlertsCount > 0 ? "text-rose-600" : "text-emerald-600"}`}>
              {activeAlertsCount > 0 ? (
                <>
                  <AlertTriangle className="w-3 h-3 animate-bounce" />
                  Action required immediately
                </>
              ) : (
                <>✓ All operations smooth</>
              )}
            </div>
          </div>
          <div className={`p-3 rounded-xl ${activeAlertsCount > 0 ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"}`}>
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 3: In Transit Shipments */}
        <div id="kpi-shipments" className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Active Shipments</span>
            <div className="text-2xl font-bold text-slate-950">{shipments.length}</div>
            <div className="text-xs text-slate-500 flex items-center gap-1 font-mono">
              <Truck className="w-3 h-3 text-slate-400" />
              {inTransitCount} in-transit, {shipments.filter(s => s.status === "Pending").length} pending
            </div>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Truck className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 4: Average Space Occupancy */}
        <div id="kpi-occupancy" className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Storage Capacity</span>
            <div className="text-2xl font-bold text-slate-950">69.4%</div>
            <div className="w-28 bg-slate-150 h-1.5 rounded-full overflow-hidden mt-1 bg-slate-100">
              <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: "69.4%" }}></div>
            </div>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Activity className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. Map Floor & Interactive Zone Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Warehouse Floor Map (7 Columns on desktop) */}
        <div id="warehouse-floor-plan" className="lg:col-span-7 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Live Floor Layout Map
              </h2>
              <p className="text-xs text-slate-500">Interactive bird&apos;s-eye telemetry. Select zones to drill down.</p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-blue-600 rounded"></span>&gt;80% Cap</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-cyan-500 rounded"></span>60-80% Cap</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-slate-400 rounded"></span>&lt;60% Cap</span>
            </div>
          </div>

          {/* SVG Map Layout */}
          <div className="relative w-full aspect-[4/3] bg-slate-50 rounded-xl border border-slate-150 flex items-center justify-center p-4">
            <svg viewBox="0 0 800 600" className="w-full h-full select-none">
              {/* Outer Warehouse Wall */}
              <rect x="10" y="10" width="780" height="580" rx="16" fill="none" stroke="#CBD5E1" strokeWidth="4" strokeDasharray="8,4" />
              
              {/* Warehouse Docks/Bays (Bottom) */}
              <g transform="translate(0, 540)">
                <text x="140" y="45" className="text-[12px] font-bold font-sans fill-slate-400">LOADING DOCKS</text>
                {/* Dock 1 */}
                <rect x="60" y="0" width="80" height="20" rx="4" fill="#64748B" />
                <text x="85" y="-5" className="text-[10px] font-bold font-mono fill-slate-500">BAY 1</text>
                {/* Dock 2 */}
                <rect x="180" y="0" width="80" height="20" rx="4" fill="#64748B" />
                <text x="205" y="-5" className="text-[10px] font-bold font-mono fill-slate-500">BAY 2</text>
                {/* Dock 3 */}
                <rect x="300" y="0" width="80" height="20" rx="4" fill="#64748B" />
                <text x="325" y="-5" className="text-[10px] font-bold font-mono fill-slate-500">BAY 3</text>
                {/* Dock 4 */}
                <rect x="420" y="0" width="80" height="20" rx="4" fill="#64748B" />
                <text x="445" y="-5" className="text-[10px] font-bold font-mono fill-slate-500">BAY 4</text>
                {/* Dock 5 */}
                <rect x="540" y="0" width="80" height="20" rx="4" fill="#64748B" />
                <text x="565" y="-5" className="text-[10px] font-bold font-mono fill-slate-500">BAY 5</text>
              </g>

              {/* Secure Vault & Control Cage (Top Right) */}
              <g transform="translate(560, 40)">
                <rect x="0" y="0" width="200" height="150" rx="12" fill="#EEF2F6" stroke="#94A3B8" strokeWidth="2" strokeDasharray="4,4" />
                <text x="100" y="30" textAnchor="middle" className="text-[12px] font-bold fill-slate-700">WAREHOUSE OPERATIONS</text>
                <text x="100" y="50" textAnchor="middle" className="text-[10px] fill-slate-500">Admin Command Station</text>
                
                {/* Charging station forklift */}
                <rect x="20" y="80" width="70" height="50" rx="6" fill="#F1F5F9" stroke="#E2E8F0" />
                <text x="55" y="110" textAnchor="middle" className="text-[9px] font-semibold fill-slate-500">RFID HUB</text>
              </g>

              {/* Racks & Aisles */}
              
              {/* ZONE A - Fast Moving (Near shipping bays) */}
              <g className="cursor-pointer" onClick={() => setSelectedZone("Zone A")}>
                <rect 
                  x="50" y="360" width="340" height="140" rx="8" 
                  fill={selectedZone === "Zone A" ? "#EFF6FF" : "#FFFFFF"} 
                  stroke={selectedZone === "Zone A" ? "#2563EB" : "#E2E8F0"} 
                  strokeWidth={selectedZone === "Zone A" ? 3 : 1.5} 
                />
                <text x="220" y="390" textAnchor="middle" className="text-[15px] font-extrabold fill-blue-700">ZONE A</text>
                <text x="220" y="415" textAnchor="middle" className="text-[11px] font-bold fill-slate-500">Fast-Moving Standard</text>
                <text x="220" y="440" textAnchor="middle" className="text-[10px] font-semibold fill-blue-600">Cap: 82% (Full)</text>

                {/* Sub aisle racks */}
                <rect x="70" y="460" width="60" height="25" rx="3" fill="#3B82F6" opacity="0.9" />
                <rect x="140" y="460" width="60" height="25" rx="3" fill="#3B82F6" opacity="0.9" />
                <rect x="210" y="460" width="60" height="25" rx="3" fill="#3B82F6" opacity="0.9" />
                <rect x="280" y="460" width="60" height="25" rx="3" fill="#94A3B8" opacity="0.7" />
              </g>

              {/* ZONE B - Cold Storage (Top Left) */}
              <g className="cursor-pointer" onClick={() => setSelectedZone("Zone B")}>
                <rect 
                  x="50" y="40" width="220" height="260" rx="8" 
                  fill={selectedZone === "Zone B" ? "#ECFEFF" : "#FFFFFF"} 
                  stroke={selectedZone === "Zone B" ? "#06B6D4" : "#E2E8F0"} 
                  strokeWidth={selectedZone === "Zone B" ? 3 : 1.5} 
                />
                <text x="160" y="80" textAnchor="middle" className="text-[15px] font-extrabold fill-cyan-700">ZONE B</text>
                <text x="160" y="105" textAnchor="middle" className="text-[11px] font-bold fill-slate-500">Temperature Ctrl (4°C)</text>
                <text x="160" y="130" textAnchor="middle" className="text-[10px] font-semibold fill-cyan-600">Cap: 68%</text>

                {/* Cold coil icon decor */}
                <path d="M 140,170 Q 150,160 160,170 T 180,170" fill="none" stroke="#06B6D4" strokeWidth="2" />
                <path d="M 140,185 Q 150,175 160,185 T 180,185" fill="none" stroke="#06B6D4" strokeWidth="2" />

                {/* Cold racks */}
                <rect x="75" y="210" width="70" height="30" rx="3" fill="#06B6D4" opacity="0.8" />
                <rect x="160" y="210" width="75" height="30" rx="3" fill="#06B6D4" opacity="0.5" />
                <rect x="75" y="250" width="160" height="30" rx="3" fill="#06B6D4" opacity="0.7" />
              </g>

              {/* ZONE C - Heavy Storage (Center) */}
              <g className="cursor-pointer" onClick={() => setSelectedZone("Zone C")}>
                <rect 
                  x="300" y="40" width="230" height="260" rx="8" 
                  fill={selectedZone === "Zone C" ? "#FFFBEB" : "#FFFFFF"} 
                  stroke={selectedZone === "Zone C" ? "#D97706" : "#E2E8F0"} 
                  strokeWidth={selectedZone === "Zone C" ? 3 : 1.5} 
                />
                <text x="415" y="80" textAnchor="middle" className="text-[15px] font-extrabold fill-amber-700">ZONE C</text>
                <text x="415" y="105" textAnchor="middle" className="text-[11px] font-bold fill-slate-500">Heavy Industrial</text>
                <text x="415" y="130" textAnchor="middle" className="text-[10px] font-semibold fill-amber-600">Cap: 92% (Critical)</text>

                {/* Heavy shelf lines */}
                <rect x="320" y="170" width="90" height="40" rx="3" fill="#D97706" opacity="0.9" />
                <rect x="420" y="170" width="90" height="40" rx="3" fill="#D97706" opacity="0.95" />
                <rect x="320" y="230" width="90" height="50" rx="3" fill="#D97706" opacity="0.9" />
                <rect x="420" y="230" width="90" height="50" rx="3" fill="#94A3B8" opacity="0.5" />
              </g>

              {/* ZONE D - High Value Secured (Bottom Right-ish) */}
              <g className="cursor-pointer" onClick={() => setSelectedZone("Zone D")}>
                <rect 
                  x="420" y="320" width="340" height="180" rx="8" 
                  fill={selectedZone === "Zone D" ? "#EEF2FF" : "#FFFFFF"} 
                  stroke={selectedZone === "Zone D" ? "#4F46E5" : "#E2E8F0"} 
                  strokeWidth={selectedZone === "Zone D" ? 3 : 1.5} 
                />
                <text x="590" y="355" textAnchor="middle" className="text-[15px] font-extrabold fill-indigo-700">ZONE D</text>
                <text x="590" y="380" textAnchor="middle" className="text-[11px] font-bold fill-slate-500">High Value Secured</text>
                <text x="590" y="405" textAnchor="middle" className="text-[10px] font-semibold fill-indigo-600">Cap: 45% (Available)</text>

                {/* Vault racks */}
                <rect x="440" y="430" width="85" height="35" rx="3" fill="#4F46E5" opacity="0.7" />
                <rect x="535" y="430" width="85" height="35" rx="3" fill="#94A3B8" opacity="0.4" />
                <rect x="630" y="430" width="110" height="35" rx="3" fill="#4F46E5" opacity="0.6" />
              </g>

              {/* ZONE E - Standard Racks (Left-Center) */}
              <g className="cursor-pointer" onClick={() => setSelectedZone("Zone E")}>
                <rect 
                  x="50" y="315" width="340" height="35" rx="6" 
                  fill={selectedZone === "Zone E" ? "#F8FAFC" : "#FFFFFF"} 
                  stroke={selectedZone === "Zone E" ? "#64748B" : "#E2E8F0"} 
                  strokeWidth={selectedZone === "Zone E" ? 2 : 1} 
                />
                <text x="220" y="337" textAnchor="middle" className="text-[12px] font-extrabold fill-slate-700">ZONE E - GENERAL BULK (55% Cap)</text>
              </g>
            </svg>
            
            {/* Overlay instruction */}
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md text-[10px] font-medium text-slate-600 shadow-xs border border-slate-200">
              💡 Click on any zone to view real-time log
            </div>
          </div>
        </div>

        {/* Selected Zone Drill-Down panel (5 Columns on desktop) */}
        <div id="zone-details-panel" className="lg:col-span-5 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Zone Telemetry</span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold text-white ${selectedZoneData.color}`}>
                Occupancy: {selectedZoneData.occupancy}%
              </span>
            </div>

            <h3 className="text-xl font-bold text-slate-950 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              {selectedZoneData.full}
            </h3>
            
            <div className="grid grid-cols-2 gap-4 mt-4 bg-slate-50 p-4 rounded-xl border border-slate-150">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">Temperature Log</span>
                <span className="text-sm font-bold text-slate-800 flex items-center gap-1">
                  <Thermometer className="w-4 h-4 text-rose-500" />
                  {selectedZoneData.temp}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">Registered SKU Types</span>
                <span className="text-sm font-bold text-slate-800 flex items-center gap-1">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  {selectedZoneData.activeItems} Active SKU Categories
                </span>
              </div>
              <div className="col-span-2 space-y-1 border-t border-slate-200 pt-3 mt-1">
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">Standard Contents</span>
                <span className="text-xs font-medium text-slate-600 block leading-relaxed">{selectedZoneData.type}</span>
              </div>
              <div className="col-span-2 space-y-1 border-t border-slate-200 pt-3">
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">Aisle Safety & Compliance</span>
                <span className="text-xs font-medium text-amber-700 flex items-start gap-1 leading-relaxed">
                  <Shield className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
                  {selectedZoneData.safety}
                </span>
              </div>
            </div>

            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-6 mb-2.5">Items Stored on Shelf Logs</h4>
            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
              {items.filter(item => item.zone.includes(selectedZone)).length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  No active item registrations in this Zone.
                </div>
              ) : (
                items.filter(item => item.zone.includes(selectedZone)).map((item) => (
                  <div key={item.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50 flex justify-between items-center hover:bg-slate-100/50 transition-colors">
                    <div>
                      <div className="text-xs font-semibold text-slate-900 leading-none mb-1">{item.name}</div>
                      <div className="text-[10px] font-mono text-slate-400">SKU: {item.sku} | Shelf: {item.shelf}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-950">{item.quantity} units</div>
                      <div className={`text-[10px] font-semibold mt-0.5 ${item.quantity <= item.minStockLevel ? "text-rose-600" : "text-emerald-600"}`}>
                        {item.quantity <= item.minStockLevel ? "Low stock threshold" : "Adequate Level"}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-2">
            <button 
              onClick={() => onNavigate("scan")}
              className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm py-2.5 px-4 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5"
            >
              <Package className="w-4 h-4" />
              Register New Item to {selectedZone}
            </button>
          </div>
        </div>
      </div>

      {/* 4. Timeline shipments & Low stock alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real-time Shipments Timeline */}
        <div id="shipments-overview-card" className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-600" />
              Incoming & Outgoing Queue
            </h3>
            <span className="text-xs text-slate-400 font-medium">Real-time GPS updates</span>
          </div>
          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
            {shipments.map((shipment) => (
              <div key={shipment.id} className="flex gap-4 p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <div className={`p-2.5 rounded-lg shrink-0 flex items-center justify-center ${
                  shipment.type === "Incoming" ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                }`}>
                  <Truck className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                      shipment.type === "Incoming" ? "text-emerald-700" : "text-blue-700"
                    }`}>
                      {shipment.type} Cargo
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{shipment.date}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900 truncate mt-0.5">{shipment.itemTitle}</h4>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                    <span>Carrier: <strong>{shipment.carrier}</strong></span>
                    <span className="text-slate-300">•</span>
                    <span>Dock: <strong>{shipment.dockNo}</strong></span>
                  </p>
                </div>
                <div className="text-right shrink-0 flex flex-col justify-between items-end">
                  <div className="text-sm font-bold text-slate-900">{shipment.quantity} units</div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    shipment.status === "Completed" 
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                      : shipment.status === "In Transit" 
                      ? "bg-blue-50 text-blue-700 border border-blue-100 animate-pulse" 
                      : "bg-amber-50 text-amber-700 border border-amber-100"
                  }`}>
                    {shipment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alerts and Urgent AI Warnings */}
        <div id="stock-alerts-card" className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-500 animate-pulse" />
                Low-Stock Threshold Watch
              </h3>
              <span className="text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-100 px-2 py-0.5 rounded">
                {lowStockItems.length} Warnings
              </span>
            </div>
            
            <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
              {lowStockItems.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  ✓ Outstanding! No items are currently below low-stock threshold.
                </div>
              ) : (
                lowStockItems.map((item) => {
                  const safetyPct = Math.round((item.quantity / item.minStockLevel) * 100);
                  return (
                    <div key={item.id} className="p-4.5 rounded-xl border border-rose-100/60 bg-rose-50/20 hover:bg-rose-50/40 transition-colors flex flex-col gap-2.5">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-bold text-slate-950">{item.name}</h4>
                          <p className="text-[10px] font-mono text-slate-500 mt-0.5">SKU: {item.sku} | Location: {item.zone} ({item.shelf})</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-rose-600 block">{item.quantity} / {item.minStockLevel} Units</span>
                          <span className="text-[9px] uppercase tracking-wider font-semibold text-rose-500 block">Critical level ({safetyPct}%)</span>
                        </div>
                      </div>
                      
                      {/* Bar indicator */}
                      <div className="space-y-1">
                        <div className="w-full bg-rose-100/50 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-rose-500 h-1.5 rounded-full" style={{ width: `${Math.min(safetyPct, 100)}%` }}></div>
                        </div>
                        <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                          <span>Out of Stock</span>
                          <span>Reorder Point ({item.minStockLevel})</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 mt-4 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Reorder suggestions are computed daily by AI.</span>
            <button 
              onClick={() => onNavigate("alerts")}
              className="text-blue-600 hover:text-blue-700 active:text-blue-800 font-semibold flex items-center gap-0.5"
            >
              See all logs
              <CornerDownRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
