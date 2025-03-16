import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Trash2 } from "lucide-react";
import DefaultPDF from "./Templates/DefualtPDF";
import DhanchhaPDF from "./Templates/DhanchhaPDF";
import { InvoicePDF as DhanchhaPDFDoc } from "./Templates/DhanchhaPDF";
import { InvoicePDF as DefaultPDFDoc } from "./Templates/DefualtPDF";
import { pdf } from "@react-pdf/renderer";
// Import the backend functions from your Wails bindings
import { SaveInvoicePDF, AddInvoice } from "../../wailsjs/go/main/App";

export interface CompanyInfo {
  name: string;
  companyName: string;
  companyAddress: string;
  gstNo: string;
  companyLogo: string | null;
  invoiceNo: string;
  invoiceDate: string;
  transactionType: string;
  panNo: string;
  bankName: string;
  accountNo: string;
  ifsc: string;
  email: string;
  isTemplateFilled?: boolean;
}

export interface FormDataType {
  invoiceNo: string;
  invoiceDate: string;
  customerName: string;
  customerAddress: string;
  items: {
    description: string;
    amount: string;
  }[];
}

const NewInvoice: React.FC = () => {
  const { company } = useParams<{ company: string | undefined }>();

  const [formData, setFormData] = useState<FormDataType>({
    invoiceNo: "",
    invoiceDate: "",
    customerName: "",
    customerAddress: "",
    items: [{ description: "", amount: "" }],
  });
  const [isPanNo, setIsPanNo] = useState(true);
  const [isBankDetails, setIsBankDetails] = useState(true);

  const [companyData, setCompanyData] = useState<CompanyInfo | null>(null);

  useEffect(() => {
    if (!company) return;
    const stored = localStorage.getItem("userTemplateData");
    if (stored) {
      try {
        const parsedData: CompanyInfo[] = JSON.parse(stored);
        const foundData = parsedData.find(
          (item) => item.companyName?.toLowerCase() === company.toLowerCase()
        );
        if (foundData) {
          setCompanyData(foundData);
        }
      } catch (err) {
        console.error("Error parsing company data:", err);
      }
    }
  }, [company]);

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = event.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleItemChange = (index: number, field: string, value: string) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setFormData((prev) => ({ ...prev, items: updatedItems }));
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { description: "", amount: "" }],
    }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      const updatedItems = formData.items.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, items: updatedItems }));
    }
  };

  const calculateTotal = () =>
    formData.items
      .reduce((total, item) => total + (parseFloat(item.amount) || 0), 0)
      .toFixed(2);

  // Check if the current company should use the Dhanchha template
  const isDhanchhaTemplate =
    companyData?.companyName?.toLowerCase() === "dhanchha";

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!company) {
      alert("Company information is missing.");
      return;
    }

    const total = parseFloat(calculateTotal());
    const invoiceData = {
      invoiceNo: formData.invoiceNo,
      invoiceDate: formData.invoiceDate,
      customerName: formData.customerName,
      customerAddress: formData.customerAddress,
      items: formData.items.map((item) => ({
        description: item.description,
        amount: parseFloat(item.amount) || 0,
      })),
      total,
      convertValues: (a: any, classs: any, asMap?: boolean) => a,
    };

    try {
      // Use the correct PDF component based on company name
      const PDFComponent = isDhanchhaTemplate ? (
        <DhanchhaPDFDoc formData={formData} companyData={companyData!} />
      ) : (
        <DefaultPDFDoc
          formData={formData}
          companyData={companyData!}
          flages={{
            isPanNo: isPanNo,
            isBankDetails: isBankDetails,
          }}
        />
      );

      console.log(PDFComponent);
      // Generate the PDF blob using react-pdf
      const blob = await pdf(PDFComponent)?.toBlob();
      if (!blob) {
        throw new Error("Failed to generate PDF blob");
      }

      // Convert blob to base64 string
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64data = reader.result?.toString();
        if (!base64data) {
          throw new Error("Failed to convert blob to base64");
        }
        // Remove the "data:application/pdf;base64," prefix if present
        const base64Prefix = "data:application/pdf;base64,";
        const pdfBase64 = base64data.startsWith(base64Prefix)
          ? base64data.substring(base64Prefix.length)
          : base64data;

        // Call backend function to save the PDF file
        await SaveInvoicePDF(company, formData.invoiceNo, pdfBase64);

        // Call backend function to add the invoice data
        await AddInvoice(company, invoiceData);

        alert("Invoice created and PDF saved successfully!");
        setFormData({
          invoiceNo: "",
          invoiceDate: "",
          customerName: "",
          customerAddress: "",
          items: [{ description: "", amount: "" }],
        });
      };
    } catch (err) {
      console.error("Error creating invoice:", err);
      alert("Failed to create invoice.");
    }
  };

  // Toggle switch component
  const Toggle: React.FC<{
    enabled: boolean;
    setEnabled: (enabled: boolean) => void;
    label: string;
  }> = ({ enabled, setEnabled, label }) => {
    return (
      <div className="flex items-center space-x-2">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={enabled}
            onChange={() => setEnabled(!enabled)}
          />
          <div
            className={`w-11 h-6 rounded-full peer ${
              enabled
                ? "bg-dp dark:bg-mp-dark after:translate-x-full"
                : "bg-gray-300 dark:bg-gray-600"
            } after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}
          ></div>
        </label>
        <span className="text-sm font-medium">{label}</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col p-4">
      <h1 className="text-dp text-3xl py-10">New Invoice</h1>
      {localStorage.getItem("userTemplateData")?.length !== 0 && companyData ? (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Form Container */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-6 w-full lg:w-1/2 dark:bg-lp-dark bg-white border dark:border-0 rounded-lg p-4"
          >
            <div className="mb-4">
              <h2 className="text-xl text-dp mb-4">Invoice Information</h2>
              <div className="flex flex-col gap-2 mb-4">
                <label htmlFor="invoiceNo" className="font-medium">
                  Invoice No:
                </label>
                <input
                  id="invoiceNo"
                  type="text"
                  placeholder="Enter invoice number"
                  className="dark:bg-[#464a56] bg-white rounded-md w-2/3 pl-2 py-1 border dark:border-0"
                  value={formData.invoiceNo}
                  required
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="invoiceDate" className="font-medium">
                  Invoice Date:
                </label>
                <input
                  id="invoiceDate"
                  type="date"
                  className="dark:bg-[#464a56] bg-white rounded-md w-2/3 pl-2 py-1 border dark:border-0"
                  value={formData.invoiceDate}
                  required
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="mb-4">
              <h2 className="text-xl text-dp mb-4">Customer Information</h2>
              <div className="flex flex-col gap-2 mb-4">
                <label htmlFor="customerName" className="font-medium">
                  Customer Name:
                </label>
                <input
                  id="customerName"
                  type="text"
                  placeholder="Enter customer name"
                  className="dark:bg-[#464a56] bg-white rounded-md w-2/3 pl-2 py-1 border dark:border-0"
                  value={formData.customerName}
                  required
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex flex-col gap-2 mb-4">
                <label htmlFor="customerAddress" className="font-medium">
                  Customer Address:
                </label>
                <textarea
                  id="customerAddress"
                  placeholder="Enter customer address"
                  className="dark:bg-[#464a56] bg-white rounded-md w-2/3 pl-2 py-1 border dark:border-0 min-h-[80px] resize-none"
                  value={formData.customerAddress}
                  required
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="mb-4">
              <h2 className="text-xl text-dp mb-4">Items</h2>
              <div className="flex mb-2 font-semibold">
                <div className="w-3/5 px-2">Description</div>
                <div className="w-1/3 px-2">Amount</div>
                <div className="w-1/5"></div>
              </div>
              {formData.items.map((item, index) => (
                <div key={index} className="flex mb-2 items-center">
                  <input
                    type="text"
                    placeholder="Product or service description"
                    className="w-2/5 mr-2 dark:bg-[#464a56] bg-white rounded-md pl-2 py-1 border dark:border-0"
                    value={item.description}
                    onChange={(e) =>
                      handleItemChange(index, "description", e.target.value)
                    }
                    required
                  />
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-1/3 mr-2 dark:bg-[#464a56] bg-white rounded-md pl-2 py-1 border dark:border-0"
                    value={item.amount}
                    onChange={(e) =>
                      handleItemChange(index, "amount", e.target.value)
                    }
                    required
                    min="0"
                    step="0.01"
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="px-2 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                disabled={formData.items.length <= 0}
                onClick={addItem}
                className="mt-2 px-3 py-1 bg-dp dark:bg-mp-dark text-white rounded-md hover:bg-mp hover:dark:bg-mp"
              >
                + Add Item
              </button>
              <div className="mt-4 flex justify-end">
                <div className="w-1/3 border-t pt-2 font-bold">
                  <span>Total: ₹ {calculateTotal()}</span>
                </div>
              </div>
            </div>

            {/* PDF Content Options Section - Only show for non-Dhanchha templates */}
            {!isDhanchhaTemplate && (
              <div className="mb-4">
                <h2 className="text-xl text-dp mb-4">PDF Content Options</h2>
                <div className="flex flex-col space-y-4">
                  <Toggle
                    enabled={isPanNo}
                    setEnabled={setIsPanNo}
                    label="Include PAN Number"
                  />
                  <Toggle
                    enabled={isBankDetails}
                    setEnabled={setIsBankDetails}
                    label="Include Bank Details"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="dark:bg-mp-dark self-start bg-dp px-4 py-2 rounded-lg text-white hover:dark:bg-mp hover:bg-mp"
            >
              Create Invoice
            </button>
          </form>

          {/* PDF Preview Container */}
          {companyData ? (
            <div className="w-full lg:w-1/2 border dark:border-0 dark:bg-[#464a56] bg-gray-100 rounded-lg p-4 h-full">
              {isDhanchhaTemplate ? (
                <DhanchhaPDF formData={formData} companyData={companyData} />
              ) : (
                <DefaultPDF
                  formData={formData}
                  companyData={companyData}
                  flages={{
                    isPanNo: isPanNo,
                    isBankDetails: isBankDetails,
                  }}
                />
              )}
            </div>
          ) : (
            <div className="w-full lg:w-1/2 flex items-center justify-center">
              <p>Loading preview...</p>
            </div>
          )}
        </div>
      ) : (
        <div className="py-10 px-4 flex flex-col gap-6">
          <h1 className="text-3xl">
            <span className="text-dp">Sorry!</span>
          </h1>
          <p className="text-lg">
            You haven't filled in your company ({company}) details yet. Please
            go to the "Template" section to set up your company information
            before generating a PDF.
          </p>
        </div>
      )}
    </div>
  );
};

export default NewInvoice;
