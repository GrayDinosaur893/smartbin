import React from 'react';
import { Camera, MapPin } from 'lucide-react';

export default function ReportWastePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Report Waste</h1>
        <p className="text-slate-500 mt-1">Help us keep our city clean. Report litter, overflowing bins, or waste issues.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side - Image Upload */}
        <div className="w-full md:w-5/12 p-8 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col justify-center bg-slate-50/50">
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center text-center h-full min-h-[300px] hover:bg-slate-50 hover:border-emerald-500 transition-colors cursor-pointer group">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors">
              <Camera size={32} className="text-slate-400 group-hover:text-emerald-600 transition-colors" />
            </div>
            <p className="font-medium text-slate-700 mb-1">Upload a photo</p>
            <p className="text-sm text-slate-500 mb-6">or drag and drop<br/>(JPG, PNG, up to 5MB)</p>
            <button type="button" className="bg-[#105a39] hover:bg-[#0b452a] text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm">
              Choose Image
            </button>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-7/12 p-8 flex flex-col justify-center">
          <form className="space-y-5">
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  defaultValue="Gwalior, Madhya Pradesh"
                  className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-[#105a39] focus:ring-1 focus:ring-[#105a39] transition-colors text-sm font-medium text-slate-700"
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#105a39] hover:text-[#0b452a]">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Waste Category (optional)</label>
              <div className="relative">
                <select className="w-full pl-4 pr-10 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-[#105a39] focus:ring-1 focus:ring-[#105a39] transition-colors appearance-none text-sm text-slate-700 bg-white cursor-pointer">
                  <option>Select category</option>
                  <option>Plastic</option>
                  <option>Organic</option>
                  <option>Electronic</option>
                  <option>Mixed</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Describe the issue (optional)</label>
              <textarea 
                placeholder="E.g. Overflowing bin, litter around, etc."
                rows="4"
                className="w-full p-4 border border-slate-300 rounded-lg focus:outline-none focus:border-[#105a39] focus:ring-1 focus:ring-[#105a39] transition-colors text-sm resize-none"
              ></textarea>
            </div>

            <button type="button" className="w-full bg-[#105a39] hover:bg-[#0b452a] text-white py-3 rounded-lg font-medium transition-colors mt-4 shadow-sm text-sm">
              Submit Report
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
