import React, { useState, useEffect } from "react";
import {
  GetInvoices,
  GetInvoiceDetail,
  ToggleInvoicePayment,
  UpdateInvoiceAmounts,
  ExportCSV,
} from "../../wailsjs/go/main/App";
import { useParams, useNavigate } from "react-router-dom";
import { FileText, Printer, Search } from "lucide-react";
import PrintButton from "./Templates/PrintButton";

const Billings: React.FC = () => {
  const { company } = useParams<{ company: string | undefined }>();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<any[]>([]);
  const [companyString, setCompanyString] = useState<string>("");
  const [isPrinting, setIsPrinting] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [companyData, setCompanyData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedFiscalYear, setSelectedFiscalYear] = useState<string>("");
  const navigate = useNavigate();

  // Generate fiscal year options
  const getCurrentFiscalYear = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    // If current month is January to March, we're in the previous fiscal year
    if (currentMonth < 3) {
      return `${currentYear - 1}-${currentYear.toString().slice(-2)}`;
    } else {
      return `${currentYear}-${(currentYear + 1).toString().slice(-2)}`;
    }
  };

  const generateFiscalYearOptions = () => {
    const options = [];

    // Start from fiscal year 2025-26 and generate options for the next 15 years
    for (let i = 0; i < 15; i++) {
      const year = 2025 + i;
      options.push(`${year}-${(year + 1).toString().slice(-2)}`);
    }

    return options;
  };

  const fiscalYearOptions = generateFiscalYearOptions();

  useEffect(() => {
    if (company) {
      // Reset all state variables when company changes
      setCompanyString(company);
      setInvoices([]);
      setFilteredInvoices([]);
      setSelectedInvoice(null);
      setIsPrinting(null);

      // Set default fiscal year
      setSelectedFiscalYear(getCurrentFiscalYear());

      // Load company data from localStorage
      const stored = localStorage.getItem("userTemplateData");
      if (stored) {
        try {
          const parsedData = JSON.parse(stored);
          const foundData = parsedData.find(
            (item: any) =>
              item.companyName?.toLowerCase() === company.toLowerCase()
          );

          if (foundData) {
            setCompanyData(foundData);
          } else {
            // Reset if no data found for this company
            setCompanyData(null);
          }
        } catch (err) {
          console.error("Error parsing company data:", err);
          setCompanyData(null);
        }
      } else {
        // No data in localStorage
        setCompanyData(null);
      }
    }
  }, [company]);

  useEffect(() => {
    const fetchInvoiceData = async () => {
      try {
        if (!companyString) return;

        const res = await GetInvoices(companyString);
        if (res && Array.isArray(res)) {
          setInvoices(res);
          filterInvoices(res, searchQuery, selectedFiscalYear);
        } else {
          // Handle empty response or undefined
          setInvoices([]);
          setFilteredInvoices([]);
        }
      } catch (error) {
        console.log("Error fetching invoices:", error);
        // Reset to empty arrays on error
        setInvoices([]);
        setFilteredInvoices([]);
      }
    };

    if (companyString) {
      fetchInvoiceData();
    }
  }, [companyString, selectedFiscalYear]);

  // Filter invoices based on search query and fiscal year
  const filterInvoices = (
    invoices: any[],
    query: string,
    fiscalYear: string
  ) => {
    let filtered = [...invoices];

    // Filter by fiscal year
    if (fiscalYear) {
      const [startYear, endYear] = fiscalYear
        .split("-")
        .map((year) => parseInt(year.length === 2 ? `20${year}` : year));
      const startDate = new Date(`${startYear}-04-01`);
      const endDate = new Date(`${endYear}-03-31`);

      filtered = filtered.filter((inv) => {
        const dateToCheck = inv.invoiceDate
          ? new Date(inv.invoiceDate)
          : new Date(inv.createdAt);
        return dateToCheck >= startDate && dateToCheck <= endDate;
      });
    }

    // Filter by search query
    if (query) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(
        (inv) =>
          inv.invoiceNo.toLowerCase().includes(lowerQuery) ||
          inv.customerName.toLowerCase().includes(lowerQuery) ||
          inv.total.toString().includes(lowerQuery) ||
          (inv.invoiceDate
            ? new Date(inv.invoiceDate)
                .toLocaleDateString()
                .includes(lowerQuery)
            : false) ||
          new Date(inv.createdAt).toLocaleDateString().includes(lowerQuery) ||
          (inv.isPaid && lowerQuery === "paid") ||
          (!inv.isPaid && lowerQuery === "unpaid")
      );
    }

    setFilteredInvoices(filtered);
  };

  useEffect(() => {
    filterInvoices(invoices, searchQuery, selectedFiscalYear);
  }, [invoices, searchQuery, selectedFiscalYear]);

  const updateInvoicePaymentStatus = async (
    company: string,
    invoiceNo: string
  ): Promise<void> => {
    try {
      console.log("Toggling invoice payment status");
      await ToggleInvoicePayment(company, invoiceNo);
      const updatedInvoices = await GetInvoices(company);
      setInvoices(updatedInvoices);
    } catch (error) {
      console.log("Error toggling invoice payment status", error);
    }
  };

  const handleFieldChange = (
    invoiceNo: string,
    field: string,
    value: string
  ): void => {
    setInvoices((prevInvoices) =>
      prevInvoices.map((inv) => {
        if (inv.invoiceNo === invoiceNo) {
          return { ...inv, [field]: parseFloat(value) };
        }
        return inv;
      })
    );
  };

  const handleUpdateAmounts = async (
    invoiceNo: string,
    paidAmount: number,
    tdsAmount: number
  ): Promise<void> => {
    try {
      await UpdateInvoiceAmounts(
        companyString,
        invoiceNo,
        paidAmount,
        tdsAmount
      );
      const updatedInvoices = await GetInvoices(companyString);
      setInvoices(updatedInvoices);
    } catch (err) {
      console.error("Error updating invoice amounts", err);
    }
  };

  const handleEditInvoice = async (invoiceNo: string) => {
    try {
      // Get the full invoice details before navigating
      const invoiceDetail = await GetInvoiceDetail(company!, invoiceNo);
      if (!invoiceDetail) {
        alert("Could not find invoice details");
        return;
      }

      // Encode the invoice number for the URL
      const encodedInvoiceNo = encodeURIComponent(invoiceNo);
      navigate(`/company/${company}/edit-invoice/${encodedInvoiceNo}`);
    } catch (error) {
      console.error("Error loading invoice details:", error);
      alert("Failed to load invoice details");
    }
  };

  const handlePrintInvoice = async (invoiceNo: string) => {
    try {
      if (isPrinting) {
        return;
      }

      setIsPrinting(invoiceNo);

      // Get the full invoice details
      const invoiceDetail = await GetInvoiceDetail(companyString, invoiceNo);
      if (!invoiceDetail) {
        throw new Error("Could not find invoice details");
      }

      // Format the invoice data for the PrintButton component
      const formattedItems = invoiceDetail.items.map((item: any) => ({
        description: item.description,
        amount: item.amount.toString(),
      }));

      const formattedInvoice = {
        invoiceNo: invoiceDetail.invoiceNo,
        invoiceDate: new Date(invoiceDetail.createdAt)
          .toISOString()
          .split("T")[0],
        customerName: invoiceDetail.customerName,
        customerAddress: invoiceDetail.customerAddress,
        items: formattedItems,
        transactionType: invoiceDetail.transactionType,
      };

      setSelectedInvoice(formattedInvoice);

      // Add a timeout to reset the state if printing takes too long or is canceled
      setTimeout(() => {
        handlePrintComplete();
      }, 1000);
    } catch (error) {
      console.error("Error preparing to print invoice:", error);
      alert("Failed to prepare invoice for printing");
      handlePrintComplete();
    }
  };

  const handlePrintComplete = () => {
    setSelectedInvoice(null);
    setIsPrinting(null);
  };

  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      const csvPath = await ExportCSV(companyString);
      alert(`CSV exported successfully to: ${csvPath}`);
      setIsExporting(false);
    } catch (error) {
      console.error("Error exporting CSV:", error);
      alert("Failed to export CSV");
      setIsExporting(false);
    }
  };

  // Calculate totals for filtered invoices
  const totalPaidAmount = filteredInvoices.reduce(
    (acc, inv) => acc + (inv.paidAmount || 0),
    0
  );
  const totalTDSAmount = filteredInvoices.reduce(
    (acc, inv) => acc + (inv.total - inv.paidAmount),
    0
  );
  const totalAmount = filteredInvoices.reduce(
    (acc, inv) => acc + parseFloat(inv.total),
    0
  );

  const paidAmount = filteredInvoices
    .filter((item) => item.isPaid === true)
    .reduce((acc, inv) => acc + parseFloat(inv.total), 0);

  const unPaidAmount = filteredInvoices
    .filter((item) => item.isPaid === false)
    .reduce((acc, inv) => acc + parseFloat(inv.total), 0);

  return (
    <div className="flex flex-col h-[97vh] p-4 relative">
      {/* Header section - fixed at top */}
      <div className="flex-none mb-4">
        <div className="absolute right-10 top-10">
          <div className="flex flex-row justify-end gap-2">
            <div className="text-green-400 text-lg">Total Paid Amount </div>
            <div className="text-lg">
              {paidAmount === 0 ? "00.00" : paidAmount.toFixed(2)}
            </div>
          </div>
          <div className="flex flex-row gap-2">
            <div className="text-red-400 text-lg">Total Unpaid Amount </div>
            <div className="text-lg">
              {unPaidAmount === 0 ? "00.00" : unPaidAmount.toFixed(2)}
            </div>
          </div>
        </div>
        <h1 className="text-3xl mb-4">Billing History</h1>

        <div className="flex flex-row items-center gap-4">
          <button
            onClick={handleExportCSV}
            disabled={isExporting || filteredInvoices.length === 0}
            className={`bg-mp hover:bg-mp-dark px-3 py-2 text-white rounded-md transition-colors ${
              isExporting || filteredInvoices.length === 0
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            {isExporting ? "Exporting..." : "Export CSV"}
          </button>

          <div className="relative">
            <select
              value={selectedFiscalYear}
              onChange={(e) => setSelectedFiscalYear(e.target.value)}
              className="bg-cbg dark:bg-cbg-dark border border-gf/30 dark:border-gf-dark/30 rounded-md px-3 py-2"
            >
              {fiscalYearOptions.map((year) => (
                <option key={year} value={year}>
                  FY {year}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-cbg dark:bg-cbg-dark border border-gf/30 dark:border-gf-dark/30 rounded-md pl-10 pr-3 py-2 w-64"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search size={16} className="text-gf dark:text-gf-dark" />
            </div>
          </div>
        </div>
      </div>

      {/* Table container with proper scroll behavior */}
      <div className="flex flex-col flex-1 overflow-hidden mt-2">
        <div className="overflow-auto pb-6 flex-1">
          <table className="min-w-full bg-bg dark:bg-bg-dark border border-gf/30 dark:border-gf-dark/30">
            <thead className="sticky top-[-1px] z-10">
              <tr className="bg-lp dark:bg-lp-dark text-mp-dark dark:text-white">
                <th className="py-2 border border-gf/40 dark:border-gf-dark/40">
                  Serial #
                </th>
                <th className="py-2 border border-gf/40 dark:border-gf-dark/40">
                  Invoice #
                </th>
                <th className="py-2 border border-gf/40 dark:border-gf-dark/40">
                  Date
                </th>
                <th className="py-2 border border-gf/40 dark:border-gf-dark/40">
                  Customer
                </th>
                <th className="py-2 border border-gf/40 dark:border-gf-dark/40">
                  Total
                </th>
                <th className="py-2 border border-gf/40 dark:border-gf-dark/40">
                  Paid Amount
                </th>
                <th className="py-2 border border-gf/40 dark:border-gf-dark/40">
                  TDS Amount
                </th>
                <th className="py-2 border border-gf/40 dark:border-gf-dark/40">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((inv, index) => (
                <tr
                  key={index}
                  className={
                    index % 2 === 0
                      ? "bg-cbg dark:bg-cbg-dark"
                      : "bg-bg dark:bg-bg-dark"
                  }
                  onDoubleClick={() => handleEditInvoice(inv.invoiceNo)}
                >
                  <td className="w-24 border border-gf/30 dark:border-gf-dark/30 text-center">
                    {index + 1}
                  </td>
                  <td className="w-28 border border-gf/30 dark:border-gf-dark/30 text-center">
                    {inv.invoiceNo}
                  </td>
                  <td className="w-32 border border-gf/30 dark:border-gf-dark/30 text-center">
                    {inv.invoiceDate
                      ? new Date(inv.invoiceDate).toLocaleString().split(",")[0]
                      : new Date(inv.createdAt).toLocaleString().split(",")[0]}
                  </td>
                  <td className="w-96 border border-gf/30 dark:border-gf-dark/30 text-center">
                    {inv.customerName}
                  </td>
                  <td className="w-52 border border-gf/30 dark:border-gf-dark/30 text-center">
                    {parseFloat(inv.total).toFixed(2)}
                  </td>
                  <td className="w-52 border border-gf/30 dark:border-gf-dark/30 text-center">
                    <input
                      type="number"
                      className="w-full text-center bg-inherit focus:outline-none focus:ring-1 focus:ring-mp rounded"
                      value={inv.paidAmount || 0}
                      onChange={(e) =>
                        handleFieldChange(
                          inv.invoiceNo,
                          "paidAmount",
                          e.target.value
                        )
                      }
                      onBlur={() => {
                        const newTDS = inv.total - inv.paidAmount;
                        handleUpdateAmounts(
                          inv.invoiceNo,
                          inv.paidAmount,
                          newTDS
                        );
                      }}
                    />
                  </td>
                  <td className="w-52 border border-gf/30 dark:border-gf-dark/30 text-center">
                    {(inv.total - inv.paidAmount).toFixed(2)}
                  </td>
                  <td className="py-2 w-36 border border-gf/30 dark:border-gf-dark/30 text-center">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => {
                          updateInvoicePaymentStatus(company!, inv.invoiceNo);
                        }}
                        className={`${
                          inv.isPaid
                            ? "bg-green-200 dark:bg-green-800/30"
                            : "bg-red-200 dark:bg-red-800/30"
                        } ${
                          inv.isPaid
                            ? "text-green-700 dark:text-green-400"
                            : "text-red-700 dark:text-red-400"
                        } rounded-xl px-3 py-1 transition-colors`}
                      >
                        {inv.isPaid ? "paid" : "unpaid"}
                      </button>
                      <button
                        onClick={() => handlePrintInvoice(inv.invoiceNo)}
                        className={`bg-blue-200 dark:bg-blue-800/30 text-blue-700 dark:text-blue-400 rounded-xl p-1 transition-colors ${
                          isPrinting === inv.invoiceNo
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                        title="Print Invoice"
                        disabled={isPrinting !== null}
                      >
                        <Printer size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredInvoices.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-4 text-gf dark:text-gf-dark"
                  >
                    No invoices found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer - fixed at bottom */}
        <div className="flex-none bg-lp dark:bg-lp-dark border-t border-gf/40 dark:border-gf-dark/40 px-4 py-3 rounded-lg backdrop-blur-lg mt-2">
          <div className="flex justify-around gap-8">
            <div className="flex flex-row gap-6 items-end">
              <span className="text-mp-dark dark:text-white font-semibold">
                Total Amount:
              </span>
              <span className="text-mp-dark dark:text-white font-bold text-lg">
                {totalAmount.toFixed(2)}
              </span>
            </div>
            <div className="flex flex-row gap-6 items-end">
              <span className="text-mp-dark dark:text-white font-semibold">
                Total Paid:
              </span>
              <span className="text-mp-dark dark:text-white font-bold text-lg">
                {totalPaidAmount.toFixed(2)}
              </span>
            </div>
            <div className="flex flex-row gap-6 items-end">
              <span className="text-mp-dark dark:text-white font-semibold">
                Total TDS:
              </span>
              <span className="text-mp-dark dark:text-white font-bold text-lg">
                {totalTDSAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden PrintButton component that will be triggered when selectedInvoice is set */}
      {selectedInvoice && companyData && (
        <div className="hidden">
          <PrintButton
            formData={selectedInvoice}
            companyData={{
              ...companyData,
              transactionType: selectedInvoice.transactionType,
            }}
            flages={{ isPanNo: true, isBankDetails: true }}
            onPrintComplete={handlePrintComplete}
          />
        </div>
      )}
    </div>
  );
};

export default Billings;
