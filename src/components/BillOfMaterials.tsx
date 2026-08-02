"use client";
import React, { useState, useMemo, useCallback } from "react";
import ContentCard from "@/components/ContentCard";

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

type SortField =
  | "partDescription"
  | "vendor"
  | "pricePerUnit"
  | "quantity"
  | "partNumber";
type SortDirection = "asc" | "desc";
type FilterType = "all" | "3d-printed" | "purchased";
type PrintFilter = "all" | "yes" | "no";

function SortIcon({
  field,
  sortField,
  sortDirection,
}: {
  field: SortField;
  sortField: SortField;
  sortDirection: SortDirection;
}) {
  if (sortField !== field) {
    return (
      <svg
        className="w-4 h-4 text-[var(--tx3)]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
        />
      </svg>
    );
  }
  return sortDirection === "asc" ? (
    <svg
      className="w-4 h-4 text-[var(--accent)]"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
      />
    </svg>
  ) : (
    <svg
      className="w-4 h-4 text-[var(--accent)]"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"
      />
    </svg>
  );
}

export default function BillOfMaterials({
  items,
  title,
}: BillOfMaterialsProps) {
  const [sortField, setSortField] = useState<SortField>("partDescription");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [vendorFilter, setVendorFilter] = useState("all");
  const [printFilter, setPrintFilter] = useState<PrintFilter>("all");
  const [free3DPrinting, setFree3DPrinting] = useState(false);
  const [recycleCTRE, setRecycleCTRE] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [ownedItems, setOwnedItems] = useState<Set<number>>(new Set());

  const isCTREPart = (item: BOMItem) => {
    const ctreParts = ["Kraken", "CANivore", "CANcoder", "TalonFX"];
    return ctreParts.some((part) => item.partDescription.includes(part));
  };

  const getEffectivePrice = useCallback(
    (item: BOMItem, index: number) => {
      if (ownedItems.has(index)) return 0;
      if (free3DPrinting && item.is3DPrinted) return 0;
      if (recycleCTRE && isCTREPart(item)) return 0;
      return item.pricePerUnit;
    },
    [free3DPrinting, recycleCTRE, ownedItems]
  );

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
              ${neededItems
                .map(
                  (item) => `
                <tr>
                  <td>${item.partDescription}</td>
                  <td>${item.quantity}</td>
                  <td>${item.vendor}</td>
                  <td>${item.partNumber || "N/A"}</td>
                  <td>$${item.pricePerUnit.toFixed(2)}</td>
                  <td>$${(item.pricePerUnit * item.quantity).toFixed(2)}</td>
                  <td>${item.notes}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
          <div class="total">
            Total Cost: $${neededItems
              .reduce((sum, item) => sum + item.pricePerUnit * item.quantity, 0)
              .toFixed(2)}
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    printWindow?.document.write(printContent);
    printWindow?.document.close();
    printWindow?.print();
  };

  const filteredAndSortedItems = useMemo(() => {
    const filtered = items.filter((item) => {
      if (filter === "3d-printed" && !item.is3DPrinted) return false;
      if (filter === "purchased" && item.is3DPrinted) return false;

      if (printFilter === "yes" && !item.is3DPrinted) return false;
      if (printFilter === "no" && item.is3DPrinted) return false;

      if (
        searchTerm &&
        !item.partDescription
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) &&
        !item.vendor.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !(item.partNumber ?? "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      ) {
        return false;
      }

      if (vendorFilter !== "all" && item.vendor !== vendorFilter) return false;

      return true;
    });

    filtered.sort((a, b) => {
      let aValue: string | number, bValue: string | number;

      switch (sortField) {
        case "partDescription":
          aValue = a.partDescription.toLowerCase();
          bValue = b.partDescription.toLowerCase();
          break;
        case "vendor":
          aValue = a.vendor.toLowerCase();
          bValue = b.vendor.toLowerCase();
          break;
        case "pricePerUnit":
          aValue = getEffectivePrice(a, items.indexOf(a));
          bValue = getEffectivePrice(b, items.indexOf(b));
          break;
        case "quantity":
          aValue = a.quantity;
          bValue = b.quantity;
          break;
        case "partNumber":
          aValue = (a.partNumber || "zzzz").toLowerCase(); // Put N/A items at the end
          bValue = (b.partNumber || "zzzz").toLowerCase();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [
    items,
    sortField,
    sortDirection,
    filter,
    searchTerm,
    vendorFilter,
    printFilter,
    getEffectivePrice,
  ]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const totalCost = filteredAndSortedItems.reduce(
    (sum, item) =>
      sum + getEffectivePrice(item, items.indexOf(item)) * item.quantity,
    0
  );
  const originalTotalCost = items.reduce(
    (sum, item) => sum + item.pricePerUnit * item.quantity,
    0
  );
  const savings = originalTotalCost - totalCost;

  const vendors = useMemo(() => {
    const uniqueVendors = Array.from(new Set(items.map((item) => item.vendor)));
    return uniqueVendors.sort();
  }, [items]);

  return (
    <ContentCard>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-[var(--tx)]">
            {title} - Bill of Materials
          </h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-[var(--accent-ink)] rounded-lg hover:bg-[var(--bg2)] transition-colors"
          >
            {isExpanded ? "Hide Details" : "Show Details"}
            <svg
              className={`w-4 h-4 transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>

        {/* Cost-Saving Tip - Always Visible */}
        <div className="bg-[var(--bg2)] border border-[var(--accent)] rounded-lg p-4 mb-4">
          <p className="text-[var(--accent)] font-medium">
            <strong>Cost-Saving Tip:</strong> Many parts listed below can likely
            be built from scrap material or parts you already own from previous
            projects, significantly reducing the actual cost of this mechanism.
          </p>
        </div>

        {/* Cost Summary - Always Visible */}
        <div className="bg-[var(--bg2)] rounded-lg p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-sm text-[var(--tx2)]">Total Items</div>
              <div className="text-xl font-bold text-[var(--tx)]">
                {items.length}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-[var(--tx2)]">Full Price</div>
              <div className="text-xl font-bold text-[var(--accent)]">
                ${originalTotalCost.toFixed(2)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-[var(--tx2)]">
                With 3D Print $5 + CTRE Recycled
              </div>
              <div className="text-xl font-bold text-[var(--ok)]">
                $
                {(
                  originalTotalCost -
                  items.reduce((sum, item) => {
                    if (item.is3DPrinted)
                      return sum + item.pricePerUnit * item.quantity;
                    if (isCTREPart(item))
                      return sum + item.pricePerUnit * item.quantity;
                    return sum;
                  }, 0) +
                  5
                ).toFixed(2)}
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
                  className="w-full px-4 py-2 border border-[var(--rule)] rounded-lg bg-white bg-[var(--bg2)] text-[var(--tx)] focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)]"
                />
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as FilterType)}
                className="px-4 py-2 border border-[var(--rule)] rounded-lg bg-white bg-[var(--bg2)] text-[var(--tx)] focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)]"
              >
                <option value="all">All Parts</option>
                <option value="3d-printed">3D Printed Only</option>
                <option value="purchased">Purchased Only</option>
              </select>
              <select
                value={vendorFilter}
                onChange={(e) => setVendorFilter(e.target.value)}
                className="px-4 py-2 border border-[var(--rule)] rounded-lg bg-white bg-[var(--bg2)] text-[var(--tx)] focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)]"
              >
                <option value="all">All Vendors</option>
                {vendors.map((vendor) => (
                  <option key={vendor} value={vendor}>
                    {vendor}
                  </option>
                ))}
              </select>
              <select
                value={printFilter}
                onChange={(e) => setPrintFilter(e.target.value as PrintFilter)}
                className="px-4 py-2 border border-[var(--rule)] rounded-lg bg-white bg-[var(--bg2)] text-[var(--tx)] focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)]"
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
                  className="w-4 h-4 text-[var(--accent)] border-[var(--rule)] bg-[var(--bg3)] rounded focus:ring-2 focus:ring-[var(--accent)]"
                />
                <span className="text-sm text-[var(--tx2)]">
                  3D Print for $5 Total
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={recycleCTRE}
                  onChange={(e) => handleCTRERecyclingToggle(e.target.checked)}
                  className="w-4 h-4 text-[var(--accent)] border-[var(--rule)] bg-[var(--bg3)] rounded focus:ring-2 focus:ring-[var(--accent)]"
                />
                <span className="text-sm text-[var(--tx2)]">
                  Recycle CTRE Parts (Kraken, CANivore, CANcoder)
                </span>
              </label>
              <button
                onClick={printNeededItems}
                className="inline-flex items-center px-4 py-2 bg-[var(--accent)] text-[var(--accent-ink)] rounded-lg hover:bg-[var(--bg2)] transition-colors text-sm font-medium"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  />
                </svg>
                Print Needed Items
              </button>
            </div>
          </div>

          {/* Cost Summary */}
          <div className="bg-[var(--bg2)] rounded-lg p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-sm text-[var(--tx2)]">Showing Items</div>
                <div className="text-xl font-bold text-[var(--tx)]">
                  {filteredAndSortedItems.length} / {items.length}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-[var(--tx2)]">Current Cost</div>
                <div className="text-xl font-bold text-[var(--accent)]">
                  ${totalCost.toFixed(2)}
                </div>
              </div>
              {savings > 0 && (
                <div className="text-center">
                  <div className="text-sm text-[var(--tx2)]">Savings</div>
                  <div className="text-xl font-bold text-[var(--ok)]">
                    -${savings.toFixed(2)}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="overflow-x-auto -mx-4 sm:-mx-6 md:-mx-8 lg:-mx-12 xl:-mx-16">
            <div className="inline-block min-w-full align-middle px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-[var(--bg2)]">
                    <th className="border border-[var(--rule)] px-4 py-3 text-center text-sm font-semibold text-[var(--tx)]">
                      Own
                    </th>
                    <th
                      className="border border-[var(--rule)] px-4 py-3 text-center text-sm font-semibold text-[var(--tx)] cursor-pointer hover:bg-[var(--bg3)]"
                      onClick={() => handleSort("partDescription")}
                    >
                      <div className="flex items-center justify-center gap-2">
                        Part Description
                        <SortIcon
                          field="partDescription"
                          sortField={sortField}
                          sortDirection={sortDirection}
                        />
                      </div>
                    </th>
                    <th
                      className="border border-[var(--rule)] px-4 py-3 text-center text-sm font-semibold text-[var(--tx)] cursor-pointer hover:bg-[var(--bg3)]"
                      onClick={() => handleSort("quantity")}
                    >
                      <div className="flex items-center justify-center gap-2">
                        Qty
                        <SortIcon
                          field="quantity"
                          sortField={sortField}
                          sortDirection={sortDirection}
                        />
                      </div>
                    </th>
                    <th
                      className="border border-[var(--rule)] px-4 py-3 text-center text-sm font-semibold text-[var(--tx)] cursor-pointer hover:bg-[var(--bg3)]"
                      onClick={() => handleSort("vendor")}
                    >
                      <div className="flex items-center justify-center gap-2">
                        Vendor
                        <SortIcon
                          field="vendor"
                          sortField={sortField}
                          sortDirection={sortDirection}
                        />
                      </div>
                    </th>
                    <th
                      className="border border-[var(--rule)] px-4 py-3 text-center text-sm font-semibold text-[var(--tx)] cursor-pointer hover:bg-[var(--bg3)]"
                      onClick={() => handleSort("partNumber")}
                    >
                      <div className="flex items-center justify-center gap-2">
                        Part #
                        <SortIcon
                          field="partNumber"
                          sortField={sortField}
                          sortDirection={sortDirection}
                        />
                      </div>
                    </th>
                    <th
                      className="border border-[var(--rule)] px-4 py-3 text-center text-sm font-semibold text-[var(--tx)] cursor-pointer hover:bg-[var(--bg3)]"
                      onClick={() => handleSort("pricePerUnit")}
                    >
                      <div className="flex items-center justify-center gap-2">
                        Price
                        <SortIcon
                          field="pricePerUnit"
                          sortField={sortField}
                          sortDirection={sortDirection}
                        />
                      </div>
                    </th>
                    <th className="border border-[var(--rule)] px-4 py-3 text-center text-sm font-semibold text-[var(--tx)]">
                      Link
                    </th>
                    <th className="border border-[var(--rule)] px-2 py-3 text-center text-sm font-semibold text-[var(--tx)] w-48">
                      Notes
                    </th>
                    <th className="border border-[var(--rule)] px-4 py-3 text-center text-sm font-semibold text-[var(--tx)]">
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
                        className={`${
                          index % 2 === 0
                            ? "bg-white bg-[var(--bg2)]"
                            : "bg-[var(--bg2)]"
                        } hover:bg-[var(--bg2)] transition-colors`}
                      >
                        <td className="border border-[var(--rule)] px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={ownedItems.has(itemIndex)}
                            onChange={() => handleOwnedToggle(itemIndex)}
                            className="w-4 h-4 text-[var(--accent)] border-[var(--rule)] bg-[var(--bg3)] rounded focus:ring-2 focus:ring-[var(--accent)]"
                          />
                        </td>
                        <td className="border border-[var(--rule)] px-4 py-3 text-sm text-[var(--tx)] text-center">
                          <div className="flex items-center justify-center gap-2">
                            {item.partDescription}
                            {isCTREPart(item) && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[var(--bg2)] text-[var(--accent)]">
                                CTRE
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="border border-[var(--rule)] px-4 py-3 text-sm text-[var(--tx)] text-center">
                          {item.quantity}
                        </td>
                        <td className="border border-[var(--rule)] px-4 py-3 text-sm text-[var(--tx)] text-center">
                          {item.vendor}
                        </td>
                        <td className="border border-[var(--rule)] px-4 py-3 text-sm text-[var(--tx)] font-mono text-center">
                          {item.partNumber || "N/A"}
                        </td>
                        <td className="border border-[var(--rule)] px-4 py-3 text-sm text-[var(--tx)] text-center">
                          <div className="flex flex-col items-center">
                            <span
                              className={
                                isDiscounted
                                  ? "text-[var(--ok)] font-semibold"
                                  : ""
                              }
                            >
                              ${effectivePrice.toFixed(2)}
                            </span>
                            {isDiscounted && (
                              <span className="text-xs text-[var(--tx2)] line-through">
                                ${item.pricePerUnit.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="border border-[var(--rule)] px-4 py-3 text-sm text-center">
                          {item.vendor === "Custom" ? (
                            <span className="text-[var(--tx2)] text-xs">
                              Files in Repository
                            </span>
                          ) : (
                            <a
                              href={item.productLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-[var(--accent)] hover:text-[var(--accent)] underline"
                            >
                              <svg
                                className="w-4 h-4 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                              </svg>
                              View
                            </a>
                          )}
                        </td>
                        <td className="border border-[var(--rule)] px-2 py-3 text-xs text-[var(--tx2)] w-48">
                          <div className="break-words" title={item.notes}>
                            {item.notes}
                          </div>
                        </td>
                        <td className="border border-[var(--rule)] px-4 py-3 text-sm text-center">
                          {item.is3DPrinted ? (
                            <div className="flex items-center justify-center gap-2">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[var(--bg2)] text-[var(--ok)]">
                                Yes
                              </span>
                              {item.printedModelLink && (
                                <a
                                  href={item.printedModelLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[var(--accent)] hover:text-[var(--accent)]"
                                  title="3D Model Link"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                                    />
                                  </svg>
                                </a>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[var(--bg2)] text-[var(--tx)]">
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
          </div>

          <div className="mt-4 text-sm text-[var(--tx2)]">
            <p className="mb-2">
              <strong>Note:</strong> Prices are estimates and may vary. Please
              check vendor websites for current pricing and availability.
            </p>
            <p>
              <strong>3D Printed Parts:</strong> Parts marked as 3D printed can
              be manufactured with a standard FDM printer using PLA or PETG
              material.
            </p>
          </div>
        </div>
      )}
    </ContentCard>
  );
}
