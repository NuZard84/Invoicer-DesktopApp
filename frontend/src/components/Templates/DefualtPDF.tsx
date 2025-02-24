import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  PDFViewer,
  Image,
} from "@react-pdf/renderer";
import { StyleSheet } from "@react-pdf/renderer";

export interface CompanyInfo {
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

interface DefaultPDFProps {
  formData: FormDataType;
  companyData: CompanyInfo;
}

// Separated InvoicePDF component for generation
export const InvoicePDF = ({ formData, companyData }: DefaultPDFProps) => {
  function convertNumberToWords(amount: number): string {
    return "Twenty Five Thousand Rupees";
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Sidebar Section */}
        <View style={styles.sidebar}>
          {/* Logo and Main Title */}
          <View
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {companyData.companyLogo && (
              <Image style={styles.logo} src={companyData.companyLogo} />
            )}
            <Text
              style={{
                textAlign: "center",
                fontSize: 18,
                fontWeight: "700",
                fontFamily: "Helvetica",
              }}
            >
              Nikhil B Fultariya
            </Text>
          </View>

          {/* Horizontal line */}
          <View
            style={{
              position: "absolute",
              top: "10%",
              backgroundColor: "rgba(0,0,0,0.75)",
              height: 0.7,
              width: "293.5%",

              marginVertical: 16,
            }}
          />

          {/* Invoice Details Section */}
          <View style={styles.sidebarSectionInvoiceDetails}>
            <Text style={styles.sidebarLabel}>Invoice No.</Text>
            <Text style={styles.sidebarValue}>
              {formData.invoiceNo ? formData.invoiceNo : 1111}
            </Text>

            <Text style={styles.sidebarLabel}>Invoice Date</Text>
            <Text style={styles.sidebarValue}>{formData.invoiceDate}</Text>

            <Text style={styles.sidebarLabel}>Transaction Type</Text>
            <Text style={styles.sidebarValue}>
              {companyData.transactionType}
            </Text>
          </View>

          {/* Horizontal line */}
          <View
            style={{
              position: "absolute",
              top: "28.75%",
              backgroundColor: "rgba(0,0,0,0.75)",
              height: 0.7,
              width: "293.5%",
            }}
          />

          {/* Company PAN Section */}
          <View style={styles.sidebarSectionCompanyPAN}>
            <Text style={styles.sidebarLabel}>PAN No.</Text>
            <Text style={styles.sidebarValue}>{companyData.panNo}</Text>
          </View>

          {/* Horizontal line */}
          <View
            style={{
              backgroundColor: "rgba(0,0,0,0.75)",
              height: 0.7,
              width: "100%",
            }}
          />

          {/* Bank Details */}
          <View style={styles.sidebarSectionBankDetails}>
            <Text style={styles.sidebarLabel}>Bank Details</Text>
            <Text style={styles.sidebarValue}>{companyData.name}</Text>
            <Text style={styles.sidebarValue}>{companyData.bankName}</Text>
            <Text style={styles.sidebarValue}>
              A/c No: {companyData.accountNo}
            </Text>
            <Text style={styles.sidebarValue}>IFSC: {companyData.ifsc}</Text>
          </View>

          {/* Horizontal line */}
          <View
            style={{
              backgroundColor: "rgba(0,0,0,0.75)",
              height: 0.7,
              width: "100%",
            }}
          />

          {/* Email */}
          <View style={styles.sidebarSectionEmail}>
            <Text style={styles.sidebarLabel}>Email</Text>
            <Text style={styles.sidebarValue}>{companyData.email}</Text>
            <Text style={styles.sidebarLabel}>Website</Text>
            <Text style={styles.sidebarValue}>www.dhancha.com</Text>
          </View>
          <View
            style={{
              backgroundColor: "rgba(0,0,0,0.75)",
              height: 0.7,
              width: "100%",
            }}
          />
          {/* Horizontal line */}
          <View
            style={{
              backgroundColor: "rgba(0,0,0,0.75)",
              height: 0.7,
              width: "293.5%",

              position: "absolute",
              top: "75.7%",
            }}
          />

          {/* Company Address */}
          <View style={styles.sidebarSectionAddress}>
            <Text style={styles.sidebarLabel}>Address</Text>
            {companyData.companyAddress.split(",").map((line, index) => (
              <Text key={index} style={styles.sidebarValue}>
                {line.trim()}
              </Text>
            ))}
          </View>
        </View>

        {/* Main Content Section */}
        <View style={styles.mainContent}>
          <Text style={styles.invoiceTitle}>INVOICE</Text>

          {/* Client Details */}
          <View style={styles.clientSection}>
            <Text style={styles.companyName}>{formData.customerName}</Text>
            <Text style={styles.sidebarValue}>
              {companyData.companyAddress}
            </Text>
          </View>

          {/* Items Table */}
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.descriptionCol}>Description</Text>
              <Text style={styles.amountCol}>Amount</Text>
            </View>

