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

export interface FlagForDefault {
  isPanNo: boolean;
  isBankDetails: boolean;
}

interface DefaultPDFProps {
  formData: FormDataType;
  companyData: CompanyInfo;
  flages: FlagForDefault;
}

function convertNumberToWords(amount: number): string {
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  function getWords(num: number): string {
    if (num < 20) return ones[num];
    if (num < 100)
      return (
        tens[Math.floor(num / 10)] +
        (num % 10 !== 0 ? " " + ones[num % 10] : "")
      );
    if (num < 1000)
      return (
        ones[Math.floor(num / 100)] +
        " Hundred" +
        (num % 100 !== 0 ? " and " + getWords(num % 100) : "")
      );
    if (num < 100000)
      return (
        getWords(Math.floor(num / 1000)) +
        " Thousand" +
        (num % 1000 !== 0 ? " " + getWords(num % 1000) : "")
      );
    if (num < 10000000)
      return (
        getWords(Math.floor(num / 100000)) +
        " Lakh" +
        (num % 100000 !== 0 ? " " + getWords(num % 100000) : "")
      );
    return (
      getWords(Math.floor(num / 10000000)) +
      " Crore" +
      (num % 10000000 !== 0 ? " " + getWords(num % 10000000) : "")
    );
  }

  const integerPart = Math.floor(amount);
  const decimalPart = Math.round((amount - integerPart) * 100);

  let words = getWords(integerPart) + " Rupees";
  if (decimalPart > 0) {
    words += " and " + getWords(decimalPart) + " Paise";
  }

  return words + " Only";
}

