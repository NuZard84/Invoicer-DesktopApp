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
    width: "30%",
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  mainContent: {
    width: "70%",
    padding: "20px 30px",
  },
  logo: {
    width: 120,
    objectFit: "contain",
    marginBottom: 15,
  },
  companyName: {
    fontSize: 14,
    marginBottom: 5,
  },
  sidebarSection: {
    marginVertical: 20,
    borderBottom: "1px solid #e0e0e0",
    paddingVertical: 20,
  },
  sidebarLabel: {
    color: "#666",
    marginTop: 6,
  },
  sidebarValue: {
    fontSize: 10,
    marginVertical: 2,
  },
  invoiceTitle: {
    fontSize: 24,
    marginBottom: 40,
    textAlign: "right",
  },
  clientSection: {
    marginBottom: 40,
  },
  table: {
    width: "100%",
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
    bottom: 100,
    right: 20,
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

function convertNumberToWords(amount: number): string {
  return "Twenty Five Thousand Rupees";
}

const InvoicePDF = ({ formData, companyData }: DefaultPDFProps) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Sidebar Section */}
        <View style={styles.sidebar}>
          {companyData.companyLogo && (
            <Image style={styles.logo} src={companyData.companyLogo} />
          )}

          {/* Invoice Details */}
          <View style={styles.sidebarSection}>
            <Text style={styles.sidebarLabel}>Invoice No.</Text>
            <Text style={styles.sidebarValue}>{formData.invoiceNo}</Text>

            <Text style={styles.sidebarLabel}>Invoice Date</Text>
            <Text style={styles.sidebarValue}>{formData.invoiceDate}</Text>

            <Text style={styles.sidebarLabel}>Transaction Type</Text>
            <Text style={styles.sidebarValue}>
              {companyData.transactionType}
            </Text>
          </View>

          {/* Company PAN */}
          <View style={styles.sidebarSection}>
            <Text style={styles.sidebarLabel}>PAN No.</Text>
            <Text style={styles.sidebarValue}>{companyData.panNo}</Text>
          </View>

          {/* Bank Details */}
          <View style={styles.sidebarSection}>
            <Text style={styles.sidebarLabel}>Bank Details</Text>
            <Text style={styles.sidebarValue}>{companyData.bankName}</Text>
            <Text style={styles.sidebarValue}>
              A/c No: {companyData.accountNo}
            </Text>
            <Text style={styles.sidebarValue}>IFSC: {companyData.ifsc}</Text>
          </View>

          {/* Email */}
          <View style={styles.sidebarSection}>
            <Text style={styles.sidebarLabel}>Email</Text>
            <Text style={styles.sidebarValue}>{companyData.email}</Text>
          </View>

          {/* Company Address */}
          <View style={styles.sidebarSection}>
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
            {formData.customerAddress.split(",").map((line, index) => (
              <Text key={index}>{line.trim()}</Text>
            ))}
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
              width: "100%",
              display: "flex",
              flexDirection: "row",
              marginTop: 10,
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
                textAlign: "right",
                marginRight: 8,
              }}
            >
              <Text>
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

export default function DhanchaPDF({ formData, companyData }: DefaultPDFProps) {
  if (!formData || !companyData) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto my-10">
      <div className="w-full h-[850px]">
        <PDFViewer width="100%" height="100%">
          <InvoicePDF formData={formData} companyData={companyData} />
        </PDFViewer>
      </div>
      <div className="mt-6 flex justify-center">
        <PDFDownloadLink
          document={
            <InvoicePDF formData={formData} companyData={companyData} />
          }
          fileName="invoice.pdf"
        >
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
}
