import React, { useState, useEffect } from "react";
import { GetInvoices } from "../../wailsjs/go/main/App";
import { useParams } from "react-router-dom";
import { Window } from "@wailsio/runtime";

const Billings: React.FC = () => {
  const { company } = useParams<{ company: string | undefined }>();
  const [invoices, setInvoices] = useState<any[]>([]);

  const [companyString, setCompanyString] = useState<string>("");

  useEffect(() => {
    if (company) {
      setCompanyString(company);
    }
  }, [company]);

  useEffect(() => {
    const fetchInvoiceData = async () => {
      try {
        const res = await GetInvoices(companyString);
        setInvoices(res);

        console.log("Get Invoice --> ", res);
      } catch (error) {
        console.log(error);
      }
    };
    if (invoices.length === 0) {
      fetchInvoiceData();
    }
  }, [companyString]);

  return (
    <div className="p-4">
      <h1 className="text-3xl mb-4">Billing History</h1>
      <button
        onClick={() => {}}
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
              <td className="py-2 border text-center">{inv.invoiceNo}</td>
              <td className="py-2 border text-center">{index + 1}</td>
              <td className="py-2 border text-center">{inv.customerName}</td>
              <td className="py-2 border text-center">
                {parseFloat(inv.total).toFixed(2)}
              </td>
              <td className="py-2 border text-center">
                {new Date(inv.createdAt).toLocaleString()}
              </td>
              <td className="py-2 border text-center">
                <button
                  onClick={() => {}}
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
