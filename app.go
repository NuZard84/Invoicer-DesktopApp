package main

import (
	"context"
	"encoding/base64"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"runtime"
	"strconv"
	"strings"
	"time"

	wailsRuntime "github.com/wailsapp/wails/v2/pkg/runtime"
)

// Invoice is the full type stored in the system.
type Invoice struct {
	InvoiceNo       string    `json:"invoiceNo"`
	CustomerName    string    `json:"customerName"`
	CustomerAddress string    `json:"customerAddress"`
	Items           []Item    `json:"items"`
	Total           float64   `json:"total"`
	CreatedAt       time.Time `json:"createdAt"`
	InvoiceDate     time.Time `json:"invoiceDate"`
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
	InvoiceDate  time.Time `json:"invoiceDate"`
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
	baseDataDir  string // Base data directory that will be platform-specific
}

// NewApp creates a new App instance.
func NewApp() *App {
	app := &App{
		companies:    make(map[string][]Invoice),
		companyInfos: make(map[string]CompanyInfo),
	}

	// Initialize base data directory
	app.initBaseDataDir()

	// List of companies (will be used with lower-case keys)
	companies := []string{"DHANCHHA", "RACHANA", "MITAL"}
	for _, company := range companies {
		app.loadCompanyData(company)
	}

	return app
}

