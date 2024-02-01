class ApiResponse{
    constructor(statusCode,data,message="Success"){
        this.statusCode = statusCode;
        this.data = data;
        this.message= message;
        this.success = statusCode < 400  // usually success status codes 400 se neechay he hotay
    }
}

export {ApiResponse}