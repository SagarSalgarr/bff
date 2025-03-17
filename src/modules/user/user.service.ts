import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../global-services/prisma.service";
import { ConfigService } from "@nestjs/config";
import axios from "axios";
import { decryptRequest, encrypt, encryptRequest } from "../../common/utils";
import { Message } from "@prisma/client";
import { MonitoringService } from "../monitoring/monitoring.service";
import { getUniqueKey } from "../../common/utils";

@Injectable()
export class UserService {
  private logger: Logger;
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private monitoringService: MonitoringService
  ) {
    this.logger = new Logger('main');
  }

  async sendOTP(mobileNumber: string, type: string = "Mobile"): Promise<any> {
    try {
      // let encryptedData = await encryptRequest(
      //   `{\"Types\":\"${type}\",\"Values\":\"${mobileNumber}\",\"Token\":\"${this.configService.get(
      //     "PM_KISSAN_TOKEN"
      //   )}\"}`
      // );
      let key = getUniqueKey();
      let requestData = `{\"Types\":\"${type}\",\"Values\":\"${mobileNumber}\",\"Token\":\"${this.configService.get("PM_KISSAN_TOKEN")}\"}`;
      console.log("Request data: ", requestData);
      let encrypted_text = await encrypt(requestData, key); //without @

      console.log("encrypted text without @: ", encrypted_text);
      // let data = JSON.stringify({
      //   EncryptedRequest: `${encryptedData.d.encryptedvalu}@${encryptedData.d.token}`,
      // });
      let data = {
       "EncryptedRequest":`${encrypted_text}@${key}`
      };
      
      console.log("(in sendOTP)the data in the data var is as: ", data);

      let config = {
        method: "post",
        maxBodyLength: Infinity,
        // url: `${this.configService.get("PM_KISAN_BASE_URL")}/chatbototp`,
        url: "https://pmkisanstaging.amnex.co.in/pmkisanstaging/ChatbotserviceStaging.asmx/ChatbotOTP",
        headers: {
          "Content-Type": "application/json",
        },
        data: data,
      };
      let response: any = await axios.request(config);
      this.logger.log("sendOTP", response.status);
      if (response.status >= 200 && response.status < 300) {
        response = await response.data;
        let decryptedData: any = await decryptRequest(
          response.d.output,
          key
        );
        const parsedData = JSON.parse(decryptedData); 
        console.log("Response from decryptedData(sendOTP)",parsedData);// Convert JSON string to an object
        // const values = parsedData.Values; // Access the Values property
        // console.log("Values:", values);
        response.d.output = parsedData;
        response["status"] =
          response.d.output.Rsponce != "False" ? "OK" : "NOT_OK";
        return response;
      } else {
        return {
          d: {
            output: {
              status: "False",
              Message: "Try again",
            },
          },
        };
      }
    } catch (error) {
      console.error("Error in sendOTP:", error.message, error.response?.data || error);
      return {
        d: {
          output: {
            status: "False",
            Message: "Try again",
          },
        },
      };
    }
  }

  async verifyOTP(
    mobileNumber: string,
    otp: string,
    type: string = "Mobile"
  ): Promise<any> {
    try {
      // let encryptedData = await encryptRequest(
      //   `{\"Types\":\"${type}\",\"Values\":\"${mobileNumber}\",\"OTP\":\"${otp}\",\"Token\":\"${this.configService.get(
      //     "PM_KISSAN_TOKEN"
      //   )}\"}`
      // );
      // const requestData = `{\"Types\":\"${type}\",\"Values\":\"${mobileNumber}\",\"Token\":\"${this.configService.get("PM_KISSAN_TOKEN")}\"}`;
      let requestData = `{\"Types\":\"${type}\",\"Values\":\"${mobileNumber}\",\"OTP\":\"${otp}\",\"Token\":,\"${this.configService.get("PM_KISSAN_TOKEN")}\"}`;
      console.log("Request data: ", requestData);
      let key = getUniqueKey();
      // const requestData = JSON.stringify({
      //   Types: type,
      //   Values: mobileNumber,
      //   Token: ""
      // });
      let encrypted_text = await encrypt(requestData, key); //without @
      

      console.log("encrypted text without @: ", encrypted_text);
      
      // let data = JSON.stringify({
      //   EncryptedRequest: `${encryptedData.d.encryptedvalu}@${encryptedData.d.token}`,
      // });
      let data = {
        // EncryptedRequest: `${encryptedData}`
        "EncryptedRequest": `${encrypted_text}@${key}`,
      };
      console.log("(inside verifyOTP)the data in the data var is : ", data);
      let config = {
        method: "post",
        maxBodyLength: Infinity,
        // url: `${this.configService.get(
        //   "PM_KISAN_BASE_URL"
        // )}/ChatbotOTPVerified`,
        url: "https://pmkisanstaging.amnex.co.in/pmkisanstaging/ChatbotserviceStaging.asmx/ChatbotOTPVerified",
        headers: {
          "Content-Type": "application/json",
        },
        data: data,
      };

      let response: any = await axios.request(config);
      this.logger.log("verifyOTP", response.status);
      if (response.status >= 200 && response.status < 300) {
        response = await response.data;
        let decryptedData: any = await decryptRequest(
          response.d.output,
          key
        );
        console.log("Response of VerifyOTP",response);
        console.log("Response from decryptedData(verifyOTP)",decryptedData);
        // response.d.output = JSON.parse(decryptedData);
        response["status"] =
          response.d.output.Rsponce != "False" ? "OK" : "NOT_OK";
        return response;
      } else {
        return {
          d: {
            output: {
              status: "False",
              Message: "Try again",
            },
          },
        };
      }
    } catch (error) {
      this.logger.error(error);
      return {
        d: {
          output: {
            status: "False",
            Message: "Try again",
          },
        },
      };
    }
  }

  async getUserData(
    mobileNumber: string,
    type: string = "Mobile"
  ): Promise<any> {
    let res: any;
    try {
      // let encryptedData = await encryptRequest(
      //   `{\"Types\":\"${type}\",\"Values\":\"${mobileNumber}\",\"Token\":\"${this.configService.get(
      //     "PM_KISSAN_TOKEN"
      //   )}\"}`
      // );
      const requestData = `{\"Types\":\"${type}\",\"Values\":\"${mobileNumber}\",\"Token\":\"${this.configService.get("PM_KISSAN_TOKEN")}\"}`;
      console.log("Request data: ", requestData);
      let key = getUniqueKey();
      // const requestData = JSON.stringify({
      //   Types: type,
      //   Values: mobileNumber,
      //   Token: ""
      // });
      let encrypted_text = await encrypt(requestData, key); //without @
      console.log("encrypted text without @: ", encrypted_text);
      // let data = JSON.stringify({
      //   EncryptedRequest: `${encryptedData.d.encryptedvalu}@${encryptedData.d.token}`,
      // });
      let data = {
        "EncryptedRequest": `${encrypted_text}@${key}`,
      };

      let config = {
        method: "post",
        maxBodyLength: Infinity,
        // url: `${this.configService.get(
        //   "PM_KISAN_BASE_URL"
        // )}/ChatbotUserDetails`,
        url: "https://pmkisanstaging.amnex.co.in/pmkisanstaging/ChatbotserviceStaging.asmx/ChatbotUserDetails",
        headers: {
          "Content-Type": "application/json",
        },
        data: data,
      };
      res = await axios.request(config);
      this.logger.log("getUserData", res.status);
      if (res.status >= 200 && res.status < 300) {
        res = await res.data;
        let decryptedData: any = await decryptRequest(
          res.d.output,
          key
        );
        console.log("Response of getUserData",res);
        console.log("decrypted data(from getUserData): ", decryptedData);
        res.d.output = JSON.parse(decryptedData);
        res["status"] = res.d.output.Rsponce != "False" ? "OK" : "NOT_OK";
      } else {
        this.monitoringService.incrementUnableToGetUserDetailsCount();
        res = {
          d: {
            output: {
              status: "False",
              Message: "Unable to get user details",
            },
          },
        };
      }
    } catch (error) {
      this.monitoringService.incrementUnableToGetUserDetailsCount();
      return {
        d: {
          output: {
            status: "False",
            Message: "Unable to get user details",
          },
        },
      };
    }
    return res;
  }

  async likeQuery(id): Promise<Message> {
    // try {
    await this.prisma.$queryRawUnsafe(`
        UPDATE "Message" SET 
        "reaction" = 1
        WHERE "id" = '${id}'`);
    // } catch {
    //   return null;
    // }
    this.monitoringService.incrementPositveFeedbackCount();
    return this.prisma.$queryRawUnsafe(`
      SELECT * from "Message" where id = '${id}'
    `);
  }

  async dislikeQuery(id): Promise<Message> {
    try {
      await this.prisma.$queryRawUnsafe(`
        UPDATE "Message" SET 
        "reaction" = -1
        WHERE "id" = '${id}'`);
      this.monitoringService.incrementNegativeFeedbackCount();
    } catch {
      return null;
    }
    return this.prisma.$queryRawUnsafe(`
      SELECT * from "Message" where id = '${id}'
    `);
  }

  async removeReactionOnQuery(id): Promise<Message> {
    try {
      await this.prisma.$queryRawUnsafe(`
        UPDATE "Message" SET 
        "reaction" = 0
        WHERE "id" = '${id}'`);
    } catch {
      return null;
    }
    return this.prisma.$queryRawUnsafe(`
      SELECT * from "Message" where id = '${id}'
    `);
  }

  async validatePhoneNumber(mobileNumber: string): Promise<boolean> {
    try {
      // Basic phone number validation regex for Indian numbers
      const phoneRegex = /^[6-9]\d{9}$/;
      return phoneRegex.test(mobileNumber);
    } catch (error) {
      this.logger.error(`Phone validation failed for ${mobileNumber}:`, error);
      return false;
    }
  }
}
