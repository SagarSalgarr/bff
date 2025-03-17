import { Injectable, CACHE_MANAGER, Inject, Logger } from "@nestjs/common";
import { Cache } from "cache-manager";
import { ConfigService } from "@nestjs/config";
import { Language } from "../../language";
import { isMostlyEnglish } from "../../common/utils";
import { MonitoringService } from "../monitoring/monitoring.service";
import { HttpService } from '@nestjs/axios';
const fetch = require("../../common/fetch");
const nodefetch = require("node-fetch");
const { Headers } = require("node-fetch");
const path = require("path");
const filePath = path.resolve(__dirname, "../../common/en.json");
const engMessage = require(filePath);
import { PrismaService } from "src/global-services/prisma.service";
@Injectable()
export class AiToolsService {
  private logger: Logger;

  constructor(
    private configService: ConfigService,
    private readonly monitoringService: MonitoringService,
    private httpService: HttpService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private prismaService: PrismaService
  ) {
    this.logger = new Logger(AiToolsService.name);
  }

  async detectLanguage(text: string, userId: string, sessionId: string): Promise<any> {
    try {
      let input = {
        input: [
          {
            source: text,
          },
        ],
      };
  
      let response: any = await this.computeBhashini(
        this.configService.get('BHASHINI_DHRUVA_AUTHORIZATION'),
        'txt-lang-detection',
        'bhashini/iiiith/indic-lang-detection-all',
        this.configService.get('BHASHINI_DHRUVA_ENDPOINT'),
        {},
        input,
        userId,
        sessionId
      )
      if(response["error"]){
        this.logger.error(response["error"])
        throw new Error(response["error"])
      }
      let language: Language;
      if(response.output && response.output.length){
        language = response.data?.pipelineResponse[0]?.output[0]?.langPrediction[0]?.langCode as Language
        this.monitoringService.incrementBhashiniSuccessCount()
        return {
          language: language || 'unk',
          error: null
        }
      } else {
        this.monitoringService.incrementBhashiniFailureCount()
        return {
          language: 'unk',
          error: null
        }
      }
    } catch (error) {
      this.monitoringService.incrementBhashiniFailureCount();
      if (isMostlyEnglish(text?.replace("?", "")?.trim())) {
        return {
          language: Language.en,
          error: error.message,
        };
      } else {
        return {
          language: "unk",
          error: error.message,
        };
      }
    }
  }

  async translate(
    source: Language,
    target: Language,
    text: string,
    userId: string,
    sessionId: string,
    maxRetries = 3
  ) {
    try {
      const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/g;
      const urls = text.match(urlRegex) || [];
      const placeHolder = "9814567092798090023722437987555212294";
      const textWithoutUrls = text.replace(urlRegex, placeHolder);

      let config = {
        "language": {
          "sourceLanguage": source,
          "targetLanguage": target
        }
      }

      let bhashiniConfig: any = await this.getBhashiniConfig('translation', config, userId, sessionId);
      
      let textArray = textWithoutUrls.split("\n");
      let translatedArray = [];

      for(let i = 0; i < textArray.length; i++) {
        let retryCount = 0;
        let success = false;
        let lastError;

        while (retryCount < maxRetries && !success) {
          try {
            let response: any = await this.computeBhashini(
              bhashiniConfig?.pipelineInferenceAPIEndPoint?.inferenceApiKey?.value,
              "translation",
              bhashiniConfig?.pipelineResponseConfig[0].config[0].serviceId,
              bhashiniConfig?.pipelineInferenceAPIEndPoint?.callbackUrl,
              config,
              {
                input: [
                  {
                    "source": textArray[i]
                  }
                ]
              },
              userId,
              sessionId
            );

            // Add detailed logging
            this.logger.debug(`Translation response for chunk ${i}: ${JSON.stringify(response)}`);

            if (response["error"]) {
              throw new Error(response["error"]);
            }

            const translatedText = response?.pipelineResponse[0]?.output[0]?.target;
            if (!translatedText) {
              throw new Error('Empty translation response');
            }

            translatedArray.push(translatedText);
            success = true;

          } catch (error) {
            lastError = error;
            retryCount++;
            this.logger.warn(`Translation attempt ${retryCount} failed for chunk ${i}: ${error.message}`);
            
            // Wait before retrying (exponential backoff)
            if (retryCount < maxRetries) {
              await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
            }
          }
        }

        if (!success) {
          this.logger.error(`Failed to translate chunk ${i} after ${maxRetries} attempts`);
          throw lastError;
        }
      }

      const translatedText = translatedArray
        .join("\n")
        .replace(new RegExp(placeHolder, "g"), () => urls.shift() || "");

      return {
        text: translatedText,
        error: null,
      };

    } catch (error) {
      this.logger.error(`Translation failed: ${error.message}`);
      this.logger.error(`Stack trace: ${error.stack}`);
      return {
        text: "",
        error: error
      };
    }
  }

