// Import React and useState
import React, { useState, useEffect } from "react";
import { getPatientMedicalTeam } from "../../ApiCalls/patientAPis";
import { getPrescriptionByPatient } from "../../ApiCalls/prescriptionApis";
import { alarmTypeOptions, timing, dosesOptions } from "./consts";
import { insertAlarm } from "../../ApiCalls/alarmsApis";
import {
  getDailyReadings,
  getDialysisReadings,
} from "../../ApiCalls/readingsApis";

// Define the AlarmModal component
const AlarmModal = ({ closeModal, pid }) => {
  // Define alarmTypeOptions and state variables

  const [selectedAlarmType, setSelectedAlarmType] = useState("Dialysis");
  const [selectedHealthParameter, setSelectedHealthParameter] = useState("");

  const [selectTimings, setSelectTimings] = useState("Daily/Weekly");
  const [description, setDescription] = useState("");
  const [weekdays, setweekdays] = useState([]);
  const [timesaday, setTimesaday] = useState(1);
  const [timings, setTimings] = useState([]);
  const [dateOfMonth, setDOM] = useState([]);
  const [doctorid, setDoctorid] = useState();
  const [consultDoctor, setConsultDoctor] = useState([]);
  const [prescription, setPrescription] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState("");
  const [viewPrescription, setViewPrescription] = useState(null);
  const [msg, setMsg] = useState("");
  const [drOptions, setDrOptions] = useState([]);
  const [dirOptions, setDirOptions] = useState([]);
  const [messageToDoctor, setMessageToDoctor] = useState("");
  const [doses, setDoses] = useState([]);
  const [doseUnit, setDoseUnit] = useState([]);

  const handleCheck = (event) => {
    var updatedList = [...weekdays];
    if (event.target.checked) {
      updatedList = [...weekdays, event.target.value];
    } else {
      updatedList.splice(weekdays.indexOf(event.target.value), 1);
    }
    setweekdays(updatedList);
  };

  const validate = () => {
    if (
      selectedAlarmType === "Dialysis" ||
      selectedAlarmType === "Health Reading"
    ) {
      if (selectedHealthParameter === "") {
        setMsg("Please select Parameter");
        return false;
      }
    } else if (selectedAlarmType === "Prescription") {
      if (selectedPrescription === "") {
        setMsg("Please select Prescription");
        return false;
      }
    } else if (
      description === "" &&
      (selectedAlarmType === "Diet Details" ||
        selectedAlarmType === "Prescription")
    ) {
      setMsg("Please enter Description");
      return false;
    } else if (selectTimings === "Daily/Weekly") {
      if (weekdays.length === 0) {
        setMsg("Please select Week Days");
        return false;
      } else if (timesaday === 0) {
        setMsg("Please select How Many Times A Day");
        return false;
      } else if (timings.length < timesaday) {
        setMsg("Please select Time");
        return false;
      }
    } else if (selectTimings === "Monthly") {
      if (timesaday === 0) {
        setMsg("Please select How Many Times A Month");
        return false;
      } else if (dateOfMonth.length < timesaday) {
        setMsg("Please select Date Of The Month");
        return false;
      } else if (timings.length < timesaday) {
        setMsg("Please select Time");
        return false;
      }
    }
    return true;
  };

  // Define handleSubmit function
  const handleSubmit = async () => {
    if (validate()) {
      const payload = {
        doctorId: doctorid,
        type: selectedAlarmType,
        parameter: selectedHealthParameter,
        description: description,
        message: messageToDoctor,
        frequency: selectTimings,
        status: "Pending",
        reason: "",
        pid: pid,
        prescriptionid: null,
        doses: null,
        doseUnit: null,
      };
      if (selectedAlarmType === "Prescription") {
        payload.prescriptionid = selectedPrescription;
        payload.doses = doses.map((dose, index) => {
          return {
            dose: dose,
            doseUnit: doseUnit[index],
            time: timings[index],
          };
        });
      }

      if (selectTimings === "Daily/Weekly") {
        payload.weekdays = weekdays.toString();
        payload.timesaday = timesaday;
        payload.time = timings.toString();
      } else if (selectTimings === "Monthly") {
        payload.dateofmonth = dateOfMonth.toString();
        payload.timesamonth = timesaday;
        payload.time = timings.toString();
      }
      const res = await insertAlarm(payload);
      if (res.success) {
        console.log("Alarm inserted successfully");
        closeModal();
      } else {
        console.log("Error inserting alarm", res);
        setMsg("Error inserting alarm");
      }
    }
  };

  useEffect(() => {
    // Fetch patient data from the server
    const fetchPatientData = async () => {
      const result = await getDailyReadings();
      const DirResult = await getDialysisReadings();
      if (result.success && DirResult.success) {
        setDrOptions(
          result.data.map((dr) => {
            return { value: dr.title, label: dr.title };
          })
        );
        setDirOptions(
          DirResult.data.map((dr) => {
            return { value: dr.title, label: dr.title };
          })
        );
      } else {
        console.error("Failed to Readings:", result.data, DirResult.data);
      }
      const response = await getPatientMedicalTeam(pid);
      if (response.success) {
        setConsultDoctor(response.data.data);
        setDoctorid(response.data.data[0].id);
      }
      const responsePres = await getPrescriptionByPatient(pid);
      if (responsePres.success) {
        setPrescription(responsePres.data.data);
        setSelectedPrescription(responsePres.data?.data[0]?.id);
      }
    };
    fetchPatientData();
  }, []);

  const renderComponent = () => {
    if (selectTimings === "Daily/Weekly") {
      return (
        <div>
          <div className="mb-4">
            <h1>Select Week Days*</h1>
            <input
              type="checkbox"
              id="Mon"
              className="mx-2"
              value="Mon"
              onChange={handleCheck}
            />
            <label htmlFor="Mon" className="mr-2">
              Mon
            </label>
            <input
              type="checkbox"
              id="Tues"
              className="mr-2"
              value="Tues"
              onChange={handleCheck}
            />
            <label htmlFor="Tues" className="mr-2">
              Tues
            </label>
            <input
              type="checkbox"
              id="Wed"
              className="mr-2"
              value="Wed"
              onChange={handleCheck}
            />
            <label htmlFor="Wed" className="mr-2">
              Wed
            </label>
            <input
              type="checkbox"
              id="Thurs"
              className="mr-2"
              value="Thurs"
              onChange={handleCheck}
            />
            <label htmlFor="Thurs" className="mr-2">
              Thurs
            </label>
            <input
              type="checkbox"
              id="Fri"
              className="mr-2"
              value="Fri"
              onChange={handleCheck}
            />
            <label htmlFor="Fri" className="mr-2">
              Fri
            </label>
            <input
              type="checkbox"
              id="Sat"
              className="mr-2"
              value="Sat"
              onChange={handleCheck}
            />
            <label htmlFor="Sat" className="mr-2">
              Sat
            </label>
            <input
              type="checkbox"
              id="Sun"
              className="mr-2"
              value="Sun"
              onChange={handleCheck}
            />
            <label htmlFor="Sun" className="mr-2">
              Sun
            </label>
          </div>

          <div>
            <label className="py-2 mb-4">How Many Times A Day*</label>
            <select
              value={timesaday}
              className="w-full border-2 mb-2 mt-2 py-2 px-3 rounded focus:outline-none focus:border-primary"
              onChange={(e) => {
                setTimings(Array(parseInt(e.target.value)));
                setTimesaday(e.target.value);
                setDOM(Array(parseInt(e.target.value)));
                setDoses(Array(parseInt(e.target.value)));
                setDoseUnit(Array(parseInt(e.target.value)));
              }}
            >
              {timing.map((time, index) => (
                <option key={index} value={time.value}>
                  {time.label}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-2">
            <label htmlFor="time" className="block mb-2">
              Time*
            </label>
            {Array.from(Array(parseInt(timesaday))).map((_, index) => {
              return (
                <div>
                  <input
                    type="time"
                    key={index}
                    value={timings[index]}
                    onChange={(e) => {
                      let temp = [...timings];
                      temp[index] = e.target.value;
                      setTimings(temp);
                    }}
                    className=" w-1/4 border-2 py-2 px-3 mb-2 rounded focus:outline-none focus:border-primary"
                  />
                  {selectedAlarmType === "Prescription" && (
                    <>
                      <input
                        type="number"
                        value={doses[index]}
                        placeholder="Dose"
                        onChange={(e) => {
                          let temp = [...doses];
                          temp[index] = e.target.value;
                          setDoses(temp);
                        }}
                        className="ml-2 w-1/5 border-2 py-2 px-3 mb-2 rounded focus:outline-none focus:border-primary"
                      />
                      <select
                        name="doseUnit"
                        id="doseUnit"
                        className="ml-2 w-1/5 border-2 py-2 px-3 mr-2 mb-2 rounded focus:outline-none focus:border-primary"
                        value={doseUnit[index]}
                        onChange={(e) => {
                          let temp = [...doseUnit];
                          temp[index] = e.target.value;
                          setDoseUnit(temp);
                        }}
                      >
                        <option value={null}>Unit</option>
                        {dosesOptions.map((option, index) => (
                          <option key={index} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </>
                  )}
                </div>
              );
            })}
          </div>
          <div>
            <label className="mb-2">Select Doctor For Approval*</label>
            <select className="w-full border-2 mb-2 mt-2 py-2 px-3 rounded focus:outline-none focus:border-primary"
              onChange={(e) => {
                setDoctorid(e.target.value);
              }}
            >
              {consultDoctor.map((doc, index) => (
                <option key={index} value={doc.id}>
                  {doc.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      );
    } else if (selectTimings === "Monthly") {
      return (
        <div>
          <div>
            <label className="py-2 mb-4">How Many Times A Month*</label>
            <select
              value={timesaday}
              className="w-full border-2 mb-2 mt-2 py-2 px-3 rounded focus:outline-none focus:border-primary"
              onChange={(e) => {
                setTimings(Array(parseInt(e.target.value)));
                setTimesaday(e.target.value);
                setDOM(Array(parseInt(e.target.value)));
                setDoses(Array(parseInt(e.target.value)));
                setDoseUnit(Array(parseInt(e.target.value)));
              }}
            >
              {timing.map((time, index) => (
                <option key={index} value={time.value}>
                  {time.label}
                </option>
              ))}
            </select>
          </div>

          {Array.from(Array(parseInt(timesaday))).map((_, index) => {
            return (
              <div key={index}>
                <label className="block">Date Of The Month*</label>
                <select
                  name="dateOfMonth"
                  id="dateOfMonth"
                  className="w-1/5 border-2 py-2 px-3 mr-2 mb-2 rounded focus:outline-none focus:border-primary"
                  value={dateOfMonth[index]}
                  onChange={(e) => {
                    let temp = [...dateOfMonth];
                    temp[index] = e.target.value;
                    setDOM(temp);
                  }}
                >
                  {/* Generate options for numbers 1 to 30 */}
                  {Array.from({ length: 30 }, (_, i) => i + 1).map(
                    (number, index) => (
                      <option key={index} value={number}>
                        {number}
                      </option>
                    )
                  )}
                </select>

                <input
                  type="time"
                  value={timings[index]}
                  onChange={(e) => {
                    let temp = [...timings];
                    temp[index] = e.target.value;
                    setTimings(temp);
                  }}
                  className=" w-1/5 border-2 py-2 px-3 mb-2 rounded focus:outline-none focus:border-primary"
                />
                {selectedAlarmType === "Prescription" && (
                  <>
                    <input
                      type="number"
                      value={doses[index]}
                      placeholder="Dose"
                      onChange={(e) => {
                        let temp = [...doses];
                        temp[index] = e.target.value;
                        setDoses(temp);
                      }}
                      className="ml-2 w-1/5 border-2 py-2 px-3 mb-2 rounded focus:outline-none focus:border-primary"
                    />
                    <select
                      name="doseUnit"
                      id="doseUnit"
                      className="ml-2 w-1/5 border-2 py-2 px-3 mr-2 mb-2 rounded focus:outline-none focus:border-primary"
                      value={doseUnit[index]}
                      onChange={(e) => {
                        let temp = [...doseUnit];
                        temp[index] = e.target.value;
                        setDoseUnit(temp);
                      }}
                    >
                      <option value={null}>Unit</option>
                      {dosesOptions.map((option, index) => (
                        <option key={index} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </>
                )}
              </div>
            );
          })}
          <div>
            <label className="mb-2">Select Doctor For Approval*</label>
            <select className="w-full border-2 mb-2 mt-2 py-2 px-3 rounded focus:outline-none focus:border-primary">
              {consultDoctor.map((doc, index) => (
                <option key={index} value={doc.id}>
                  {doc.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      );
    }
    // Default case
    return null;
  };

  // JSX structure of AlarmModal component
  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50 bg-black overflow-y-auto">
        <div className="p-7 mt-4 bg-white shadow-md border-t-4 w-1/2 border-primary rounded z-50 overflow-y-auto h-3/4">
          <div className="header flex justify-between items-center border-b pb-2 mb-4">
            <h2 className="text-2xl font-bold">Alarms</h2>
          </div>
          <div className="p-4">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Alarm Type*
              </label>
              <select
                id="alarmType"
                onChange={(e) => {
                  setSelectedAlarmType(e.target.value);
                  setSelectedHealthParameter("");
                }}
                value={selectedAlarmType}
                className="w-full py-2 px-3 border border-gray-300 rounded focus:outline-none focus:border-primary"
              >
                <option className="text-gray-400">Select Alarm Type</option>
                {alarmTypeOptions.map((type, index) => (
                  <option key={index} value={type.label}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            {/* health parameter's section */}
            {selectedAlarmType !== "Diet Details" &&
              selectedAlarmType !== "Prescription" && (
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    {selectedAlarmType &&
                      alarmTypeOptions.find(
                        (type) => type.label === selectedAlarmType
                      )?.title}
                  </label>
                  <select
                    value={selectedHealthParameter}
                    onChange={(e) => setSelectedHealthParameter(e.target.value)}
                    disabled={!selectedAlarmType}
                    className="w-full py-2 px-3 border border-gray-300 rounded focus:outline-none focus:border-primary"
                  >
                    <option className="text-gray-100">Select Parameter</option>
                    {selectedAlarmType === "Dialysis"
                      ? dirOptions.map((option, index) => (
                          <option key={index} value={option.value}>
                            {option.label}
                          </option>
                        ))
                      : drOptions.map((option, index) => (
                          <option key={index} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                  </select>
                </div>
              )}

            {/* description section */}
            {selectedAlarmType === "Prescription" && (
              <div className="my-2">
                <label>Select Prescription*</label>
                <table className=" w-full text-sm text-left rtl:text-right text-gray-800 ">
                  <thead className="text-sm text-gray-700 border-b-2 border-gray-800 ">
                    <tr>
                      <th scope="col" className="px-6 py-3">
                        Image
                      </th>
                      <th scope="col" className="px-6 py-3 ">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 ">
                        Select
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {prescription.map((pres, index) => {
                      return (
                        <tr key={index} className="my-4">
                          <td className="px-6 py-4 text-3xl">
                            <img
                              src={pres.Prescription}
                              alt="image"
                              className="inline h-12 w-12 mx-10"
                              onClick={() => {
                                if (viewPrescription === index + 1) {
                                  setViewPrescription(null);
                                } else {
                                  setViewPrescription(index + 1);
                                }
                              }}
                            />
                          </td>
                          <td className="px-6 py-4 text-md">
                            {new Date(pres.Date).toDateString()}
                          </td>
                          <td className="px-6 py-4 text-3xl">
                            <input
                              type="radio"
                              name="prescription"
                              value={pres.id}
                              onChange={(e) => {
                                setSelectedPrescription(e.target.value);
                              }}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {selectedAlarmType === "Diet Details" ||
            selectedAlarmType === "Prescription" ? (
              <div className="mb-4">
                <label>Short Description*</label>
                <input
                  type="text"
                  value={description}
                  className="w-full py-2 px-3 border border-gray-300 rounded focus:outline-none focus:border-primary "
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            ) : null}

            {/* {selectedAlarmType === "Diet Details" ||
            selectedAlarmType === "Prescription" ? (
              <div className="mb-4">
                <label>Message to Doctor*</label>
                <input
                  type="text"
                  value={messageToDoctor}
                  className="w-full py-2 px-3 border border-gray-300 rounded focus:outline-none focus:border-primary "
                  onChange={(e) => setMessageToDoctor(e.target.value)}
                />
              </div>
            ) : null} */}

            <div className="flex">
              <div className="mb-4 mr-4">
                <input
                  name="regularity"
                  type="radio"
                  id="dailyWeekly"
                  value="Daily/Weekly"
                  checked={selectTimings === "Daily/Weekly"}
                  onChange={(e) => setSelectTimings(e.target.value)}
                />
                <label htmlFor="dailyWeekly">Daily/Weekly</label>
              </div>
              <div className="mb-4">
                <input
                  name="regularity"
                  type="radio"
                  id="monthly"
                  value="Monthly"
                  checked={selectTimings === "Monthly"}
                  onChange={(e) => setSelectTimings(e.target.value)}
                />
                <label htmlFor="monthly">Monthly</label>
              </div>
            </div>
            <div className="mb-4 mr-4">{renderComponent()}</div>
            <div className="text-[#ff0000]">{msg}</div>
          </div>

          <div className="flex justify-end p-4">
            <button
              onClick={handleSubmit}
              className="bg-primary text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Submit
            </button>
            <button
              onClick={() => {
                closeModal();
              }}
              className="border-2 border-primary text-primary py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-2"
            >
              Close
            </button>
          </div>
        </div>
        {viewPrescription && (
          <div className="p-7 mt-4 bg-white shadow-md border-t-4 w-1/4 border-primary rounded z-50 overflow-y-auto h-3/4">
            <img
              src={prescription[viewPrescription - 1].Prescription}
              className="w-full"
            />
          </div>
        )}
      </div>
    </>
  );
};

// Export the AlarmModal component
export default AlarmModal;