// Separated InvoicePDF component for generation
export const InvoicePDF = ({
  formData,
  companyData,
  flages,
}: DefaultPDFProps) => {
  // Calculate total amount
  const totalAmount = formData.items.reduce(
    (sum, item) => sum + (parseFloat(item.amount) || 0),
    0
  );

  // Check if company name exists
  const hasCompanyName = !!companyData.companyName;
  // Check if company address exists
  const hasCompanyAddress = !!companyData.companyAddress;
  // Check if company logo exists
  const hasCompanyLogo = !!companyData.companyLogo;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.leftHeader}>
            {hasCompanyName && (
              <Text style={styles.companyName}>
                {companyData.companyName.toUpperCase()}
              </Text>
            )}
            {hasCompanyAddress &&
              companyData.companyAddress.split(",").map((line, index) => (
                <Text key={index} style={styles.addressLine}>
                  {line.trim()}
                </Text>
              ))}
          </View>
          <View style={styles.rightHeader}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <View style={styles.rightDetails}>
              <View
                style={{
                  flexDirection: "row",
                  display: "flex",
                  gap: 2,
                }}
              >
                <View
                  style={{
                    flexDirection: "column",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-end",
                    gap: 2,
                  }}
                >
                  <Text style={styles.detailLabel}>Invoice No.:-</Text>
                  <Text style={styles.detailLabel}>Date:-</Text>
                  <Text style={styles.detailLabel}>Transaction Type:-</Text>
                  {flages.isPanNo && companyData.panNo && (
                    <Text style={styles.detailLabel}>PAN:-</Text>
                  )}
                </View>
                <View
                  style={{
                    flexDirection: "column",
                    display: "flex",
                    justifyContent: "center",
                    gap: 2,
                  }}
                >
                  <Text style={styles.detailValue}>{formData.invoiceNo}</Text>
                  <Text style={styles.detailValue}>{formData.invoiceDate}</Text>
                  <Text style={styles.detailValue}>
                    {companyData.transactionType}
                  </Text>
                  {flages.isPanNo && companyData.panNo && (
                    <Text style={styles.detailValue}>{companyData.panNo}</Text>
                  )}
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Customer Details */}
        <View style={styles.customerSection}>
          <View style={styles.customerHeader}>
            <Text style={styles.customerLabel}>To.</Text>
          </View>
          <View style={styles.customerDetails}>
            <Text style={styles.customerName}>{formData.customerName}</Text>

            <Text style={styles.customerAddressLine}>
              {formData.customerAddress}
            </Text>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <View style={styles.tableColumnSmall}>
              <Text style={styles.tableHeaderText}>Sr. No.</Text>
            </View>
            <View style={styles.tableColumnLarge}>
              <Text style={styles.tableHeaderText}>Descriptions</Text>
            </View>
            <View style={styles.tableColumnMedium}>
              <Text style={styles.tableHeaderText}>Amount</Text>
            </View>
          </View>

          {/* Table Rows */}
          {formData.items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={styles.tableColumnSmall}>
                <Text style={styles.tableCell}>{index + 1}</Text>
              </View>
              <View style={styles.tableColumnLarge}>
                <Text style={styles.tableCell}>{item.description}</Text>
              </View>
              <View style={styles.tableColumnMedium}>
                <Text style={styles.tableCellAmount}>
                  {parseFloat(item.amount).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Text>
              </View>
            </View>
          ))}

          {/* Total Row */}
          <View style={styles.totalRow}>
            <View style={styles.totalLabelContainer}>
              <Text style={styles.totalLabel}>Total Rs.:-</Text>
            </View>
            <View style={styles.totalAmountContainer}>
              <Text style={styles.totalAmount}>
                {totalAmount.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
            </View>
          </View>

          {/* Amount in Words */}
          <View style={styles.amountInWordsRow}>
            <Text style={styles.amountInWords}>
              {convertNumberToWords(totalAmount)}
            </Text>
          </View>
        </View>

        {/* Bank Details - only show if the data exists */}
        {flages.isBankDetails &&
          companyData.bankName &&
          companyData.accountNo &&
          companyData.ifsc && (
            <View style={styles.bankDetails}>
              {companyData.name && (
                <Text style={styles.bankDetailsText}>{companyData.name}</Text>
              )}
              <Text style={styles.bankDetailsText}>{companyData.bankName}</Text>
              <Text style={styles.bankDetailsText}>
                A/c No. {companyData.accountNo}
              </Text>
              <Text style={styles.bankDetailsText}>
                IFSC : {companyData.ifsc}
              </Text>
            </View>
          )}

        {/* Signature Section - only show if name exists */}
        {companyData.name && (
          <View style={styles.signatureSection}>
            <View style={styles.signatureContainer}>
              <Text style={styles.signatureName}>{companyData.name}</Text>
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
};

// Preview component with original interface
export default function DefaultPDF({
  formData,
  companyData,
  flages,
}: DefaultPDFProps) {
  if (!formData || !companyData) {
    return null;
  }
  console.log("in default pdf", companyData);

  try {
    return (
      <div className="max-w-2xl mx-auto my-10">
        <div className="w-full h-[600px]">
          <PDFViewer width="100%" height="100%">
            <InvoicePDF
              formData={formData}
              companyData={companyData}
              flages={flages}
            />
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
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 0,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    paddingBottom: 10,
  },
  leftHeader: {
    flex: 1,
    paddingLeft: 20,
    paddingTop: 20,
  },
  rightHeader: {
    flex: 1,
    alignItems: "flex-end",
    paddingRight: 20,
    paddingTop: 20,
  },
  companyName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  addressLine: {
    fontSize: 10,
    marginBottom: 2,
  },
  invoiceTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  invoiceDetails: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    paddingBottom: 10,
  },
  leftDetails: {
    flex: 1,
  },
  rightDetails: {
    marginTop: 8,
    flexDirection: "column",
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 1,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: "bold",
    width: "auto",
  },
  detailValue: {
    fontSize: 10,
  },
  customerSection: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    paddingBottom: 10,
    paddingTop: 10,
    paddingLeft: 20,
  },
  customerHeader: {
    width: 30,
  },
  customerLabel: {
    fontSize: 12,
    fontWeight: "bold",
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 5,
  },
  customerAddressLine: {
    fontSize: 10,
    marginBottom: 2,
  },
  table: {
    marginLeft: 20,
    marginRight: 20,
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    backgroundColor: "#f5f5f5",
  },
  tableColumnSmall: {
    width: "10%",
    padding: 5,
    borderRightWidth: 1,
    borderRightColor: "#000000",
  },
  tableColumnLarge: {
    width: "60%",
    padding: 5,
    borderRightWidth: 1,
    borderRightColor: "#000000",
  },
  tableColumnMedium: {
    width: "30%",
    padding: 5,
  },
  tableHeaderText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  tableCell: {
    fontSize: 10,
    padding: 5,
  },
  tableCellAmount: {
    fontSize: 10,
    padding: 5,
    textAlign: "right",
  },
  totalRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    marginTop: 5,
  },
  totalLabelContainer: {
    width: "70%",
    padding: 5,
    alignItems: "flex-end",
  },
  totalAmountContainer: {
    width: "30%",
    padding: 5,
  },
  totalLabel: {
    fontSize: 10,
    fontWeight: "bold",
  },
  totalAmount: {
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "right",
  },
  amountInWordsRow: {
    padding: 10,
  },
  amountInWords: {
    fontSize: 10,
    fontStyle: "italic",
  },
  bankDetails: {
    position: "absolute",
    bottom: "52%",

    left: 20,
  },
  bankDetailsText: {
    fontSize: 10,
    marginBottom: 2,
  },
  signatureSection: {
    position: "absolute",
    bottom: "52%",
    right: 50,
  },
  signatureContainer: {
    borderTopWidth: 1,
    borderTopColor: "#000000",
    width: 150,
    alignItems: "center",
    paddingTop: 5,
  },
  signatureName: {
    fontSize: 10,
    fontWeight: "bold",
  },
});
