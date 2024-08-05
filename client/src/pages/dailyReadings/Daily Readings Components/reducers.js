import { readingTypes } from "../../../constants/ReadingConstants";

export function newQuestionReducer(state, action) {
  switch (action.type) {
    case "id": {
      return {
        ...state,
        id: action.payload,
      };
    }

    case "title": {
      return {
        ...state,
        title: action.payload,
      };
    }
    
    case "ailment": {
      return {
        ...state,
        ailment: action.payload,
      };
    }
    
    case "assign_range": {
      return {
        ...state,
        assign_range: action.payload,
      };
    }
    
    case "lower_assign_range": {
      return {
        ...state,
        lower_assign_range: action.payload,
      };
    }
    
    case "upper_assign_range": {
      return {
        ...state,
        upper_assign_range: action.payload,
      };
    }
    
    case "isGraph": {
      return {
        ...state,
        isGraph: action.payload,
      };
    }

    case "type": {
      return {
        ...state,
        type: action.payload,
      };
    }
    case "alertTextDoc": {
      return {
        ...state,
        alertTextDoc: action.payload,
      };
    }
    
    case "all": {
      return {
        id: null,
        title: "",
        ailment: [],
        assign_range: "no",
        lower_assign_range: 0,
        type: readingTypes[0],
        upper_assign_range: 100,
        alertTextDoc:"",
        isGraph: 0,
        ...action.payload,
      };
    }
    
    default: {
      return state;
    }
  }
}
