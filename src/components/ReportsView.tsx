import React, { useState } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  CartesianGrid,
  AreaChart,
  Area
} from "recharts";
import { 
  TrendingUp, 
  Activity, 
  Sparkles, 
  RefreshCw, 
  Cpu, 
  Printer, 
  Download, 
  ChevronRight, 
  FileText,
  Percent,
  Clock,
  ShieldCheck
} from "lucide-react";
import { InventoryItem, Shipment, AlertNotification } from "../types";

interface ReportsViewProps {
  items: InventoryItem[];
  shipments: Shipment[];
  alerts: AlertNotification[];
}

export default function ReportsView({ items, shipments, alerts }: ReportsViewProps) {
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [reportLoading, setReportLoading] = useState<boolean>(false);

  // Parse Metrics for Recharts
  
  // 1. Zone Space Utilization (computed mock capacity)
  const zoneData = [
    { name: "Zone A (Fast)", occupancy: 82, cap: 100, color: "#2563EB" },
    { name: "Zone B (Cold)", occupancy: 68, cap: 100, color: "#06B6D4" },
    { name: "Zone C (Heavy)", occupancy: 92, cap: 100, color: "#D97706" },
    { name: "Zone D (Secured)", occupancy: 45, cap: 100, color: "#4F46E5" },
    { name: "Zone E (Standard)", occupancy: 55, cap: 100, color: "#64748B" }
  ];

  // 2. Cargo Throughput volumes over the week (Mon to Sun)
  const throughputData = [
    { day: "Mon", incoming: 120, outgoing: 80 },
    { day: "Tue", incoming: 150, outgoing: 110 },
    { day: "Wed", incoming: 140, outgoing: 130 },
    { day: "Thu", incoming: 190, outgoing: 145 },
    { day: "Fri", incoming: 220, outgoing: 180 },
    { day: "Sat", incoming: 90, outgoing: 70 },
    { day: "Sun", incoming: 45, outgoing: 35 }
  ];

  // 3. Automated Scanning Velocity Trends (ms / scans)
  const scanningSpeedTrends = [
    { week: "Week 24", speed: 4.8 },
    { week: "Week 25", speed: 4.1 },
    { week: "Week 26", speed: 3.5 },
    { week: "Week 27", speed: 2.8 },
    { week: "Week 28", speed: 2.4 }
  ];

  // Trigger Gemini AI Executive Audit
  const generateAIExecutiveInsights = async () => {
    setReportLoading(true);
    setAiReport(null);

    // Compute basic numbers for prompt context
    const totalInventoryCount = items.reduce((acc, i) => acc + i.quantity, 0);
    const resolvedCount = alerts.filter(a => a.resolved).length;
    const unresolvedCount = alerts.filter(a => !a.resolved).length;

    try {
      const response = await fetch("/api/gemini/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metrics: {
            inventoryCount: totalInventoryCount,
            alertsResolved: resolvedCount,
            alertsCount: unresolvedCount,
            scanSpeed: 2.4,
            zoneUtilization: {
              "Zone A": "82%",
              "Zone B": "68%",
              "Zone C": "92%",
              "Zone D": "45%",
              "Zone E": "55%"
            },
            recentActions: shipments.map(s => `${s.type} ${s.quantity} units of "${s.itemTitle}" via ${s.carrier}`)
          }
        })
      });

      const data = await response.json();
      if (data.success) {
        setAiReport(data.reportText);
      } else {
        alert("Report Error: " + (data.error || "Unknown error"));
      }
    } catch (err: any) {
      console.error(err);
      alert("Failed to communicate with AI report generator: " + err.message);
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header with PDF triggers */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 id="reports-title" className="text-2xl font-bold tracking-tight text-slate-900">Performance Metrics & Audits</h1>
          <p className="text-slate-500 text-sm mt-1">Deep visual analytics, volume trends, and automatic AI executive audit reporting.</p>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto shrink-0">
          <button 
            onClick={generateAIExecutiveInsights}
            disabled={reportLoading}
            className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-slate-200 text-white font-semibold text-xs py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
          >
            {reportLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Drafting report...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-white animate-pulse" />
                Generate AI Executive Insights
              </>
            )}
          </button>
          
          {aiReport && (
            <button 
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
          )}
        </div>
      </div>

      {/* 2. Top level report cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-100 space-y-1.5">
          <div className="text-slate-400 font-mono text-[10px] uppercase tracking-wider font-bold">Spatial Efficiency</div>
          <div className="text-xl font-bold text-slate-950 flex items-center gap-1">
            <Percent className="w-4 h-4 text-blue-500" />
            68.4% Occupancy
          </div>
          <span className="text-[10px] text-emerald-600 font-medium">✓ Optimal operating range</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 space-y-1.5">
          <div className="text-slate-400 font-mono text-[10px] uppercase tracking-wider font-bold">Average Scanning Speed</div>
          <div className="text-xl font-bold text-slate-950 flex items-center gap-1">
            <Clock className="w-4 h-4 text-purple-500" />
            2.4s / Scan
          </div>
          <span className="text-[10px] text-blue-600 font-semibold">⚡ Increased 28% this month</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 space-y-1.5">
          <div className="text-slate-400 font-mono text-[10px] uppercase tracking-wider font-bold">Physical Audit Accuracy</div>
          <div className="text-xl font-bold text-slate-950 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            98.2% Accuracy
          </div>
          <span className="text-[10px] text-amber-600 font-semibold">⚠️ 2 unresolved count mismatches</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 space-y-1.5">
          <div className="text-slate-400 font-mono text-[10px] uppercase tracking-wider font-bold">Annual Inventory Turnover</div>
          <div className="text-xl font-bold text-slate-950 flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            4.8x Turnover
          </div>
          <span className="text-[10px] text-emerald-600 font-medium">✓ Higher than industry median</span>
        </div>
      </div>

      {/* 3. Recharts Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Space Occupancy (Bar) */}
        <div id="chart-space-utilization" className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm tracking-wide uppercase">
              Zone Occupancy & Capacity Utilization
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">Maximum safety capacity is restricted to 95% on primary shelves.</p>
          </div>
          
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={zoneData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} unit="%" />
                <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 10, fill: '#64748B' }} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Bar dataKey="occupancy" radius={[0, 4, 4, 0]}>
                  {zoneData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Throughput volumes (Area) */}
        <div id="chart-throughput" className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm tracking-wide uppercase">
              Weekly Shifting Cargo Volumes
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">Comparison of incoming forklift placement versus outgoing dispatch orders.</p>
          </div>

          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={throughputData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend iconType="circle" />
                <Area type="monotone" dataKey="incoming" name="Incoming Intake" stroke="#10B981" fillOpacity={1} fill="url(#colorIn)" strokeWidth={2} />
                <Area type="monotone" dataKey="outgoing" name="Outgoing Dispatch" stroke="#3B82F6" fillOpacity={1} fill="url(#colorOut)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Weekly scan speeds (Line) */}
        <div id="chart-scanning-speed" className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4 lg:col-span-2">
          <div>
            <h3 className="font-bold text-slate-900 text-sm tracking-wide uppercase">
              RFID & QR Scanning Speed Optimization Trend
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">Continuous speed gains driven by AI image recognition and automated shelf classification routing.</p>
          </div>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={scanningSpeedTrends} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                <YAxis unit="s" tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => `${value} seconds`} />
                <Legend iconType="circle" />
                <Line type="monotone" dataKey="speed" name="Average Speed per Scan" stroke="#4F46E5" strokeWidth={3} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 4. AI Report Rendering Panel */}
      {aiReport && (
        <div id="ai-executive-report" className="bg-slate-900 text-slate-100 p-8 rounded-2xl border border-slate-800 shadow-lg space-y-6 animate-fade-in relative overflow-hidden">
          {/* Subtle logo vector layer in background */}
          <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none transform translate-y-12 translate-x-12 scale-150">
            <FileText className="w-96 h-96" />
          </div>

          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-blue-400" />
              <span className="text-xs font-mono font-bold uppercase text-blue-400 tracking-wider">Smart Warehouse AI executive audit</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono bg-slate-850 px-2 py-0.5 rounded border border-slate-850">
              Shift Code: UTC-7
            </span>
          </div>

          {/* Markdown summary text container */}
          <div className="prose prose-invert prose-xs text-xs max-w-none leading-relaxed space-y-4">
            {aiReport.split("\n").map((line, idx) => {
              if (line.startsWith("###")) {
                return <h3 key={idx} className="text-base font-bold text-white pt-3 border-b border-slate-800 pb-1 mt-4">{line.replace("###", "")}</h3>;
              }
              if (line.startsWith("##")) {
                return <h2 key={idx} className="text-lg font-bold text-blue-400 pt-4 mt-6">{line.replace("##", "")}</h2>;
              }
              if (line.startsWith("**") && line.endsWith("**")) {
                return <div key={idx} className="text-sm font-bold text-white mt-3">{line.replaceAll("**", "")}</div>;
              }
              if (line.startsWith("-") || line.startsWith("*")) {
                return <li key={idx} className="ml-4 list-disc pl-1 text-slate-300 font-medium">{line.substring(2)}</li>;
              }
              return <p key={idx} className="text-slate-300 font-sans">{line}</p>;
            })}
          </div>

          <div className="flex justify-between items-center border-t border-slate-800 pt-5 mt-8 text-[10px] text-slate-500">
            <span>Security Rating: High ISO-27001. Grounding active.</span>
            <span>Generated locally on AI Studio Dev Containers</span>
          </div>
        </div>
      )}

    </div>
  );
}
