import React, { useState, useMemo, useCallback } from 'react';

export interface BOMItem {
  partDescription: string;
  quantity: number;
  vendor: string;
  partNumber?: string;
  pricePerUnit: number;
  productLink: string;
  notes: string;
  is3DPrinted: boolean;
  printedModelLink?: string;
}

interface BillOfMaterialsProps {
  items: BOMItem[];
  title: string;
}

type SortField = 'partDescription' | 'vendor' | 'pricePerUnit' | 'quantity' | 'partNumber';
type SortDirection = 'asc' | 'desc';
type FilterType = 'all' | '3d-printed' | 'purchased';
type PrintFilter = 'all' | 'yes' | 'no';

export default function BillOfMaterials({ items, title }: BillOfMaterialsProps) {
  const [sortField, setSortField] = useState<SortField>('partDescription');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [vendorFilter, setVendorFilter] = useState('all');
  const [printFilter, setPrintFilter] = useState<PrintFilter>('all');
  const [free3DPrinting, setFree3DPrinting] = useState(false);
  const [recycleCTRE, setRecycleCTRE] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [ownedItems, setOwnedItems] = useState<Set<number>>(new Set());

  const isCTREPart = (item: BOMItem) => {
    const ctreParts = ['Kraken', 'CANivore', 'CANCoder', 'CANcoder', 'TalonFX'];
    return ctreParts.some(part => item.partDescription.includes(part));
  };

  const getEffectivePrice = useCallback((item: BOMItem, index: number) => {
    if (ownedItems.has(index)) return 0;
    if (free3DPrinting && item.is3DPrinted) return 0;
    if (recycleCTRE && isCTREPart(item)) return 0;
    return item.pricePerUnit;
  }, [free3DPrinting, recycleCTRE, ownedItems]);

  const handleOwnedToggle = (index: number) => {
    const newOwnedItems = new Set(ownedItems);
    if (newOwnedItems.has(index)) {
      newOwnedItems.delete(index);
    } else {
      newOwnedItems.add(index);
    }
    setOwnedItems(newOwnedItems);
  };

  const handle3DPrintingToggle = (checked: boolean) => {
    setFree3DPrinting(checked);
    if (checked) {
      const newOwnedItems = new Set(ownedItems);
      items.forEach((item, index) => {
        if (item.is3DPrinted) {
          newOwnedItems.add(index);
        }
      });
      setOwnedItems(newOwnedItems);
    } else {
      const newOwnedItems = new Set(ownedItems);
      items.forEach((item, index) => {
        if (item.is3DPrinted) {
          newOwnedItems.delete(index);
        }
      });
      setOwnedItems(newOwnedItems);
    }
  };

  const handleCTRERecyclingToggle = (checked: boolean) => {
    setRecycleCTRE(checked);
    if (checked) {
      const newOwnedItems = new Set(ownedItems);
      items.forEach((item, index) => {
        if (isCTREPart(item)) {
          newOwnedItems.add(index);
        }
      });
      setOwnedItems(newOwnedItems);
    } else {
      const newOwnedItems = new Set(ownedItems);
      items.forEach((item, index) => {
        if (isCTREPart(item)) {
          newOwnedItems.delete(index);
        }
      });
      setOwnedItems(newOwnedItems);
    }
  };

  const printNeededItems = () => {
    const neededItems = items.filter((item, index) => !ownedItems.has(index));
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bill of Materials - ${title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .total { font-weight: bold; margin-top: 20px; }
          </style>
        </head>
        <body>
          <h1>Bill of Materials - ${title}</h1>
          <p>Items needed to purchase:</p>
          <table>
            <thead>
              <tr>
                <th>Part Description</th>
                <th>Quantity</th>
                <th>Vendor</th>
                <th>Part Number</th>
                <th>Price Per Unit</th>
                <th>Total Price</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              ${neededItems.map(item => `
                <tr>
                  <td>${item.partDescription}</td>
                  <td>${item.quantity}</td>
                  <td>${item.vendor}</td>
                  <td>${item.partNumber || 'N/A'}</td>
                  <td>$${item.pricePerUnit.toFixed(2)}</td>
                  <td>$${(item.pricePerUnit * item.quantity).toFixed(2)}</td>
                  <td>${item.notes}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total">
            Total Cost: $${neededItems.reduce((sum, item) => sum + (item.pricePerUnit * item.quantity), 0).toFixed(2)}
          </div>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow?.document.write(printContent);
    printWindow?.document.close();
    printWindow?.print();
  };

  const filteredAndSortedItems = useMemo(() => {
    const filtered = items.filter(item => {
      if (filter === '3d-printed' && !item.is3DPrinted) return false;
      if (filter === 'purchased' && item.is3DPrinted) return false;
      
      if (printFilter === 'yes' && !item.is3DPrinted) return false;
      if (printFilter === 'no' && item.is3DPrinted) return false;
      
      if (searchTerm && !item.partDescription.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !item.vendor.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !item.partNumber?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      if (vendorFilter !== 'all' && item.vendor !== vendorFilter) return false;
      
      return true;
    });

    filtered.sort((a, b) => {
      let aValue: string | number, bValue: string | number;
      
      switch (sortField) {
        case 'partDescription':
          aValue = a.partDescription.toLowerCase();
          bValue = b.partDescription.toLowerCase();
          break;
        case 'vendor':
          aValue = a.vendor.toLowerCase();
          bValue = b.vendor.toLowerCase();
          break;
        case 'pricePerUnit':
          aValue = getEffectivePrice(a, items.indexOf(a));
          bValue = getEffectivePrice(b, items.indexOf(b));
          break;
        case 'quantity':
          aValue = a.quantity;
          bValue = b.quantity;
          break;
        case 'partNumber':
          aValue = (a.partNumber || 'zzzz').toLowerCase(); // Put N/A items at the end
          bValue = (b.partNumber || 'zzzz').toLowerCase();
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [items, sortField, sortDirection, filter, searchTerm, vendorFilter, printFilter, getEffectivePrice]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const totalCost = filteredAndSortedItems.reduce((sum, item) => sum + (getEffectivePrice(item, items.indexOf(item)) * item.quantity), 0);
  const originalTotalCost = items.reduce((sum, item) => sum + (item.pricePerUnit * item.quantity), 0);
  const savings = originalTotalCost - totalCost;

  const vendors = useMemo(() => {
    const uniqueVendors = Array.from(new Set(items.map(item => item.vendor)));
    return uniqueVendors.sort();
  }, [items]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
      </svg>
    );
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 shadow-lg border border-slate-200 dark:border-slate-800">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {title} - Bill of Materials
          </h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            {isExpanded ? 'Hide Details' : 'Show Details'}
            <svg 
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Cost-Saving Tip - Always Visible */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
          <p className="text-blue-800 dark:text-blue-300 font-medium">
            💡 <strong>Cost-Saving Tip:</strong> Many parts listed below can likely be built from scrap material or parts you already own from previous projects, significantly reducing the actual cost of this mechanism.
          </p>
        </div>

        {/* Cost Summary - Always Visible */}
        <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-sm text-slate-600 dark:text-slate-400">Total Items</div>
              <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {items.length}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-slate-600 dark:text-slate-400">Full Price</div>
              <div className="text-xl font-bold text-primary-600 dark:text-primary-400">
                ${originalTotalCost.toFixed(2)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                With 3D Print $5 + CTRE Recycled
              </div>
              <div className="text-xl font-bold text-green-600 dark:text-green-400">
                ${(originalTotalCost - items.reduce((sum, item) => {
                  if (item.is3DPrinted) return sum + (item.pricePerUnit * item.quantity);
                  if (isCTREPart(item)) return sum + (item.pricePerUnit * item.quantity);
                  return sum;
                }, 0) + 5).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div>
          {/* Filters and Controls */}
          <div className="space-y-4 mb-6">
            {/* Search and Type Filter Row */}
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-64">
                <input
                  type="text"
                  placeholder="Search parts, vendors, or part numbers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as FilterType)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Parts</option>
                <option value="3d-printed">3D Printed Only</option>
                <option value="purchased">Purchased Only</option>
              </select>
              <select
                value={vendorFilter}
                onChange={(e) => setVendorFilter(e.target.value)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Vendors</option>
                {vendors.map(vendor => (
                  <option key={vendor} value={vendor}>{vendor}</option>
                ))}
              </select>
              <select
                value={printFilter}
                onChange={(e) => setPrintFilter(e.target.value as PrintFilter)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All 3D Print</option>
                <option value="yes">3D Printed</option>
                <option value="no">Not 3D Printed</option>
              </select>
            </div>

            {/* Cost Options Row */}
            <div className="flex flex-wrap gap-6 items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={free3DPrinting}
                  onChange={(e) => handle3DPrintingToggle(e.target.checked)}
                  className="w-4 h-4 text-primary-600 bg-slate-100 border-slate-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  3D Print for $5 Total
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={recycleCTRE}
                  onChange={(e) => handleCTRERecyclingToggle(e.target.checked)}
                  className="w-4 h-4 text-primary-600 bg-slate-100 border-slate-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  Recycle CTRE Parts (Kraken, CANivore, CANCoder)
                </span>
              </label>
              <button
                onClick={printNeededItems}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print Needed Items
              </button>
            </div>
          </div>

          {/* Cost Summary */}
          <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-sm text-slate-600 dark:text-slate-400">Showing Items</div>
                <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {filteredAndSortedItems.length} / {items.length}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-slate-600 dark:text-slate-400">Current Cost</div>
                <div className="text-xl font-bold text-primary-600 dark:text-primary-400">
                  ${totalCost.toFixed(2)}
                </div>
              </div>
              {savings > 0 && (
                <div className="text-center">
                  <div className="text-sm text-slate-600 dark:text-slate-400">Savings</div>
                  <div className="text-xl font-bold text-green-600 dark:text-green-400">
                    -${savings.toFixed(2)}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800">
                  <th className="border border-slate-300 dark:border-slate-600 px-4 py-3 text-center text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Own
                  </th>
                  <th 
                    className="border border-slate-300 dark:border-slate-600 px-4 py-3 text-center text-sm font-semibold text-slate-900 dark:text-slate-100 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700"
                    onClick={() => handleSort('partDescription')}
                  >
                    <div className="flex items-center justify-center gap-2">
                      Part Description
                      <SortIcon field="partDescription" />
                    </div>
                  </th>
                  <th 
                    className="border border-slate-300 dark:border-slate-600 px-4 py-3 text-center text-sm font-semibold text-slate-900 dark:text-slate-100 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700"
                    onClick={() => handleSort('quantity')}
                  >
                    <div className="flex items-center justify-center gap-2">
                      Qty
                      <SortIcon field="quantity" />
                    </div>
                  </th>
                  <th 
                    className="border border-slate-300 dark:border-slate-600 px-4 py-3 text-center text-sm font-semibold text-slate-900 dark:text-slate-100 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700"
                    onClick={() => handleSort('vendor')}
                  >
                    <div className="flex items-center justify-center gap-2">
                      Vendor
                      <SortIcon field="vendor" />
                    </div>
                  </th>
                  <th 
                    className="border border-slate-300 dark:border-slate-600 px-4 py-3 text-center text-sm font-semibold text-slate-900 dark:text-slate-100 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700"
                    onClick={() => handleSort('partNumber')}
                  >
                    <div className="flex items-center justify-center gap-2">
                      Part #
                      <SortIcon field="partNumber" />
                    </div>
                  </th>
                  <th 
                    className="border border-slate-300 dark:border-slate-600 px-4 py-3 text-center text-sm font-semibold text-slate-900 dark:text-slate-100 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700"
                    onClick={() => handleSort('pricePerUnit')}
                  >
                    <div className="flex items-center justify-center gap-2">
                      Price
                      <SortIcon field="pricePerUnit" />
                    </div>
                  </th>
                  <th className="border border-slate-300 dark:border-slate-600 px-4 py-3 text-center text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Link
                  </th>
                  <th className="border border-slate-300 dark:border-slate-600 px-2 py-3 text-center text-sm font-semibold text-slate-900 dark:text-slate-100 w-48">
                    Notes
                  </th>
                  <th className="border border-slate-300 dark:border-slate-600 px-4 py-3 text-center text-sm font-semibold text-slate-900 dark:text-slate-100">
                    3D Print
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedItems.map((item, index) => {
                  const itemIndex = items.indexOf(item);
                  const effectivePrice = getEffectivePrice(item, itemIndex);
                  const isDiscounted = effectivePrice < item.pricePerUnit;
                  
                  return (
                    <tr 
                      key={index}
                      className={`${index % 2 === 0 ? 'bg-white dark:bg-slate-950' : 'bg-slate-50 dark:bg-slate-900'} hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors`}
                    >
                      <td className="border border-slate-300 dark:border-slate-600 px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={ownedItems.has(itemIndex)}
                          onChange={() => handleOwnedToggle(itemIndex)}
                          className="w-4 h-4 text-primary-600 bg-slate-100 border-slate-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600"
                        />
                      </td>
                      <td className="border border-slate-300 dark:border-slate-600 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {item.partDescription}
                          {isCTREPart(item) && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                              CTRE
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="border border-slate-300 dark:border-slate-600 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 text-center">
                        {item.quantity}
                      </td>
                      <td className="border border-slate-300 dark:border-slate-600 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 text-center">
                        {item.vendor}
                      </td>
                      <td className="border border-slate-300 dark:border-slate-600 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 font-mono text-center">
                        {item.partNumber || 'N/A'}
                      </td>
                      <td className="border border-slate-300 dark:border-slate-600 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 text-center">
                        <div className="flex flex-col items-center">
                          <span className={isDiscounted ? 'text-green-600 dark:text-green-400 font-semibold' : ''}>
                            ${effectivePrice.toFixed(2)}
                          </span>
                          {isDiscounted && (
                            <span className="text-xs text-slate-500 dark:text-slate-400 line-through">
                              ${item.pricePerUnit.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="border border-slate-300 dark:border-slate-600 px-4 py-3 text-sm text-center">
                        <a 
                          href={item.productLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 underline"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          View
                        </a>
                      </td>
                      <td className="border border-slate-300 dark:border-slate-600 px-2 py-3 text-xs text-slate-700 dark:text-slate-300 w-48">
                        <div className="break-words" title={item.notes}>
                          {item.notes}
                        </div>
                      </td>
                      <td className="border border-slate-300 dark:border-slate-600 px-4 py-3 text-sm text-center">
                        {item.is3DPrinted ? (
                          <div className="flex items-center justify-center gap-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                              Yes
                            </span>
                            {item.printedModelLink && (
                              <a 
                                href={item.printedModelLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                                title="3D Model Link"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
                            No
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-sm text-slate-600 dark:text-slate-400">
            <p className="mb-2">
              <strong>Note:</strong> Prices are estimates and may vary. Please check vendor websites for current pricing and availability.
            </p>
            <p>
              <strong>3D Printed Parts:</strong> Parts marked as 3D printed can be manufactured with a standard FDM printer using PLA or PETG material.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}