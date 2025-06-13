// import { Worker, Viewer } from "@react-pdf-viewer/core";
// import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
// import { pdfjs } from "react-pdf";

// pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// function MyPDFViewer({ file }) {
//   return (
//     <Worker
//       workerUrl={`//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`}
//     >
//       <Viewer fileUrl={file} />
//     </Worker>
//   );
// }

// export default MyPDFViewer;


import { pdfjs, Document, Page } from "react-pdf";
import { useState } from "react";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

function MyPDFViewer({ file }) {
  const [numPages, setNumPages] = useState(null);
  const [scale, setScale] = useState(1.35); //zoom lvl

  return (
    <div className="h-full overflow-auto flex justify-center relative">
      {/* pdf here*/}
      <Document
        file={file}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        className="border rounded shadow-md"
      >
        {Array.from({ length: numPages }, (_, index) => (
          <Page
            key={index}
            pageNumber={index + 1}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            scale={scale}
          />
        ))}
      </Document>
    </div>
  );
}

export default MyPDFViewer;
