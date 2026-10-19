import React, { useState } from "react";
import { 
  LayoutGrid, 
  Scan, 
  Cpu, 
  Bell, 
  TrendingUp, 
  Menu, 
  X, 
  Warehouse,
  PackageCheck,
  LifeBuoy,
  LogOut,
  User,
  Settings
} from "lucide-react";
import { InventoryItem, Shipment, AlertNotification, Equipment } from "./types";
import { initialInventoryItems, initialShipments, initialAlerts, initialEquipment } from "./data";
import DashboardView from "./components/DashboardView";
import ScanProductView from "./components/ScanProductView";
import AIToolsView from "./components/AIToolsView";
import NotificationsView from "./components/NotificationsView";
import ReportsView from "./components/ReportsView";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Core State Engine
  const [items, setItems] = useState<InventoryItem[]>(initialInventoryItems);
  const [shipments, setShipments] = useState<Shipment[]>(initialShipments);
  const [alerts, setAlerts] = useState<AlertNotification[]>(initialAlerts);
  const [equipment, setEquipment] = useState<Equipment[]>(initialEquipment);

  // State handlers
  const handleAddItem = (newItem: InventoryItem) => {
    setItems((prev) => [newItem, ...prev]);
    
    // Auto add a shipment to simulate arrival
    const mockShip: Shipment = {
      id: "SH-" + Math.floor(Math.random() * 899 + 1000),
      type: "Incoming",
      itemTitle: newItem.name,
      quantity: newItem.quantity,
      carrier: "AI Auto-Carrier",
      status: "Completed",
      date: new Date().toISOString().replace("T", " ").substring(0, 16),
      dockNo: "Dock Bay 1",
    };
    setShipments((prev) => [mockShip, ...prev]);
  };

  const handleResolveAlert = (id: string) => {
    setAlerts((prev) => 
      prev.map((alert) => 
        alert.id === id ? { ...alert, resolved: true } : alert
      )
    );
  };

  const handleClearAllAlerts = () => {
    setAlerts([]);
  };

  const handleAddSimulatedAlert = (newAlert: AlertNotification) => {
    setAlerts((prev) => [newAlert, ...prev]);
    // Set view to alerts automatically to see it
    setActiveTab("alerts");
  };

  const handleUpdateEquipment = (id: string, updatedFields: Partial<Equipment>) => {
    setEquipment((prev) => 
      prev.map((machine) => 
        machine.id === id ? { ...machine, ...updatedFields } : machine
      )
    );
  };

  const unreadAlertsCount = alerts.filter((a) => !a.resolved).length;

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans antialiased text-slate-800">
      
      {/* 1. DESKTOP SIDEBAR (Visible on md and up) */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 shrink-0 select-none">
        {/* Sidebar Header Brand */}
        <div className="h-16 flex items-center px-6 border-b border-slate-200 gap-2.5">
          <div className="bg-blue-600 text-white p-1.5 rounded-lg">
            <Warehouse className="w-5 h-5" />
          </div>
          <div>
            <span className="text-sm font-bold text-slate-900 block leading-tight">Smart Warehouse</span>
            <span className="text-[10px] font-semibold text-blue-600 tracking-wider uppercase block">AI Suite v2.5</span>
          </div>
        </div>

        {/* Sidebar Main Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          <button 
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "dashboard" 
                ? "bg-blue-50 text-blue-700 shadow-3xs" 
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            Control Console
          </button>

          <button 
            onClick={() => setActiveTab("scan")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "scan" 
                ? "bg-blue-50 text-blue-700 shadow-3xs" 
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            }`}
          >
            <Scan className="w-4 h-4" />
            QR / RFID Scanner
          </button>

          <button 
            onClick={() => setActiveTab("tools")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "tools" 
                ? "bg-blue-50 text-blue-700 shadow-3xs" 
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            }`}
          >
            <Cpu className="w-4 h-4" />
            AI Telemetry Tools
          </button>

          <button 
            onClick={() => setActiveTab("alerts")}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "alerts" 
                ? "bg-blue-50 text-blue-700 shadow-3xs" 
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            }`}
          >
            <span className="flex items-center gap-3">
              <Bell className="w-4 h-4" />
              Live Warnings
            </span>
            {unreadAlertsCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-rose-500 text-white leading-none">
                {unreadAlertsCount}
              </span>
            )}
          </button>

          <button 
            onClick={() => setActiveTab("reports")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "reports" 
                ? "bg-blue-50 text-blue-700 shadow-3xs" 
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Analytics Reports
          </button>
        </nav>

        {/* User Account / Footer inside Sidebar */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs border border-blue-200">
              U
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-slate-800 block truncate">User Profile</span>
              <span className="text-[10px] text-slate-400 block truncate">7essa7essa1233@gmail.com</span>
            </div>
          </div>
          <div className="text-[9px] text-slate-400 font-mono text-center">
            Logged into AI Studio Container
          </div>
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Toggle button */}
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition-colors"
            >
              <Menu className="w-5.5 h-5.5" />
            </button>
            <div className="flex md:hidden items-center gap-2">
              <div className="bg-blue-600 text-white p-1 rounded-md">
                <Warehouse className="w-4.5 h-4.5" />
              </div>
              <span className="text-sm font-bold text-slate-900">Smart Warehouse AI</span>
            </div>
            
            {/* Breadcrumb path for desktop */}
            <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-400">
              <span>Admin Panel</span>
              <span>/</span>
              <span className="text-slate-700 capitalize">{activeTab}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Top quick-stats for active notifications */}
            <div 
              onClick={() => setActiveTab("alerts")}
              className="relative p-1.5 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-800 cursor-pointer transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadAlertsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              )}
            </div>

            <div className="hidden sm:flex items-center gap-2.5 pl-4 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs">
                JD
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-800 block">Warehouse Director</span>
                <span className="text-[9px] font-medium text-slate-400 block">Zone Master #4</span>
              </div>
            </div>
          </div>
        </header>

        {/* Tab views switcher with smooth padding */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-[1400px] mx-auto">
            {activeTab === "dashboard" && (
              <DashboardView 
                items={items}
                shipments={shipments}
                alerts={alerts}
                equipment={equipment}
                onNavigate={setActiveTab}
                onResolveAlert={handleResolveAlert}
              />
            )}
            
            {activeTab === "scan" && (
              <ScanProductView 
                onAddItem={handleAddItem}
                onNavigate={setActiveTab}
              />
            )}

            {activeTab === "tools" && (
              <AIToolsView 
                equipment={equipment}
                onUpdateEquipment={handleUpdateEquipment}
              />
            )}

            {activeTab === "alerts" && (
              <NotificationsView 
                alerts={alerts}
                onResolveAlert={handleResolveAlert}
                onClearAll={handleClearAllAlerts}
                onAddSimulatedAlert={handleAddSimulatedAlert}
              />
            )}

            {activeTab === "reports" && (
              <ReportsView 
                items={items}
                shipments={shipments}
                alerts={alerts}
              />
            )}
          </div>
        </main>
      </div>

      {/* 3. MOBILE MENU BACKDROP & DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 md:hidden animate-fade-in flex justify-start">
          <div className="w-64 bg-white h-full flex flex-col justify-between p-6 shadow-2xl relative animate-slide-right">
            
            {/* Close Mobile Drawer */}
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 active:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-8">
              {/* Logo Brand */}
              <div className="flex items-center gap-2.5">
                <div className="bg-blue-600 text-white p-1.5 rounded-lg">
                  <Warehouse className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-900 block leading-tight">Smart Warehouse</span>
                  <span className="text-[10px] font-semibold text-blue-600 tracking-wider uppercase block">AI Suite v2.5</span>
                </div>
              </div>

              {/* Mobile nav links */}
              <nav className="space-y-2">
                <button 
                  onClick={() => {
                    setActiveTab("dashboard");
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === "dashboard" 
                      ? "bg-blue-50 text-blue-700 shadow-3xs" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  Control Console
                </button>

                <button 
                  onClick={() => {
                    setActiveTab("scan");
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === "scan" 
                      ? "bg-blue-50 text-blue-700 shadow-3xs" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  <Scan className="w-4 h-4" />
                  QR / RFID Scanner
                </button>

                <button 
                  onClick={() => {
                    setActiveTab("tools");
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === "tools" 
                      ? "bg-blue-50 text-blue-700 shadow-3xs" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  <Cpu className="w-4 h-4" />
                  AI Telemetry Tools
                </button>

                <button 
                  onClick={() => {
                    setActiveTab("alerts");
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === "alerts" 
                      ? "bg-blue-50 text-blue-700 shadow-3xs" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Bell className="w-4 h-4" />
                    Live Warnings
                  </span>
                  {unreadAlertsCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-rose-500 text-white leading-none">
                      {unreadAlertsCount}
                    </span>
                  )}
                </button>

                <button 
                  onClick={() => {
                    setActiveTab("reports");
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === "reports" 
                      ? "bg-blue-50 text-blue-700 shadow-3xs" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  Analytics Reports
                </button>
              </nav>
            </div>

            {/* Profile footer on mobile drawer */}
            <div className="space-y-4 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs border border-blue-200">
                  U
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-slate-800 block truncate">User Profile</span>
                  <span className="text-[10px] text-slate-400 block truncate">7essa7essa1233@gmail.com</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
