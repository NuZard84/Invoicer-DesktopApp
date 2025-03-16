import React, { useState, useEffect } from "react";
import {
  GetInvoices,
  GetInvoiceDetail,
  ToggleInvoicePayment,
  UpdateInvoiceAmounts,
} from "../../wailsjs/go/main/App";
import { useParams } from "react-router-dom";

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
        const res0 = await GetInvoiceDetail(companyString, res[0].invoiceNo);
        console.log("get first invoice detail -->", res0);
        console.log("Get Invoice --> ", res);
      } catch (error) {
        console.log(error);
      }
    };
    if (invoices.length === 0) {
      fetchInvoiceData();
    }
  }, [companyString]);

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

  // Calculate totals
  const totalPaidAmount = invoices.reduce(
    (acc, inv) => acc + (inv.paidAmount || 0),
    0
  );
  const totalTDSAmount = invoices.reduce(
    (acc, inv) => acc + (inv.total - inv.paidAmount),
    0
  );
  const totalAmount = invoices.reduce(
    (acc, inv) => acc + parseFloat(inv.total),
    0
  );

  const paidAmount = invoices
    .filter((item, i) => item.isPaid === true)
    .reduce((acc, inv) => acc + parseFloat(inv.total), 0);

  const unPaidAmount = invoices
    .filter((item, i) => item.isPaid === false)
    .reduce((acc, inv) => acc + parseFloat(inv.total), 0);

  return (
    <div className="p-4 relative">
      <div className="absolute right-10 top-10">
        <div className="flex flex-row justify-end gap-2">
          <div className="text-green-400 text-lg">Total Paid Amount </div>
          <div className="text-lg">
            {paidAmount === 0 ? "00.00" : paidAmount}
          </div>
        </div>
        <div className="flex flex-row gap-2">
          <div className="text-red-400 text-lg">Total Unpaid Amount </div>
          <div className="text-lg">
            {unPaidAmount === 0 ? "00.00" : unPaidAmount}
          </div>
        </div>
      </div>
      <h1 className="text-3xl mb-4">Billing History</h1>
      <button
        onClick={() => {}}
        className="bg-mp hover:bg-mp-dark px-3 py-2 text-white rounded-md mb-4 transition-colors"
      >
        Export CSV
      </button>
      <div className="relative">
        <table className="min-w-full bg-bg dark:bg-bg-dark border border-gf/30 dark:border-gf-dark/30">
          <thead>
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
            {invoices.map((inv, index) => (
              <tr
                key={index}
                className={
                  index % 2 === 0
                    ? "bg-cbg dark:bg-cbg-dark"
                    : "bg-bg dark:bg-bg-dark"
                }
              >
                <td className="w-24 border border-gf/30 dark:border-gf-dark/30 text-center">
                  {index + 1}
                </td>
                <td className="w-28 border border-gf/30 dark:border-gf-dark/30 text-center">
                  {inv.invoiceNo}
                </td>
                <td className="w-32 border border-gf/30 dark:border-gf-dark/30 text-center">
                  {new Date(inv.createdAt).toLocaleString().split(",")[0]}
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
                    } rounded-xl px-4 py-1 transition-colors`}
                  >
                    {inv.isPaid ? "paid" : "unpaid"}
                  </button>
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
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
        {/* Sticky Footer */}
        <div className="sticky bottom-0 bg-lp dark:bg-lp-dark  border-gf/40 dark:border-gf-dark/40 flex">
          <table className="min-w-full self-end">
            <tfoot>
              <tr className="text-mp-dark dark:text-white ">
                <td className="w-[48.4%] flex items-center justify-center  "></td>
                <td className="py-2  w-56 border border-gf/40 dark:border-gf-dark/40 text-center font-bold">
                  {totalAmount.toFixed(2)}
                </td>

                <td className="py-2 w-56 border border-gf/40 dark:border-gf-dark/40 text-center font-bold">
                  {totalPaidAmount.toFixed(2)}
                </td>

                <td className="py-2 w-56 border border-gf/40 dark:border-gf-dark/40 text-center font-bold">
                  {totalTDSAmount.toFixed(2)}
                </td>
                <td className="w-[9.7%]"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Billings;
