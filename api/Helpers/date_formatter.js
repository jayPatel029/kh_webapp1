const getCurrentFormattedDate = () => {
  const currentDate = new Date();

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const monthIndex = currentDate.getMonth();
  const month = months[monthIndex];

  const day = currentDate.getDate();
  const year = currentDate.getFullYear();

  const formattedDate = `${day} ${month} ${year}`;

  //   console.log(formattedDate);
  return formattedDate;
};

const formatDate = (dateString) => {
  const date = new Date(dateString);

  const day = date.getDate();
  const month = new Intl.DateTimeFormat("en", { month: "short" }).format(date);
  const year = date.getFullYear();

  const formattedDate = `${day} ${month} ${year}`;

  // console.log(formattedDate);
  return formattedDate;
};

function convertDateFormatYYYYmmDD(dateString) {

  const date = new Date(dateString);


  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  
  return `${year}-${month}-${day}`;
}


function convertDateFormat(date) {
  const options = { year: "numeric", month: "short", day: "2-digit" };
  const formattedDate = date
    .toLocaleDateString("en-GB", options)
    .replace(/^(\d{1})-(\w{3})-(\d{4})$/, "0$1-$2-$3");
  // console.log(formattedDate);
  return formattedDate;
}

function getWeekOfMonth(date) {
  const month = date.getMonth();
  const firstDayOfMonth = new Date(date.getFullYear(), month, 1).getDay();
  const dayOfMonth = date.getDate();
  const offset = firstDayOfMonth < 5 ? 1 : 0;
  const week = Math.floor((dayOfMonth + firstDayOfMonth - offset) / 7) + 1;
  return week;
}

const getColor = (value, lowRange, highRange, lowRange2, highRange2) => {
  if (highRange != 0 && highRange2 != 0 && lowRange != 0 && lowRange2 != 0) {
    if (value >= highRange2 || value <= lowRange2) {
      return "red";
    } else if (value >= highRange && value <= highRange2) {
      return "yellow";
    } else if (value >= lowRange && value <= highRange) {
      return "green";
    } else if (value >= lowRange2 && value <= lowRange) {
      return "yellow";
    }
  } else if (
    highRange == 0 &&
    highRange2 != 0 &&
    lowRange != 0 &&
    lowRange2 != 0
  ) {
    if (value >= highRange2 || value <= lowRange2) {
      return "red";
    } else if (value >= lowRange && value <= highRange2) {
      return "green";
    } else if (value >= lowRange2 && value <= lowRange) {
      return "yellow";
    }
  } else if (
    highRange != 0 &&
    highRange2 == 0 &&
    lowRange != 0 &&
    lowRange2 != 0
  ) {
    if (value <= lowRange2) {
      return "red";
    } else if (value >= highRange) {
      return "yellow";
    } else if (value >= lowRange && value <= highRange) {
      return "green";
    } else if (value >= lowRange2 && value <= lowRange) {
      return "yellow";
    }
  } else if (
    highRange != 0 &&
    highRange2 != 0 &&
    lowRange == 0 &&
    lowRange2 != 0
  ) {
    if (value >= highRange2 || value <= lowRange2) {
      return "red";
    } else if (value >= highRange && value <= highRange2) {
      return "yellow";
    } else if (value >= lowRange2 && value <= highRange) {
      return "green";
    }
  } else if (
    highRange != 0 &&
    highRange2 != 0 &&
    lowRange != 0 &&
    lowRange2 == 0
  ) {
    if (value >= highRange2) {
      return "red";
    } else if (value < lowRange) {
      return "yellow";
    } else if (value >= highRange && value <= highRange2) {
      return "yellow";
    } else if (value >= lowRange && value <= highRange) {
      return "green";
    }
  } else if (
    highRange == 0 &&
    highRange2 == 0 &&
    lowRange != 0 &&
    lowRange2 != 0
  ) {
    if (value <= lowRange2) {
      return "red";
    } else if (value >= lowRange) {
      return "green";
    } else if (value >= lowRange2 && value <= lowRange) {
      return "yellow";
    }
  } else if (
    highRange != 0 &&
    highRange2 == 0 &&
    lowRange == 0 &&
    lowRange2 != 0
  ) {
    if (value <= lowRange2) {
      return "red";
    } else if (value >= highRange) {
      return "yellow";
    } else if (value >= lowRange2 && value <= highRange) {
      return "green";
    }
  } else if (
    highRange != 0 &&
    highRange2 != 0 &&
    lowRange == 0 &&
    lowRange2 == 0
  ) {
    if (value >= highRange2) {
      return "red";
    } else if (value >= highRange && value <= highRange2) {
      return "yellow";
    } else if (value <= highRange) {
      return "green";
    }
  } else if (
    highRange == 0 &&
    highRange2 != 0 &&
    lowRange == 0 &&
    lowRange2 != 0
  ) {
    if (value >= highRange2 || value <= lowRange2) {
      return "red";
    } else if (value >= lowRange2 && value <= highRange2) {
      return "green";
    }
  } else if (
    highRange == 0 &&
    highRange2 != 0 &&
    lowRange != 0 &&
    lowRange2 == 0
  ) {
    if (value >= highRange2) {
      return "red";
    } else if (value >= lowRange && value <= highRange2) {
      return "green";
    } else if (value <= lowRange) {
      return "yellow";
    }
  } else if (
    highRange != 0 &&
    highRange2 == 0 &&
    lowRange != 0 &&
    lowRange2 == 0
  ) {
    if (value >= highRange) {
      return "yellow";
    } else if (value >= lowRange && value <= highRange) {
      return "green";
    } else if (value <= lowRange) {
      return "red";
    }
  } else if (
    highRange != 0 &&
    highRange2 == 0 &&
    lowRange == 0 &&
    lowRange2 == 0
  ) {
    if (value <= highRange) {
      return "green";
    } else {
      return "yellow";
    }
  } else if (
    highRange == 0 &&
    highRange2 != 0 &&
    lowRange == 0 &&
    lowRange2 == 0
  ) {
    if (value <= highRange2) {
      return "green";
    } else {
      return "yellow";
    }
  } else if (
    highRange == 0 &&
    highRange2 == 0 &&
    lowRange != 0 &&
    lowRange2 == 0
  ) {
    if (value >= lowRange) {
      return "green";
    } else {
      return "yellow";
    }
  } else if (
    highRange == 0 &&
    highRange2 == 0 &&
    lowRange == 0 &&
    lowRange2 != 0
  ) {
    if (value >= lowRange2) {
      return "yellow";
    } else {
      return "red";
    }
  } else if (
    highRange == 0 &&
    highRange2 == 0 &&
    lowRange == 0 &&
    lowRange2 == 0
  ) {
    return "green";
  }
};

const formatDateNew = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

module.exports = {
  getCurrentFormattedDate,
  formatDate,
  convertDateFormatYYYYmmDD,
  getWeekOfMonth,
  getColor,
  convertDateFormat,
  formatDateNew,
};
