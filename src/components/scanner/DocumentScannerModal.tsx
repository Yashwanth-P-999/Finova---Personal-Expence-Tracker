import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  Image as ImageIcon,
  Sparkles,
  Check,
  X,
  Trash2,
  Plus,
  ArrowRight,
  FileSpreadsheet,
} from 'lucide-react';
import { Account, Category, PaymentMethod } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useToast } from '../../contexts/ToastContext.tsx';
import { formatCurrency } from '../../utils/formatters.ts';

interface ExtractedItem {
  id: string;
  description: string;
  amount: number;
  date: string;
  categoryId: string;
  categoryName: string;
  confidence: number;
  paymentMethod: PaymentMethod;
  accountId: string;
}

interface DocumentScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  accounts: Account[];
  categories: Category[];
}

export const DocumentScannerModal: React.FC<DocumentScannerModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  accounts,
  categories,
}) => {
  const { success, error } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'upload' | 'script'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [scriptText, setScriptText] = useState<string>('');
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [isImporting, setIsImporting] = useState<boolean>(false);

  // Extracted items review table
  const [parsedItems, setParsedItems] = useState<ExtractedItem[]>([]);
  const [defaultAccountId, setDefaultAccountId] = useState<string>(
    accounts[0]?.id || ''
  );

  if (!isOpen) return null;

  // Preset sample scripts for instant user testing
  const samplePresets = [
    {
      title: 'Store Grocery Receipt',
      script: `D-Mart Supermarket
Date: 2026-10-01
Organic Wheat Flour 5kg - 340
Sunflower Oil 2L - 265
Dairy Milk Chocolate 3pk - 180
Farm Eggs 12pk - 95
Fresh Apples 1kg - 160
Blinkit Express Delivery - 45
Total Amount: 1,085
Payment: UPI`,
    },
    {
      title: 'Restaurant & Dining Bill',
      script: `Dominos Pizza & Gourmet Feast
01/10/2026
Farmhouse Pan Pizza - 480
Garlic Breadsticks - 150
Starbucks Cold Brew Coffee - 350
Chai Point Ginger Tea - 80
Tax & Service: 85
Paid via Card`,
    },
    {
      title: 'Monthly Handwritten Expenses Script',
      script: `Monthly Personal Expenses Log:
Apartment Maintenance - 2500
BESCOM Electricity Bill - 1450
Airtel Wifi Broadband - 899
Uber cab to office - 240
Zomato Dinner with friends - 620
Apollo Pharmacy multivitamin - 380`,
    },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        setScriptText(reader.result as string);
        setActiveTab('script');
      };
      reader.readAsText(file);
    }
  };

  const handleParse = async () => {
    setIsParsing(true);
    try {
      let res;
      if (activeTab === 'upload' && filePreview) {
        res = await api.parseDocument({
          imageBase64: filePreview,
          mimeType: selectedFile?.type || 'image/jpeg',
        });
      } else {
        if (!scriptText.trim()) {
          error('Please write or paste your expense script');
          setIsParsing(false);
          return;
        }
        res = await api.parseDocument({
          text: scriptText.trim(),
        });
      }

      if (!res.items || res.items.length === 0) {
        error('Could not detect expense entries. Try adjusting your text format.');
        setIsParsing(false);
        return;
      }

      const mapped: ExtractedItem[] = res.items.map((it, idx) => ({
        id: `parsed_${Date.now()}_${idx}`,
        description: it.description,
        amount: it.amount,
        date: it.date || new Date().toISOString().slice(0, 10),
        categoryId: it.categoryId,
        categoryName: it.categoryName,
        confidence: it.confidence,
        paymentMethod: it.paymentMethod || 'UPI',
        accountId: defaultAccountId,
      }));

      setParsedItems(mapped);
      success(`Extracted ${mapped.length} expense items! Review and confirm below.`);
    } catch (err: any) {
      error(err.message || 'Failed to parse document');
    } finally {
      setIsParsing(false);
    }
  };

  const handleRemoveItem = (id: string) => {
    setParsedItems((prev) => prev.filter((it) => it.id !== id));
  };

  const handleUpdateItem = (id: string, updates: Partial<ExtractedItem>) => {
    setParsedItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, ...updates } : it))
    );
  };

  const handleAddItem = () => {
    const newItem: ExtractedItem = {
      id: `parsed_${Date.now()}`,
      description: 'Extra Item',
      amount: 100,
      date: new Date().toISOString().slice(0, 10),
      categoryId: categories.find((c) => c.type === 'expense')?.id || 'cat_other',
      categoryName: 'General',
      confidence: 1.0,
      paymentMethod: 'UPI',
      accountId: defaultAccountId,
    };
    setParsedItems((prev) => [...prev, newItem]);
  };

  const handleImportToLedger = async () => {
    if (parsedItems.length === 0) {
      error('No items to import');
      return;
    }

    setIsImporting(true);
    try {
      const itemsToImport = parsedItems.map((it) => ({
        description: it.description,
        amount: it.amount,
        date: it.date,
        categoryId: it.categoryId,
        accountId: it.accountId || defaultAccountId,
        paymentMethod: it.paymentMethod,
        type: 'expense' as const,
      }));

      const res = await api.bulkImport(itemsToImport, defaultAccountId);
      success(res.message || 'Ledger updated successfully');
      onSuccess();
      onClose();
    } catch (err: any) {
      error(err.message || 'Import failed');
    } finally {
      setIsImporting(false);
    }
  };

  const totalAmount = parsedItems.reduce((acc, it) => acc + (Number(it.amount) || 0), 0);
  const expenseCategories = categories.filter((c) => c.type === 'expense');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Scan Store Bill or Expense Script
              </h2>
              <p className="text-xs text-slate-500">
                Upload receipts, store bills, or handwritten expense notes to automatically update your ledger
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Step 1: Input Type Tabs */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  activeTab === 'upload'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Upload Bill / Receipt Photo</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('script')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  activeTab === 'script'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Expense Script / Text Notes</span>
              </button>
            </div>

            {/* Quick Presets */}
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-[11px] font-medium text-slate-400">Presets:</span>
              {samplePresets.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setScriptText(p.script);
                    setActiveTab('script');
                  }}
                  className="text-[11px] font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50/60 hover:bg-indigo-100/60 px-2 py-1 rounded transition-colors"
                >
                  {p.title}
                </button>
              ))}
            </div>
          </div>

          {/* Tab 1: Image Upload Box */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-indigo-50/20"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.txt,.csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="text-xs font-semibold text-slate-800">
                  {selectedFile ? selectedFile.name : 'Click to upload store bill or receipt photo'}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Supports JPG, PNG, PDF receipts, or camera snapshots
                </div>
              </div>

              {filePreview && (
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-3">
                    <img
                      src={filePreview}
                      alt="Uploaded bill"
                      className="w-12 h-12 object-cover rounded-md border border-slate-200"
                    />
                    <div>
                      <div className="text-xs font-semibold text-slate-900">
                        {selectedFile?.name || 'receipt.jpg'}
                      </div>
                      <div className="text-[11px] text-slate-500">Ready for automated OCR extraction</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setFilePreview(null);
                    }}
                    className="p-1 text-slate-400 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Script Text Area */}
          {activeTab === 'script' && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Paste your personal expenses script or written bill items:
              </label>
              <textarea
                rows={5}
                value={scriptText}
                onChange={(e) => setScriptText(e.target.value)}
                placeholder="Example:&#10;D-Mart Groceries 1,420&#10;Uber ride to tech park 280&#10;Starbucks Coffee 350&#10;Bescom Electricity 1,450"
                className="w-full p-3 text-xs font-mono text-slate-900 bg-slate-50/50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
          )}

          {/* Parse Button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleParse}
              disabled={isParsing || (activeTab === 'upload' && !filePreview && !selectedFile) || (activeTab === 'script' && !scriptText.trim())}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isParsing ? 'Analyzing Document with ML & OCR...' : 'Analyze & Extract Expenses'}</span>
            </button>
          </div>

          {/* Step 2: Parsed Line Items Table */}
          {parsedItems.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Review Extracted Expenses ({parsedItems.length} items)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Verify description, amounts, and ML categorized tags before updating your ledger.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-xs text-slate-600">
                    Target Account:{' '}
                    <select
                      value={defaultAccountId}
                      onChange={(e) => {
                        setDefaultAccountId(e.target.value);
                        setParsedItems((prev) =>
                          prev.map((it) => ({ ...it, accountId: e.target.value }))
                        );
                      }}
                      className="px-2 py-1 text-xs font-semibold bg-white border border-slate-200 rounded-md ml-1"
                    >
                      {accounts.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name} (₹{a.balance.toLocaleString()})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>
              </div>

              {/* Editable Items Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3">Category (ML Tag)</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Payment</th>
                      <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                      <th className="py-2.5 px-2 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/60">
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) =>
                              handleUpdateItem(item.id, { description: e.target.value })
                            }
                            className="w-full px-2 py-1 text-xs font-medium text-slate-900 bg-white border border-slate-200 rounded focus:outline-hidden focus:border-indigo-600"
                          />
                        </td>

                        <td className="py-2 px-3">
                          <select
                            value={item.categoryId}
                            onChange={(e) => {
                              const found = categories.find((c) => c.id === e.target.value);
                              handleUpdateItem(item.id, {
                                categoryId: e.target.value,
                                categoryName: found?.name || 'General',
                              });
                            }}
                            className="px-2 py-1 text-xs bg-white border border-slate-200 rounded focus:outline-hidden focus:border-indigo-600"
                          >
                            {expenseCategories.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="py-2 px-3">
                          <input
                            type="date"
                            value={item.date}
                            onChange={(e) =>
                              handleUpdateItem(item.id, { date: e.target.value })
                            }
                            className="px-2 py-1 text-xs bg-white border border-slate-200 rounded focus:outline-hidden focus:border-indigo-600"
                          />
                        </td>

                        <td className="py-2 px-3">
                          <select
                            value={item.paymentMethod}
                            onChange={(e) =>
                              handleUpdateItem(item.id, {
                                paymentMethod: e.target.value as PaymentMethod,
                              })
                            }
                            className="px-2 py-1 text-xs bg-white border border-slate-200 rounded focus:outline-hidden focus:border-indigo-600"
                          >
                            <option value="UPI">UPI</option>
                            <option value="Card">Card</option>
                            <option value="Cash">Cash</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                          </select>
                        </td>

                        <td className="py-2 px-3 text-right">
                          <input
                            type="number"
                            step="0.01"
                            value={item.amount}
                            onChange={(e) =>
                              handleUpdateItem(item.id, {
                                amount: parseFloat(e.target.value) || 0,
                              })
                            }
                            className="w-24 px-2 py-1 text-xs text-right font-bold text-red-600 bg-white border border-slate-200 rounded focus:outline-hidden focus:border-indigo-600"
                          />
                        </td>

                        <td className="py-2 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="p-1 text-slate-300 hover:text-red-600 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50/80 border-t border-slate-200 font-bold text-slate-900">
                    <tr>
                      <td colSpan={4} className="py-2.5 px-3 text-right">
                        Total Extracted Outflow:
                      </td>
                      <td className="py-2.5 px-3 text-right text-red-600 text-sm">
                        ₹{totalAmount.toLocaleString()}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {parsedItems.length > 0
              ? `${parsedItems.length} expenses ready for ledger import`
              : 'Upload a bill or paste a script to begin'}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isImporting}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleImportToLedger}
              disabled={parsedItems.length === 0 || isImporting}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isImporting ? 'Reconciling Ledger...' : 'Import & Update Ledger'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