  async speechToText(
    base64audio: string,
    language: Language,
    userId: string,
    sessionId: string
  ) {
    try {
      let config: any = await this.getBhashiniConfig('asr',{
        "language": {
            "sourceLanguage": language
        }
      },userId,sessionId)
      let requestConfig = {
        language: {
          sourceLanguage: language,
        },
      };
      if (["kn", "ur", "ml", "gu", "pa"].indexOf(`${language}`) == -1) {
        requestConfig["postProcessors"] = ["itn"];
      }

      let response: any = await this.computeBhashini(
        config?.pipelineInferenceAPIEndPoint?.inferenceApiKey?.value,
        "asr",
        config?.pipelineResponseConfig[0].config[0].serviceId,
        config?.pipelineInferenceAPIEndPoint?.callbackUrl,
        requestConfig,
        {
          audio: [
            {
              "audioContent": base64audio
            }
          ]
        },
        userId,
        sessionId
      )
      if(response["error"]){
        this.logger.error(response["error"])
        throw new Error(response["error"])
      }
      return {
        text: response?.pipelineResponse[0]?.output[0]?.source,
        error: null,
      };
    } catch (error) {
      this.logger.error(error);
      return {
        text: "",
        error: error,
      };
    }
  }

  async textToSpeech(
    text: string,
    language: Language,
    audioGender: string = 'male',
    userId: string,
    sessionId: string
  ) {
    try {
      let config: any = await this.getBhashiniConfig('tts',{
        "language": {
            "sourceLanguage": language
        }
      },userId,sessionId)
  
      this.logger.debug('Bhashini Config:', JSON.stringify(config, null, 2));
      this.logger.debug('Service ID:', config?.pipelineResponseConfig[0].config[0].serviceId);

      let response: any = await this.computeBhashini(
        config?.pipelineInferenceAPIEndPoint?.inferenceApiKey?.value,
        "tts",
        config?.pipelineResponseConfig[0].config[0].serviceId,
        config?.pipelineInferenceAPIEndPoint?.callbackUrl,
        {
          language: {
            sourceLanguage: language,
          },
          gender: audioGender
        },
        {
          input: [
            {
              "source": text
            }
          ]
        },
        userId,
        sessionId
      )
      if(response["error"]){
        this.logger.error(response["error"])
        throw new Error(response["error"])
      }
      return {
        text: response?.pipelineResponse[0]?.audio[0]?.audioContent,
        error: null,
      };
    } catch (error) {
      this.logger.error(error);
      return {
        text: "",
        error: error,
      };
    }
  }

  async textClassification(text: string) {
    try {
      var myHeaders = new Headers();
      myHeaders.append("accept", "application/json");
      myHeaders.append("X-API-Key", this.configService.get("WADHWANI_API_KEY"));
      let response: any = await fetch(
        `${this.configService.get(
          "WADHWANI_BASE_URL"
        )}/detect_query_intent?query=${text}`,
        {
          headers: myHeaders,
          method: "GET",
          mode: "cors",
          credentials: "omit",
        }
      );
      response = await response.text();
      return response;
    } catch (error) {
      this.logger.error(error);
      return {
        error,
      };
    }
  }

