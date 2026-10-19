import React, { useState } from "react";
import { 
  Wrench, 
  Search, 
  Cpu, 
  Gauge, 
  Thermometer, 
  ShieldAlert, 
  AlertTriangle, 
  Activity, 
  Sliders, 
  CheckCircle,
  Clock,
  Compass,
  ArrowRight,
  FlameKindling
} from "lucide-react";
import { Equipment } from "../types";

interface AIToolsViewProps {
  equipment: Equipment[];
  onUpdateEquipment: (id: string, updatedFields: Partial<Equipment>) => void;
}

export default function AIToolsView({ equipment, onUpdateEquipment }: AIToolsViewProps) {
  const [activeTab, setActiveTab] = useState<"storage" | "maintenance">("storage");

  // Storage Optimizer inputs
  const [itemName, setItemName] = useState<string>("");
  const [itemWeight, setItemWeight] = useState<number>(15);
  const [itemDims, setItemDims] = useState<string>("12\" x 12\" x 12\"");
  const [velocity, setVelocity] = useState<"High" | "Medium" | "Low">("Medium");
  const [isTempSensitive, setIsTempSensitive] = useState<boolean>(false);
  const [isHazardous, setIsHazardous] = useState<boolean>(false);
  
  const [storageLoading, setStorageLoading] = useState<boolean>(false);
  const [storageResult, setStorageResult] = useState<any | null>(null);

  // Maintenance Predictor inputs
  const [selectedMachineId, setSelectedMachineId] = useState<string>(equipment[0]?.id || "");
  const currentMachine = equipment.find(e => e.id === selectedMachineId) || equipment[0];

  const [runHours, setRunHours] = useState<number>(currentMachine?.runHours || 1000);
  const [temp, setTemp] = useState<number>(currentMachine?.temperature || 45);
  const [vibration, setVibration] = useState<number>(currentMachine?.vibrationLevel || 2.5);
  const [noise, setNoise] = useState<boolean>(false);
  const [heavyLoadCycles, setHeavyLoadCycles] = useState<number>(30);

  const [maintLoading, setMaintLoading] = useState<boolean>(false);

  // Sync state if selected machine shifts
  const handleMachineChange = (id: string) => {
    setSelectedMachineId(id);
    const mach = equipment.find(e => e.id === id);
    if (mach) {
      setRunHours(mach.runHours);
      setTemp(mach.temperature);
      setVibration(mach.vibrationLevel);
    }
  };

  // Run Storage Suggestion
  const handleOptimizeStorage = async () => {
    setStorageLoading(true);
    setStorageResult(null);

    try {
      const response = await fetch("/api/gemini/suggest-storage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: itemName || "General Packaged Goods",
          weight: itemWeight,
          dimensions: itemDims,
          accessFrequency: velocity,
          temperatureSensitive: isTempSensitive,
          hazardous: isHazardous
        })
      });

      const data = await response.json();
      if (data.success) {
        setStorageResult(data.suggestion);
      } else {
        alert("Optimization Error: " + (data.error || "Unknown error"));
      }
    } catch (err: any) {
      console.error(err);
      alert("Failed to communicate with optimizer: " + err.message);
    } finally {
      setStorageLoading(false);
    }
  };

  // Run Maintenance Prediction
  const handlePredictMaintenance = async () => {
    setMaintLoading(true);

    try {
      const response = await fetch("/api/gemini/predict-maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          equipmentName: currentMachine.name,
          modelNo: currentMachine.modelNo,
          currentRunHours: runHours,
          lastServiceDate: currentMachine.lastServiceDate,
          temperature: temp,
          vibrationLevel: vibration,
          abnormalNoise: noise,
          heavyLoadCycles: heavyLoadCycles
        })
      });

      const data = await response.json();
      if (data.success) {
        const pred = data.prediction;
        
        // Update local state with predictions
        onUpdateEquipment(selectedMachineId, {
          runHours: runHours,
          temperature: temp,
          vibrationLevel: vibration,
          healthScore: pred.healthIndicator,
          status: pred.failureRisk === "Critical" || pred.failureRisk === "High" ? "Maintenance Required" : "Operational",
          failureRiskPrediction: pred.failureRisk,
          daysToServicePrediction: pred.daysToService,
          predictedFailurePoints: pred.predictedFailurePoints,
          servicePlan: pred.servicePlan
        });
      } else {
        alert("Telemetry Diagnostic Error: " + (data.error || "Unknown error"));
      }
    } catch (err: any) {
      console.error(err);
      alert("Failed to run diagnostics: " + err.message);
    } finally {
      setMaintLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Tab Selectors header */}
      <div className="bg-white p-4.5 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Advanced AI Diagnostics</h1>
          <p className="text-slate-500 text-xs mt-0.5">Solve logistics hurdles and prevent machine downtime with server-side machine learning models.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto shrink-0 border border-slate-200">
          <button 
            onClick={() => setActiveTab("storage")}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "storage" ? "bg-white text-slate-950 shadow-xs" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Compass className="w-4 h-4" />
            Storage Route Optimizer
          </button>
          <button 
            onClick={() => setActiveTab("maintenance")}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "maintenance" ? "bg-white text-slate-950 shadow-xs" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Wrench className="w-4 h-4" />
            Predictive Maintenance
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* TAB 1: STORAGE OPTIMIZER */}
        {activeTab === "storage" && (
          <>
            {/* Inputs Panel (7 Cols) */}
            <div id="storage-optimizer-inputs" className="md:col-span-7 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-blue-600" />
                  Simulate Cargo Payload
                </h2>
                <p className="text-xs text-slate-500 mt-1">Specify package dimensional limits and retrieval speeds to let AI compute the ideal warehouse location.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-bold text-slate-700">Payload Name / Nomenclature</label>
                  <input 
                    type="text" 
                    value={itemName} 
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="e.g. Specialized Microprocessor Nodes"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white text-xs px-3 py-2 rounded-lg outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Weight (lbs)</label>
                  <input 
                    type="number" 
                    value={itemWeight} 
                    onChange={(e) => setItemWeight(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white text-xs px-3 py-2 rounded-lg outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Dimensions (e.g. LxWxH in)</label>
                  <input 
                    type="text" 
                    value={itemDims} 
                    onChange={(e) => setItemDims(e.target.value)}
                    placeholder="e.g. 15&quot; x 12&quot; x 6&quot;"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white text-xs px-3 py-2 rounded-lg outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-bold text-slate-700 block">Retrieval Velocity (Dispatched speed)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["High", "Medium", "Low"].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setVelocity(level as any)}
                        className={`py-2 rounded-lg text-xs font-semibold border transition-all ${
                          velocity === level 
                            ? "bg-blue-600 text-white border-blue-600 shadow-xs" 
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {level === "High" ? "⚡ High (Fast Out)" : level === "Medium" ? "📦 Medium" : "⏳ Low (Long Term)"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Switch Toggles */}
                <div className="col-span-2 space-y-3 pt-2">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={isTempSensitive}
                      onChange={(e) => setIsTempSensitive(e.target.checked)}
                      className="w-4.5 h-4.5 accent-blue-600 rounded"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Requires climate control / Cold Room</span>
                      <span className="text-[10px] text-slate-400">Forces placement in protected Zone B temperature vaults</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={isHazardous}
                      onChange={(e) => setIsHazardous(e.target.checked)}
                      className="w-4.5 h-4.5 accent-blue-600 rounded"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Fragile, Explosive, or Electrostatic Hazard</span>
                      <span className="text-[10px] text-slate-400">Adheres to specialized protective shelving parameters</span>
                    </div>
                  </label>
                </div>
              </div>

              <button 
                onClick={handleOptimizeStorage}
                disabled={storageLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm py-2.5 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
              >
                {storageLoading ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin" />
                    Gemini AI computing optimal spatial grids...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Determine Optimal Shelf Coordinates
                  </>
                )}
              </button>
            </div>

            {/* Results Panel (5 Cols) */}
            <div id="storage-optimizer-results" className="md:col-span-5 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm tracking-wide uppercase border-b border-slate-100 pb-3 mb-4">
                  Spatial Mapping Recommendation
                </h3>

                {storageResult ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 space-y-1">
                      <span className="text-[10px] font-mono uppercase text-blue-600 block font-bold">Suggested Warehouse Region</span>
                      <div className="text-base font-extrabold text-blue-950">{storageResult.recommendedZone}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-xl bg-purple-50 border border-purple-100 space-y-1">
                        <span className="text-[9px] font-mono uppercase text-purple-600 block font-bold">Shelf Coordinates</span>
                        <div className="text-sm font-bold text-purple-950 font-mono">{storageResult.shelfCoordinates}</div>
                      </div>
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 space-y-1">
                        <span className="text-[9px] font-mono uppercase text-emerald-600 block font-bold">Accessibility Score</span>
                        <div className="text-sm font-bold text-emerald-950">{storageResult.accessibilityScore} / 10</div>
                      </div>
                    </div>

                    <div className="space-y-1 pt-2">
                      <span className="text-[9px] font-mono uppercase text-slate-400 block font-bold">Safety Instructions</span>
                      <p className="text-xs text-amber-800 font-medium leading-relaxed bg-amber-50/50 p-3 rounded-xl border border-amber-100">
                        {storageResult.safetyGuidelines}
                      </p>
                    </div>

                    <div className="space-y-1 pt-2">
                      <span className="text-[9px] font-mono uppercase text-slate-400 block font-bold">AI Allocation Rationale</span>
                      <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                        {storageResult.allocationMapReason}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="py-24 text-center text-slate-400 space-y-3">
                    <Cpu className="w-12 h-12 mx-auto text-slate-300" />
                    <div>
                      <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Awaiting Simulation</div>
                      <p className="text-xs text-slate-400 mt-1 max-w-[200px] mx-auto leading-relaxed">
                        Input the item specs on the left and click calculate to display recommendations.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {storageResult && (
                <div className="pt-4 border-t border-slate-100 text-[10px] text-slate-400 font-medium">
                  💡 High efficiency placements can increase retrieval speeds by up to 28%.
                </div>
              )}
            </div>
          </>
        )}

        {/* TAB 2: PREDICTIVE MAINTENANCE */}
        {activeTab === "maintenance" && (
          <>
            {/* Inputs & Diagnostics controls (7 Cols) */}
            <div id="predictive-maintenance-inputs" className="md:col-span-7 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Gauge className="w-5 h-5 text-blue-600 animate-spin-slow" />
                    Telemetry Adjuster Panel
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">Adjust dials of physical warehouse machinery to simulate stress tests and predict structural failures.</p>
                </div>
                
                <select 
                  value={selectedMachineId} 
                  onChange={(e) => handleMachineChange(e.target.value)}
                  className="bg-slate-100 border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg outline-none font-semibold text-slate-800"
                >
                  {equipment.map(e => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-5 bg-slate-50 p-4.5 rounded-xl border border-slate-200">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5 pb-3 border-b border-slate-200">
                  <Sliders className="w-4 h-4 text-blue-600" />
                  Active Telemetry Dials: {currentMachine.name}
                </div>

                {/* Control 1: Run Hours */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700">Cumulative Run Hours</span>
                    <span className="text-blue-600 font-mono">{runHours} hrs</span>
                  </div>
                  <input 
                    type="range" 
                    min="100" 
                    max="15000" 
                    step="50"
                    value={runHours} 
                    onChange={(e) => setRunHours(parseInt(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer h-1.5 rounded bg-slate-200"
                  />
                </div>

                {/* Control 2: Operating Temp */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700 flex items-center gap-1">
                      <Thermometer className="w-4 h-4 text-rose-500" />
                      Operating Temperature
                    </span>
                    <span className={`font-mono ${temp > 70 ? "text-rose-600 font-bold" : "text-blue-600"}`}>{temp}°C</span>
                  </div>
                  <input 
                    type="range" 
                    min="5" 
                    max="120" 
                    value={temp} 
                    onChange={(e) => setTemp(parseInt(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer h-1.5 rounded bg-slate-200"
                  />
                </div>

                {/* Control 3: Vibration Levels */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700 flex items-center gap-1">
                      <Activity className="w-4 h-4 text-blue-500" />
                      Bearing Vibration
                    </span>
                    <span className={`font-mono ${vibration > 4.5 ? "text-rose-600 font-bold" : "text-blue-600"}`}>{vibration} mm/s</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.5" 
                    max="12.0" 
                    step="0.1"
                    value={vibration} 
                    onChange={(e) => setVibration(parseFloat(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer h-1.5 rounded bg-slate-200"
                  />
                </div>

                {/* Toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-200">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs font-semibold text-slate-700">
                    <input 
                      type="checkbox" 
                      checked={noise} 
                      onChange={(e) => setNoise(e.target.checked)}
                      className="w-4.5 h-4.5 accent-blue-600 rounded"
                    />
                    Unusual clanking noise reported
                  </label>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-slate-700">
                      <span>High-Load Cycles</span>
                      <span>{heavyLoadCycles}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="5" 
                      max="100" 
                      value={heavyLoadCycles} 
                      onChange={(e) => setHeavyLoadCycles(parseInt(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer h-1"
                    />
                  </div>
                </div>
              </div>

              <button 
                onClick={handlePredictMaintenance}
                disabled={maintLoading}
                className="w-full bg-slate-900 hover:bg-slate-850 active:bg-slate-950 text-white font-bold text-sm py-2.5 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
              >
                {maintLoading ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin" />
                    Running Gemini Machinery Fail-safe simulations...
                  </>
                ) : (
                  <>
                    <Wrench className="w-4 h-4" />
                    Run AI Predictive Diagnostics
                  </>
                )}
              </button>
            </div>

            {/* Results diagnostics panel (5 Cols) */}
            <div id="predictive-maintenance-results" className="md:col-span-5 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm tracking-wide uppercase border-b border-slate-100 pb-3 mb-4">
                  Diagnostic Telemetry Report
                </h3>

                {currentMachine.failureRiskPrediction ? (
                  <div className="space-y-4">
                    
                    {/* Health score and Risk bar */}
                    <div className="flex items-center gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-150">
                      <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="28" cy="28" r="24" fill="transparent" stroke="#E2E8F0" strokeWidth="4" />
                          <circle 
                            cx="28" cy="28" r="24" fill="transparent" 
                            stroke={currentMachine.healthScore > 75 ? "#10B981" : currentMachine.healthScore > 50 ? "#F59E0B" : "#EF4444"} 
                            strokeWidth="4" 
                            strokeDasharray={2 * Math.PI * 24}
                            strokeDashoffset={2 * Math.PI * 24 * (1 - currentMachine.healthScore / 100)}
                          />
                        </svg>
                        <span className="absolute text-xs font-bold font-mono">{currentMachine.healthScore}%</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono text-slate-400 block font-bold uppercase leading-none">Diagnostic Rating</span>
                        <div className="text-sm font-bold text-slate-950">{currentMachine.name}</div>
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          currentMachine.failureRiskPrediction === "Low" 
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                            : currentMachine.failureRiskPrediction === "Medium" 
                            ? "bg-amber-50 text-amber-700 border border-amber-100" 
                            : "bg-rose-50 text-rose-700 border border-rose-100 animate-pulse"
                        }`}>
                          Risk Class: {currentMachine.failureRiskPrediction}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 space-y-1">
                        <span className="text-[9px] font-mono uppercase text-blue-600 block font-bold">ETA to Failure</span>
                        <div className="text-sm font-bold text-blue-950 font-mono">
                          {currentMachine.daysToServicePrediction} Days
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 space-y-1">
                        <span className="text-[9px] font-mono uppercase text-rose-600 block font-bold">Likely Break Point</span>
                        <div className="text-xs font-bold text-rose-950 truncate">
                          {currentMachine.predictedFailurePoints}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <span className="text-[9px] font-mono uppercase text-slate-400 block font-bold">Technician Service Directive</span>
                      <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-150 max-h-[140px] overflow-y-auto">
                        {currentMachine.servicePlan}
                      </p>
                    </div>

                  </div>
                ) : (
                  <div className="py-24 text-center text-slate-400 space-y-3">
                    <Wrench className="w-12 h-12 mx-auto text-slate-300" />
                    <div>
                      <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Awaiting Diagnostics</div>
                      <p className="text-xs text-slate-400 mt-1 max-w-[200px] mx-auto leading-relaxed">
                        Specify stress parameters on the left and trigger predictive logs to display.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {currentMachine.failureRiskPrediction && (
                <div className="pt-4 border-t border-slate-100 text-[10px] text-slate-400 font-medium">
                  ✓ Maintenance recommendations are archived into shifting logs.
                </div>
              )}
            </div>
          </>
        )}

      </div>

    </div>
  );
}
