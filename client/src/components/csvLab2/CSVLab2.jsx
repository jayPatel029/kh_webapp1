import React, { useState } from "react";
import {
  useCSVReader,
  lightenDarkenColor,
  formatFileSize,
} from "react-papaparse";
import axiosInstance from "../../helpers/axios/axiosInstance";
import { server_url } from "../../constants/constants";
import { getFileRes } from "../../helpers/fileuploadHelper";
import getCurrentDate from "../../helpers/formatDate";

const GREY = "#CCC";
const GREY_LIGHT = "rgba(255, 255, 255, 0.4)";
const DEFAULT_REMOVE_HOVER_COLOR = "#A01919";
const REMOVE_HOVER_COLOR_LIGHT = lightenDarkenColor(
  DEFAULT_REMOVE_HOVER_COLOR,
  40
);
const GREY_DIM = "#686868";

const styles = {
  zone: {
    alignItems: "center",
    border: `2px dashed ${GREY}`,
    borderRadius: 20,
    display: "flex",
    flexDirection: "column",
    height: "100%",
    justifyContent: "center",
    padding: 20,
  },
  file: {
    background: "linear-gradient(to bottom, #EEE, #DDD)",
    borderRadius: 20,
    display: "flex",
    height: 120,
    width: 120,
    position: "relative",
    zIndex: 10,
    flexDirection: "column",
    justifyContent: "center",
  },
  info: {
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    paddingLeft: 10,
    paddingRight: 10,
  },
  size: {
    backgroundColor: GREY_LIGHT,
    borderRadius: 3,
    marginBottom: "0.5em",
    justifyContent: "center",
    display: "flex",
  },
  name: {
    backgroundColor: GREY_LIGHT,
    borderRadius: 3,
    fontSize: 12,
    marginBottom: "0.5em",
  },
  progressBar: {
    bottom: 14,
    position: "absolute",
    width: "100%",
    paddingLeft: 10,
    paddingRight: 10,
  },
  zoneHover: {
    borderColor: GREY_DIM,
  },
  default: {
    borderColor: GREY,
  },
  remove: {
    height: 23,
    position: "absolute",
    right: 6,
    top: 6,
    width: 23,
  },
};
export default function CSVReader({ setData, setSuccess, success, patientId }) {
  const { CSVReader } = useCSVReader();
  const [zoneHover, setZoneHover] = useState(false);
  const [removeHoverColor, setRemoveHoverColor] = useState(
    DEFAULT_REMOVE_HOVER_COLOR
  );
  const [headData, setHeadData] = useState([]);
  const [columnMappings, setColumnMappings] = useState({
    date: "",
    Hemoglobin: "",
    PCV: "",
    RBC: "",
    MCH : "",
    MCHC : "",
    MCV: "",
    RDW : "",
    TLC: "",
    Segmented_Neutrophils:"",
    Neutrophils: "",
    Lymphocytes: "",
    Monocytes: "",
    Eosinophils: "",
    Basophils: "",
    Neutrophils_absolute: "",
    Lymphocytes_absolute: "",
    Monocytes_absolute: "",
    Eosinophils_absolute: "",
    Basophils_absolute: "",
    Platelet_Count: "",

  });
  const [csvData, setCsvData] = useState([]);
  const [columnOptions, setColumnOptions] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const handleSubmit = () => {
    const mappedData = csvData
      .map((row) => ({
        Hemoglobin: columnMappings.Hemoglobin
          ? row[columnOptions.indexOf(columnMappings.Hemoglobin)]
          : undefined,
        MCV: columnMappings.MCV
          ? row[columnOptions.indexOf(columnMappings.MCV)]
          : undefined,
        date: columnMappings.date
          ? row[columnOptions.indexOf(columnMappings.date)]
          : undefined,
        'Packed Cell Volume (PCV)': columnMappings.PCV
          ? row[columnOptions.indexOf(columnMappings.PCV)]
          : undefined,
          'RBC Count': columnMappings.RBC
          ? row[columnOptions.indexOf(columnMappings.RBC)]
          : undefined,
        MCH: columnMappings.MCH
          ? row[columnOptions.indexOf(columnMappings.MCH)]
          : undefined,
        MCHC: columnMappings.MCHC
          ? row[columnOptions.indexOf(columnMappings.MCHC)]
          : undefined,
        'Red Cell Distribution Width (RDW)': columnMappings.RDW
          ? row[columnOptions.indexOf(columnMappings.RDW)]
          : undefined,
        'Total Leukocyte Count (TLC)': columnMappings.TLC
          ? row[columnOptions.indexOf(columnMappings.TLC)]
          : undefined,
        'Segmented Neutrophils': columnMappings.Segmented_Neutrophils
          ? row[columnOptions.indexOf(columnMappings.Segmented_Neutrophils)]
          : undefined,
        Neutrophils: columnMappings.Neutrophils
          ? row[columnOptions.indexOf(columnMappings.Neutrophils)]
          : undefined,
        Lymphocytes: columnMappings.Lymphocytes
          ? row[columnOptions.indexOf(columnMappings.Lymphocytes)]
          : undefined,
        Monocytes: columnMappings.Monocytes
          ? row[columnOptions.indexOf(columnMappings.Monocytes)]
          : undefined,
        Eosinophils: columnMappings.Eosinophils
          ? row[columnOptions.indexOf(columnMappings.Eosinophils)]
          : undefined,
        Basophils: columnMappings.Basophils
          ? row[columnOptions.indexOf(columnMappings.Basophils)]
          : undefined,
        'Neutrophils (absolute)': columnMappings.Neutrophils_absolute
          ? row[columnOptions.indexOf(columnMappings.Neutrophils_absolute)]
          : undefined,
        'Lymphocytes (absolute)': columnMappings.Lymphocytes_absolute
          ? row[columnOptions.indexOf(columnMappings.Lymphocytes_absolute)]
          : undefined,
        'Monocytes (absolute)': columnMappings.Monocytes_absolute
          ? row[columnOptions.indexOf(columnMappings.Monocytes_absolute)]
          : undefined,
        'Eosinophils (absolute)': columnMappings.Eosinophils_absolute
          ? row[columnOptions.indexOf(columnMappings.Eosinophils_absolute)]
          : undefined,
        'Basophils (absolute)': columnMappings.Basophils_absolute
          ? row[columnOptions.indexOf(columnMappings.Basophils_absolute)]
          : undefined,
        'Platelet Count': columnMappings.Platelet_Count
          ? row[columnOptions.indexOf(columnMappings.Platelet_Count)]
          : undefined,
            

      }))
      .filter((item) => Object.values(item).some((value) => value !== undefined));

    const trimmedMappedData = mappedData.slice(1);
    setData(trimmedMappedData);
    setSuccess(!success);
    if (selectedFile) {
      getFileRes(selectedFile)
        .then(async (res) => {
          console.log("res", res);
          if (res.data.objectUrl === undefined) {
            alert("failed to upload you document, please try again later");
            return;
          }
          
          let data = { data: trimmedMappedData, patient_id: patientId, Report_Type: "Lab" ,Lab_Report: res.data.objectUrl};
          console.log("Data:", data);
          axiosInstance
          .post(`${server_url}/labreport/addBulkIndividual`, data)
          .then((response) => {
            console.log("Response:", response.data);
            setCsvData([]);
            setHeadData([]);
          })
          .catch((error) => {
            console.error("Error:", error);
          });
        })
      }
  };


  return (
    <CSVReader
      onUploadAccepted={(results, acceptedFile) => {
        setZoneHover(false);
        if (results.data.length > 0) {
          setSelectedFile(acceptedFile);
          setCsvData(results.data);
          setHeadData(results.data.slice(0, 5)); // Get the first five entries
          setColumnOptions(results.data[0]);
        }
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setZoneHover(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        setZoneHover(false);
      }}
    >
      {({ getRootProps, acceptedFile, ProgressBar, getRemoveFileProps, Remove }) => (
        <div className="flex flex-col space-y-6">
          <div
            {...getRootProps()}
            className={`flex justify-center items-center p-6 border-2 ${zoneHover ? 'border-gray-500' : 'border-gray-300'} rounded-lg`}
          >
            {acceptedFile ? (
              <div className="relative flex flex-col items-center justify-center w-32 h-32 bg-gradient-to-b from-gray-100 to-gray-200 rounded-lg">
                <div className="text-center">
                  <span className="block text-sm font-medium">{formatFileSize(acceptedFile.size)}</span>
                  <span className="block text-xs">{acceptedFile.name}</span>
                </div>
                <ProgressBar className="absolute bottom-0 w-full" />
                <div
                  {...getRemoveFileProps()}
                  className="absolute top-0 right-0 p-1 cursor-pointer"
                  onMouseOver={() => setRemoveHoverColor(REMOVE_HOVER_COLOR_LIGHT)}
                  onMouseOut={() => setRemoveHoverColor(DEFAULT_REMOVE_HOVER_COLOR)}
                >
                  <Remove color={removeHoverColor} />
                </div>
              </div>
            ) : (
              "Drop CSV file here or click to upload"
            )}
          </div>

          {headData.length > 0 && (
  <div>
    <h2 className="text-xl font-semibold mb-4">First Five Entries</h2>
    <div className="overflow-auto max-h-80 w-full">
      <table className="table-auto border-collapse border border-gray-300 w-full">
        <thead>
          <tr className="bg-gray-200">
            {headData[0].map((item, index) => (
              <th key={index} className="border px-4 py-2">
                {item}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {headData.slice(1).map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="border px-1 py-2">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)}

          {headData.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Match the Columns</h2>
              <ul className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(columnMappings).map(([key, value]) => (
                  <li key={key} className="flex flex-col space-y-2">
                    <label htmlFor={key} className="font-medium">{key}</label>
                    <select
                      id={key}
                      value={value}
                      onChange={(e) =>
                        setColumnMappings({
                          ...columnMappings,
                          [key]: e.target.value,
                        })
                      }
                      className="border px-4 py-2 rounded focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Select Column</option>
                      {columnOptions.map((column, index) => (
                        <option key={index} value={column}>{column}</option>
                      ))}
                    </select>
                  </li>
                ))}
              </ul>
              <div className="mt-4">
            
                <button
                  onClick={handleSubmit}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
                >
                  Submit Edited
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </CSVReader>
  );
}

