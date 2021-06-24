exports.jsonResponse = function(responseData, message, statusCode){
  return {
    errorCode: statusCode,
    error: statusCode === 200 ? "Exitoso" : "Error",
    message: message,
    date: new Date(),
    data: responseData
  }
}