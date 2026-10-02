import React, { useState, useRef } from 'react';
import { Trash2, Lightbulb, Camera, Sparkles, Loader2, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function AIClassificationPage() {
  const fileInputRef = useRef(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState({
    waste_detected: true,
    category: 'Plastic',
    confidence: 94,
    recommended_bin: 'Dry Waste (Recyclable)',
    disposal_tip: 'Please dispose of plastic waste in the blue dry-waste bin to help recycling.',
    severity: 'medium',
    engine: 'Vision LLM Model',
    reason: 'Verified real waste'
  });

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Set preview
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('/api/ai/classify-waste', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (data.success) {
        setResult({
          waste_detected: data.waste_detected !== false,
          category: data.category || 'Plastic',
          confidence: data.confidence || 90,
          recommended_bin: data.recommended_bin || 'Dry Waste (Recyclable)',
          disposal_tip: data.disposal_tip || (data.waste_detected === false ? 'Upload a photo showing real physical trash or garbage.' : 'Dispose in blue dry-waste bin to help recycling.'),
          severity: data.severity || 'medium',
          engine: data.engine || 'Vision AI Model',
          reason: data.reason || (data.waste_detected === false ? 'No physical garbage detected in image.' : 'Real waste verified.')
        });
      }
    } catch (err) {
      console.error('Vision AI classification error:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const isNonWaste = result.waste_detected === false || result.category?.toLowerCase().includes('non-waste');
  const isDry = result.recommended_bin?.toLowerCase().includes('dry') || result.recommended_bin?.toLowerCase().includes('blue');
  const isWet = result.recommended_bin?.toLowerCase().includes('wet') || result.recommended_bin?.toLowerCase().includes('green');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            AI Waste Classification <Sparkles size={22} className="text-emerald-600" />
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Upload any real-life waste photo to classify in real time.</p>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="self-start sm:self-auto bg-[#105a39] hover:bg-[#0b452a] text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition shadow-sm cursor-pointer"
        >
          <Camera size={16} /> Upload New Photo
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageSelect}
        accept="image/*"
        className="hidden"
      />

      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Left Side - Image view */}
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="bg-slate-100 rounded-2xl border-2 border-dashed border-slate-300 overflow-hidden h-80 flex items-center justify-center relative cursor-pointer group hover:border-emerald-500 transition-colors"
          >
            {imagePreview ? (
              <img 
                src={imagePreview} 
                alt="Uploaded waste" 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="absolute inset-0 bg-slate-100 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Camera size={32} />
                </div>
                <span className="font-bold text-slate-700 text-sm">Click to Choose Photo</span>
                <span className="text-xs text-slate-400 mt-1">Real-life garbage, bottle, paper, food waste</span>
              </div>
            )}

            {analyzing && (
              <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-xs flex flex-col items-center justify-center text-white p-4">
                <Loader2 size={36} className="animate-spin text-emerald-400 mb-2" />
                <p className="font-bold text-sm">Vision AI Scanning...</p>
                <p className="text-xs text-emerald-200 mt-1">Detecting waste texture & recyclability</p>
              </div>
            )}
          </div>
          
          <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()}
            disabled={analyzing}
            className="w-full bg-[#105a39] hover:bg-[#0b452a] text-white py-3 rounded-xl font-bold transition-colors shadow-sm text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <RefreshCw size={16} className={analyzing ? "animate-spin" : ""} />
            {analyzing ? 'Scanning...' : 'Upload / Test Another Image'}
          </button>
        </div>

        {/* Right Side - Results */}
        <div className="w-full md:w-1/2 flex flex-col gap-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm justify-between">
          
          {/* Classification Result */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 text-base">Classification Result</h3>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                isNonWaste ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {isNonWaste ? 'Rejection / Non-Waste' : result.engine || 'Vision AI'}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border shrink-0 ${
                isNonWaste 
                  ? 'bg-red-50 text-red-600 border-red-200' 
                  : 'bg-emerald-50 text-emerald-600 border-emerald-100'
              }`}>
                {isNonWaste ? (
                  <Trash2 size={30} className="text-red-500 opacity-60" />
                ) : (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                )}
              </div>
              <div>
                <p className={`font-bold text-xl sm:text-2xl leading-tight ${isNonWaste ? 'text-red-700' : 'text-slate-800'}`}>
                  {result.category}
                </p>
                <p className={`text-xs font-bold mt-1 flex items-center gap-1 ${isNonWaste ? 'text-red-500' : 'text-emerald-600'}`}>
                  <CheckCircle2 size={14} /> {isNonWaste ? 'Verification Status: Not Waste' : `Confidence: ${result.confidence}%`}
                </p>
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-slate-100"></div>

          {/* Recommended Bin */}
          <div>
            <h3 className="font-bold text-slate-800 text-sm mb-3">Recommended Bin Color</h3>
            {isNonWaste ? (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 font-medium">
                ⚠️ N/A — No physical waste recognized. Please upload a clear photo of garbage or recycling items.
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className={`w-12 h-14 ${isDry ? 'bg-blue-500 border-b-4 border-blue-700' : isWet ? 'bg-emerald-500 border-b-4 border-emerald-700' : 'bg-red-500 border-b-4 border-red-700'} rounded-t-lg rounded-b flex flex-col items-center justify-center shrink-0 relative shadow-sm`}>
                   <div className={`absolute -top-1.5 w-full h-2 ${isDry ? 'bg-blue-600' : isWet ? 'bg-emerald-600' : 'bg-red-600'} rounded-t-lg`}></div>
                   <Trash2 size={24} className="text-white opacity-90 mt-1" />
                </div>
                <div>
                  <p className="font-bold text-base text-slate-800 leading-tight">{result.recommended_bin}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Municipal segregation standard</p>
                </div>
              </div>
            )}
          </div>

          {/* Tip Card */}
          <div className={`border rounded-xl p-3.5 flex gap-3 ${
            isNonWaste ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
          }`}>
            <div className={`shrink-0 mt-0.5 ${isNonWaste ? 'text-red-500' : 'text-amber-500'}`}>
              <Lightbulb size={18} fill="currentColor" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-xs mb-0.5">
                {isNonWaste ? 'Upload Requirement' : 'Disposal Tip'}
              </p>
              <p className="text-slate-600 text-xs leading-relaxed">
                {result.disposal_tip}
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
