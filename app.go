package main

import (
	"context"
	"encoding/base64"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// Invoice is the full type stored in the system.
type Invoice struct {
	InvoiceNo       string    `json:"invoiceNo"`
	CustomerName    string    `json:"customerName"`
	CustomerAddress string    `json:"customerAddress"`
	Items           []Item    `json:"items"`
	Total           float64   `json:"total"`
	CreatedAt       time.Time `json:"createdAt"`
	IsPaid          bool      `json:"isPaid"`
	CompanyName     string    `json:"companyName"`
	PaidAmount      float64   `json:"paidAmount"`      // New field: actual paid amount
	TDSAmount       float64   `json:"tdsAmount"`       // New field: TDS amount
	TransactionType string    `json:"transactionType"` // Transaction type (online/cheque)
}

// InvoiceData is a subset of Invoice for API returns.
type InvoiceData struct {
	InvoiceNo    string    `json:"invoiceNo"`
	CustomerName string    `json:"customerName"`
	Total        float64   `json:"total"`
	CreatedAt    time.Time `json:"createdAt"`
	IsPaid       bool      `json:"isPaid"`
	PaidAmount   float64   `json:"paidAmount"` // New field
	TDSAmount    float64   `json:"tdsAmount"`  // New field
}

// InvoiceInput is the type expected from the frontend.
type InvoiceInput struct {
	InvoiceNo       string  `json:"invoiceNo"`
	InvoiceDate     string  `json:"invoiceDate"`
	CustomerName    string  `json:"customerName"`
	CustomerAddress string  `json:"customerAddress"`
	Items           []Item  `json:"items"`
	Total           float64 `json:"total"`
	TransactionType string  `json:"transactionType"`
}

// Item represents an individual line item on an invoice.
type Item struct {
	Description string  `json:"description"`
	Amount      float64 `json:"amount"`
}

// CompanyInfo stores company-specific information.
type CompanyInfo struct {
	Name           string `json:"name"`
	CompanyName    string `json:"companyName"`
	CompanyAddress string `json:"companyAddress"`
	GstNo          string `json:"gstNo"`
	PanNo          string `json:"panNo"`
	BankName       string `json:"bankName"`
	AccountNo      string `json:"accountNo"`
	Ifsc           string `json:"ifsc"`
	Email          string `json:"email"`
	PDFSavePath    string `json:"pdfSavePath"` // New field for custom PDF save path
}

// App holds the application state.
type App struct {
	ctx          context.Context
	companies    map[string][]Invoice
	companyInfos map[string]CompanyInfo
}

// NewApp creates a new App instance.
func NewApp() *App {
	app := &App{
		companies:    make(map[string][]Invoice),
		companyInfos: make(map[string]CompanyInfo),
	}

	// List of companies (will be used with lower-case keys)
	companies := []string{"DHANCHHA", "RACHANA", "MITAL"}
	for _, company := range companies {
		app.loadCompanyData(company)
	}

	return app
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// getCompanyDataPath returns the file path for the given company and file type.
func getCompanyDataPath(company, fileType string) string {
	company = strings.ToLower(company)
	// This constructs paths like: data/dhanchha/dhanchha_invoices.json or data/dhanchha/dhanchha_info.json
	return filepath.Join("data", company, fmt.Sprintf("%s_%s.json", company, fileType))
}

// loadCompanyData loads invoices and company info from file.
func (a *App) loadCompanyData(company string) error {
	companyDir := filepath.Join("data", strings.ToLower(company))
	os.MkdirAll(companyDir, os.ModePerm)

	invoicesPath := getCompanyDataPath(company, "invoices")
	if data, err := os.ReadFile(invoicesPath); err == nil {
		var invoices []Invoice
		if err := json.Unmarshal(data, &invoices); err == nil {
			a.companies[strings.ToLower(company)] = invoices
		}
	}

	infoPath := getCompanyDataPath(company, "info")
	if data, err := os.ReadFile(infoPath); err == nil {
		var companyInfo CompanyInfo
		if err := json.Unmarshal(data, &companyInfo); err == nil {
			a.companyInfos[strings.ToLower(company)] = companyInfo
		}
	}

	return nil
}

// saveCompanyData writes the company data back to file.
func (a *App) saveCompanyData(company string) error {
	companyKey := strings.ToLower(company)
	if data, err := json.MarshalIndent(a.companies[companyKey], "", "  "); err == nil {
		os.WriteFile(getCompanyDataPath(company, "invoices"), data, 0644)
	}

	if data, err := json.MarshalIndent(a.companyInfos[companyKey], "", "  "); err == nil {
		os.WriteFile(getCompanyDataPath(company, "info"), data, 0644)
	}

	return nil
}

// IsInvoiceNumberUnique checks if an invoice number is unique for a company
func (a *App) IsInvoiceNumberUnique(company string, invoiceNo string) (bool, error) {
	company = strings.ToLower(company)
	invoices, ok := a.companies[company]
	if !ok {
		return true, nil // No invoices for this company yet
	}

	for _, inv := range invoices {
		if inv.InvoiceNo == invoiceNo {
			return false, nil
		}
	}
	return true, nil
}

// AddInvoice accepts InvoiceInput from the frontend, converts it to a full Invoice.
func (a *App) AddInvoice(company string, input InvoiceInput) error {
	company = strings.ToLower(company)

	// Check if invoice number already exists
	if input.InvoiceNo != "" {
		isUnique, err := a.IsInvoiceNumberUnique(company, input.InvoiceNo)
		if err != nil {
			return err
		}
		if !isUnique {
			return fmt.Errorf("invoice number %s already exists for company %s", input.InvoiceNo, company)
		}
	}

	invoice := Invoice{
		InvoiceNo:       input.InvoiceNo,
		CustomerName:    input.CustomerName,
		CustomerAddress: input.CustomerAddress,
		Items:           input.Items,
		Total:           input.Total,
		CreatedAt:       time.Now(),
		IsPaid:          false,
		CompanyName:     company,
		PaidAmount:      input.Total,
		TDSAmount:       0,
		TransactionType: input.TransactionType,
	}

	// Fiscal year logic (example)
	var fiscalYear string
	currentMonth := time.Now().Month()
	currentYear := time.Now().Year()
	if currentMonth >= 4 {
		fiscalYear = fmt.Sprintf("%d-%d", currentYear%100, (currentYear+1)%100)
	} else {
		fiscalYear = fmt.Sprintf("%d-%d", (currentYear-1)%100, currentYear%100)
	}

	// Generate invoice number if missing.
	if invoice.InvoiceNo == "" {
		lastInvoice := a.getLastInvoice(company)
		if lastInvoice == nil {
			invoice.InvoiceNo = fmt.Sprintf("%s/%s/001", string(company[0]), fiscalYear)
		} else {
			parts := strings.Split(lastInvoice.InvoiceNo, "/")
			if len(parts) == 3 {
				num, _ := strconv.Atoi(parts[2])
				invoice.InvoiceNo = fmt.Sprintf("%s/%s/%03d", string(company[0]), fiscalYear, num+1)
			}
		}
	}

	if _, exists := a.companies[company]; !exists {
		a.companies[company] = []Invoice{}
	}
	a.companies[company] = append(a.companies[company], invoice)
	return a.saveCompanyData(company)
}

// getLastInvoice returns the last invoice for the given company.
func (a *App) getLastInvoice(company string) *Invoice {
	invoices := a.companies[company]
	if len(invoices) == 0 {
		return nil
	}
	return &invoices[len(invoices)-1]
}

// GetInvoiceDetail returns the full invoice details for a given invoice number.
func (a *App) GetInvoiceDetail(company string, invoiceNo string) (*Invoice, error) {
	company = strings.ToLower(company)
	invoices, ok := a.companies[company]
	if !ok {
		return nil, fmt.Errorf("company data not found for: %s", company)
	}
	for _, inv := range invoices {
		if inv.InvoiceNo == invoiceNo {
			return &inv, nil
		}
	}
	return nil, fmt.Errorf("invoice not found: %s", invoiceNo)
}

// GetInvoices returns invoice data for the given company.
func (a *App) GetInvoices(company string) ([]InvoiceData, error) {
	company = strings.ToLower(company)
	invoices, ok := a.companies[company]
	if !ok {
		return nil, fmt.Errorf("company data not found for: %s", company)
	}

	result := make([]InvoiceData, len(invoices))
	for i, inv := range invoices {
		result[i] = InvoiceData{
			InvoiceNo:    inv.InvoiceNo,
			CustomerName: inv.CustomerName,
			Total:        inv.Total,
			CreatedAt:    inv.CreatedAt,
			IsPaid:       inv.IsPaid,
			PaidAmount:   inv.PaidAmount,
			TDSAmount:    inv.TDSAmount,
		}
	}

	return result, nil
}

// UpdateInvoiceAmounts updates the PaidAmount and TDSAmount for a specific invoice.
func (a *App) UpdateInvoiceAmounts(company string, invoiceNo string, paidAmount float64, _ float64) error {
	company = strings.ToLower(company)
	invoices, ok := a.companies[company]
	if !ok {
		return fmt.Errorf("company data not found for: %s", company)
	}

	for i, inv := range invoices {
		if inv.InvoiceNo == invoiceNo {
			a.companies[company][i].PaidAmount = paidAmount
			// Compute TDS automatically: TDS = Total - PaidAmount
			a.companies[company][i].TDSAmount = inv.Total - paidAmount
			return a.saveCompanyData(company)
		}
	}

	return fmt.Errorf("invoice not found: %s", invoiceNo)
}

// ExportCSV exports invoice data to a CSV file for the given company.
func (a *App) ExportCSV(company string) (string, error) {
	company = strings.ToLower(company)
	filePath := filepath.Join("data", company, "invoices_export.csv")
	file, err := os.Create(filePath)
	if err != nil {
		return "", err
	}
	defer file.Close()

	writer := csv.NewWriter(file)
	defer writer.Flush()

	header := []string{"Invoice No", "Customer Name", "Customer Address", "Total", "Paid Amount", "TDS Amount", "Created At", "Is Paid"}
	if err := writer.Write(header); err != nil {
		return "", err
	}

	for _, inv := range a.companies[company] {
		row := []string{
			inv.InvoiceNo,
			inv.CustomerName,
			inv.CustomerAddress,
			fmt.Sprintf("%.2f", inv.Total),
			fmt.Sprintf("%.2f", inv.PaidAmount),
			fmt.Sprintf("%.2f", inv.TDSAmount),
			inv.CreatedAt.Format(time.RFC3339),
			strconv.FormatBool(inv.IsPaid),
		}
		if err := writer.Write(row); err != nil {
			return "", err
		}
	}

	return filePath, nil
}

// SaveInvoicePDF saves a PDF for the invoice after decoding its base64 representation.
func (a *App) SaveInvoicePDF(company string, invoiceNo string, pdfBase64 string) error {
	company = strings.ToLower(company)
	var pdfDir string

	// Check if a custom PDF save path is set in the company info.
	if info, ok := a.companyInfos[company]; ok && info.PDFSavePath != "" {
		pdfDir = info.PDFSavePath

		// Check if the directory exists, create it if it doesn't
		_, err := os.Stat(pdfDir)
		if os.IsNotExist(err) {
			// Try to create the directory
			if err := os.MkdirAll(pdfDir, os.ModePerm); err != nil {
				// If we can't create the directory, fall back to the default path
				pdfDir = filepath.Join("data", company, "pdf")
				if err := os.MkdirAll(pdfDir, os.ModePerm); err != nil {
					return err
				}
			}
		}
	} else {
		pdfDir = filepath.Join("data", company, "pdf")
		if err := os.MkdirAll(pdfDir, os.ModePerm); err != nil {
			return err
		}
	}

	// Sanitize the invoice number to make it safe for use as a filename
	// Replace slashes with hyphens
	safeInvoiceNo := strings.ReplaceAll(invoiceNo, "/", "-")

	pdfData, err := decodeBase64(pdfBase64)
	if err != nil {
		return err
	}

	pdfPath := filepath.Join(pdfDir, fmt.Sprintf("%s.pdf", safeInvoiceNo))
	return os.WriteFile(pdfPath, pdfData, 0644)
}

// decodeBase64 decodes a base64 encoded string.
func decodeBase64(data string) ([]byte, error) {
	return base64.StdEncoding.DecodeString(data)
}

// ToggleInvoicePayment toggles the isPaid field for a specific invoice.
func (a *App) ToggleInvoicePayment(company string, invoiceNo string) error {
	company = strings.ToLower(company)
	invoices, ok := a.companies[company]
	if !ok {
		return fmt.Errorf("company data not found for: %s", company)
	}

	for i, inv := range invoices {
		if inv.InvoiceNo == invoiceNo {
			a.companies[company][i].IsPaid = !inv.IsPaid
			return a.saveCompanyData(company)
		}
	}

	return fmt.Errorf("invoice not found: %s", invoiceNo)
}

// GeneratePDF is a stub that simulates PDF generation by saving a base64 string.
// In a real implementation, you would generate a PDF dynamically.
func (a *App) GeneratePDF(company string, invoiceNo string) (string, error) {
	// For demo purposes, let's assume we receive a base64 PDF string from somewhere.
	dummyPDFBase64 := "JVBERi0xLjQKJcTl8uXr..."
	if err := a.SaveInvoicePDF(company, invoiceNo, dummyPDFBase64); err != nil {
		return "", err
	}
	pdfPath := filepath.Join("data", strings.ToLower(company), "pdf", fmt.Sprintf("%s.pdf", invoiceNo))
	return pdfPath, nil
}

// SetCompanyPDFSavePath updates the PDF save path for a company.
func (a *App) SetCompanyPDFSavePath(company string, initialPath string) (string, error) {
	// Open a directory dialog for the user to select a folder.
	selectedPath, err := runtime.OpenDirectoryDialog(a.ctx, runtime.OpenDialogOptions{
		Title:            "Select PDF Save Path",
		DefaultDirectory: initialPath, // This can be empty or a previously set path.
	})
	if err != nil {
		return "", err
	}

	// Update the company info with the selected path.
	company = strings.ToLower(company)
	info, ok := a.companyInfos[company]
	if !ok {
		info = CompanyInfo{
			CompanyName: company,
			PDFSavePath: selectedPath,
		}
	} else {
		info.PDFSavePath = selectedPath
	}
	a.companyInfos[company] = info
	if err := a.saveCompanyData(company); err != nil {
		return "", err
	}
	return selectedPath, nil
}

// GetCompanyPDFSavePath returns the current PDF save path for a company.
func (a *App) GetCompanyPDFSavePath(company string) (string, error) {
	company = strings.ToLower(company)
	if info, ok := a.companyInfos[company]; ok {
		return info.PDFSavePath, nil
	}
	return "", fmt.Errorf("company info not found for: %s", company)
}

// GeneratePDFFromInvoice generates a PDF for an existing invoice
func (a *App) GeneratePDFFromInvoice(company string, invoiceNo string, pdfBase64 string) error {
	return a.SaveInvoicePDF(company, invoiceNo, pdfBase64)
}

// UpdateInvoice updates an existing invoice with new data
func (a *App) UpdateInvoice(company string, invoiceNo string, input InvoiceInput) error {
	company = strings.ToLower(company)
	invoices, ok := a.companies[company]
	if !ok {
		return fmt.Errorf("company data not found for: %s", company)
	}

	// Verify the invoice exists
	var existingInvoiceIndex = -1
	for i, inv := range invoices {
		if inv.InvoiceNo == invoiceNo {
			existingInvoiceIndex = i
			break
		}
	}

	if existingInvoiceIndex == -1 {
		return fmt.Errorf("invoice not found: %s", invoiceNo)
	}

	// Update the invoice with new data
	a.companies[company][existingInvoiceIndex].CustomerName = input.CustomerName
	a.companies[company][existingInvoiceIndex].CustomerAddress = input.CustomerAddress
	a.companies[company][existingInvoiceIndex].Items = input.Items
	a.companies[company][existingInvoiceIndex].Total = input.Total

	return a.saveCompanyData(company)
}
