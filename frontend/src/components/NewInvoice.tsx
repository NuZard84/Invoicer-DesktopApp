import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Trash2, AlertCircle } from "lucide-react";
import DefaultPDF from "./Templates/DefualtPDF";
import DhanchhaPDF from "./Templates/DhanchhaPDF";
import { InvoicePDF as DhanchhaPDFDoc } from "./Templates/DhanchhaPDF";
import { InvoicePDF as DefaultPDFDoc } from "./Templates/DefualtPDF";
import { pdf } from "@react-pdf/renderer";
// Import the backend functions from your Wails bindings
import {
  SaveInvoicePDF,
  AddInvoice,
  GetInvoiceDetail,
  UpdateInvoice,
  GeneratePDFFromInvoice,
} from "../../wailsjs/go/main/App";

export interface CompanyInfo {
  name: string;
  companyName: string;
  companyAddress: string;
  gstNo: string;
  companyLogo: string | null;
  invoiceNo: string;
  invoiceDate: string;
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
  const { company, invoiceId } = useParams<{
    company: string | undefined;
    invoiceId: string | undefined;
  }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState<FormDataType>({
    invoiceNo: "",
    invoiceDate: "",
    customerName: "",
    customerAddress: "",
    items: [{ description: "", amount: "" }],
  });
  const [isPanNo, setIsPanNo] = useState(true);
  const [isBankDetails, setIsBankDetails] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [companyData, setCompanyData] = useState<CompanyInfo | null>(null);
  const [generatePDF, setGeneratePDF] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [transactionType, setTransactionType] = useState<string>("online");

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

  // Load invoice data if editing an existing invoice
  useEffect(() => {
    if (company && invoiceId) {
      setIsEditing(true);
      loadInvoiceData(company, invoiceId);
    }
  }, [company, invoiceId]);

