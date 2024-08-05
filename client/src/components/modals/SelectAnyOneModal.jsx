import React, { useEffect, useState } from "react";
 

const SelectAnyOneModal = ({
  closeModal,
  user_id,
  question_id,
  question,
  options,
}) => {
  const [selectedResponse, setSelectedResponse] = useState("");
  // const [optionsList, setOptionsList] = useState([]);

  // // Split options string at commas and append to optionsList
  // useEffect(() => {
  //   if (options) {
  //     const optionsArray = options.split(",");
  //     setOptionsList(optionsArray);
  //   }
  // }, [options]);

  const handleSubmit = () => {
    // Example data to send in the request body
    const postData = {
      question_id: question_id,
      user_id: user_id,
      response: selectedResponse,
    };

    // Replace 'http://localhost:port/api/endpoint' with the actual endpoint URL
    const url = "http://localhost:8080/api/userResponses/save";

    axiosInstance
      .post(url, postData)
      .then((response) => {
        console.log("Response:", response.data);
        // Handle successful response here
      })
      .catch((error) => {
        console.error("Error:", error);
        // Handle error here
      });
    closeModal();
  };
  //   console.log(user_id);
  const handleClose = () => {
    closeModal();
  };

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50 bg-black">
        <div className="p-7 ml-4 mr-4 mt-4 bg-white shadow-md border-t-4 border-primary rounded z-50 overflow-y-auto">
          <div className="p-4">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                {/* {question_id}
                {user_id} */}
                {question}
              </label>
              {options.map((option) => (
                <div key={option}>
                  <input
                    type="checkbox"
                    id={option}
                    value={option}
                    onChange={(e) => setSelectedResponse(e.target.value)}
                    checked={selectedResponse === option}
                  />
                  <label htmlFor={option}>{option}</label>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end p-4">
            <button
              onClick={handleSubmit}
              className="bg-primary text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Submit
            </button>
            <button
              onClick={handleClose}
              className="border-2 border-primary text-primary py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-2"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SelectAnyOneModal;
