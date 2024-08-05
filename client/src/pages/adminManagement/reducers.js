export function newUserReducer(state, action) {
  switch (action.type) {
    case "name": {
      return {
        ...state,
        name: action.payload,
      };
    }
    case "email": {
      return {
        ...state,
        email: action.payload,
      };
    }
    case "role": {
      return {
        ...state,
        role: action.payload,
      };
    }
    case "phone": {
      return {
        ...state,
        phone: action.payload,
      };
    }
    case "password": {
      return {
        ...state,
        password: action.payload,
      };
    }
    case "all": {
      return {
        name: "",
        email: "",
        role: "Admin",
        phone: "",
        password: "",
        ...action.payload,
      };
    }
  }
}

export function newDoctorReducer(state, action) {
  switch (action.type) {
    case "name": {
      return {
        ...state,
        name: action.payload,
      };
    }
    case "specialities": {
      return {
        ...state,
        specialities: action.payload,
      };
    }
    case "email": {
      return {
        ...state,
        email: action.payload,
      };
    }
    case "phoneNo": {
      return {
        ...state,
        phoneNo: action.payload,
      };
    }
    case "practicingAt": {
      return {
        ...state,
        practicingAt: action.payload,
      };
    }
    case "institute": {
      return {
        ...state,
        institute: action.payload,
      };
    }
    case "licenseNo": {
      return {
        ...state,
        licenseNo: action.payload,
      };
    }
    case "doctorsCode": {
      return {
        ...state,
        doctorsCode: action.payload,
      };
    }
    case "yearsOfExperience": {
      return {
        ...state,
        yearsOfExperience: action.payload,
      };
    }
    case "address": {
      return {
        ...state,
        address: action.payload,
      };
    }
    case "photo": {
      return {
        ...state,
        photo: action.payload,
      };
    }
    case "resume": {
      return {
        ...state,
        resume: action.payload,
      };
    }
    case "reference": {
      return {
        ...state,
        reference: action.payload,
      };
    }
    case "description": {
      return {
        ...state,
        description: action.payload,
      };
    }
    case "role": {
      return {
        ...state,
        role: action.payload,
      };
    }
    case "dailyReadings": {
      return {
        ...state,
        dailyReadings: action.payload,
      };
    }
    case "dialysisReadings": {
      return {
        ...state,
        dialysisReadings: action.payload,
      };
    }

    case "email_notification": {
      return {
        ...state,
        email_notification: action.payload,
      };
    }
    case "can_export": {
      return {
        ...state,
        can_export: action.payload,
      };
    }

    case "all": {
      return {
        id: null,
        uniqueCode: "",
        name: "",
        specialities: [],
        email: "",
        phoneNo: "",
        practicingAt: "Government Hospital",
        institute: "",
        licenseNo: "",
        doctorsCode: "",
        yearsOfExperience: 0,
        address: "",
        photo: null,
        resume: "",
        reference: "",
        description: "",
        role: "Doctor",
        dailyReadings: [],
        dialysisReadings: [],
        email_notification: "yes",
        can_export: "no",
        ...action.payload,
      };
    }
    default: {
      return state;
    }
  }
}
