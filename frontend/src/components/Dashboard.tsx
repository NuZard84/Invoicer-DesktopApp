import React, { useState, useEffect, useRef } from "react";

const Dashboard: React.FC = () => {
  const [isTemplateFilled, setIsTemplateFilled] = useState<boolean>(false);

  useEffect(() => {
    const templateFilled = localStorage.getItem("isTemplateFilled");

    if (templateFilled === "true") {
      setIsTemplateFilled(true);
    }
  }, []);

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
