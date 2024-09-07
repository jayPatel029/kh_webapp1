import React, { useState, useEffect } from "react";
import axiosInstance from "../../helpers/axios/axiosInstance";
import { useLocation } from "react-router-dom";
import { server_url } from "../../constants/constants";
import { addComment } from "../../ApiCalls/commentApi";
import MyPDFViewer from "../../components/pdf/MyPDFViewer";

function UploadedFileModal({ closeModal, file, user_id, file_id }) {
  //   const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [prevComments, setPrevComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const [successful,setSuccessful]=useState(true);
  // console.log(file.file);

  useEffect(() => {
    const data = {
      fileId: file_id,
      fileType: "Lab Report",
    };
    axiosInstance
      .post(`${server_url}/comments/getComments`, data)
      .then((res) => {
        console.log("Comments", res.data.data);
        setPrevComments(res.data.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [successful]);

  useEffect(() => {
    setLoading(true); // Set loading to true when file changes
    // Check if file is loaded
    if (file.imageUrl && file.imageUrl !== "") {
      setLoading(false);
    }
  }, [file.imageUrl]);

  const isPdf = /.*\.pdf$/.test(file.imageUrl);

  const uploadComment = async () => {
    try {
      const id = location.state.id;
      const fileId = file_id;
      const fileType = "Lab Report";
      var iSDoctor = 0;
      var isD = localStorage.getItem("isDoctor");
      if (isD === "true") {
        iSDoctor = 1;
      }

      const response = await addComment(
        newComment,
        fileId,
        fileType,
        id,
        iSDoctor
      );
      if (response.success) {
        console.log(response.message);
      }
      // After uploading, fetch the updated comments
      //   fetchComments();
      // Clear the input field
      setNewComment("");
      setSuccessful(!successful);
    } catch (error) {
      console.error("Error uploading comment:", error);
    }
  };
  console.log(file);
  //   useEffect(() => {
  //     fetchComments();
  //   }, []); // Fetch comments when the component mounts

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const dateObject = new Date(dateString);
    const day = dateObject.getDate();
    const month = dateObject.toLocaleString("default", { month: "short" });
    const year = dateObject.getFullYear();
    return `${day} ${month} ${year}`;
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50 bg-black">
      <div className="p-7 ml-4 mr-4 mt-4 bg-white w-3/5 h-4/5 shadow-md border-t-4 border-teal-500 rounded z-50 overflow-auto">
      <div className="header flex justify-between items-center border-b pb-2 mb-4 sticky top-0">
          <h1 className="text-2xl font-bold">Uploaded Image</h1>
          <button
            onClick={closeModal}
            className="border-2 border-teal-500 text-teal-500 py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-2"          >
            Close
          </button>
        </div>

        {/* Image */}
        <div className="h-full">
          {loading ? ( // Show loading indicator if isLoading is true
            <div className="flex justify-center items-center h-full">
              <p>Loading...</p>
            </div>
          ) : (
            <div className="overflow-auto h-4/5">
              {isPdf ? (
                <div className="h-full">
                  <MyPDFViewer file={file.imageUrl} />
                </div>
              ) : (
                <img
                  src={file.imageUrl ? file.imageUrl : ""}
                  alt="Lab_Report"
                  className="w-full h-auto object-contain"
                  style={{
                    width: "100%",
                    height: "100%",
                  }}
                />
              )}
            </div>
          )}
          <div className="flex-1 mt-4">
            <div className="mb-4 overflow-auto h-3/4">
              <h2 className="font-medium">Previous Comments</h2>
              <div className="bg-gray-100 p-4 rounded-lg overflow-y-auto max-h-[400px]">
                {prevComments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`flex items-start mb-4 ${
                      comment.isDoctor ? "justify-start" : "justify-end"
                    }`}
                  >
                    <div
                      className={`rounded-full bg-teal-500 text-white w-8 h-8 flex items-center justify-center mr-2 ${
                        comment.isDoctor ? "order-1" : "order-2"
                      }`}
                    >
                      {comment.isDoctor ? "D" : "P"}
                    </div>
                    <div
                      className={`bg-white text-black p-2 text-sm rounded-lg shadow-md max-w-3/4 ${
                        comment.isDoctor
                          ? "ml-2 bg-black"
                          : "mr-2 bg-teal-500 text-black"
                      }`}
                    >
                      <span className="font-medium text-xs text-gray-500 mr-2">
                        {comment.isDoctor ? "Doctor: " : "Patient: "}
                      </span>
                      <span className="flex-grow text-sm text-black font-bold">
                        {comment.content}
                      </span>
                      <p className="flex justify-end text-gray-600 italic text-xs">
                        {formatDate(comment.date)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add a Comment */}
            <div>
              <h2 className="font-medium">Add a Comment</h2>
              <textarea
                id="text"
                className="w-full border-2 py-2 px-3 rounded focus:outline-none focus:border-amber-950"
                rows="1"
                style={{ minHeight: "38px", height: "auto" }}
                value={newComment}
                onChange={(e) => {
                  setNewComment(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = e.target.scrollHeight + "px";
                }}
              />
              <div className="flex justify-end mt-4">
                <button
                  onClick={uploadComment}
                  className="bg-teal-500 text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UploadedFileModal;