  async getResponseViaWadhwani(
    sessionId: string,
    userId: string,
    text: string,
    schemeName: string
  ) {
    const startTime = new Date();
    
    try {
      var myHeaders = new Headers();
      myHeaders.append("accept", "application/json");
      myHeaders.append("X-API-Key", this.configService.get("WADHWANI_API_KEY"));

      let response: any = await fetch(
        `${this.configService.get("WADHWANI_BASE_URL")}/get_bot_response?query=${text}&user_id=${userId}&session_id=${sessionId}&scheme_name=${schemeName}`,
        {
          headers: myHeaders,
          "method": "GET",
          "mode": "cors",
          "credentials": "omit"
        }
      );

      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      // Store response time metrics
      await this.prismaService.apiResponseTime.create({
        data: {
          apiName: 'Wadhwani',
          endpoint: 'get_bot_response',
          startTime,
          endTime,
          duration,
          userId,
          sessionId,
          success: true,
          errorMsg: null
        }
      });

      const responseData = await response.json();
      
      this.logger.log(
        `Wadhwani API Response Time: ${duration}ms`,
        `userId: ${userId}`,
        `sessionId: ${sessionId}`
      );

      // When storing the message, convert content to string if needed
      await this.prismaService.message.create({
        data: {
          text: typeof responseData.message === 'string' 
            ? responseData.message 
            : JSON.stringify(responseData.message),
          type: 'System',
          userId,
          flowId: sessionId,
          messageType: 'final_response',
          content: responseData // This will be stored in the Json field
        }
      });

      return responseData;

    } catch (error) {
      const endTime = new Date();
      
      // Store error metrics
      await this.prismaService.apiResponseTime.create({
        data: {
          apiName: 'Wadhwani',
          endpoint: 'get_bot_response',
          startTime,
          endTime,
          duration: endTime.getTime() - startTime.getTime(),
          userId,
          sessionId,
          success: false,
          errorMsg: error.message
        }
      });

      this.logger.error(error);
      return { error };
    }
  }

