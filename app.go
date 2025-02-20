package main

import (
	"context"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"strconv"
	"time"

	"github.com/go-pdf/fpdf"
)

// Invoice represents a single invoice with a generated invoice number and serial number.
type Invoice struct {
	InvoiceNumber   int       `json:"invoiceNumber"`
	SerialNumber    int       `json:"serialNumber"`
	CustomerName    string    `json:"customerName"`
	CustomerAddress string    `json:"customerAddress"`
	Items           []Item    `json:"items"`
	Total           float64   `json:"total"`
	CreatedAt       time.Time `json:"createdAt"`
}

// Item represents an individual line item on an invoice.
type Item struct {
	Description string  `json:"description"`
	Amount      float64 `json:"amount"`
}

// App is our Wails application backend.
type App struct {
	invoices        []Invoice
	ctx             context.Context
	pdfTemplatePath string // default or custom PDF template path
}

// NewApp creates a new App application with default values.
func NewApp() *App {
	app := &App{
		invoices:        []Invoice{},
		pdfTemplatePath: "templates/default.pdf", // default template file
	}
	// Try to load previously stored invoices
	if err := app.loadInvoices(); err != nil {
		fmt.Println("Error loading invoices:", err)
	}
	return app
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// loadInvoices loads invoice history from a JSON file.
func (a *App) loadInvoices() error {
	// Ensure the data folder exists
	os.MkdirAll("data", os.ModePerm)
	dataPath := "data/invoices.json"
	if _, err := os.Stat(dataPath); os.IsNotExist(err) {
		// File doesn't exist – start with an empty list.
		a.invoices = []Invoice{}
		return nil
	}
	bytes, err := ioutil.ReadFile(dataPath)
	if err != nil {
		return err
	}
	return json.Unmarshal(bytes, &a.invoices)
}

// saveInvoices writes the current invoice history to a JSON file.
func (a *App) saveInvoices() error {
	data, err := json.MarshalIndent(a.invoices, "", "  ")
	if err != nil {
		return err
	}
	os.MkdirAll("data", os.ModePerm)
	return ioutil.WriteFile("data/invoices.json", data, 0644)
}

// AddInvoice receives invoice data (from your React frontend), generates invoice and serial numbers,
// stamps the creation time, appends the invoice to the history, and saves it locally.
func (a *App) AddInvoice(invoice Invoice) error {
	invoice.InvoiceNumber = len(a.invoices) + 1
	// For example, using an offset for serial numbers
	invoice.SerialNumber = len(a.invoices) + 1000
	invoice.CreatedAt = time.Now()
	a.invoices = append(a.invoices, invoice)
	return a.saveInvoices()
}

// GetInvoices returns the stored invoice history.
func (a *App) GetInvoices() []Invoice {
	return a.invoices
}

// GeneratePDF creates a PDF file for a given invoice number.
// It uses a simple layout with fpdf; if you later decide to use a template,
// you can enhance this function to parse the template file and overlay invoice data.
func (a *App) GeneratePDF(invoiceNumber int) (string, error) {
	// Find the invoice by its number.
	var inv *Invoice
	for i, v := range a.invoices {
		if v.InvoiceNumber == invoiceNumber {
			inv = &a.invoices[i]
			break
		}
	}
	if inv == nil {
		return "", fmt.Errorf("invoice not found")
	}

	// Create a new PDF document.
	pdf := fpdf.New("P", "mm", "A4", "")
	pdf.AddPage()
	pdf.SetFont("Arial", "B", 16)
	// Header
	pdf.Cell(40, 10, fmt.Sprintf("Invoice #%d", inv.InvoiceNumber))
	pdf.Ln(12)

	// Customer info
	pdf.SetFont("Arial", "", 12)
	pdf.Cell(40, 10, fmt.Sprintf("Customer: %s", inv.CustomerName))
	pdf.Ln(8)
	pdf.Cell(40, 10, fmt.Sprintf("Address: %s", inv.CustomerAddress))
	pdf.Ln(8)
	pdf.Cell(40, 10, fmt.Sprintf("Date: %s", inv.CreatedAt.Format("2006-01-02 15:04")))
	pdf.Ln(12)

	// Table header
	pdf.Cell(100, 10, "Description")
	pdf.Cell(40, 10, "Amount")
	pdf.Ln(10)
	// Table rows
	for _, item := range inv.Items {
		pdf.Cell(100, 10, item.Description)
		pdf.Cell(40, 10, fmt.Sprintf("%.2f", item.Amount))
		pdf.Ln(8)
	}
	pdf.Ln(10)
	pdf.Cell(100, 10, "Total")
	pdf.Cell(40, 10, fmt.Sprintf("%.2f", inv.Total))

	// Save the PDF to the data folder.
	os.MkdirAll("data", os.ModePerm)
	outputPath := fmt.Sprintf("data/invoice_%d.pdf", inv.InvoiceNumber)
	err := pdf.OutputFileAndClose(outputPath)
	if err != nil {
		return "", err
	}
	return outputPath, nil
}

// ExportCSV writes all invoices to a CSV file and returns its path.
func (a *App) ExportCSV() (string, error) {
	filePath := "data/invoices_export.csv"
	file, err := os.Create(filePath)
	if err != nil {
		return "", err
	}
	defer file.Close()

	writer := csv.NewWriter(file)
	defer writer.Flush()

	// Write header row.
	header := []string{"InvoiceNumber", "SerialNumber", "CustomerName", "CustomerAddress", "Total", "CreatedAt"}
	if err := writer.Write(header); err != nil {
		return "", err
	}
	// Write each invoice as a CSV row.
	for _, inv := range a.invoices {
		row := []string{
			strconv.Itoa(inv.InvoiceNumber),
			strconv.Itoa(inv.SerialNumber),
			inv.CustomerName,
			inv.CustomerAddress,
			fmt.Sprintf("%.2f", inv.Total),
			inv.CreatedAt.Format(time.RFC3339),
		}
		if err := writer.Write(row); err != nil {
			return "", err
		}
	}
	return filePath, nil
}

// ImportTemplate sets a new PDF template path.
// (In a real-world scenario, you might copy the file to a specific folder or parse it for placeholders.)
func (a *App) ImportTemplate(path string) error {
	a.pdfTemplatePath = path
	return nil
}
