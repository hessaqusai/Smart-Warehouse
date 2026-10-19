import React, { useState } from "react";
import { 
  Bell, 
  Trash2, 
  CheckCircle, 
  AlertTriangle, 
  ShieldAlert, 
  Info, 
  Sparkles, 
  RefreshCw,
  PlusCircle,
  QrCode
} from "lucide-react";
import { AlertNotification } from "../types";

interface NotificationsViewProps {
  alerts: AlertNotification[];
  onResolveAlert: (id: string) => void;
  onClearAll: () => void;
  onAddSimulatedAlert: (alert: AlertNotification) => void;
}

export default function NotificationsView({
  alerts,
  onResolveAlert,
  onClearAll,
  onAddSimulatedAlert
}: NotificationsViewProps) {
  const [filter, setFilter] = useState<"all" | "active" | "resolved">("active");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filteredAlerts = alerts.filter(alert => {
    const statusMatch = 
      filter === "all" ? true :
      filter === "active" ? !alert.resolved : alert.resolved;
    
    const catMatch = 
      categoryFilter === "all" ? true : alert.category === categoryFilter;

    return statusMatch && catMatch;
  });

  // Generate a mock custom discrepancy using RFID simulator
  const triggerSimulatedAuditMismatch = () => {
    const errorItems = [
      { name: "Nomex Fire Resistant Suits", zone: "Zone D", expected: 5, actual: 4, label: "D-01-A" },
      { name: "Heavy Duty Hydraulic Fluids", zone: "Zone C", expected: 125, actual: 120, label: "C-08-C" },
      { name: "Lithium Ion Battery Packs (48V)", zone: "Zone B", expected: 10, actual: 8, label: "B-04-A" }
    ];
    const item = errorItems[Math.floor(Math.random() * errorItems.length)];
    
    const newAlert: AlertNotification = {
      id: "AL-" + Math.floor(Math.random() * 899 + 100),
      type: "danger",
      title: "Physical Audit Count Mismatch",
      description: `RFID bulk scanner at ${item.zone} (Shelf ${item.label}) flagged ${item.actual} units of "${item.name}" registered, but system database expected ${item.expected}. Potential misplacement or scan dropout.`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      category: "Discrepancy",
      resolved: false,
    };

    onAddSimulatedAlert(newAlert);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 1. Top Panel Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-blue-600 animate-swing" />
            Anomalies & Telemetry Notifications
          </h1>
          <p className="text-slate-500 text-sm mt-1">Live warning indicators regarding stock limits, machine stress thresholds, and transit delays.</p>
        </div>
        
        <div className="flex gap-2 shrink-0 w-full sm:w-auto">
          <button 
            onClick={triggerSimulatedAuditMismatch}
            className="flex-1 sm:flex-none bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-semibold text-xs py-2 px-3.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
            Trigger simulated physical count discrepancy
          </button>
          
          {alerts.length > 0 && (
            <button 
              onClick={onClearAll}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-50 text-slate-600 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-colors"
            >
              Clear Log
            </button>
          )}
        </div>
      </div>

      {/* 2. Filters & Sort Section */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 flex flex-col sm:flex-row justify-between gap-4 items-center">
        
        {/* Status Filters */}
        <div className="flex bg-slate-150 p-1 rounded-lg border border-slate-200 bg-slate-100 w-full sm:w-auto">
          <button 
            onClick={() => setFilter("active")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              filter === "active" ? "bg-white text-slate-950 shadow-2xs" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Unresolved ({alerts.filter(a => !a.resolved).length})
          </button>
          <button 
            onClick={() => setFilter("resolved")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              filter === "resolved" ? "bg-white text-slate-950 shadow-2xs" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Resolved ({alerts.filter(a => a.resolved).length})
          </button>
          <button 
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              filter === "all" ? "bg-white text-slate-950 shadow-2xs" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            All Logs ({alerts.length})
          </button>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-semibold shrink-0">Category:</span>
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full sm:w-auto bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg outline-none font-semibold text-slate-800"
          >
            <option value="all">All Categories</option>
            <option value="Low Stock">Low Stock Limits</option>
            <option value="Equipment">Machine Diagnostics</option>
            <option value="Discrepancy">Audit Discrepancies</option>
            <option value="Shipment">Transit Cargo Logs</option>
          </select>
        </div>
      </div>

      {/* 3. Alerts Lists */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-100">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-950">Zero anomalies matching filter</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-[280px] mx-auto leading-relaxed">
                All warehouse sectors, structural weight sensors, and robotic systems are reporting clean telemetry.
              </p>
            </div>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isDanger = alert.type === "danger";
            const isWarning = alert.type === "warning";
            const isInfo = alert.type === "info";

            return (
              <div 
                key={alert.id}
                className={`p-5 rounded-2xl border transition-all flex gap-4 ${
                  alert.resolved 
                    ? "bg-slate-50/50 border-slate-150 opacity-70" 
                    : isDanger 
                    ? "bg-rose-50/30 border-rose-100/80 shadow-2xs hover:bg-rose-50/50" 
                    : isWarning 
                    ? "bg-amber-50/30 border-amber-100/80 shadow-2xs hover:bg-amber-50/50" 
                    : "bg-blue-50/20 border-blue-100/60 shadow-2xs hover:bg-blue-50/40"
                }`}
              >
                {/* Visual Icon Badge */}
                <div className={`p-3 rounded-xl shrink-0 h-12 w-12 flex items-center justify-center ${
                  alert.resolved 
                    ? "bg-slate-100 text-slate-400" 
                    : isDanger 
                    ? "bg-rose-50 text-rose-600" 
                    : isWarning 
                    ? "bg-amber-50 text-amber-600" 
                    : "bg-blue-50 text-blue-600"
                }`}>
                  {alert.resolved ? (
                    <CheckCircle className="w-6 h-6 stroke-[2]" />
                  ) : isDanger ? (
                    <ShieldAlert className="w-6 h-6 stroke-[2]" />
                  ) : isWarning ? (
                    <AlertTriangle className="w-6 h-6 stroke-[2]" />
                  ) : (
                    <Info className="w-6 h-6 stroke-[2]" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{alert.title}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        alert.category === "Low Stock" 
                          ? "bg-rose-50 text-rose-700 border border-rose-100" 
                          : alert.category === "Equipment" 
                          ? "bg-amber-50 text-amber-700 border border-amber-100" 
                          : alert.category === "Discrepancy" 
                          ? "bg-purple-50 text-purple-700 border border-purple-100" 
                          : "bg-blue-50 text-blue-700 border border-blue-100"
                      }`}>
                        {alert.category}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{alert.timestamp}</span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-medium">{alert.description}</p>
                  
                  {alert.resolved && (
                    <div className="text-[10px] text-slate-400 font-bold font-sans pt-1 flex items-center gap-1">
                      ✓ Resolved and verified in shifting logs.
                    </div>
                  )}
                </div>

                {/* Actions */}
                {!alert.resolved && (
                  <div className="shrink-0 flex items-center">
                    <button 
                      onClick={() => onResolveAlert(alert.id)}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-100 active:bg-emerald-100 transition-all shadow-3xs"
                    >
                      Acknowledge & Resolve
                    </button>
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