            {formData.items.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.descriptionCol}>{item.description}</Text>
                <Text style={styles.amountCol}>
                  {parseFloat(item.amount).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>

          {/* Totals */}
          <View
            style={{
              justifyContent: "space-between",
              width: "94.5%",
              display: "flex",
              flexDirection: "row",
              position: "absolute",
              top: "76.5%",
            }}
          >
            <View style={styles.total}>
              <Text>Total: </Text>
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
            <View
              style={{
                // textAlign: "right",
                marginRight: 8,
              }}
            >
              <Text
                style={{
                  fontFamily: "Helvetica-Bold",
                }}
              >
                {formData.items
                  .reduce(
                    (sum, item) => sum + (parseFloat(item.amount) || 0),
                    0
                  )
                  .toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Signature */}
          <View style={styles.signature}>
            <Text>{companyData.name}</Text>
            <Text>Proprietor {companyData.companyName}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

// Preview component
export default function DefaultPDF({ formData, companyData }: DefaultPDFProps) {
  if (!formData || !companyData) {
    return null;
  }

  try {
    return (
      <div className="max-w-2xl mx-auto my-10">
        <div className="w-full h-[600px]">
          <PDFViewer width="100%" height="100%">
            <InvoicePDF formData={formData} companyData={companyData} />
          </PDFViewer>
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
    padding: 0,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#262626",
    flexDirection: "row",
  },
  sidebar: {
    width: "33%",
    height: "100%",
    backgroundColor: "rgba(230, 230, 230, 1)",
    padding: 20,
    paddingLeft: 25,
  },
  mainContent: {
    width: "70%",
    padding: "20px 10px",
  },
  logo: {
    width: 170,
    objectFit: "contain",
    marginBottom: 8,
  },
  companyName: {
    fontSize: 14,
    marginBottom: 5,
  },

  sidebarSectionInvoiceDetails: {
    marginVertical: 10,
    paddingLeft: 6,
    paddingTop: 20,
  },
  sidebarSectionCompanyPAN: {
    paddingVertical: 20,

    marginTop: 20,
    paddingLeft: 6,
  },
  sidebarSectionBankDetails: {
    paddingVertical: 20,

    paddingLeft: 6,
  },
  sidebarSectionEmail: {
    paddingVertical: 20,

    paddingLeft: 6,
  },
  sidebarSectionAddress: {
    paddingVertical: 15,

    paddingLeft: 6,
  },

  sidebarLabel: {
    color: "#666",
    marginTop: 6,
  },
  sidebarValue: {
    fontSize: 10,
    marginVertical: 2,
    marginBottom: 2,
  },
  invoiceTitle: {
    fontSize: 24,
    marginBottom: 40,
    textAlign: "right",
  },
  clientSection: {
    height: 135,
    marginTop: 20,

    display: "flex",
    justifyContent: "center",
  },
  table: {
    width: "100%",
    marginTop: 5,
  },
  tableHeader: {
    backgroundColor: "#f9f9f9",
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    padding: "8px 0",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    padding: "8px 0",
  },
  descriptionCol: {
    flex: 2,
    paddingLeft: 8,
  },
  amountCol: {
    flex: 1,
    textAlign: "right",
    paddingRight: 8,
  },
  total: {
    textAlign: "left",
    paddingRight: 8,
    marginLeft: 8,
  },
  totalInWords: {
    marginTop: 2,
    fontSize: 9,
    fontStyle: "italic",
    color: "#666",
  },
  signature: {
    position: "absolute",
    bottom: 40,
    right: 35,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 130,
    borderTopColor: "#666",
    borderTopWidth: 1,
    paddingRight: 8,
    paddingTop: 8,
  },
});
