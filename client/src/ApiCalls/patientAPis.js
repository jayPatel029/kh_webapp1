import axiosInstance from "../helpers/axios/axiosInstance";
import { server_url } from "../constants/constants";

export async function getPatients() {
  try {
    const response = await axiosInstance.get(
      server_url + "/patient" + "/getPatients"
    );
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response.data.message };
  }
}

export async function AddPatient(patientData) {
  try {
    const response = await axiosInstance.post(
      server_url + "/patient" + "/AddPatient",
      patientData
    );
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response.data.message };
  }
}

export async function updatePatientProgram(patientId, programData) {
  try {
    const response = await axiosInstance.put(
      server_url + "/patient" + "/updateProgram/" + patientId,
      programData
    );
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response.data.message };
  }
}

export async function getPatientById(patientId) {
  try {
    const response = await axiosInstance.get(
      server_url + "/patient" + "/getPatient/" + patientId
    );
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response.data.message };
  }
}

export async function getPatientMedicalTeam(id) {
  try {
    const response = await axiosInstance.get(
      server_url + "/patient" + "/getMedicalTeam/" + id
    );
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response.data.message };
  }
}

export async function getPatientAdminTeam(id) {
  try {
    const response = await axiosInstance.get(
      server_url + "/patient" + "/getAdminTeam/" + id
    );
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, data: error.response.data.message };
  }
}

export async function canExportPatient() {
  try {
    const token = localStorage.getItem("token"); // Fetch token from local storage
    const response = await axiosInstance.get(
      server_url + "/patientdata/canexport",
      {
        headers: {
          Authorization: `Bearer ${token}`, // Send token in headers
        },
      }
    );
    console.log("response from canExportPatient : ", response);
    if (response.status === 403) {
      return { success: false };
    } else if (response.status === 200) {
      return { success: true };
    } else {
      return { success: false };
    }
  } catch (error) {
    return { success: false, data: error.response.data.message };
  }
}
