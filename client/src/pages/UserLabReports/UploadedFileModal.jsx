import React, { useState, useEffect } from "react";
import axiosInstance from "../../helpers/axios/axiosInstance";
import { useLocation } from "react-router-dom";
import { server_url } from "../../constants/constants";
import { addComment } from "../../ApiCalls/commentApi";
import MyPDFViewer from "../../components/pdf/MyPDFViewer";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import { Document, Page, pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;



// Ensure to set workerSrc
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

function UploadedFileModal({ closeModal, file, user_id, file_id }) {
  const [newComment, setNewComment] = useState("");
  const [prevComments, setPrevComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const [successful, setSuccessful] = useState(true);

  useEffect(() => {
    console.log("file_id", file.imageUrl);
    const data = {
      fileId: file_id,
      fileType: "Lab Report",
    };
    axiosInstance
      .post(`${server_url}/comments/getComments`, data)
      .then((res) => {
        setPrevComments(res.data.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [successful]);

  useEffect(() => {
    setLoading(true);
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
      const iSDoctor = localStorage.getItem("isDoctor") === "true" ? 1 : 0;

      const response = await addComment(newComment, fileId, fileType, id, iSDoctor);
      if (response.success) {
        setSuccessful(!successful);
      }
      setNewComment("");
    } catch (error) {
      console.error("Error uploading comment:", error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const dateObject = new Date(dateString);
    const istDateObject = new Date(dateObject.getTime() + 330 * 60000);
    const day = istDateObject.getDate();
    const month = istDateObject.toLocaleString("default", { month: "short" });
    const year = istDateObject.getFullYear();
    let hours = istDateObject.getHours();
    const minutes = istDateObject.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
  };


  // Ensure to set workerSrc

  const downloadPDF = async () => {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
  
    // Load the PDF
    if (file.imageUrl && file.imageUrl.endsWith(".pdf")) {
      const loadingTask = pdfjs.getDocument(file.imageUrl);
      loadingTask.promise.then(async (pdfDocument) => {
        const numPages = pdfDocument.numPages;
  
        // Render the PDF pages
        for (let i = 1; i <= numPages; i++) {
          const page = await pdfDocument.getPage(i);
          const viewport = page.getViewport({ scale: 2 });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
  
          // Render PDF page to canvas
          await page.render({ canvasContext: context, viewport: viewport }).promise;
          const imgData = canvas.toDataURL("image/png");
  
          // Add the image of the PDF page to the PDF document
          const imgHeight = (canvas.height * pageWidth) / canvas.width;
          pdf.addImage(imgData, "PNG", 0, 10, pageWidth, imgHeight);
  
          // Add a new page if it's not the last page
          if (i < numPages) {
            pdf.addPage();
          }
        }
  
        // Create a new page for comments
        pdf.addPage();
  
        // Set font for comments
        pdf.setFontSize(12);
        pdf.text("Comments:", 10, 20); // Title for comments section
        let yPosition = 30; // Starting Y position for comments
  
        // Add comments to PDF
        prevComments.forEach((comment) => {
          const commentText = `${comment.isDoctor ? "Doctor" : "Patient"}: ${comment.content}`;
          const formattedDate = formatDate(comment.date);
          const text = `${commentText} (${formattedDate})`;
          
          pdf.text(text, 10, yPosition);
          yPosition += 10; // Move down for the next line
        });
  
        // Save the final PDF
        pdf.save("report_with_comments.pdf");
      });
    } else {
      // Handle image download...
    }
  };
  
 
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50 bg-black">
      <div id="modal-content" className="p-7 ml-4 mr-4 mt-4 bg-white w-3/5 h-4/5 shadow-md border-t-4 border-teal-500 rounded z-50 overflow-auto">
        <div className="header flex justify-between items-center border-b pb-2 mb-4 sticky top-0">
          <h1 className="text-2xl font-bold">Uploaded Image</h1>
          <button onClick={closeModal} className="border-2 border-teal-500 text-teal-500 py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-2">Close</button>
          <button onClick={downloadPDF} className="border-2 border-teal-500 text-teal-500 py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-2">
            Download as PDF
          </button>
        </div>

        <div className="h-full">
          {loading ? (
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
                <img src={file.imageUrl || ""} alt="Lab_Report" className="w-full h-auto object-contain" />
              )}
            </div>
          )}
          <div className="flex-1 mt-4">
            <h2 className="font-medium">Previous Comments</h2>
            <div className="bg-gray-100 p-4 rounded-lg overflow-y-auto max-h-[400px]">
              {prevComments.map((comment) => (
                <div key={comment.id} className={`flex items-start mb-4 ${comment.isDoctor ? "justify-start" : "justify-end"}`}>
                  <div className={`rounded-full bg-teal-500 text-white w-8 h-8 flex items-center justify-center mr-2 ${comment.isDoctor ? "order-1" : "order-2"}`}>
                    {comment.isDoctor ? "D" : "P"}
                  </div>
                  <div className={`bg-white text-black p-2 text-sm rounded-lg shadow-md max-w-3/4 ${comment.isDoctor ? "ml-2 bg-black" : "mr-2 bg-teal-500 text-black"}`}>
                    <span className="font-medium text-xs text-gray-500 mr-2">{comment.isDoctor ? "Doctor: " : "Patient: "}</span>
                    <span className="flex-grow text-sm text-black font-bold">{comment.content}</span>
                    <p className="flex justify-end text-gray-600 italic text-xs">{formatDate(comment.date)}</p>
                  </div>
                </div>
              ))}
            </div>

            <h2 className="font-medium mt-4">Add a Comment</h2>
            <textarea
              className="w-full border-2 py-2 px-3 rounded focus:outline-none focus:border-amber-950"
              rows="1"
              value={newComment}
              onChange={(e) => {
                setNewComment(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = e.target.scrollHeight + "px";
              }}
            />
            <div className="flex justify-end mt-4">
              <button onClick={uploadComment} className="bg-teal-500 text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UploadedFileModal;
