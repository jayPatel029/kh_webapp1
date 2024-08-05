const {pool} = require("../databaseConn/database.js");


const updateIsRead = async (req,res) => {
    const {email,alerts} = req.body;
    const getDoctorIdQuery = `SELECT * FROM doctors WHERE email = '${email}'`
    // console.log("Alerts: ",alerts)
    try {
        const doctor = await pool.query(getDoctorIdQuery);
        const doctorId = doctor[0].id;
        for (let i = 0; i < alerts.length; i++) {
          const alert = alerts[i];
          console.log("Here")
          const updateQuery = `UPDATE alertsread SET isRead = 1 WHERE alertId = '${alert.id}' AND dailyordia = '${alert.dailyordia}' AND doctorId = '${doctorId}'`
          try {
              await pool.query(updateQuery);
              console.log("Alerts Updated Successfully");
          } catch (error) {
              console.log("Error in updating",error);
              return res.status(500).json({
                  success: false,
                  data: "Error while Updating Alerts",
              });
          }
      }


        return res.status(200).json({
            success: true,
            data: "Alerts Updated Successfully",
        });
      
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            data: "Error while Updating Alerts",
        });
      
    }
   
}


const AddisReads = async (patientId,alertId,type) => {
  const getDoctorsQuery = `SELECT * FROM doctor_patients WHERE patient_id= '${patientId}'`
  try {
    const doctors = await pool.query(getDoctorsQuery);
    for (let i = 0; i < doctors.length; i++) {
      const doctor = doctors[i];
      const insertQuery = `INSERT INTO alertsread (doctorId,alertId,dailyordia,isRead) VALUES ('${doctor.doctor_id}','${alertId}','${type}',0)`
      try {
        await pool.query(insertQuery);
      } catch (error) {
        console.log(error);
      }
    }
    
  } catch (error) {
    console.log(error);  
  }
}

// 1
const getAlertColor = (value,lowRange,highRange,lowRange2,highRange2) => {
    if (highRange != 0 && highRange2 != 0 && lowRange != 0 && lowRange2 != 0) {
        if ( value >= highRange2 ||  value <= lowRange2) {
          return "red";
        } else if ( value >= highRange &&  value <= highRange2) {
          return "yellow";
        }
        else if ( value >= lowRange &&  value <= highRange) {
          return "green";
        }
        else if ( value >= lowRange2 &&  value <= lowRange) {
          return "yellow";
        }
  
      }
      else if (highRange == 0 && highRange2 != 0 && lowRange != 0 && lowRange2 != 0) {
        if ( value >= highRange2 ||  value <= lowRange2) {
          return "red";
        } 
        else if ( value >= lowRange &&  value <= highRange2) {
          return "green";
        }
        else if ( value >= lowRange2 &&  value <= lowRange) {
          return "yellow";
        }
  
      }
      else if (highRange != 0 && highRange2 == 0 && lowRange != 0 && lowRange2 != 0) {
        if ( value <= lowRange2) {
          return "red";
        }else if( value >= highRange){
          return "yellow";
  
        }
        else if ( value >= lowRange &&  value <= highRange) {
          return "green";
        }
        else if ( value >= lowRange2 &&  value <= lowRange) {
          return "yellow";
        }
  
      }
      else if (highRange != 0 && highRange2 != 0 && lowRange == 0 && lowRange2 != 0) {
  
        if ( value >= highRange2 ||  value <= lowRange2) {
          return "red";
        } else if ( value >= highRange &&  value <= highRange2) {
          return "yellow";
        }
        else if ( value >= lowRange2 &&  value <= highRange) {
          return "green";
        }
      }
      else if (highRange != 0 && highRange2 != 0 && lowRange != 0 && lowRange2 == 0) {
  
        if ( value >= highRange2) {
          return "red";
        }else if(value<lowRange){
          return "yellow";
        }
        else if ( value >= highRange &&  value <= highRange2) {
          return "yellow";
        }
        else if ( value >= lowRange &&  value <= highRange) {
          return "green";
        }
        
  
      }
      else if (highRange == 0 && highRange2 == 0 && lowRange != 0 && lowRange2 != 0) {
        if ( value <= lowRange2) {
          return "red";
        } 
        else if ( value >= lowRange) {
          return "green";
        }
        else if ( value >= lowRange2 &&  value <= lowRange) {
          return "yellow";
        }
        
  
      }
      else if (highRange != 0 && highRange2 == 0 && lowRange == 0 && lowRange2 != 0) {
        if ( value <= lowRange2) {
          return "red";
        } else if ( value >= highRange) {
          return "yellow";
        }
        else if ( value >= lowRange2 &&  value <= highRange) {
          return "green";
        }
  
      }
      else if (highRange != 0 && highRange2 != 0 && lowRange == 0 && lowRange2 == 0) {
        if ( value >= highRange2) {
          return "red";
        } else if ( value >= highRange &&  value <= highRange2) {
          return "yellow";
        }
        else if ( value <= highRange) {
          return "green";
        }
  
      }
      else if (highRange == 0 && highRange2 != 0 && lowRange == 0 && lowRange2 != 0) {
        if ( value >= highRange2 ||  value <= lowRange2) {
          return "red";
        } 
        else if ( value >= lowRange2 &&  value <= highRange2) {
          return "green";
        }
  
      }
      else if (highRange == 0 && highRange2 != 0 && lowRange != 0 && lowRange2 == 0) {
        if ( value >= highRange2) {
          return "red";
        }
        else if ( value >= lowRange &&  value <= highRange2) {
          return "green";
        }
        else if ( value <= lowRange) {
          return "yellow";
        }
  
      }
      else if (highRange != 0 && highRange2 == 0 && lowRange != 0 && lowRange2 == 0) {
  
        if ( value >= highRange) {
          return "yellow";
        }
        else if ( value >= lowRange &&  value <= highRange) {
          return "green";
        }
        else if ( value <= lowRange) {
          return "red";
        }
  
      }
      else if (highRange != 0 && highRange2 == 0 && lowRange == 0 && lowRange2 == 0) {
  
        if (  value <= highRange) {
          return "green";
        }else{
          return "yellow";
  
        }
  
      }
      else if (highRange == 0 && highRange2 != 0 && lowRange == 0 && lowRange2 == 0) {
  
        if (  value <= highRange2) {
          return "green";
        }else{
          return "yellow";
  
        }
  
      }
      else if (highRange == 0 && highRange2 == 0 && lowRange != 0 && lowRange2 == 0) {
        if (  value >= lowRange) {
          return "green";
        }else{
          return "yellow";
  
        }
  
      }
      else if (highRange == 0 && highRange2 == 0 && lowRange == 0 && lowRange2 != 0) {
        if (  value >= lowRange2) {
          return "yellow";
        }else{
          return "red"
        }
      }
      else if (highRange == 0 && highRange2 == 0 && lowRange == 0 && lowRange2 == 0) {
        return "green";
  
    }
    

}

