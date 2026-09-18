import React from 'react';
import { Trash2, Lightbulb } from 'lucide-react';

export default function AIClassificationPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">AI Waste Classification</h1>
        <p className="text-slate-500 mt-1">Upload an image and let AI identify the type of waste.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Left Side - Image view */}
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <div className="bg-slate-200 rounded-xl border border-slate-300 overflow-hidden h-80 flex items-center justify-center relative">
            {/* Fake bottle image (using CSS styling for placeholder) */}
            <div className="absolute inset-0 bg-slate-300 flex items-center justify-center">
              <div className="text-slate-500 text-center">
                <span className="text-6xl mb-2 block">🚰</span>
                <span className="font-bold">Bottle.jpg</span>
              </div>
            </div>
          </div>
          
          <button type="button" className="w-full bg-[#105a39] hover:bg-[#0b452a] text-white py-3 rounded-lg font-medium transition-colors shadow-sm text-sm">
            Upload Another Image
          </button>
        </div>

        {/* Right Side - Results */}
        <div className="w-full md:w-1/2 flex flex-col gap-6">
          
          {/* Classification Result */}
          <div>
            <h3 className="font-bold text-slate-800 text-lg mb-4">Classification Result</h3>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-100 shrink-0">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
              </div>
              <div>
                <p className="font-bold text-2xl text-slate-800 leading-tight">Plastic</p>
                <p className="text-slate-500 text-sm font-medium mt-1">Confidence: 94%</p>
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-slate-200"></div>

          {/* Recommended Bin */}
          <div>
            <h3 className="font-bold text-slate-800 text-lg mb-4">Recommended Bin</h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-14 bg-blue-500 rounded-t-lg rounded-b flex flex-col items-center justify-center border-b-4 border-blue-700 shrink-0 relative">
                 <div className="absolute -top-1.5 w-full h-2 bg-blue-600 rounded-t-lg"></div>
                 <Trash2 size={24} className="text-white opacity-90 mt-1" />
              </div>
              <div>
                <p className="font-bold text-lg text-slate-800 leading-tight">Dry Waste (Recyclable)</p>
              </div>
            </div>
          </div>

          {/* Tip Card */}
          <div className="mt-2 bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
            <div className="text-amber-500 shrink-0 mt-0.5">
              <Lightbulb size={20} fill="currentColor" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm mb-0.5">Tip</p>
              <p className="text-slate-600 text-sm leading-relaxed">
                Please dispose of plastic waste in the dry-waste bin to help recycling.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