  useEffect(() => {
    // Check if the generatePDF query parameter is present
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get("generatePDF") === "true") {
      setGeneratePDF(true);
    }
  }, [location]);

  const loadInvoiceData = async (company: string, invoiceId: string) => {
    try {
      const invoiceData = await GetInvoiceDetail(company, invoiceId);
      if (invoiceData) {
        // Format the items array to match the expected form structure
        const formattedItems = invoiceData.items.map((item: any) => ({
          description: item.description,
          amount: item.amount.toString(),
        }));

        setFormData({
          invoiceNo: invoiceData.invoiceNo,
          // Format the date to YYYY-MM-DD for the date input
          invoiceDate: new Date(invoiceData.createdAt)
            .toISOString()
            .split("T")[0],
          customerName: invoiceData.customerName,
          customerAddress: invoiceData.customerAddress,
          items: formattedItems,
        });

        // Set transaction type if it exists in the invoice data
        if (invoiceData.transactionType) {
          setTransactionType(invoiceData.transactionType);
        }
      }
    } catch (error) {
      console.error("Error loading invoice data:", error);
      alert("Failed to load invoice data");
    }
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = event.target;
    // Clear error message when user changes the invoice number
    if (id === "invoiceNo") {
      setErrorMessage(null);
    }
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
    setErrorMessage(null);

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
      transactionType,
      convertValues: (a: any, classs: any, asMap?: boolean) => a,
    };

    try {
      if (isEditing) {
        // If editing existing invoice, just update the data
        await UpdateInvoice(company, formData.invoiceNo, invoiceData);

        // Only generate PDF if requested
        if (generatePDF) {
          await generateAndSavePDF(invoiceData);
        } else {
          alert("Invoice updated successfully!");
          navigate(`/company/${company}/billings`);
        }
      } else {
        // If creating new invoice, add the data
        await AddInvoice(company, invoiceData);

        // Only generate PDF if requested
        if (generatePDF) {
          await generateAndSavePDF(invoiceData);
        } else {
          alert("Invoice created successfully!");
          setFormData({
            invoiceNo: "",
            invoiceDate: "",
            customerName: "",
            customerAddress: "",
            items: [{ description: "", amount: "" }],
          });
        }
      }
    } catch (err: any) {
      console.error("Error handling invoice:", err);

      // Check for duplicate invoice number error
      if (err.message && err.message.includes("already exists")) {
        setErrorMessage(
          "This invoice number already exists. Please use a different one."
        );
      } else {
        alert("Failed to process invoice: " + err.message);
      }
    }
  };

  const generateAndSavePDF = async (invoiceData: any) => {
    // Pass transaction type to the PDF component
    const pdfData = {
      ...invoiceData,
      transactionType,
    };

    // Use the correct PDF component based on company name
    const PDFComponent = isDhanchhaTemplate ? (
      <DhanchhaPDFDoc
        formData={formData}
        companyData={{ ...companyData!, transactionType }}
      />
    ) : (
      <DefaultPDFDoc
        formData={formData}
        companyData={{ ...companyData!, transactionType }}
        flages={{
          isPanNo: isPanNo,
          isBankDetails: isBankDetails,
        }}
      />
    );

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
      if (isEditing) {
        await GeneratePDFFromInvoice(company!, formData.invoiceNo, pdfBase64);
        alert("Invoice updated and PDF generated successfully!");
      } else {
        await SaveInvoicePDF(company!, formData.invoiceNo, pdfBase64);
        alert("Invoice created and PDF generated successfully!");
      }

      if (isEditing) {
        // Navigate back to billings page after successful edit
        navigate(`/company/${company}/billings`);
      } else {
        // Reset form for new invoice creation
        setFormData({
          invoiceNo: "",
          invoiceDate: "",
          customerName: "",
          customerAddress: "",
          items: [{ description: "", amount: "" }],
        });
      }
    };
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
      <h1 className="text-dp text-3xl py-10">
        {isEditing ? "Edit Invoice" : "New Invoice"}
      </h1>
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
                <div className="flex flex-col w-2/3">
                  <input
                    id="invoiceNo"
                    type="text"
                    placeholder="Enter invoice number"
                    className={`dark:bg-[#464a56] bg-white rounded-md w-full pl-2 py-1 border ${
                      errorMessage
                        ? "border-red-500 dark:border-red-500"
                        : "dark:border-0"
                    }`}
                    value={formData.invoiceNo}
                    required
                    onChange={handleInputChange}
                    readOnly={isEditing} // Make read-only when editing
                  />
                  {errorMessage && (
                    <div className="flex items-center text-red-500 mt-1 text-sm">
                      <AlertCircle size={14} className="mr-1" /> {errorMessage}
                    </div>
                  )}
                </div>
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
              {/* Transaction Type Selection */}
              <div className="flex flex-col gap-2 mt-4">
                <label className="font-medium">Transaction Type:</label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center w-2/3 rounded-lg overflow-hidden border dark:border-slate-600">
                    <button
                      type="button"
                      onClick={() => setTransactionType("online")}
                      className={`flex-1 py-2 px-4 text-center transition-colors border-r dark:border-slate-600 ${
                        transactionType === "online"
                          ? "bg-dp dark:bg-mp-dark text-white"
                          : "bg-white dark:bg-[#464a56] hover:bg-gray-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      Online
                    </button>
                    <button
                      type="button"
                      onClick={() => setTransactionType("cheque")}
                      className={`flex-1 py-2 px-4 text-center transition-colors ${
                        transactionType === "cheque"
                          ? "bg-dp dark:bg-mp-dark text-white"
                          : "bg-white dark:bg-[#464a56] hover:bg-gray-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      Cheque
                    </button>
                  </div>
                </div>
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
                className="mt-2 px-3 py-1 bg-mp text-white rounded-md dark:bg-dp hover:bg-mp-dark hover:dark:bg-mp transition-colors"
              >
                + Add Item
              </button>
              <div className="mt-4 flex justify-end">
                <div className="w-1/3 border-t pt-2 font-bold">
                  <span>Total: ₹ {calculateTotal()}</span>
                </div>
              </div>
            </div>

            {/* PDF Generation Option */}
            <div className="mb-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="generatePDF"
                  checked={generatePDF}
                  onChange={(e) => setGeneratePDF(e.target.checked)}
                  className="w-4 h-4 text-dp dark:text-mp-dark rounded"
                />
                <label htmlFor="generatePDF" className="font-medium">
                  {isEditing ? "Generate updated PDF" : "Generate PDF now"}
                </label>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {isEditing
                  ? "If unchecked, only the invoice data will be updated without generating a new PDF."
                  : "If unchecked, only the invoice data will be saved. You can generate the PDF later from the Billings page."}
              </p>
            </div>

            {/* PDF Content Options Section - Only show for non-Dhanchha templates and when generate PDF is checked */}
            {!isDhanchhaTemplate && generatePDF && (
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

            <div className="flex space-x-4">
              <button
                type="submit"
                className="dark:bg-dp bg-mp text-white px-4 py-2 rounded-lg hover:dark:bg-mp hover:bg-mp-dark transition-colors"
              >
                {isEditing ? "Update Invoice" : "Create Invoice"}
              </button>

              {isEditing && (
                <button
                  type="button"
                  onClick={() => navigate(`/company/${company}/billings`)}
                  className="bg-gray-500 px-4 py-2 rounded-lg text-white hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {/* PDF Preview Container - Only show when generate PDF is checked */}
          {companyData && generatePDF ? (
            <div className="w-full lg:w-1/2 border dark:border-0 dark:bg-[#464a56] bg-gray-100 rounded-lg p-4 h-full">
              {isDhanchhaTemplate ? (
                <DhanchhaPDF
                  formData={formData}
                  companyData={{ ...companyData, transactionType }}
                />
              ) : (
                <DefaultPDF
                  formData={formData}
                  companyData={{ ...companyData, transactionType }}
                  flages={{
                    isPanNo: isPanNo,
                    isBankDetails: isBankDetails,
                  }}
                />
              )}
            </div>
          ) : (
            <div className="w-full lg:w-1/2 flex items-center justify-center">
              {generatePDF ? (
                <p>Loading preview...</p>
              ) : (
                <p className="text-gray-500">PDF preview disabled</p>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="py-10 px-4 flex flex-col gap-6">
          <h1 className="text-dp text-3xl">
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