const AddDailyReadingsAlerts = async (question_id,user_id,date,readings) => {
  console.log("adding daily readings",question_id,user_id,date,readings);
    const checkQuery = `SELECT * FROM daily_readings WHERE id = '${question_id}'`
    try {
        var dr = await pool.query(checkQuery);
        dr = dr[0];
        var type = dr.type;
        if (type === 'Int' || type ==="Decimal"){
            let inReadings = parseFloat(readings);
            lr = parseFloat(dr.low_range);
            hr = parseFloat(dr.high_range);
            const checkCustomRangeQuery = `SELECT * FROM user_range WHERE question_id = '${question_id}' AND user_id = '${user_id}'`
            try {
                var ur = await pool.query(checkCustomRangeQuery);
                ur = ur[0];
                if(ur){
                    lr = parseFloat(ur.low_range_1);
                    hr = parseFloat(ur.high_range_1);
                    lr2 = parseFloat(ur.low_range_2);
                    hr2 = parseFloat(ur.high_range_2);
                    var color = getAlertColor(inReadings,lr,hr,lr2,hr2);
                    if (color === "red" || color === "yellow"){
                        var cc = "red"
                        if (color === "yellow"){
                          cc = "orange"
                        }
                        const data = {
                            Name: dr.title,                         
                            Type: dr.type,
                            Date: date,
                            AlertText: dr.alertTextDoc? dr.alertTextDoc +`${readings}` : `The reading for ${dr.title} is ${readings} which is in the ${color} zone` ,
                            patientId: user_id,
                            color: cc,
                            dialyordia: "daily",
                            questionId: dr.id,
                        }
                        const insertQuery = `INSERT INTO readingalerts (Name,Type,Date,AlertText,patientId,color,dailyordia,questionId) VALUES ('${data.Name}' ,'${data.Type}','${data.Date}','${data.AlertText}','${data.patientId}','${data.color}','${data.dialyordia}',${data.questionId})`
                        try {
                            const res = await pool.query(insertQuery);
                            var alertId = Number(res.insertId);
                            await AddisReads(user_id,alertId,"daily");
                            return {
                                success: true,
                                data: "Alert Added Successfully",
                            };
                        } catch (error) {
                            console.log(error);
                            return {
                                success: false,
                                data: "Error while Adding Readings",
                            };
                            
                        }
                    }
                    
                }else{
                    lr = parseFloat(dr.low_range);
                    hr = parseFloat(dr.high_range);

                    if (inReadings >= hr || inReadings <= lr){
                        const data = {
                            Name: dr.title,
                            
                            Type: dr.type,
                            Date: date,
                            AlertText: dr.alertTextDoc? dr.alertTextDoc +`${readings}` : `The reading for ${dr.title} is ${readings} which is in the red zone`,
                            patientId: user_id,
                            color: "red",
                            dialyordia: "daily",
                            questionId: dr.id,
                        }
                        const insertQuery = `INSERT INTO readingalerts (Name  ,Type,Date,AlertText,patientId,color,dailyordia,questionId) VALUES ('${data.Name}' ,'${data.Type}','${data.Date}','${data.AlertText}','${data.patientId}','${data.color}','${data.dialyordia}',${data.questionId})`
                        try {
                            const res = await pool.query(insertQuery);
                            var alertId = Number(res.insertId);
                            await AddisReads(user_id,alertId,"daily");
                            console.log("Alert Added Successfully");
                            return {
                                success: true,
                                data: "Alert Added Successfully",
                            };
                        } catch (error) {
                            console.log(error);
                            return {
                                success: false,
                                data: "Error while Adding Readings",
                            };
                            
                        }
                    }
                }
                
            } catch (error) {
                console.log(error);
                return {
                    success: false,
                    data: "Error while Adding Readings",
                };
                
            }

        }
        else{
            const data ={
                Name: dr.title,
                
                Type: dr.type,
                Date: date,
                AlertText: dr.alertTextDoc? dr.alertTextDoc + `${readings}` :  `The response for ${dr.title} is ${readings}`,
                patientId: user_id,
                color: "red",
                dialyordia: "daily",
                questionId: dr.id,    
            }
            const insertQuery = `INSERT INTO readingalerts (Name  ,Type,Date,AlertText,patientId,color,dailyordia,questionId) VALUES ('${data.Name}' ,'${data.Type}','${data.Date}','${data.AlertText}','${data.patientId}','${data.color}','${data.dialyordia}',${data.questionId})`
            try {
                const res = await pool.query(insertQuery);
                var alertId = Number(res.insertId);
                await AddisReads(user_id,alertId,"daily");
                return {
                    success: true,
                    data: "Alert Added Successfully",
                };
            
                
            } catch (error) {
                console.log(error);
                return {
                    success: false,
                    data: "Error while Adding Readings",
                };
                
            }

        }      
    } catch (error) {
        console.log(error);
        return {
            success: false,
            data: "Error while Adding Readings",
        };
        
    }
}

