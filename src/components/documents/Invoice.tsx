import React, { useState, useEffect } from 'react';

interface InvoiceProps {
  data: any;
}

export const Invoice: React.FC<InvoiceProps> = ({ data }) => {
  const currency = data.currency || '$';
  const [isInclusive, setIsInclusive] = useState(data.isTaxInclusive || false);
  const taxRate = data.taxRate || 0;
  const taxName = data.taxName || 'Tax';

  // Update state if data changes
  useEffect(() => {
    setIsInclusive(data.isTaxInclusive || false);
  }, [data.isTaxInclusive]);

  const calculatedItems = data.items?.map((item: any) => {
    const netPrice = item.unitPrice || 0;
    const grossPrice = netPrice * (1 + taxRate / 100);
    const displayPrice = isInclusive ? grossPrice : netPrice;
    const displayAmount = displayPrice * item.quantity;
    return { ...item, displayPrice, displayAmount };
  }) || [];

  const netSubtotal = data.items?.reduce((sum: number, item: any) => sum + ((item.unitPrice || 0) * item.quantity), 0) || 0;
  const calculatedTaxAmount = netSubtotal * (taxRate / 100);
  const grossTotal = netSubtotal + calculatedTaxAmount;

  return (
    <div className="bg-white p-12 md:p-16 text-slate-800 font-sans max-w-4xl mx-auto shadow-sm border border-slate-100 relative">
      <div className="absolute top-6 right-6 print:hidden">
        <label className="flex items-center cursor-pointer bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
          <div className="relative">
            <input type="checkbox" className="sr-only" checked={isInclusive} onChange={(e) => setIsInclusive(e.target.checked)} />
            <div className={`block w-10 h-6 rounded-full transition-colors ${isInclusive ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isInclusive ? 'transform translate-x-4' : ''}`}></div>
          </div>
          <div className="ml-3 text-sm font-medium text-slate-700">
            {isInclusive ? 'Gross Prices (Inc. Tax)' : 'Net Prices (Exc. Tax)'}
          </div>
        </label>
      </div>

      <div className="flex justify-between items-start mb-16">
        <div>
          <h1 className="text-5xl font-bold text-slate-900 mb-2 tracking-tight">INVOICE</h1>
          <p className="text-slate-500 font-medium">#{data.invoiceNumber || 'INV-0001'}</p>
        </div>
        <div className="text-right mt-12 md:mt-0">
          <h2 className="text-2xl font-bold text-slate-900">{data.companyName || 'Your Company'}</h2>
          {data.companyTaxId && <p className="text-slate-500 font-medium mt-1">{data.companyTaxId}</p>}
          <p className="text-slate-500 whitespace-pre-line mt-2 leading-relaxed">{data.companyAddress}</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between mb-16 bg-slate-50 p-6 rounded-xl border border-slate-100 gap-8 md:gap-0">
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Billed To</h3>
          <p className="font-bold text-slate-800 text-lg">{data.clientName}</p>
          {data.clientTaxId && <p className="text-slate-500 font-medium mt-1">{data.clientTaxId}</p>}
          <p className="text-slate-500 whitespace-pre-line mt-1 leading-relaxed">{data.clientAddress}</p>
        </div>
        <div className="md:text-right flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Date Issued</h3>
            <p className="font-semibold text-slate-800">{data.date}</p>
          </div>
          <div className="mt-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Due Date</h3>
            <p className="font-semibold text-slate-800">{data.dueDate}</p>
          </div>
        </div>
      </div>

      <div className="mb-12 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b-2 border-slate-200">
              <th className="py-4 px-4 font-bold text-slate-500 uppercase text-xs tracking-widest">Description</th>
              <th className="py-4 px-4 font-bold text-slate-500 uppercase text-xs tracking-widest text-right">Qty</th>
              <th className="py-4 px-4 font-bold text-slate-500 uppercase text-xs tracking-widest text-right">Price ({isInclusive ? 'Gross' : 'Net'})</th>
              <th className="py-4 px-4 font-bold text-slate-500 uppercase text-xs tracking-widest text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {calculatedItems.map((item: any, index: number) => (
              <tr key={index} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                <td className="py-5 px-4 text-slate-800 font-medium">{item.description}</td>
                <td className="py-5 px-4 text-slate-600 text-right">{item.quantity}</td>
                <td className="py-5 px-4 text-slate-600 text-right">{currency}{item.displayPrice.toFixed(2)}</td>
                <td className="py-5 px-4 text-slate-900 font-bold text-right">{currency}{item.displayAmount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end mb-16">
        <div className="w-full max-w-sm bg-slate-50 p-6 rounded-xl border border-slate-100">
          {!isInclusive ? (
            <>
              <div className="flex justify-between py-2 text-slate-600 font-medium">
                <span>Subtotal (Net)</span>
                <span>{currency}{netSubtotal.toFixed(2)}</span>
              </div>
              {taxRate > 0 && (
                <div className="flex justify-between py-2 text-slate-600 font-medium">
                  <span>{taxName} ({taxRate}%)</span>
                  <span>{currency}{calculatedTaxAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between py-4 border-t-2 border-slate-200 mt-4">
                <span className="text-2xl font-bold text-slate-900">Total</span>
                <span className="text-2xl font-bold text-blue-600">{currency}{grossTotal.toFixed(2)}</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between py-2 text-slate-600 font-medium">
                <span>Total (Gross)</span>
                <span>{currency}{grossTotal.toFixed(2)}</span>
              </div>
              {taxRate > 0 && (
                <div className="flex justify-between py-2 text-slate-500 text-sm">
                  <span>Includes {taxName} ({taxRate}%)</span>
                  <span>{currency}{calculatedTaxAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between py-4 border-t-2 border-slate-200 mt-4">
                <span className="text-2xl font-bold text-slate-900">Amount Due</span>
                <span className="text-2xl font-bold text-blue-600">{currency}{grossTotal.toFixed(2)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {data.notes && (
        <div className="border-t border-slate-200 pt-8">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Notes</h3>
          <p className="text-slate-600 text-sm whitespace-pre-line leading-relaxed">{data.notes}</p>
        </div>
      )}
    </div>
  );
};
