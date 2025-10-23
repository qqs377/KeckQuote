import React, { useState } from 'react';
import { FileText, Download } from 'lucide-react';

export default function MSQuoteGenerator() {
  const [sampleType, setSampleType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [stainType, setStainType] = useState('none');
  const [isFixed, setIsFixed] = useState('no');
  const [solutionType, setSolutionType] = useState('');
  const [gradientType, setGradientType] = useState('');
  const [PhosEnrich, setPhosEnrich] = useState('none');
  const [quote, setQuote] = useState(null);

  const generateQuote = () => {
    const qty = parseInt(quantity);
    if (!qty || qty <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    const quoteItems = [];

    if (sampleType === 'gel') {
      // Calculate sample prep simple
      let prepSimpleQty = 0;
      let needsFixation = 0;
      let needsDestaining = 0;
      
      if (stainType === 'silver') {
        needsDestaining = qty;
        if (isFixed === 'no') {
          needsFixation = qty;
        }
      } else if (stainType === 'coomassie') {
        needsDestaining = qty;
      }
      
      const extraction = qty;
      const totalOps = needsFixation + needsDestaining + extraction;
      prepSimpleQty = Math.max(1, Math.ceil(totalOps / 4));
      
      quoteItems.push({
        service: 'Sample prep simple',
        quantity: prepSimpleQty
      });
      
      quoteItems.push({
        service: 'Sample prep Trypsin',
        quantity: qty
      });
      
      quoteItems.push({
        service: 'LCMSMS short gradient',
        quantity: qty
      });
      
      quoteItems.push({
        service: 'Data analysis protein ID',
        quantity: qty
      });
      
      quoteItems.push({
        service: 'Consulting',
        quantity: 0.25
      });
    } else if (sampleType === 'solution') {
      // Solution analysis
      if (solutionType === 'cell_pellet') {
        quoteItems.push({
          service: 'Sample prep complex',
          quantity: qty
        });
        quoteItems.push({
          service: 'Sample prep desalt',
          quantity: qty
        });
        quoteItems.push({
          service: 'Sample prep custom enzyme',
          quantity: qty
        });
      } else if (solutionType === 'ip_pulldown' || solutionType === 'cell_lysates') {
        quoteItems.push({
          service: 'Sample prep simple',
          quantity: qty
        });
        quoteItems.push({
          service: 'Sample prep desalt',
          quantity: qty
        });
        quoteItems.push({
          service: 'Sample prep custom enzyme',
          quantity: qty
        });
      } else if (solutionType === 'contaminants_strap') {
        quoteItems.push({
          service: 'Sample prep simple',
          quantity: qty
        });
        quoteItems.push({
          service: 'Sample prep desalt',
          quantity: qty
        });
        quoteItems.push({
          service: 'Sample prep Trypsin',
          quantity: qty
        });
      }
      
    // Phospho TiO2 enrichment
    if (PhosEnrich === 'Yes') {
      quoteItems.push({
        service: 'Sample_Prep_TiO2',
        quantity: qty
      });
    }

    // Gradient - double quantity if phospho enrichment
    const gradientMultiplier = PhosEnrich === 'Yes' ? 2 : 1;
        //equivalent to: 
        //let gradientMultiplier;  // declare variable
        //if (PhosEnrich === 'Yes') {
        //      gradientMultiplier = 2;  
        //} else {
        // gradientMultiplier = 1; 
        //}

    if (gradientType === 'dda_lfq') {
      quoteItems.push({
        service: 'LCMSMS long gradient',
        quantity: qty * gradientMultiplier
      });
    } else if (gradientType === 'dia') {
      quoteItems.push({
        service: 'LCMSMS median gradient',
        quantity: qty * gradientMultiplier
      });
    }

    // Data analysis - double quantity if phospho enrichment, skip if gradientType is 'None'
    if (gradientType !== 'None') {
      quoteItems.push({
        service: 'Data analysis protein ID',
        quantity: qty * gradientMultiplier
      });
    }    

      quoteItems.push({
        service: 'Sample prep nanodrop',
        quantity: qty * 2
      });
      
      quoteItems.push({
        service: 'Consulting',
        quantity: 0.25
      });
    }

    setQuote(quoteItems);
  };

  const resetForm = () => {
    setSampleType('');
    setQuantity('');
    setStainType('none');
    setIsFixed('no');
    setSolutionType('');
    setGradientType('');
    setPhosEnrich('none');
    setQuote(null);
  };

  const downloadQuote = () => {
    if (!quote) return;
    
    let csv = 'Service,Quantity\n';
    quote.forEach(item => {
      csv += `"${item.service}",${item.quantity}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ms_quote.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-800">MS Quote Generator</h1>
          </div>

          {!quote ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sample Type *
                </label>
                <select
                  value={sampleType}
                  onChange={(e) => setSampleType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select sample type</option>
                  <option value="gel">Gel Band</option>
                  <option value="solution">Solution</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity of Samples *
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter number of samples"
                />
              </div>

              {sampleType === 'gel' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stain Type
                    </label>
                    <select
                      value={stainType}
                      onChange={(e) => setStainType(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="none">None</option>
                      <option value="silver">Silver Stain</option>
                      <option value="coomassie">Coomassie Stain</option>
                    </select>
                  </div>

                  {stainType === 'silver' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Has the sample been fixed?
                      </label>
                      <select
                        value={isFixed}
                        onChange={(e) => setIsFixed(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="no">No</option>
                        <option value="yes">Yes</option>
                      </select>
                    </div>
                  )}
                </>
              )}

              {sampleType === 'solution' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Solution Sample Type *
                    </label>
                    <select
                      value={solutionType}
                      onChange={(e) => setSolutionType(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="">Select solution type</option>
                      <option value="cell_pellet">Cell Pellet (requires sonication)</option>
                      <option value="ip_pulldown">Immunoprecipitation Pull-down</option>
                      <option value="cell_lysates">Cell Lysates</option>
                      <option value="contaminants_strap">Contaminants/Detergents/Salt (S-trap)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gradient Type *
                    </label>
                    <select
                      value={gradientType}
                      onChange={(e) => setGradientType(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="">Select gradient type</option>
                      <option value="dda_lfq">DDA LFQ (Long Gradient)</option>
                      <option value="dia">DIA (Median Gradient)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      TiO2 Phospho Enrichment *
                    </label>
                    <select
                      value={PhosEnrich}
                      onChange={(e) => setPhosEnrich(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="Yes">Yes</option>
                      <option value="None">None</option>
                    </select>
                  </div>
                </>
              )}

              <button
                onClick={generateQuote}
                disabled={!sampleType || !quantity || (sampleType === 'solution' && (!solutionType || !gradientType))}
                className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Generate Quote
              </button>
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Generated Quote</h2>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-300">
                        <th className="text-left py-2 px-3 font-semibold text-gray-700">Service</th>
                        <th className="text-right py-2 px-3 font-semibold text-gray-700">Quantity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quote.map((item, idx) => (
                        <tr key={idx} className="border-b border-gray-200 last:border-0">
                          <td className="py-2 px-3 text-gray-800">{item.service}</td>
                          <td className="py-2 px-3 text-right text-gray-800">{item.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={downloadQuote}
                  className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download CSV
                </button>
                <button
                  onClick={resetForm}
                  className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                >
                  New Quote
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Mass Spectrometry Quote Generator v1.0</p>
        </div>
      </div>
    </div>
  );
}
