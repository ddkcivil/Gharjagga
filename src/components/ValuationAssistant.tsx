import React, { useState } from 'react';
import { Bot, Sparkles, Loader2 } from 'lucide-react';

export default function ValuationAssistant() {
  const [region, setRegion] = useState('');
  const [landType, setLandType] = useState('Terai');
  const [area, setArea] = useState('');
  const [estimate, setEstimate] = useState<{ low: number; high: number; explanation: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEstimate = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/estimate-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ region, landType, area }),
      });
      const data = await response.json();
      setEstimate(data);
    } catch (error) {
      console.error('Estimation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-neutral-150 space-y-4">
      <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
        <Bot className="text-amber-700" size={16} />
        Land Valuation Assistant
      </h3>
      <div className="space-y-3">
        <input type="text" placeholder="Region/Municipality" value={region} onChange={(e) => setRegion(e.target.value)} className="w-full border p-2 text-xs rounded" />
        <select value={landType} onChange={(e) => setLandType(e.target.value)} className="w-full border p-2 text-xs rounded">
          <option value="Terai">Terai</option>
          <option value="Hilly">Hilly</option>
        </select>
        <input type="text" placeholder="Area (e.g. 5 Kattha)" value={area} onChange={(e) => setArea(e.target.value)} className="w-full border p-2 text-xs rounded" />
        <button onClick={handleEstimate} disabled={loading} className="w-full bg-amber-700 text-white p-2 rounded text-xs font-bold flex items-center justify-center gap-2">
          {loading ? <Loader2 className="animate-spin" size={14} /> : <><Sparkles size={14} /> Estimate Market Price</>}
        </button>
      </div>
      {estimate && (
        <div className="mt-4 p-3 bg-neutral-50 rounded text-xs text-neutral-700 space-y-2">
          <p><strong>Range:</strong> NPR {estimate.low.toLocaleString()} - {estimate.high.toLocaleString()}</p>
          <p>{estimate.explanation}</p>
        </div>
      )}
    </div>
  );
}
