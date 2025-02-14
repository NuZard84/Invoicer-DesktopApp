import React, { useState, useEffect } from "react";

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

  // Handle file upload
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

  // Handle form submission (save to localStorage)
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    localStorage.setItem("userTemplateData", JSON.stringify(formData));
    localStorage.setItem("isTemplateFilled", "true");
    setIsTemplateFilled(true);
    alert("Template information saved successfully!");
  };

  // Handle reset (clear localStorage & reset state)
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

      {isTemplateFilled ? (
        // ✅ **Preview Mode - Display User's Saved Information**
        <div className="mt-4 p-4 ml-4 flex flex-col gap-6 w-[70%] dark:bg-lp-dark bg-white border dark:border-0 rounded-lg">
          <h2 className="text-2xl text-dp">Your Information</h2>

          {/* Display Logo if available */}
          {formData.companyLogo && (
            <img
              src={formData.companyLogo}
              alt="Company Logo"
              className=" object-contain rounded-md"
            />
          )}

          <p className="text-lg">
            <strong>Name: </strong>
            <span className="w-[50%">{formData.name}</span>
          </p>
          <p className="text-lg">
            <strong>Company Name: </strong>
            <span className="w-[50%">{formData.companyName}</span>
          </p>
          <p className="text-lg">
            <strong>Company Address: </strong>{" "}
            <span className="w-[50%">{formData.companyAddress}</span>
          </p>
          <p className="text-lg">
            <strong>GST No: </strong>{" "}
            <span className="w-[50%">{formData.gstNo}</span>
          </p>

          <button
            onClick={handleReset}
            className="bg-red-600 self-start px-3 py-2 rounded-lg text-white hover:bg-red-500  mt-2"
          >
            Reset Information
          </button>
        </div>
      ) : (
        // ✅ **Form Mode - Ask User to Fill Out Information**
        <form
          onSubmit={handleSubmit}
          className="mt-4 p-4 flex ml-4 flex-col gap-6 w-[75%] dark:bg-lp-dark bg-white border dark:border-0 rounded-lg"
        >
          <h2 className="text-2xl text-dp">Set Up Your Information</h2>

          {/* Name Input */}
          <div className="gap-2 flex flex-col">
            <label htmlFor="name" className="font-medium">
              Your Name:
            </label>
            <input
              id="name"
              className="dark:bg-slate-600 bg-white rounded-md w-[65%] pl-2 py-1 border dark:border-0"
              type="text"
              placeholder="Enter your name"
              value={formData.name}
              required
              onChange={handleInputChange}
            />
          </div>

          {/* Company Name Input */}
          <div className="gap-2 flex flex-col">
            <label htmlFor="companyName" className="font-medium">
              Your Company Name:
            </label>
            <input
              id="companyName"
              className="dark:bg-slate-600 bg-white rounded-md pl-2 w-[65%] py-1 border dark:border-0"
              type="text"
              placeholder="Enter your company name"
              required
              value={formData.companyName}
              onChange={handleInputChange}
            />
          </div>

          {/* Company Address Input */}
          <div className="gap-2 flex flex-col">
            <label htmlFor="companyAddress" className="font-medium">
              Company Address:
            </label>
            <textarea
              id="companyAddress"
              className="dark:bg-slate-600 bg-white rounded-md w-[65%] pl-2 py-1 border dark:border-0"
              type="text"
              placeholder="Enter company address"
              required
              value={formData.companyAddress}
              onChange={handleInputChange}
            />
          </div>

          {/* GST Number Input */}
          <div className="gap-2 flex flex-col">
            <label htmlFor="gstNo" className="font-medium">
              GST No:
            </label>
            <input
              id="gstNo"
              className="dark:bg-slate-600 bg-white rounded-md w-[65%] pl-2 py-1 border dark:border-0"
              type="number"
              placeholder="Enter GST No."
              required
              value={formData.gstNo}
              onChange={handleInputChange}
            />
          </div>

          {/* Company Logo Upload */}
          <div className="gap-2 flex flex-col">
            <label htmlFor="company-logo" className="font-medium">
              Upload Your Company Logo:
            </label>

            {/* Hidden File Input */}
            <input
              id="company-logo"
              type="file"
              accept="image/*"
              required
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Custom Upload Button */}
            <label
              htmlFor="company-logo"
              className="cursor-pointer bg-dp  text-white px-4 py-1 rounded-md w-fit hover:bg-mp dark:bg-mp-dark hover:dark:bg-mp  transition"
            >
              Choose File
            </label>

            {/* Display Selected File Name */}
            {fileName && (
              <p className="dark:text-lp mt-1 text-sm">Selected: {fileName}</p>
            )}
          </div>

          <button
            type="submit"
            className="dark:bg-mp-dark self-start bg-dp px-3 py-2 rounded-lg text-white hover:dark:bg-mp hover:bg-mp"
          >
            Save Information
          </button>
        </form>
      )}
    </div>
  );
};

export default Dashboard;
