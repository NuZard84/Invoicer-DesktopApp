import React, { useState, useEffect } from "react";
import { GetInvoices, GeneratePDF, ExportCSV } from "../../wailsjs/go/main/App";

const Billings: React.FC = () => {
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const data = await GetInvoices();
      setInvoices(data);
    } catch (err) {
      console.error("Error fetching invoices:", err);
    }
  };

  const handleGeneratePDF = async (invoiceNumber: number) => {
    try {
      const pdfPath = await GeneratePDF(invoiceNumber);
      alert("PDF generated: " + pdfPath);
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("Failed to generate PDF.");
    }
  };

  const handleExportCSV = async () => {
    try {
      const csvPath = await ExportCSV();
      alert("CSV exported: " + csvPath);
    } catch (err) {
      console.error("Error exporting CSV:", err);
      alert("Failed to export CSV.");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl mb-4">Billing History</h1>
      <button
        onClick={handleExportCSV}
        className="bg-green-600 px-3 py-2 text-white rounded-md mb-4"
      >
        Export CSV
      </button>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 border">Invoice #</th>
            <th className="py-2 border">Serial #</th>
            <th className="py-2 border">Customer</th>
            <th className="py-2 border">Total</th>
            <th className="py-2 border">Date</th>
            <th className="py-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv, index) => (
            <tr key={index}>
              <td className="py-2 border text-center">{inv.invoiceNumber}</td>
              <td className="py-2 border text-center">{inv.serialNumber}</td>
              <td className="py-2 border text-center">{inv.customerName}</td>
              <td className="py-2 border text-center">
                {parseFloat(inv.total).toFixed(2)}
              </td>
              <td className="py-2 border text-center">
                {new Date(inv.createdAt).toLocaleString()}
              </td>
              <td className="py-2 border text-center">
                <button
                  onClick={() => handleGeneratePDF(inv.invoiceNumber)}
                  className="bg-blue-600 text-white px-2 py-1 rounded-md"
                >
                  Generate PDF
                </button>
              </td>
            </tr>
          ))}
          {invoices.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center py-4">
                No invoices found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Billings;
