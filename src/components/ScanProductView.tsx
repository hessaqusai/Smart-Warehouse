import React, { useState, useRef, useEffect } from "react";
import { 
  Camera, 
  Upload, 
  Scan, 
  Cpu, 
  FileCheck, 
  Compass, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Play, 
  Check, 
  QrCode, 
  Inbox, 
  FolderSearch,
  BadgeAlert
} from "lucide-react";
import { InventoryItem } from "../types";

interface ScanProductViewProps {
  onAddItem: (item: InventoryItem) => void;
  onNavigate: (tab: string) => void;
}

// Preset tags for fast simulation testing
const PRESET_TAGS = [
  {
    name: "Industrial Copper Wire Reels",
    qr: "RFID-COP-884210",
    desc: "Reels of premium industrial heavy gauge wiring",
    weight: "45 lbs",
    dimensions: "24\" x 24\" x 18\"",
    imagePlaceholder: "A stack of thick heavy orange copper metal reels on a wooden logistics pallet, wrapped in secure industrial protective plastic sheeting, warehouse background."
  },
  {
    name: "Lithium Ion Battery Packs (48V)",
    qr: "RFID-BAT-220914",
    desc: "Lithium secondary batteries for warehouse forklifts",
    weight: "22 lbs",
    dimensions: "18\" x 12\" x 8\"",
    imagePlaceholder: "Heavy industrial black secondary batteries with yellow caution logos and copper connectors, stored in a specialized clean safety container."
  },
  {
    name: "Nomex Fire Resistant Suits",
    qr: "RFID-SAF-440212",
    desc: "Level 4 chemical and fire hazard safety protective gear",
    weight: "4 lbs",
    dimensions: "20\" x 16\" x 6\"",
    imagePlaceholder: "Folded fire protective orange Nomex suits with reflective gray stripes and visors, pristine condition in a clean box."
  },
  {
    name: "Heavy Duty Hydraulic Fluids",
    qr: "RFID-CHM-114402",
    desc: "High-viscosity standard hydraulic fluid for heavy robotic machinery lifts",
    weight: "80 lbs (per barrel)",
    dimensions: "22\" x 22\" x 36\"",
    imagePlaceholder: "A blue steel chemical barrel with standard hazard placards (toxic/corrosive icons), sealed tight."
  }
];

