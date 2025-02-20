import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const Template: React.FC = () => {
  const { company } = useParams();

  const [formData, setFormData] = useState({
    name: "",
    companyName: "",
    companyTitle: "",
    companyAddress: "",
    gstNo: "",
    companyLogo: null as string | null,
    transactionType: "",
    panNo: "",
    bankName: "",
    accountNo: "",
    ifsc: "",
    email: "",
    isTemplateFilled: false,
  });
  const [fileName, setFileName] = useState<string | null>(null);
  const [isTemplateFilled, setIsTemplateFilled] = useState(false);

  // Load any existing company data from localStorage
  useEffect(() => {
    if (!company) return;
    const stored = localStorage.getItem("userTemplateData");
    const parsed = stored ? JSON.parse(stored) : [];

    const foundIndex = parsed.findIndex((item: any) => item[company]);
    if (foundIndex !== -1) {
      const data = parsed[foundIndex][company];
      setFormData(data);
      setIsTemplateFilled(!!data.isTemplateFilled);
      if (data.companyLogo) setFileName("Logo Selected");
    }
  }, [company]);

  // Handle text input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  // Handle logo file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setFileName(file.name);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        companyName: company as string,
        companyLogo: reader.result as string,
      }));
    };
  };

  // Save info to localStorage
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;

    const stored = localStorage.getItem("userTemplateData");
    const parsed = stored ? JSON.parse(stored) : [];

    const updatedData = {
      ...formData,
      isTemplateFilled: true,
      companyName: company,
    };

    const foundIndex = parsed.findIndex(
      (item: any) => item.companyName === company
    );
    if (foundIndex !== -1) {
      parsed[foundIndex] = updatedData;
    } else {
      parsed.push(updatedData);
    }

    localStorage.setItem("userTemplateData", JSON.stringify(parsed));
    setIsTemplateFilled(true);
    alert("Template information saved successfully!");
  };

  // Reset info in localStorage
  const handleReset = () => {
    if (!company) return;
    const stored = localStorage.getItem("userTemplateData");
    const parsed = stored ? JSON.parse(stored) : [];
    const foundIndex = parsed.findIndex((item: any) => item[company]);

    const resetData = {
      name: "",
      companyName: "",
      companyTitle: "",
      companyAddress: "",
      gstNo: "",
      companyLogo: null,
      transactionType: "",
      panNo: "",
      bankName: "",
      accountNo: "",
      ifsc: "",
      email: "",
      isTemplateFilled: false,
    };

    if (foundIndex !== -1) {
      parsed[foundIndex][company] = resetData;
    } else {
      parsed.push({ [company]: resetData });
    }

    localStorage.setItem("userTemplateData", JSON.stringify(parsed));
    setFormData(resetData);
    setFileName(null);
    setIsTemplateFilled(false);
  };

  return (
    <div className="flex flex-col">
      <div className="py-10 px-4 flex flex-col gap-6">
        <h1 className="text-3xl">
          Welcome {isTemplateFilled ? "Back to" : "to"}{" "}
          <span className="text-dp">Invoicer</span> -{" "}
          <span className="uppercase">{company}</span>
        </h1>
        <p className="text-lg">
          This software helps create invoices and track billings for{" "}
          <strong>{company}</strong>.
        </p>
      </div>

      {isTemplateFilled ? (
        <div className="mt-4 p-4 ml-4 flex flex-col gap-6 w-[70%] dark:bg-lp-dark bg-white border dark:border-0 rounded-lg">
          <h2 className="text-2xl text-dp">Your Information</h2>
          {formData.companyLogo && (
            <img
              src={formData.companyLogo}
              alt="Company Logo"
              className="object-contain rounded-md"
            />
          )}
          <p className="text-lg">
            <strong>Name: </strong>
            {formData.name}
          </p>
          <p className="text-lg">
            <strong>Company Name: </strong>
            {formData.companyTitle}
          </p>
          <p className="text-lg">
            <strong>Company Address: </strong>
            {formData.companyAddress}
          </p>
          <p className="text-lg">
            <strong>GST No: </strong>
            {formData.gstNo}
          </p>
          <p className="text-lg">
            <strong>Transaction Type: </strong>
            {formData.transactionType}
          </p>
          <p className="text-lg">
            <strong>PAN No: </strong>
            {formData.panNo}
          </p>
          <p className="text-lg">
            <strong>Bank Name: </strong>
            {formData.bankName}
          </p>
          <p className="text-lg">
            <strong>Account No: </strong>
            {formData.accountNo}
          </p>
          <p className="text-lg">
            <strong>IFSC: </strong>
            {formData.ifsc}
          </p>
          <p className="text-lg">
            <strong>Email: </strong>
            {formData.email}
          </p>

          <div className="flex gap-4">
            <button
              onClick={handleReset}
              className="bg-red-600 self-start px-3 py-2 rounded-lg text-white hover:bg-red-500 mt-2"
            >
              Reset Information
            </button>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="mt-4 p-4 flex ml-4 flex-col gap-6 w-[75%] dark:bg-lp-dark bg-white border dark:border-0 rounded-lg"
        >
          <h2 className="text-2xl text-dp">Set Up Your Information</h2>
          <div className="gap-2 flex flex-col">
            <label htmlFor="name" className="font-medium">
              Your Name:
            </label>
            <input
              id="name"
              type="text"
              placeholder="Enter your name"
              value={formData.name}
              required
              onChange={handleInputChange}
              className="dark:bg-slate-600 bg-white rounded-md w-[65%] pl-2 py-1 border dark:border-0"
            />
          </div>
          <div className="gap-2 flex flex-col">
            <label htmlFor="companyTitle" className="font-medium">
              Your Company Name:
            </label>
            <input
              id="companyTitle"
              type="text"
              placeholder="Enter your company name"
              required
              value={formData.companyTitle}
              onChange={handleInputChange}
              className="dark:bg-slate-600 bg-white rounded-md pl-2 w-[65%] py-1 border dark:border-0"
            />
          </div>
          <div className="gap-2 flex flex-col">
            <label htmlFor="companyAddress" className="font-medium">
              Company Address:
            </label>
            <textarea
              id="companyAddress"
              placeholder="Enter company address"
              required
              value={formData.companyAddress}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  companyAddress: e.target.value,
                }))
              }
              className="dark:bg-slate-600 bg-white rounded-md w-[65%] pl-2 py-1 border dark:border-0 min-h-[100px] resize-none"
            />
          </div>
          <div className="gap-2 flex flex-col">
            <label htmlFor="gstNo" className="font-medium">
              GST No:
            </label>
            <input
              id="gstNo"
              type="number"
              placeholder="Enter GST No."
              required
              value={formData.gstNo}
              onChange={handleInputChange}
              className="dark:bg-slate-600 bg-white rounded-md w-[65%] pl-2 py-1 border dark:border-0"
            />
          </div>
          <div className="gap-2 flex flex-col">
            <label htmlFor="transactionType" className="font-medium">
              Transaction Type:
            </label>
            <input
              id="transactionType"
              type="text"
              placeholder="Enter transaction type"
              required
              value={formData.transactionType}
              onChange={handleInputChange}
              className="dark:bg-slate-600 bg-white rounded-md w-[65%] pl-2 py-1 border dark:border-0"
            />
          </div>
          <div className="gap-2 flex flex-col">
            <label htmlFor="panNo" className="font-medium">
              PAN No:
            </label>
            <input
              id="panNo"
              type="text"
              placeholder="Enter PAN No."
              required
              value={formData.panNo}
              onChange={handleInputChange}
              className="dark:bg-slate-600 bg-white rounded-md w-[65%] pl-2 py-1 border dark:border-0"
            />
          </div>
          <div className="gap-2 flex flex-col">
            <label htmlFor="bankName" className="font-medium">
              Bank Name:
            </label>
            <input
              id="bankName"
              type="text"
              placeholder="Enter bank name"
              required
              value={formData.bankName}
              onChange={handleInputChange}
              className="dark:bg-slate-600 bg-white rounded-md w-[65%] pl-2 py-1 border dark:border-0"
            />
          </div>
          <div className="gap-2 flex flex-col">
            <label htmlFor="accountNo" className="font-medium">
              Account No:
            </label>
            <input
              id="accountNo"
              type="text"
              placeholder="Enter account number"
              required
              value={formData.accountNo}
              onChange={handleInputChange}
              className="dark:bg-slate-600 bg-white rounded-md w-[65%] pl-2 py-1 border dark:border-0"
            />
          </div>
          <div className="gap-2 flex flex-col">
            <label htmlFor="ifsc" className="font-medium">
              IFSC:
            </label>
            <input
              id="ifsc"
              type="text"
              placeholder="Enter IFSC code"
              required
              value={formData.ifsc}
              onChange={handleInputChange}
              className="dark:bg-slate-600 bg-white rounded-md w-[65%] pl-2 py-1 border dark:border-0"
            />
          </div>
          <div className="gap-2 flex flex-col">
            <label htmlFor="email" className="font-medium">
              Email:
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="dark:bg-slate-600 bg-white rounded-md w-[65%] pl-2 py-1 border dark:border-0"
            />
          </div>
          <div className="gap-2 flex flex-col">
            <label htmlFor="company-logo" className="font-medium">
              Upload Your Company Logo:
            </label>
            <input
              id="company-logo"
              type="file"
              accept="image/*"
              required
              className="hidden"
              onChange={handleFileChange}
            />
            <label
              htmlFor="company-logo"
              className="cursor-pointer bg-dp text-white px-4 py-1 rounded-md w-fit hover:bg-mp dark:bg-mp-dark hover:dark:bg-mp transition"
            >
              Choose File
            </label>
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

export default Template;