  async getBhashiniConfig(task,config,userId, sessionId) {
    const cacheKey = `getBhashiniConfig:${JSON.stringify({ task, config })}`;

    const cachedData = await this.cacheManager.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    var myHeaders = new Headers();
    myHeaders.append("userID", this.configService.get("ULCA_USER_ID"));
    myHeaders.append("ulcaApiKey", this.configService.get("ULCA_API_KEY"));
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
      pipelineTasks: [
        {
          taskType: task,
          config: config,
        },
      ],
      pipelineRequestConfig: {
        pipelineId: "64392f96daac500b55c543cd",
      },
    });

    var requestOptions: any = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
      retry: 4,
      pause: 0,
      url: this.configService.get("ULCA_CONFIG_URL"),
      userId,
      sessionId,
      callback: null,
      timeout: this.configService.get("BHASHINI_API_TIMEOUT") || 30000
    };

    requestOptions.callback = function (retry) {
      const elapsed = Date.now() - this.startTime;
      this.logger.error(`userId: ${this.userId} sessionId: ${this.sessionId} URL: ${this.url} (config API) Re-Trying: ${retry}, Previous failed call Time Taken: ${elapsed}ms`);
    }.bind({...requestOptions, logger: this.logger});

    try{
      this.monitoringService.incrementBhashiniCount()
      let startDate = new Date();
      this.logger.log(`${startDate}: userId: ${userId} sessionId: ${sessionId} Waiting for ${this.configService.get("ULCA_CONFIG_URL")} (config API) to respond ...`)
      let response  = await fetch(this.configService.get("ULCA_CONFIG_URL"), requestOptions)
      if(response.status != 200){
        this.logger.error(response)
        throw new Error(`${new Date()}: API call to '${this.configService.get("ULCA_CONFIG_URL")}' with config '${JSON.stringify(config,null,3)}' failed with status code ${response.status}`)
      }
      let endDate = new Date();
      response = await response.json()
      this.logger.log(`${endDate}: userId: ${userId} sessionId: ${sessionId} URL: ${this.configService.get("ULCA_CONFIG_URL")} (config API) Responded succesfully in ${endDate.getTime()-startDate.getTime()} ms.`)
      this.monitoringService.incrementBhashiniSuccessCount()
      await this.cacheManager.set(cacheKey, response, 86400);
      this.logger.debug('Bhashini Config:', JSON.stringify(response, null, 2));
      this.logger.debug('Service ID:', response?.pipelineResponseConfig[0].config[0].serviceId);
      return response;
    } catch (error) {
      this.monitoringService.incrementBhashiniFailureCount();
      this.logger.error(error);
      return {
        error,
      };
    }
  }

  async computeBhashini(authorization, task, serviceId, url, config, input, userId, sessionId) {
    const taskType = task;
    this.logger.log(`[${taskType}] Starting Bhashini API call for user ${userId}`);
    this.logger.debug(`[${taskType}] Config: ${JSON.stringify({
        task,
        serviceId,
        config,
        inputSample: input?.input?.[0]?.source?.substring(0, 50) + '...'
    })}`);

    // Cache check (except for ASR)
    const cacheKey = `computeBhashini:${JSON.stringify({ task, serviceId, url, config, input })}`;
    if (task != 'asr') {
        const cachedData = await this.cacheManager.get(cacheKey);
        if (cachedData) {
            this.logger.log(`[${taskType}] Cache hit for ${cacheKey}`);
            return cachedData;
        }
    }

    try {
        var myHeaders = new Headers();
        myHeaders.append("Accept", "*/*");
        myHeaders.append("Authorization", authorization);
        myHeaders.append("Content-Type", "application/json");

        // Log service configuration
        this.logger.debug(`[${taskType}] Using service ID: ${serviceId}`);
        this.logger.debug(`[${taskType}] Endpoint URL: ${url}`);

        config["serviceId"] = serviceId;
        if (task === "tts") {
            if (!config["gender"]) {
                config["gender"] = "male";
            }
            config["samplingRate"] = 8000;
        }

        var raw = JSON.stringify({
            pipelineTasks: [
                {
                    taskType: task,
                    config: config,
                }
            ],
            inputData: input,
        });

        // Log the complete request payload
        this.logger.debug(`[${taskType}] Request Payload: ${raw}`);

        var requestOptions: any = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: 'follow',
            retry: 4,
            pause: 0,
            startTime: Date.now(),
            url,
            task,
            userId,
            sessionId,
            callback: null,
            timeout: this.configService.get("BHASHINI_API_TIMEOUT") || 30000
        };

        // Enhanced error callback
        requestOptions.callback = function (retry, error) {
            const elapsed = Date.now() - this.startTime;
            const errorType = error?.name || 'Unknown';
            const errorMessage = error?.message || 'No error message';

            this.logger.error(`[${this.task.toUpperCase()}] Attempt ${retry} failed:
                - User: ${this.userId}
                - Session: ${this.sessionId}
                - URL: ${this.url}
                - Error Type: ${errorType}
                - Error Message: ${errorMessage}
                - Time Taken: ${elapsed}ms`);
        }.bind({ ...requestOptions, logger: this.logger });

        this.logger.log(`[${taskType}] Making request to Bhashini API...`);
        const startTime = Date.now();

        const response = await fetch(url, requestOptions);
        const endTime = Date.now();

        // Log the response status and time
        this.logger.log(`[${taskType}] Response received in ${endTime - startTime}ms
            Status: ${response.status}
            Status Text: ${response.statusText}`);

        if (!response.ok) {
            // Log the response body to get more context about the error
            const responseText = await response.text();
            this.logger.error(`[${taskType}] Non-OK response text: ${responseText}`);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Parse and log the JSON response
        const responseData = await response.json();
        this.logger.debug(`[${taskType}] Complete response: ${JSON.stringify(responseData)}`);

        if (!responseData?.pipelineResponse) {
            this.logger.error(`[${taskType}] Response missing pipelineResponse: ${JSON.stringify(responseData)}`);
            throw new Error('Invalid response structure from Bhashini API');
        }

        // Cache successful responses (except ASR)
        if (task !== 'asr' && responseData) {
            await this.cacheManager.set(cacheKey, responseData);
        }

        return responseData;

    } catch (error) {
        const errorDetails = {
            type: error.name,
            message: error.message,
            stack: error.stack,
            task: taskType,
            userId,
            sessionId,
            serviceId,
            url
        };
        
        this.logger.error(`[${taskType}] Bhashini API call failed:
            Error Type: ${errorDetails.type}
            Message: ${errorDetails.message}
            Service ID: ${serviceId}
            Task: ${task}
            User: ${userId}`);
        
        this.logger.debug(`[${taskType}] Full error details: ${JSON.stringify(errorDetails)}`);
        this.logger.error(`[${taskType}] Complete error details:`, {
            error: error.message,
            stack: error.stack,
            requestPayload: {
                task,
                serviceId,
                config,
                input
            }
        });
        
        throw error;
    }
  }
}