export default function ScanProductView({ onAddItem, onNavigate }: ScanProductViewProps) {
  // Modes: "camera" | "upload" | "preset"
  const [inputMode, setInputMode] = useState<"camera" | "upload" | "preset">("preset");
  const [selectedPreset, setSelectedPreset] = useState<number>(0);
  const [manualDetails, setManualDetails] = useState<string>("");
  const [qrInput, setQrInput] = useState<string>("");
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanImage, setScanImage] = useState<string | null>(null);

  // Loading & Results
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<any | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Camera states
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Clean camera up
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const startCamera = async () => {
    setIsScanning(true);
    setScanImage(null);
    setAiResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn("Could not start real camera (usually due to iframe sandbox or lack of hardware). Running matrix simulator feed instead.", err);
    }
  };

  // Switch modes safely
  useEffect(() => {
    stopCamera();
    return () => stopCamera();
  }, [inputMode]);

  const capturePhoto = () => {
    if (streamRef.current && videoRef.current) {
      // Capture actual photo
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg");
        setScanImage(dataUrl);
        stopCamera();
      }
    } else {
      // Simulate snapshot of chosen preset if camera is a simulated fallback
      setScanImage("SIMULATED_SNAPSHOT");
      setIsScanning(false);
    }
  };

  // Trigger Gemini API Analysis
  const runAIAnalysis = async () => {
    setIsLoading(true);
    setAiResult(null);
    setSaveSuccess(false);

    let base64Img = scanImage;
    // Generate a beautiful, structured simulation if the image is just a mock string
    if (base64Img === "SIMULATED_SNAPSHOT" || !base64Img) {
      base64Img = null; // Backend will generate full metadata
    }

    try {
      const payload: any = {
        manualDetails: manualDetails || (inputMode === "preset" ? PRESET_TAGS[selectedPreset].desc : ""),
        qrCode: qrInput || (inputMode === "preset" ? PRESET_TAGS[selectedPreset].qr : "RFID-MOCK-" + Math.floor(Math.random() * 899999 + 100000)),
        itemType: inputMode === "preset" ? PRESET_TAGS[selectedPreset].name : "",
      };

      if (base64Img) {
        payload.image = base64Img;
      }

      const response = await fetch("/api/gemini/analyze-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.success) {
        setAiResult(data.analysis);
      } else {
        alert("Gemini Scan Error: " + (data.error || "Unknown Error"));
      }
    } catch (error: any) {
      console.error(error);
      alert("Failed to communicate with AI server: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Confirm stock placement and add to Inventory state
  const confirmStockPlacement = () => {
    if (!aiResult) return;

    const newItem: InventoryItem = {
      id: "INV-" + Math.floor(Math.random() * 8999 + 1000),
      name: aiResult.itemName,
      sku: aiResult.sku,
      category: aiResult.category,
      quantity: aiResult.quantityInferred || 10,
      minStockLevel: Math.ceil((aiResult.quantityInferred || 10) * 0.3),
      zone: aiResult.suggestedZone,
      shelf: aiResult.suggestedShelf,
      weight: aiResult.weight,
      dimensions: aiResult.dimensions,
      lastUpdated: new Date().toISOString().split("T")[0],
      source: inputMode === "camera" ? "AI Camera Scan" : (inputMode === "preset" ? "RFID Tag" : "Manual Input"),
      accessFrequency: "Medium",
    };

    onAddItem(newItem);
    setSaveSuccess(true);
    setTimeout(() => {
      onNavigate("dashboard");
    }, 2000);
  };

  // Preset upload mock handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setScanImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Scan className="w-6 h-6 text-blue-600 animate-pulse" />
            QR / RFID Digital Scanner & Registrar
          </h1>
          <p className="text-slate-500 text-sm mt-1">Register incoming inventory in seconds using smart vision audits and automatic rack routing.</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button 
            onClick={() => setInputMode("preset")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              inputMode === "preset" ? "bg-blue-600 text-white shadow-sm" : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            📋 Presets Demo
          </button>
          <button 
            onClick={() => {
              setInputMode("camera");
              startCamera();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
              inputMode === "camera" ? "bg-blue-600 text-white shadow-sm" : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            Camera
          </button>
          <button 
            onClick={() => setInputMode("upload")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
              inputMode === "upload" ? "bg-blue-600 text-white shadow-sm" : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Upload File
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Side: Scanner / Inputs (7 Columns) */}
        <div className="md:col-span-7 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
          
          {/* CAMERA MODE */}
          {inputMode === "camera" && (
            <div className="space-y-4">
              <div className="relative aspect-video bg-black rounded-xl overflow-hidden border-2 border-blue-500 flex flex-col items-center justify-center">
                {isScanning ? (
                  <>
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    {/* Retro Camera Grid HUD */}
                    <div className="absolute inset-0 border-4 border-white/10 flex flex-col justify-between p-4 pointer-events-none">
                      <div className="flex justify-between items-start">
                        <div className="text-[9px] font-mono text-emerald-400 bg-black/60 px-2 py-0.5 rounded flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                          REC (FEED ACTIVE)
                        </div>
                        <div className="text-[9px] font-mono text-white/60">AUTOFOCUS ACTIVE</div>
                      </div>
                      
                      {/* Scanning laser line */}
                      <div className="w-full h-0.5 bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] absolute left-0 top-[45%] animate-bounce"></div>
                      
                      <div className="flex justify-between items-end">
                        <div className="text-[9px] font-mono text-white/50">RES: 1080P</div>
                        <div className="text-[9px] font-mono text-white/50">ISO 400</div>
                      </div>
                    </div>
                  </>
                ) : scanImage ? (
                  <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                    {scanImage === "SIMULATED_SNAPSHOT" ? (
                      <div className="text-center space-y-3 p-6">
                        <QrCode className="w-12 h-12 text-blue-400 mx-auto animate-pulse" />
                        <div>
                          <div className="text-sm font-bold text-white">Simulated Tag Snapshot Acquired</div>
                          <p className="text-[11px] text-slate-400 mt-0.5">Preset: {PRESET_TAGS[selectedPreset].name}</p>
                        </div>
                      </div>
                    ) : (
                      <img src={scanImage} alt="Captured scan" className="w-full h-full object-contain" />
                    )}
                  </div>
                ) : (
                  <div className="text-center p-6 text-slate-400 space-y-3">
                    <Camera className="w-12 h-12 mx-auto text-slate-300" />
                    <div className="text-sm">Camera is inactive.</div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                {isScanning ? (
                  <button 
                    onClick={capturePhoto}
                    className="flex-1 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white py-2.5 rounded-xl font-bold text-sm transition-all shadow-xs flex items-center justify-center gap-1.5"
                  >
                    📸 Freeze & Capture Frame
                  </button>
                ) : (
                  <button 
                    onClick={startCamera}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white py-2.5 rounded-xl font-bold text-sm transition-all shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Restart Camera Stream
                  </button>
                )}
              </div>
            </div>
          )}

          {/* UPLOAD FILE MODE */}
          {inputMode === "upload" && (
            <div className="space-y-4">
              <label className="border-2 border-dashed border-slate-250 hover:border-blue-400 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50 group">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleFileUpload}
                />
                <Inbox className="w-12 h-12 text-slate-400 group-hover:text-blue-500 transition-colors mb-3" />
                <span className="text-sm font-semibold text-slate-700">Drag and drop package image here</span>
                <span className="text-xs text-slate-400 mt-1">Supports PNG, JPG up to 10MB</span>
                <span className="mt-4 bg-white border border-slate-200 px-4 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 shadow-xs">
                  Choose Photo
                </span>
              </label>

              {scanImage && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span className="text-xs font-semibold text-slate-700 truncate max-w-[200px]">Photo Uploaded Successfully</span>
                  </div>
                  <button 
                    onClick={() => setScanImage(null)}
                    className="text-[10px] text-rose-600 font-bold hover:underline"
                  >
                    Remove Photo
                  </button>
                </div>
              )}
            </div>
          )}

          {/* PRESET TAG DEMO MODE */}
          {inputMode === "preset" && (
            <div className="space-y-4">
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                <Compass className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-blue-900">Preset Simulation Mode</h4>
                  <p className="text-[11px] text-blue-700 leading-relaxed">
                    Select a target incoming component label. This simulates scanning real QR code / RFID microchips directly with physical warehouse credentials.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PRESET_TAGS.map((tag, idx) => (
                  <div 
                    key={idx}
                    onClick={() => {
                      setSelectedPreset(idx);
                      setQrInput(tag.qr);
                      setManualDetails(tag.desc);
                      setScanImage("SIMULATED_SNAPSHOT");
                    }}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all text-left space-y-1.5 ${
                      selectedPreset === idx 
                        ? "border-blue-600 bg-blue-50/20 shadow-xs" 
                        : "border-slate-150 hover:bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 truncate pr-2">{tag.name}</span>
                      <span className={`w-3 h-3 rounded-full border flex items-center justify-center shrink-0 ${
                        selectedPreset === idx ? "border-blue-600 bg-blue-600" : "border-slate-300"
                      }`}>
                        {selectedPreset === idx && <Check className="w-2 h-2 text-white stroke-[3]" />}
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">RFID: {tag.qr}</div>
                    <div className="text-[10px] text-slate-500 leading-snug line-clamp-1">{tag.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* QR/RFID Code Override Input & Manual Logs */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <QrCode className="w-3.5 h-3.5 text-slate-400" />
                  Override scanned tag (QR/RFID string)
                </label>
                <input 
                  type="text" 
                  value={qrInput}
                  onChange={(e) => setQrInput(e.target.value)}
                  placeholder="e.g. RFID-XYZ-99042"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white text-xs px-3 py-2 rounded-lg outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <FolderSearch className="w-3.5 h-3.5 text-slate-400" />
                  Manual package description
                </label>
                <input 
                  type="text" 
                  value={manualDetails}
                  onChange={(e) => setManualDetails(e.target.value)}
                  placeholder="e.g. Copper reels, weight 45lbs"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white text-xs px-3 py-2 rounded-lg outline-none transition-all"
                />
              </div>
            </div>

            <button 
              onClick={runAIAnalysis}
              disabled={isLoading || (!scanImage && !qrInput && !manualDetails)}
              className="w-full bg-slate-900 hover:bg-slate-850 active:bg-slate-950 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-sm py-3 px-4 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Gemini AI Analyzing physical parameters...
                </>
              ) : (
                <>
                  <Cpu className="w-4 h-4" />
                  Execute Gemini AI Audit & Route Suggestions
                </>
              )}
            </button>
          </div>

        </div>

        {/* Right Side: Gemini AI Routing & Placement result (5 Columns) */}
        <div className="md:col-span-5 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-4">
                <h3 className="font-bold text-slate-900 text-sm tracking-wide uppercase flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-blue-600" />
                  AI Placement Registry
                </h3>
                <span className="text-[10px] font-semibold text-slate-400">Powered by Gemini-3.5</span>
              </div>

              {saveSuccess ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-100">
                    <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">Inventory Registry Success</h4>
                    <p className="text-xs text-slate-500 mt-1">Item registered on shelf {aiResult?.suggestedShelf}. Returning to console...</p>
                  </div>
                </div>
              ) : aiResult ? (
                <div className="space-y-5">
                  
                  {/* Anomaly / Mistake check alert */}
                  {aiResult.mistakeDetected ? (
                    <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-100 flex items-start gap-2.5">
                      <BadgeAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-rose-900">AI Logging Mistake Detected</h4>
                        <p className="text-[11px] text-rose-700 leading-relaxed mt-0.5">{aiResult.mistakeDetails}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-start gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-emerald-900">Zero Registry Mistakes Detected</h4>
                        <p className="text-[11px] text-emerald-700 leading-relaxed mt-0.5">Physical telemetry completely matches log standards.</p>
                      </div>
                    </div>
                  )}

                  {/* Identified Product Info */}
                  <div className="space-y-3">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block">Identified Item</span>
                      <h4 className="text-base font-bold text-slate-950">{aiResult.itemName}</h4>
                    </div>

                    <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-150">
                      <div>
                        <span className="text-[9px] font-mono uppercase text-slate-400 block">Formed SKU</span>
                        <span className="text-xs font-bold text-slate-800">{aiResult.sku}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-mono uppercase text-slate-400 block">Category</span>
                        <span className="text-xs font-bold text-slate-800">{aiResult.category}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-mono uppercase text-slate-400 block">Quantity Count</span>
                        <span className="text-xs font-bold text-slate-800">{aiResult.quantityInferred} items</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-mono uppercase text-slate-400 block">Specs</span>
                        <span className="text-xs font-bold text-slate-800">{aiResult.weight} / {aiResult.dimensions}</span>
                      </div>
                    </div>
                  </div>

                  {/* AI Placement suggestions */}
                  <div className="space-y-2 border-t border-slate-100 pt-4">
                    <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block">Optimal Rack Location Router</span>
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg">
                        <span className="text-[9px] text-blue-600 font-bold block uppercase leading-none mb-1">Zone Assignment</span>
                        <span className="text-xs font-bold text-blue-950">{aiResult.suggestedZone}</span>
                      </div>
                      <div className="bg-purple-50 border border-purple-100 px-3 py-1.5 rounded-lg">
                        <span className="text-[9px] text-purple-600 font-bold block uppercase leading-none mb-1">Coordinate</span>
                        <span className="text-xs font-bold text-purple-950 font-mono">{aiResult.suggestedShelf}</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed flex items-start gap-2 mt-2">
                      <FileCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-800 font-semibold block mb-0.5">AI Routing Justification</strong>
                        {aiResult.justification}
                      </div>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="py-20 text-center space-y-3">
                  <Inbox className="w-12 h-12 text-slate-300 mx-auto" />
                  <div>
                    <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Awaiting Scan Telemetry</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-[200px] mx-auto leading-relaxed">
                      Select or scan an item on the left and run AI audit to display routing.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {aiResult && !saveSuccess && (
              <div className="border-t border-slate-100 pt-4 mt-6">
                <button 
                  onClick={confirmStockPlacement}
                  className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm py-2.5 px-4 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5"
                >
                  Confirm Physical Placement & Log Stock
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
