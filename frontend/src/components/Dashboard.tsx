import React, { useState, useEffect, useRef } from "react";
import { ImportTemplate } from "../../wailsjs/go/main/App";

const Dashboard: React.FC = () => {
  // State for form data
  const [formData, setFormData] = useState({
    name: "",
    companyName: "",
    companyAddress: "",
    gstNo: "",
    companyLogo: null as string | null, // Store image as base64 string
  });
  const [fileName, setFileName] = useState<string | null>(null);
  const [isTemplateFilled, setIsTemplateFilled] = useState<boolean>(false);

  // Reference for the hidden file input (for custom template)
  const templateInputRef = useRef<HTMLInputElement>(null);

  // Load data from localStorage on component mount
  useEffect(() => {
    const storedData = localStorage.getItem("userTemplateData");
    const templateFilled = localStorage.getItem("isTemplateFilled");
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setFormData(parsedData);
      setFileName(parsedData.companyLogo ? "Logo Selected" : null);
    }
    if (templateFilled === "true") {
      setIsTemplateFilled(true);
    }
  }, []);

  // Handle input change
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  // Handle file upload for company logo
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setFileName(file.name);
      // Convert image to base64 for localStorage
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setFormData((prevData) => ({
          ...prevData,
          companyLogo: reader.result as string,
        }));
      };
    }
  };

  // Save company details to localStorage
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    localStorage.setItem("userTemplateData", JSON.stringify(formData));
    localStorage.setItem("isTemplateFilled", "true");
    setIsTemplateFilled(true);
    alert("Template information saved successfully!");
  };

  // Reset company details
  const handleReset = () => {
    localStorage.removeItem("userTemplateData");
    localStorage.setItem("isTemplateFilled", "false");
    setIsTemplateFilled(false);
    setFileName(null);
    setFormData({
      name: "",
      companyName: "",
      companyAddress: "",
      gstNo: "",
      companyLogo: null,
    });
  };

  // When a custom template file is chosen, get its path and call the backend ImportTemplate function.
  const handleTemplateFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      // In a Wails desktop environment, file objects include a "path" property.
      const filePath = (file as any).path;
      ImportTemplate(filePath)
        .then(() => alert("Template imported successfully!"))
        .catch((err: any) => {
          console.error("Error importing template:", err);
          alert("Failed to import template.");
        });
    }
  };

  // Trigger click on the hidden template file input
  const triggerTemplateInput = () => {
    templateInputRef.current?.click();
  };

  return (
    <div className="flex flex-col">
      <div className="py-10 px-4 flex flex-col gap-6">
        <h1 className="text-3xl">
          Welcome {isTemplateFilled ? "Back to" : "to"}{" "}
          <span className="text-dp">Invoicer</span>
        </h1>
        <p className="text-lg">
          This software helps you create invoices for your business and track
          all your billings to manage payments efficiently.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
