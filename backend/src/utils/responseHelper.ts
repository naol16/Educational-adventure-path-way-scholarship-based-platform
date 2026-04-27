import { Response } from "express";

export class ResponseHelper {
  /**
   * Sends a standardized success response.
   */
  static success(res: Response, data: any = null, message: string = "Success", statusCode: number = 200) {
    return res.status(statusCode).json({
      status: "success",
      message,
      data
    });
  }

  /**
   * Sends a standardized error response.
   */
  static error(res: Response, message: string = "Error", statusCode: number = 500, details: any = null) {
    return res.status(statusCode).json({
      status: "error",
      message,
      details
    });
  }
}
