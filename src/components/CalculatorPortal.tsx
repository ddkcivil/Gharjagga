import React, { useState } from 'react';
import { calculateSlabCommission, calculateNepalGovTaxes } from '../utils/converters';
import { Calculator, Download, FileText, CheckCircle } from 'lucide-react';
import ValuationAssistant from './ValuationAssistant';

export default function CalculatorPortal() {
  const [dealPrice, setDealPrice] = useState<number>(5000000); // 50 Lakhs NPR default
  const [calculationMode, setCalculationMode] = useState<'standard' | 'negotiated'>('standard');
  const [negotiatedRate, setNegotiatedRate] = useState<number>(2.0); // Default flat 2%

  // Tax settings
  const [buyerType, setBuyerType] = useState<'None' | 'Female' | 'Senior/Disabled'>('None');
  const [yearsOwned, setYearsOwned] = useState<number>(5); // 5+ years for CGT (5% instead of 7.5%)
  const [buyerName, setBuyerName] = useState<string>('Dharma Raj Kunwar');
  const [sellerName, setSellerName] = useState<string>('Krishna Prasad Sharma');
  const [propertyTitle, setPropertyTitle] = useState<string>('Tilottama Plotting Plot - Ward 4');

  const isFemale = buyerType === 'Female';
  const isSeniorOrDisabled = buyerType === 'Senior/Disabled';

  // Perform calculations
  const slabResult = calculateSlabCommission(dealPrice);
  const commRate = calculationMode === 'standard' ? slabResult.rate : negotiatedRate;
  const rawCommission = calculationMode === 'standard' ? slabResult.amount : (dealPrice * (negotiatedRate / 100));

  const vatAmount = rawCommission * 0.13; // 13% VAT
  const tdsAmount = rawCommission * 0.015; // 1.5% TDS
  const finalCommissionBill = rawCommission + vatAmount; // Bill total (with VAT)

  const taxResult = calculateNepalGovTaxes(dealPrice, isFemale, isSeniorOrDisabled, yearsOwned);

  const [invoiceSaved, setInvoiceSaved] = useState<boolean>(false);

  // Loan states
  const [loanAmount, setLoanAmount] = useState<number>(3000000); // 30 Lakhs
  const [interestRate, setInterestRate] = useState<number>(10.5); // Average Nepalese bank rate
  const [loanTenure, setLoanTenure] = useState<number>(15); // Years

  const monthlyRate = interestRate / 100 / 12;
  const numberOfMonths = loanTenure * 12;
  
  const emi = loanAmount > 0 
    ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfMonths)) / 
      (Math.pow(1 + monthlyRate, numberOfMonths) - 1)
    : 0;

  const totalPayment = emi * numberOfMonths;
  const totalInterest = totalPayment - loanAmount;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold text-neutral-900">Nepal Real Estate Financial & Commission Hub</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Calculate official land agency commission rules, municipal tax rebates, and draft detailed transaction receipts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Inputs */}
        <div className="lg:col-span-7 bg-white p-6 border border-neutral-100 rounded-xl space-y-6">
          <h2 className="text-lg font-semibold text-neutral-950 flex items-center gap-2 border-b border-neutral-100 pb-3">
            <Calculator className="text-amber-700" size={18} />
            Transaction Setup
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                Transaction Value (NPR)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-500 font-mono text-sm">
                  रु.
                </span>
                <input
                  type="number"
                  value={dealPrice}
                  onChange={(e) => {
                    const val = Math.max(0, parseInt(e.target.value) || 0);
                    setDealPrice(val);
                    setInvoiceSaved(false);
                  }}
                  className="pl-10 pr-4 py-2 w-full border border-neutral-200 rounded-md text-sm font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                Lakhs/Crores Equivalent:{' '}
                <span className="font-mono text-neutral-600 font-medium">
                  {dealPrice >= 10000000
                    ? `${(dealPrice / 10000000).toFixed(2)} Crore`
                    : `${(dealPrice / 100000).toFixed(2)} Lakhs`}
                </span>
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                Commission Strategy
              </label>
              <div className="flex bg-neutral-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setCalculationMode('standard')}
                  className={`flex-1 text-center py-1.5 text-xs font-medium rounded-md transition-all ${
                    calculationMode === 'standard'
                      ? 'bg-white text-neutral-950 shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-950'
                  }`}
                >
                  Standard Nepal Slabs
                </button>
                <button
                  type="button"
                  onClick={() => setCalculationMode('negotiated')}
                  className={`flex-1 text-center py-1.5 text-xs font-medium rounded-md transition-all ${
                    calculationMode === 'negotiated'
                      ? 'bg-white text-neutral-950 shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-950'
                  }`}
                >
                  Negotiated Rate
                </button>
              </div>
            </div>
          </div>

          {calculationMode === 'negotiated' && (
            <div className="bg-amber-50/50 p-4 rounded-lg border border-amber-100/50">
              <div className="flex justify-between text-xs font-medium text-amber-900 mb-1">
                <span>Negotiated Service Charge Rate</span>
                <span className="font-mono">{negotiatedRate.toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min="1.5"
                max="3.0"
                step="0.1"
                value={negotiatedRate}
                onChange={(e) => {
                  setNegotiatedRate(parseFloat(e.target.value));
                  setInvoiceSaved(false);
                }}
                className="w-full accent-amber-700 mt-2"
              />
              <span className="text-[10px] text-amber-700 mt-1 block">
                * Handdrawn specifications limit agency fee guidelines between 1.5% and 3.0% of the total deal value.
              </span>
            </div>
          )}

          <div className="border-t border-neutral-100 pt-5 space-y-4">
            <h3 className="text-sm font-semibold text-neutral-950">Nepal Government Registry Tax Discounts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Buyer Privilege Rebates
                </label>
                <select
                  value={buyerType}
                  onChange={(e) => {
                    setBuyerType(e.target.value as any);
                    setInvoiceSaved(false);
                  }}
                  className="w-full border border-neutral-200 rounded-md py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="None">None (Standard 5.0% Registry Fee)</option>
                  <option value="Female">Female Buyer (25% Rebate = 3.75% Fee)</option>
                  <option value="Senior/Disabled">Senior / Disabled Buyer (50% Rebate = 2.50% Fee)</option>
                </select>
                <span className="text-[10px] text-neutral-400 mt-1 block leading-normal">
                  * Municipalities grant registration rebates based on direct ownership certificates.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Seller Holding Duration (for CGT)
                </label>
                <select
                  value={yearsOwned}
                  onChange={(e) => {
                    setYearsOwned(parseInt(e.target.value));
                    setInvoiceSaved(false);
                  }}
                  className="w-full border border-neutral-200 rounded-md py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value={3}>Owned less than 5 Years (7.5% Tax on estimated gains)</option>
                  <option value={6}>Owned 5 Years or More (5.0% Tax on estimated gains)</option>
                </select>
                <span className="text-[10px] text-neutral-400 mt-1 block leading-normal">
                  * Capital Gains Tax (CGT) is calculated on verified land revenue profit margins.
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-neutral-100 pt-5 space-y-4">
            <h3 className="text-sm font-semibold text-neutral-950">Home Loan EMI Calculator</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-neutral-500 uppercase mb-1">Loan (NPR)</label>
                <input type="number" value={loanAmount} onChange={(e) => setLoanAmount(Math.max(0, parseInt(e.target.value) || 0))} className="w-full border border-neutral-200 rounded-md py-1 px-2.5 text-xs font-mono focus:outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-neutral-500 uppercase mb-1">Interest (%)</label>
                <input type="number" step="0.1" value={interestRate} onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)} className="w-full border border-neutral-200 rounded-md py-1 px-2.5 text-xs font-mono focus:outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-neutral-500 uppercase mb-1">Tenure (Yrs)</label>
                <input type="number" value={loanTenure} onChange={(e) => setLoanTenure(Math.max(1, parseInt(e.target.value) || 1))} className="w-full border border-neutral-200 rounded-md py-1 px-2.5 text-xs font-mono focus:outline-none" />
              </div>
            </div>
            <div className="bg-neutral-50 p-3 rounded-md border border-neutral-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-neutral-500 uppercase font-bold">Monthly EMI</span>
                <div className="text-lg font-serif font-bold text-neutral-950">रु. {emi.toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-neutral-500 uppercase font-bold">Total Interest</span>
                <div className="text-xs font-mono font-bold text-neutral-800">रु. {totalInterest.toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
              </div>
            </div>
          </div>

          <div className="border-t border-neutral-100 pt-5 space-y-4">
            <h3 className="text-sm font-semibold text-neutral-950">Billing Identity Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-neutral-500 uppercase mb-1">Seller Name</label>
                <input
                  type="text"
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                  className="w-full border border-neutral-200 rounded-md py-1 px-2.5 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-neutral-500 uppercase mb-1">Buyer Name</label>
                <input
                  type="text"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="w-full border border-neutral-200 rounded-md py-1 px-2.5 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-neutral-500 uppercase mb-1">Plot Title</label>
                <input
                  type="text"
                  value={propertyTitle}
                  onChange={(e) => setPropertyTitle(e.target.value)}
                  className="w-full border border-neutral-200 rounded-md py-1 px-2.5 text-xs focus:outline-none"
                />
              </div>
            </div>
          </div>

          <ValuationAssistant />
        </div>

        {/* Right Side: Output Dashboard Receipt */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          <div className="bg-neutral-900 text-white rounded-xl shadow-lg overflow-hidden border border-neutral-850">
            {/* Header branding */}
            <div className="bg-amber-800 p-5 text-center relative">
              <span className="text-[10px] tracking-widest font-mono text-amber-200 uppercase font-semibold">
                Official Bill Receipt
              </span>
              <h3 className="font-serif text-xl font-bold mt-1 text-white">GHARJAGGA NEPAL</h3>
              <p className="text-[11px] text-amber-100 mt-0.5">Licensed Real Estate Brokerage Firm</p>
              <div className="absolute top-4 right-4 bg-neutral-900/40 text-amber-300 font-mono text-[9px] px-2 py-0.5 rounded border border-amber-500/20">
                FY 2083/84
              </div>
            </div>

            {/* Invoice Body */}
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center text-xs text-neutral-400 font-mono border-b border-neutral-800 pb-3">
                <span>INVOICE: GJN-10842-2026</span>
                <span>DATE: {new Date().toLocaleDateString()}</span>
              </div>

              {/* Identity metadata */}
              <div className="grid grid-cols-2 gap-4 text-xs border-b border-neutral-800 pb-3">
                <div>
                  <span className="text-[10px] text-neutral-500 block uppercase">Seller Party</span>
                  <span className="font-medium text-neutral-200">{sellerName}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-neutral-500 block uppercase">Buyer Party</span>
                  <span className="font-medium text-neutral-200">{buyerName}</span>
                </div>
              </div>

              {/* Calculation list */}
              <div className="space-y-2 border-b border-neutral-800 pb-4">
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-400">Final Land Transaction Price:</span>
                  <span className="font-mono text-neutral-200">NPR {dealPrice.toLocaleString('en-US')}</span>
                </div>

                <div className="flex justify-between text-xs">
                  <span className="text-neutral-400">
                    Brokerage Commission ({commRate.toFixed(1)}%):
                  </span>
                  <span className="font-mono text-neutral-200">NPR {rawCommission.toLocaleString('en-US')}</span>
                </div>

                <div className="flex justify-between text-xs">
                  <span className="text-neutral-400">VAT (13.0% Government Tax):</span>
                  <span className="font-mono text-neutral-200">NPR {vatAmount.toLocaleString('en-US')}</span>
                </div>

                <div className="flex justify-between text-xs">
                  <span className="text-neutral-400 text-emerald-400">TDS Deduction (1.5% - Deducted on payout):</span>
                  <span className="font-mono text-emerald-400">- NPR {tdsAmount.toLocaleString('en-US')}</span>
                </div>
              </div>

              {/* Final Amount */}
              <div className="flex justify-between items-center pt-2 pb-4">
                <div>
                  <span className="text-[10px] text-neutral-500 block uppercase font-semibold">Total Invoice Bill (With VAT)</span>
                  <span className="text-[10px] text-amber-500">Payable to GharJagga Nepal</span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-lg font-bold text-amber-500">
                    NPR {finalCommissionBill.toLocaleString('en-US')}
                  </span>
                </div>
              </div>

              {/* Estimate Taxes section (unboxed, clean typography) */}
              <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-800 space-y-2">
                <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                  Est. Government Malpot Land Registration Taxes
                </div>

                <div className="flex justify-between text-[11px]">
                  <span className="text-neutral-500">Registry Fee ({taxResult.appliedRegRate.toFixed(2)}% of Value):</span>
                  <span className="font-mono text-neutral-300">NPR {taxResult.registrationFee.toLocaleString('en-US')}</span>
                </div>

                {buyerType !== 'None' && (
                  <div className="text-[9px] text-emerald-500 italic">
                    * Applied {buyerType === 'Female' ? '25%' : '50%'} Government Privilege Rebate.
                  </div>
                )}

                <div className="flex justify-between text-[11px]">
                  <span className="text-neutral-500">Capital Gains Tax ({taxResult.cgtRate}% on est. gains):</span>
                  <span className="font-mono text-neutral-300">NPR {taxResult.capitalGainTax.toLocaleString('en-US')}</span>
                </div>
              </div>
            </div>

            {/* Invoice actions */}
            <div className="bg-neutral-950 border-t border-neutral-800 px-6 py-4 flex gap-3">
              <button
                type="button"
                onClick={() => setInvoiceSaved(true)}
                className="flex-1 bg-amber-700 hover:bg-amber-800 text-white py-2 px-4 rounded text-xs font-semibold flex items-center justify-center gap-2 transition-all"
              >
                {invoiceSaved ? (
                  <>
                    <CheckCircle size={14} />
                    Saved to Records
                  </>
                ) : (
                  <>
                    <FileText size={14} />
                    Finalize & Record Bill
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick reference guide (Nepal rules) */}
          <div className="bg-neutral-50 p-5 rounded-xl border border-neutral-100 text-xs space-y-2">
            <h4 className="font-bold text-neutral-900 uppercase tracking-wide">Nepal Brokerage Rule Book (Reference)</h4>
            <ul className="space-y-1.5 text-neutral-600 list-disc pl-4">
              <li>
                <strong>Commission Limits:</strong> As per Nepal Land Agent policies, agent commission brackets range from 1.0% (for highly expensive properties &gt;2Cr) up to 3.0% (for smaller plots &lt;20 Lakhs).
              </li>
              <li>
                <strong>TDS Rule:</strong> Under Sec 88 of Nepal Income Tax Act, 1.5% TDS must be deducted when a business entity pays real estate commissions.
              </li>
              <li>
                <strong>VAT Requirement:</strong> VAT is mandatory (13%) on the commission amount if the agency or business holds a VAT registration certificate in Nepal.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
