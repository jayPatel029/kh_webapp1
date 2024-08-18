import axios from "axios";
import React, { useState } from "react";

const PdfDataExtractor = () => {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const response = await axios.post(
        "http://localhost:3001/api/text/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setText(response.data.text);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1>PDF Text Extractor</h1>
      <input type="file" accept=".pdf" onChange={handleFileChange} />
      <button onClick={handleSubmit}>Upload and Extract</button>
      <div>
        <h2>Extracted Text:</h2>
        <div className="text-container">{text}</div>
      </div>
    </div>
  );
};

export default PdfDataExtractor;
