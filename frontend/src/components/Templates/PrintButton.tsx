import React, { useEffect } from "react";
import { pdf } from "@react-pdf/renderer";
import {
  CompanyInfo,
  FlagForDefault,
  FormDataType,
  InvoicePDF,
} from "./DefualtPDF";
import { InvoicePDF as DhanchhaPDFDoc } from "./DhanchhaPDF";

interface PrintButtonProps {
  formData: FormDataType;
  companyData: CompanyInfo;
  flages: FlagForDefault;
  onPrintComplete?: () => void;
}

const PrintButton: React.FC<PrintButtonProps> = ({
  formData,
  companyData,
  flages,
  onPrintComplete,
}) => {
  // Auto-trigger print on component mount
  useEffect(() => {
    // Use a small timeout to ensure component is fully mounted
    const timer = setTimeout(() => {
      handlePrint();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handlePrint = async () => {
    try {
      // Check if the current company should use the Dhanchha template
      const isDhanchhaTemplate =
        companyData?.companyName?.toLowerCase() === "dhanchha";

      // Use the correct PDF component based on company name
      const PDFComponent = isDhanchhaTemplate ? (
        <DhanchhaPDFDoc formData={formData} companyData={companyData} />
      ) : (
        <InvoicePDF
          formData={formData}
          companyData={companyData}
          flages={flages}
        />
      );

      const blob = await pdf(PDFComponent).toBlob();
      const url = URL.createObjectURL(blob);

      const newWindow = window.open(url, "_blank");
      if (newWindow) {
        newWindow.onload = () => {
          newWindow.print();
          newWindow.onafterprint = () => {
            newWindow.close(); // Automatically close after printing
            if (onPrintComplete) onPrintComplete();
          };
        };
      } else {
        console.warn(
          "Browser blocked opening a new window. Please enable popups for this site."
        );
        alert(
          "Unable to open print dialog. Please make sure popups are enabled for this site."
        );
        if (onPrintComplete) onPrintComplete();
      }
    } catch (error) {
      console.error("Error printing invoice:", error);
      alert("Failed to print invoice. Please try again.");
      if (onPrintComplete) onPrintComplete();
    }
  };

  return (
    <button
      onClick={handlePrint}
      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
    >
      Print Invoice
    </button>
  );
};

export default PrintButton;
