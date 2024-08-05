import React from "react";
import { admindashblue, admindashred, dummyadmin } from "../../assets";
import { Link } from "react-router-dom";
 
import { server_url } from "../../constants/constants";
import axiosInstance from "../../helpers/axios/axiosInstance";
import CircleIcon from '@mui/icons-material/Circle';

const UserCard = ({ user }) => {
  const actionFunc = async (alert) => {
    console.log(alert);
    if (alert.alarmId) {
      localStorage.setItem("alarmId", alert.alarmId);
    }
    if (alert.labReportId) {
      localStorage.setItem("labReportId", alert.labReportId);
    }
    if (alert.requisitionId) {
      localStorage.setItem("requisitionId", alert.requisitionId);
    }
    // update the isRead of the alert object
    if(alert.missedAlertId && alert.isOpened ==0){
      updateIsReadAlert(alert.missedAlertId);
      updateIsReadAlert(alert.id);
    }else if(alert.isOpened ==0){
      updateIsReadAlert(alert.id);
    }
    

    window.location.href = alert.redirect;

  };
  const updateIsReadAlert = async (alertId) => {
    const url = `${server_url}/alerts/updateIsRead`;
    try {
      // Making the POST request to the server
      const response = await axiosInstance.put(url, { id: alertId });
    } catch (error) {
      console.error('Error:', error.response ? error.response.data : error.message);
    }
  }
  return (
    <div
      className="w-full bg-white p-4 m-2 border rounded shadow flex items-center"
      onClick={() => actionFunc(user)}
      style={{ cursor: "pointer" }}
    >
      {/* User Card Left Content */}
      <div className="flex items-center">
        <img
          src={dummyadmin}
          alt="Sample"
          className="mr-4 h-12 w-12 rounded-full"
        />
        <div>
          <p className="font-semibold">{user.name}</p>
          <p>{user.type}</p>
        </div>
      </div>

      {/* User Card Right Content */}
      <div className="ml-auto flex items-center">
        <p className="mr-2">{user.date.slice(0, 10)}</p>
        <div>
          {
            user.isOpened===1 ?(
              <div>
                
            </div>

            ):(
              <div>
                 <CircleIcon style={{ fontSize: '16px', color: 'red' }} />
            </div>

            )
            
          }
          {/* Arrow icon pointing right*/}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 transform rotate-180"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M13.293 4.293a1 1 0 011.414 1.414L11 10l3.707 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

const AdminContainer = ({
  newUsers,
  totalUsers,
  doctorAlerts,
  patientAlerts,
}) => {
  // console.log(patientAlerts)
  return (
    <div className="bg-gray-100 min-h-screen md:py-10 md:px-40 overflow-y-auto">
      {/* Upper Cards Container */}
      <div className="flex flex-wrap justify-center gap-4 mt-2 ">
        {/* New Users Card */}
        <div className="w-full md:w-1/3 bg-white p-8 rounded shadow-md flex items-center">
          {/* Left Content */}
          <div>
            <p className="text-lg font-semibold">New Users</p>
            <p className="text-2xl font-bold">{newUsers}</p>
          </div>
          {/* Right Image */}
          <img
            src={admindashblue}
            alt="User"
            className="ml-10 h-12 w-12 rounded-full"
          />
        </div>

        {/* Total Users Card */}
        <div className="w-full md:w-1/3 bg-white p-8 rounded shadow-md flex items-center">
          {/* Left Content */}
          <div>
            <p className="text-lg font-semibold">Total Users</p>
            <p className="text-2xl font-bold">{totalUsers}</p>
            {/* Add your content */}
          </div>
          {/* Right Image */}
          <img
            src={admindashred}
            alt="User"
            className="ml-12 h-13 w-12 rounded-full"
          />
        </div>
      </div>

      {/* Alerts Container */}
      <div className="flex flex-col md:flex-row md:justify-between">
        {/* Doctor Alerts Container */}
        <div
          className="bg-white p-5 rounded-md border-t-primary border-t-4 shadow-md my-10 md:w-1/2 md:mr-2"
          style={{ maxHeight: "400px", height: "auto" }}
        >
          <p className="text-lg font-semibold text-center md:sticky md:top-0 bg-white pt-2">
            Doctor Alerts
          </p>
          <div style={{ maxHeight: "calc(100% - 2rem)", overflowY: "auto" }}>
            {doctorAlerts.map((user) => (
              <div>
                <UserCard key={user.id} user={user} />
              </div>
            ))}
          </div>
        </div>

        {/* Patient Alerts Container */}
        <div
          className="bg-white p-5 rounded-md border-t-primary border-t-4 shadow-md my-10 md:w-1/2 md:ml-2 "
          style={{ maxHeight: "400px", height: "auto" }}
        >
          <p className="text-lg font-semibold text-center md:sticky md:top-0 bg-white pt-2">
            Patient Alerts
          </p>
          <div style={{ maxHeight: "calc(100% - 2rem)", overflowY: "auto" }}>
            {patientAlerts.map((user) => (
              <div>
                <UserCard key={user.id} user={user} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminContainer;
