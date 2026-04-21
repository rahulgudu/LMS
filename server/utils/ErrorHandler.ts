class ErrorHandler extends Error {
    statusCode: Number;
  constructor(message: any, statusCode: number) {
    super(message);
    this.statusCode = statusCode as number;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ErrorHandler;
