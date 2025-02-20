import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  PDFViewer,
  PDFDownloadLink,
  Image,
} from "@react-pdf/renderer";
import { StyleSheet } from "@react-pdf/renderer";

// Updated CompanyInfo interface
interface CompanyInfo {
  name: string;
  companyName: string;
  companyAddress: string;
  gstNo: string;
  companyLogo: string | null;
  transactionType: string;
  panNo: string;
  bankName: string;
  accountNo: string;
  ifsc: string;
  email: string;
  isTemplateFilled?: boolean;
}

interface FormDataType {
  invoiceNo: string;
  invoiceDate: string;
  customerName: string;
  customerAddress: string;
  items: {
    description: string;
    amount: string;
  }[];
}

interface DefaultPDFProps {
  formData: FormDataType;
  companyData: CompanyInfo;
}

export default function DefaultPDF({ formData, companyData }: DefaultPDFProps) {
  if (!formData || !companyData) {
    return null;
  }

  // This function can be enhanced or replaced by a proper conversion library
  function convertNumberToWords(amount: number): string {
    // For demo purposes, simply return a placeholder
    return "Twenty Five Thousand Rupees";
  }

  console.log();
  const InvoicePDF = () => (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header: Logo, Company Info and Invoice Details */}
        <View style={styles.header}>
          <View style={styles.companyLogoContainer}>
            {companyData.companyLogo && (
              <Image src={companyData.companyLogo} style={styles.companyLogo} />
            )}
          </View>
          <View style={styles.companyInfo}>
            <Text style={styles.companyTitle}>{companyData.companyName}</Text>
            {companyData.companyAddress.split(",").map((line, idx) => (
              <Text key={idx} style={styles.companyAddressText}>
                {line.trim()}
              </Text>
            ))}
          </View>
          <View style={styles.invoiceInfo}>
            <Text style={styles.invoiceLabel}>INVOICE</Text>
            <Text>Invoice No: {formData.invoiceNo}</Text>
            <Text>Invoice Date: {formData.invoiceDate}</Text>
            <Text>Transaction Type: {companyData.transactionType}</Text>
          </View>
        </View>

        {/* Additional Company Details */}
        <View style={styles.companyDetails}>
          <Text>PAN No: {companyData.panNo}</Text>
          <Text>Bank Name: {companyData.bankName}</Text>
          <Text>Account No: {companyData.accountNo}</Text>
          <Text>IFSC: {companyData.ifsc}</Text>
          <Text>Email: {companyData.email}</Text>
        </View>

        {/* Bill To Section */}
        <View style={styles.billToSection}>
          <Text style={styles.sectionTitle}>Bill To:</Text>
          <Text>{formData.customerName}</Text>
          {formData.customerAddress.split(",").map((line, idx) => (
            <Text key={idx}>{line.trim()}</Text>
          ))}
        </View>

        {/* Invoice Items Table */}
        <View style={styles.table}>
          <View style={styles.tableRowHeader}>
            <Text
              style={[
                styles.tableCell,
                styles.descriptionCell,
                styles.boldText,
              ]}
            >
              Description
            </Text>
            <Text
              style={[styles.tableCell, styles.amountCell, styles.boldText]}
            >
              Amount
            </Text>
          </View>
          {formData.items.map((item, idx) => (
            <View key={idx} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.descriptionCell]}>
                {item.description}
              </Text>
              <Text style={[styles.tableCell, styles.amountCell]}>
                ₹{parseFloat(item.amount).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {/* Total Section */}
        <View style={styles.totalSection}>
          <Text style={styles.boldText}>
            Total: ₹
            {formData.items
              .reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)
              .toFixed(2)}
          </Text>
          <Text style={styles.totalInWords}>
            {convertNumberToWords(
              formData.items.reduce(
                (sum, item) => sum + (parseFloat(item.amount) || 0),
                0
              )
            )}{" "}
            Only
          </Text>
        </View>
      </Page>
    </Document>
  );

  try {
    return (
      <div className="max-w-2xl mx-auto my-10">
        <div className="w-full h-[600px]">
          <PDFViewer width="100%" height="100%">
            <InvoicePDF />
          </PDFViewer>
        </div>
        <div className="mt-6 flex justify-center">
          <PDFDownloadLink document={<InvoicePDF />} fileName="invoice.pdf">
            {({ loading }) => (
              <button
                className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300"
                disabled={loading}
              >
                {loading ? "Loading document..." : "Download PDF"}
              </button>
            )}
          </PDFDownloadLink>
        </div>
      </div>
    );
  } catch (error) {
    console.error("PDF rendering error:", error);
    return (
      <div className="text-red-500">
        Error loading PDF preview. Please check your data and try again.
      </div>
    );
  }
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#fff",
    padding: "30px 50px",
    fontSize: "12px",
    fontFamily: "Helvetica",
    color: "#262626",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  companyLogoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  companyLogo: {
    width: 60,
    height: 60,
    objectFit: "contain",
  },
  companyInfo: {
    flex: 2,
    textAlign: "center",
  },
  companyTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  companyAddressText: {
    fontSize: 10,
  },
  invoiceInfo: {
    flex: 2,
    textAlign: "right",
  },
  invoiceLabel: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  companyDetails: {
    marginBottom: 20,
    borderTopWidth: 1,
    borderTopColor: "#000",
    paddingTop: 10,
  },
  billToSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  table: {
    borderWidth: 1,
    borderColor: "#000",
  },
  tableRowHeader: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
  },
  tableCell: {
    padding: 8,
    flex: 1,
  },
  descriptionCell: {
    flex: 2,
  },
  amountCell: {
    flex: 1,
    textAlign: "right",
  },
  boldText: {
    fontWeight: "bold",
  },
  totalSection: {
    marginTop: 10,
    padding: 8,
    alignItems: "flex-end",
  },
  totalInWords: {
    fontSize: 10,
    fontStyle: "italic",
  },
});