// initBaseDataDir sets up the base data directory based on the operating system
func (a *App) initBaseDataDir() {
	// Determine if running on macOS, Windows, or Linux
	if runtime.GOOS == "darwin" {
		// For macOS, find the application bundle directory
		// Get the path to the current executable
		execPath, err := os.Executable()
		if err == nil {
			// Navigate up to the app bundle's Contents directory
			// Typical structure: YourApp.app/Contents/MacOS/executable
			bundlePath := filepath.Dir(filepath.Dir(filepath.Dir(execPath)))
			// Create a data directory inside the app bundle
			a.baseDataDir = filepath.Join(bundlePath, "Contents", "Resources", "data")
		} else {
			// Fallback if we can't get the executable path
			a.baseDataDir = "data"
		}
	} else {
		// For Windows and other platforms, continue using the existing "data" directory
		a.baseDataDir = "data"
	}

	// Ensure the base directory exists
	err := os.MkdirAll(a.baseDataDir, os.ModePerm)
	if err != nil {
		// Log the error or handle it appropriately
		fmt.Printf("Error creating data directory: %v\n", err)
		// Fallback to current directory if we can't create the intended directory
		a.baseDataDir = "data"
		os.MkdirAll(a.baseDataDir, os.ModePerm)
	}

	fmt.Printf("Using data directory: %s\n", a.baseDataDir)
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// getCompanyDataPath returns the file path for the given company and file type.
func (a *App) getCompanyDataPath(company, fileType string) string {
	company = strings.ToLower(company)
	// This constructs paths like: baseDataDir/dhanchha/dhanchha_invoices.json
	return filepath.Join(a.baseDataDir, company, fmt.Sprintf("%s_%s.json", company, fileType))
}

// ensureCompanyDirExists ensures that the company directory exists
func (a *App) ensureCompanyDirExists(company string) error {
	companyDir := filepath.Join(a.baseDataDir, strings.ToLower(company))
	return os.MkdirAll(companyDir, os.ModePerm)
}

// loadCompanyData loads invoices and company info from file.
func (a *App) loadCompanyData(company string) error {
	company = strings.ToLower(company)

	// Ensure company directory exists
	if err := a.ensureCompanyDirExists(company); err != nil {
		return err
	}

	invoicesPath := a.getCompanyDataPath(company, "invoices")
	if data, err := os.ReadFile(invoicesPath); err == nil {
		var invoices []Invoice
		if err := json.Unmarshal(data, &invoices); err == nil {
			a.companies[company] = invoices
		}
	}

	infoPath := a.getCompanyDataPath(company, "info")
	if data, err := os.ReadFile(infoPath); err == nil {
		var companyInfo CompanyInfo
		if err := json.Unmarshal(data, &companyInfo); err == nil {
			a.companyInfos[company] = companyInfo
		}
	}

	return nil
}

// saveCompanyData writes the company data back to file.
func (a *App) saveCompanyData(company string) error {
	companyKey := strings.ToLower(company)

	// Ensure company directory exists
	if err := a.ensureCompanyDirExists(companyKey); err != nil {
		return err
	}

	if data, err := json.MarshalIndent(a.companies[companyKey], "", "  "); err == nil {
		if err := os.WriteFile(a.getCompanyDataPath(companyKey, "invoices"), data, 0644); err != nil {
			return err
		}
	}

	if data, err := json.MarshalIndent(a.companyInfos[companyKey], "", "  "); err == nil {
		if err := os.WriteFile(a.getCompanyDataPath(companyKey, "info"), data, 0644); err != nil {
			return err
		}
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

	// Parse invoice date from string
	invoiceDate, err := time.Parse("2006-01-02", input.InvoiceDate)
	if err != nil {
		// If there's an error parsing the date, use today's date
		invoiceDate = time.Now()
	}

	invoice := Invoice{
		InvoiceNo:       input.InvoiceNo,
		CustomerName:    input.CustomerName,
		CustomerAddress: input.CustomerAddress,
		Items:           input.Items,
		Total:           input.Total,
		CreatedAt:       time.Now(),
		InvoiceDate:     invoiceDate,
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
			InvoiceDate:  inv.InvoiceDate,
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

	// Ensure company directory exists
	if err := a.ensureCompanyDirExists(company); err != nil {
		return "", err
	}

	filePath := filepath.Join(a.baseDataDir, company, "invoices_export.csv")
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
				pdfDir = filepath.Join(a.baseDataDir, company, "pdf")
				if err := os.MkdirAll(pdfDir, os.ModePerm); err != nil {
					return err
				}
			}
		}
	} else {
		pdfDir = filepath.Join(a.baseDataDir, company, "pdf")
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

	company = strings.ToLower(company)
	// Sanitize the invoice number for the filename
	safeInvoiceNo := strings.ReplaceAll(invoiceNo, "/", "-")

	// Get the PDF directory
	var pdfDir string
	if info, ok := a.companyInfos[company]; ok && info.PDFSavePath != "" && info.PDFSavePath != "" {
		pdfDir = info.PDFSavePath
	} else {
		pdfDir = filepath.Join(a.baseDataDir, company, "pdf")
	}

	pdfPath := filepath.Join(pdfDir, fmt.Sprintf("%s.pdf", safeInvoiceNo))
	return pdfPath, nil
}

// SetCompanyPDFSavePath updates the PDF save path for a company.
func (a *App) SetCompanyPDFSavePath(company string, initialPath string) (string, error) {
	// If initialPath is empty, try to use a sensible default
	if initialPath == "" {
		if runtime.GOOS == "darwin" {
			homeDir, err := os.UserHomeDir()
			if err == nil {
				initialPath = filepath.Join(homeDir, "Documents")
			}
		}
	}

	// Open a directory dialog for the user to select a folder.
	selectedPath, err := wailsRuntime.OpenDirectoryDialog(a.ctx, wailsRuntime.OpenDialogOptions{
		Title:            "Select PDF Save Path",
		DefaultDirectory: initialPath,
	})

	// If the user cancels, don't update anything
	if err != nil || selectedPath == "" {
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
func (a *App) UpdateInvoice(company string, originalInvoiceNo string, input InvoiceInput) error {
	company = strings.ToLower(company)
	invoices, ok := a.companies[company]
	if !ok {
		return fmt.Errorf("company data not found for: %s", company)
	}

	// Check if invoice number has been changed
	if originalInvoiceNo != input.InvoiceNo {
		// Verify the new invoice number doesn't already exist
		isUnique, err := a.IsInvoiceNumberUnique(company, input.InvoiceNo)
		if err != nil {
			return err
		}
		if !isUnique {
			return fmt.Errorf("invoice number %s already exists for company %s", input.InvoiceNo, company)
		}
	}

	// Verify the original invoice exists
	var existingInvoiceIndex = -1
	for i, inv := range invoices {
		if inv.InvoiceNo == originalInvoiceNo {
			existingInvoiceIndex = i
			break
		}
	}

	if existingInvoiceIndex == -1 {
		return fmt.Errorf("invoice not found: %s", originalInvoiceNo)
	}

	// Update the invoice with new data including invoice number
	a.companies[company][existingInvoiceIndex].InvoiceNo = input.InvoiceNo
	a.companies[company][existingInvoiceIndex].CustomerName = input.CustomerName
	a.companies[company][existingInvoiceIndex].CustomerAddress = input.CustomerAddress
	a.companies[company][existingInvoiceIndex].Items = input.Items
	a.companies[company][existingInvoiceIndex].Total = input.Total

	// Parse invoice date from string
	invoiceDate, err := time.Parse("2006-01-02", input.InvoiceDate)
	if err != nil {
		// If there's an error parsing the date, don't update the invoice date
	} else {
		a.companies[company][existingInvoiceIndex].InvoiceDate = invoiceDate
	}

	return a.saveCompanyData(company)
}