const AddDialysisReadingsAlerts = async (question_id,user_id,date,readings) => {
    const checkQuery = `SELECT * FROM dialysis_readings WHERE id = '${question_id}'`
    try {
        var dr = await pool.query(checkQuery);
        dr = dr[0];
        var type = dr.type;
        if (type === 'Int' || type ==="Decimal"){
            let inReadings = parseFloat(readings);
            lr = parseFloat(dr.low_range);
            hr = parseFloat(dr.high_range);
            const checkCustomRangeQuery = `SELECT * FROM user_range_dialysis WHERE question_id = '${question_id}' AND user_id = '${user_id}'`
            try {
                var ur = await pool.query(checkCustomRangeQuery);
                ur = ur[0];
                if(ur){
                    lr = parseFloat(ur.low_range_1);
                    hr = parseFloat(ur.high_range_1);
                    lr2 = parseFloat(ur.low_range_2);
                    hr2 = parseFloat(ur.high_range_2);
                    var color = getAlertColor(inReadings,lr,hr,lr2,hr2);
                    if (color === "red" || color === "yellow"){
                        var cc = "red"
                        if (color === "yellow"){
                          cc = "orange"
                        }
                        const data = {
                            Name: dr.title,
                            
                            Type: dr.type,
                            Date: date,
                            AlertText: dr.alertTextDoc? dr.alertTextDoc +`${readings}` : `The reading for ${dr.title} is ${readings} which is in the ${color} zone`,
                            patientId: user_id,
                            color: cc,
                            dialyordia: "dialysis",
                            questionId: dr.id,
                        }
                        const insertQuery = `INSERT INTO readingalerts (Name  ,Type,Date,AlertText,patientId,color,dailyordia,questionId) VALUES ('${data.Name}' ,'${data.Type}','${data.Date}','${data.AlertText}','${data.patientId}','${data.color}','${data.dialyordia}',${data.questionId})`
                        try {
                            const res = await pool.query(insertQuery);
                            var alertId = Number(res.insertId);
                            await AddisReads(user_id,alertId,"dialysis");
                            return {
                                success: true,
                                data: "Alert Added Successfully",
                            };
                        } catch (error) {
                            console.log(error);
                            return {
                                success: false,
                                data: "Error while Adding Readings",
                            };
                            
                        }
                    }
                    
                }else{
                    lr = parseFloat(dr.low_range);
                    hr = parseFloat(dr.high_range);

                    if (inReadings >= hr || inReadings <= lr){
                        const data = {
                            Name: dr.title,
                            
                            Type: dr.type,
                            Date: date,
                            AlertText:dr.alertTextDoc? dr.alertTextDoc + `${readings}` : `The reading for ${dr.title} is ${readings} which is in the red zone`,
                            patientId: user_id,
                            color: "red",
                            dialyordia: "dialysis",
                            questionId: dr.id,
                        }
                        const insertQuery = `INSERT INTO readingalerts (Name  ,Type,Date,AlertText,patientId,color,dailyordia,questionId) VALUES ('${data.Name}' ,'${data.Type}','${data.Date}','${data.AlertText}','${data.patientId}','${data.color}','${data.dialyordia}',${data.questionId})`
                        try {
                            var res = await pool.query(insertQuery);
                            var alertId = Number(res.insertId);
                            await AddisReads(user_id,alertId,"dialysis");


                            console.log("Alert Added Successfully");
                            return {
                                success: true,
                                data: "Alert Added Successfully",
                            };
                        } catch (error) {
                            console.log(error);
                            return {
                                success: false,
                                data: "Error while Adding Readings",
                            };
                            
                        }
                    }
                }
                
            } catch (error) {
                console.log(error);
                return {
                    success: false,
                    data: "Error while Adding Readings",
                };
                
            }

        }
        else{
            const data ={
                Name: dr.title,
                
                Type: dr.type,
                Date: date,
                AlertText: dr.alertTextDoc ? dr.alertTextDoc + `${readings}` : `The response for ${dr.title} is ${readings}`,
                patientId: user_id,
                color: "red",
                dialyordia: "dialysis",
                questionId: dr.id,   
            }
            const insertQuery = `INSERT INTO readingalerts (Name  ,Type,Date,AlertText,patientId,color,dailyordia,questionId) VALUES ('${data.Name}' ,'${data.Type}','${data.Date}','${data.AlertText}','${data.patientId}','${data.color}','${data.dialyordia}',${data.questionId})`
            try {
                const res = await pool.query(insertQuery);
                var alertId = Number(res.insertId);
                await AddisReads(user_id,alertId,"dialysis");
                return {
                    success: true,
                    data: "Alert Added Successfully",
                };
            
                
            } catch (error) {
                console.log(error);
                return {
                    success: false,
                    data: "Error while Adding Readings",
                };
                
            }

        }      
    } catch (error) {
        console.log(error);
        return {
            success: false,
            data: "Error while Adding Readings",
        };
        
    }
    
}

const AddDailyReadingsAlertsAPI = async (req, res, next) => {
    const { question_id, user_id, date, readings } = req.body;
    try {
        await AddDailyReadingsAlerts(question_id,user_id,date,readings);
        return res.status(200).json({
            success: true,
            data: "Readings Added Successfully",
        });
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            data: "Error while Adding Readings",
        });
        
    }
};

const AddDialysisReadingsAlertsAPI = async (req, res, next) => {
    const { question_id, user_id, date, readings } = req.body;
    try {
        await AddDialysisReadingsAlerts(question_id,user_id,date,readings);
        return res.status(200).json({
            success: true,
            data: "Readings Added Successfully",
        });
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            data: "Error while Adding Readings",
        });
        
    }
};








module.exports = {
    AddDailyReadingsAlerts,
    AddDialysisReadingsAlerts,
    AddDailyReadingsAlertsAPI,
    AddDialysisReadingsAlertsAPI,
    updateIsRead
};