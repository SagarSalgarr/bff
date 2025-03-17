import {
  Controller,
  Get,
  Post,
  Headers,
  Body,
  Param,
  CACHE_MANAGER,
  Inject,
  Logger
} from "@nestjs/common";
import { AppService, Prompt } from "./app.service";
import { IsNotEmpty, IsUUID, IsOptional } from "class-validator";
import { interpret } from "xstate";
import { Language } from "./language";
import { ConfigService } from "@nestjs/config";
import { AiToolsService } from "./modules/aiTools/ai-tools.service";
import {
  formatStringsToTable,
  removeLinks,
  wordToNumber,
} from "./common/utils";
import { ConversationService } from "./modules/conversation/conversation.service";
import { PrismaService } from "./global-services/prisma.service";
import { MonitoringService } from "./modules/monitoring/monitoring.service";
import { PromptServices } from "./xstate/prompt/prompt.service";
import { SoilhealthcardService } from "./modules/soilhealthcard/soilhealthcard.service";
import { Cache } from "cache-manager";
import { HttpService } from '@nestjs/axios';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiHeader } from '@nestjs/swagger';
const uuid = require("uuid");
const path = require("path");
const filePath = path.resolve(__dirname, "./common/en.json");
const engMessage = require(filePath);
const argon2 = require("argon2");

export class PromptDto {
  @IsNotEmpty()
  type: "Text" | "Audio";
  @IsNotEmpty()
  text: string;
  @IsNotEmpty()
  @IsUUID()
  userId: string;
  @IsOptional()
  inputLanguage?: string;
  @IsOptional()
  media?: string;
  @IsOptional()
  appId?: string;
  @IsOptional()
  channel?: string;
  @IsOptional()
  @IsUUID()
  from?: string;
  @IsOptional()
  context?: string;
  @IsOptional()
  to?: string;
  @IsOptional()
  @IsUUID()
  messageId?: string;
  @IsOptional()
  @IsUUID()
  conversationId?: string;
  @IsOptional()
  identifier?: string;
}

@ApiTags('App')
@Controller()
export class AppController {
  private configService: ConfigService;
  private aiToolsService: AiToolsService;
  private conversationService: ConversationService;
  private prismaService: PrismaService;
  private promptService: PromptServices;
  private soilHealthCardService: SoilhealthcardService;
  private logger: Logger;

  constructor(
    private readonly appService: AppService,
    private readonly monitoringService: MonitoringService,
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {
    this.prismaService = new PrismaService();
    this.configService = new ConfigService();
    this.soilHealthCardService = new SoilhealthcardService(
      this.configService,
      this.httpService,
    );
    this.aiToolsService = new AiToolsService(
      this.configService,
      this.monitoringService,
      this.httpService,
      this.cacheManager,
      this.prismaService
    );
    this.conversationService = new ConversationService(
      this.prismaService,
      this.configService
    );
    this.promptService = new PromptServices(
      this.prismaService,
      this.configService,
      this.aiToolsService,
      this.monitoringService,
      this.soilHealthCardService,
    );
    this.logger = new Logger(AppService.name);
  }

  @ApiOperation({ summary: 'Get hello message' })
  @ApiResponse({ status: 200, description: 'Returns hello message' })
  @Get("/")
  getHello(): string {
    return this.appService.getHello();
  }

  @ApiOperation({ summary: 'Process user prompt' })
  @ApiParam({ name: 'configid', description: 'Configuration ID' })
  @ApiBody({ type: PromptDto })
  @ApiHeader({ name: 'user-id', description: 'User ID' })
  @ApiHeader({ name: 'session-id', description: 'Session ID' })
  @ApiResponse({ status: 200, description: 'Returns processed prompt response' })
  @ApiResponse({ status: 400, description: 'Missing required headers' })
  @Post("/prompt/:configid")
  async prompt(
    @Body() promptDto: any,
    @Headers() headers,
    @Param("configid") configid: string
  ): Promise<any> {
    let startTime = Date.now();
    //get userId from headers
    const userId = headers["user-id"];
    const sessionId = headers["session-id"];
    this.logger.log("userId =", userId);
    this.logger.log("sessionId =", sessionId);
    if (!userId) {
      return {
        text: "",
        error: "'user-id' should not be empty",
      };
    }
    if (!sessionId) {
      return {
        text: "",
        error: "'session-id' should not be empty",
      };
    }
    let messageType = "intermediate_response";
    //create or get user and conversation
    let user;
    try {
      user = await this.prismaService.user.findUnique({
        where: {
          id: userId,
        },
      });
    } catch {
      this.monitoringService.incrementTotalSessionsCount();
    }
    if (!user) {
      user = await this.prismaService.user.create({
        data: {
          id: userId,
        },
      });
    }

    //input setup
    let prompt: Prompt = {
      input: promptDto,
    };
    let userInput = promptDto.text;
    let type = "text";

    let defaultContext = {
      sessionId,
      userId,
      userQuestion: "",
      query: "",
      queryType: "",
      response: "",
      userAadhaarNumber:
        user.identifier && configid == "3" ? user.identifier : "",
      otp: "",
      error: "",
      currentState: "getUserQuestion",
      type: "",
      inputType: type,
      inputLanguage: prompt.inputLanguage,
      lastAadhaarDigits: "",
      state: "onGoing",
      isOTPVerified: false,
      schemeName:
        promptDto.schemeName && promptDto.schemeName.trim() !== ""
          ? promptDto.schemeName
          : "PM Kisan",
    };

    let conversation = await this.conversationService.getConversationState(
      sessionId,
      userId,
      defaultContext,
      configid
    )
    
    // this.logger.log("fetched conversation: ", conversation)
    //handle text and audio
    if (promptDto.text) {
      type = "Text";
      let detectLanguageStartTime = Date.now();
      if (/^\d+$/.test(userInput)) {
        prompt.inputLanguage = Language.en;
      } else {
        // this.logger.log("IN ELSE....")
        try {
          let response = await this.aiToolsService.detectLanguage(userInput, userId, sessionId)
          prompt.inputLanguage = response["language"] as Language 
        } catch (error) {
        }
        // this.logger.log("LANGUAGE DETECTED...")
        //@ts-ignore
        if (prompt.inputLanguage == "unk") {
          prompt.inputLanguage = prompt.input.inputLanguage as Language;
        }
      }
    } else if (promptDto.media) {
      let audioStartTime = Date.now();
      if (promptDto.media.category == "base64audio" && promptDto.media.text) {
        type = "Audio";
        prompt.inputLanguage = promptDto.inputLanguage as Language;
        let response;
        if(['askingAadhaarNumber','askingOTP','askLastAaadhaarDigits','confirmInput2','confirmInput3','confirmInput4'].indexOf(conversation?.currentState) != -1) 
          response = await this.aiToolsService.speechToText(promptDto.media.text,Language.en,userId,sessionId)
        else
          response = await this.aiToolsService.speechToText(promptDto.media.text,prompt.inputLanguage,userId,sessionId)

        if (response.error) {
          this.logger.error(response.error);
          this.monitoringService.incrementTotalFailureSessionsCount();
          this.monitoringService.incrementSomethingWentWrongTryAgainCount();
          return {
            text: "",
            error: "Something went wrong, please try again.",
            conversationId: conversation?.id,
          };
        }
        userInput = response["text"];
      } else {
        this.monitoringService.incrementUnsupportedMediaCount();
        this.logger.error("Unsupported media");
        return {
          text: "",
          media: promptDto.media,
          mediaCaption: "",
          error: "Unsupported media",
          conversationId: conversation?.id,
        };
      }
    }

    conversation.inputType = type;
    // this.logger.log("CP 1...")
    //get flow
    let botFlowMachine;
    switch (configid) {
      case "1":
        botFlowMachine = this.promptService.getXstateMachine("botFlowMachine1");
        break;
      case "2":
        botFlowMachine = this.promptService.getXstateMachine("botFlowMachine2");
        break;
      case "3":
        botFlowMachine = this.promptService.getXstateMachine("botFlowMachine3");
        break;
      default:
        botFlowMachine = this.promptService.getXstateMachine("botFlowMachine3");
    }

    let botFlowService = interpret(
      botFlowMachine.withContext(conversation || defaultContext)
    ).start();
    if (
      (botFlowService.state.context.currentState == "askingAadhaarNumber" ||
        botFlowService.state.context.currentState == "confirmInput2") &&
      type == "Text"
    ) {
      let hashedAadhaar = await argon2.hash(promptDto.text);
      this.logger.log("you have entered aadhaar", hashedAadhaar);
      await this.prismaService.message.create({
        data: {
          text: hashedAadhaar,
          // audio: type=="Audio"?promptDto.media.text:null,
          audio: null,
          type: "User",
          userId,
          flowId: configid || '3',
          messageType
        }
      })
    }else {
      // this.logger.log("creating a new message in Message table...")
      await this.prismaService.message.create({
        data: {
          text: type == "Text" ? promptDto.text : null,
          // audio: type=="Audio"?promptDto.media.text:null,
          audio: null,
          type: "User",
          userId,
          flowId: configid || "3",
          messageType,
        },
      });
    }
    let isNumber = false;

    if (
      type == "Audio" &&
      (botFlowService.state.context.currentState == "confirmInput1" ||
        botFlowService.state.context.currentState == "getUserQuestion")
    ) {
      let audioStartTime = Date.now();
      let res = {
        text: userInput,
        textInEnglish: "",
        error: null
      }
      res['audio'] = await this.aiToolsService.textToSpeech(res.text,prompt.inputLanguage,promptDto.audioGender,userId,sessionId)
      if(res['audio']['error']){
      }
      res["messageId"] = uuid.v4();
      res["conversationId"] = conversation?.id;
      return res;
    } else {
      //translate to english
      // this.logger.log("Translating to English...")
      let translateStartTime = Date.now();
      if (userInput == "resend OTP") {
        this.monitoringService.incrementResentOTPCount();
      }
      if (prompt.inputLanguage != Language.en && userInput != "resend OTP") {
        try {
          let response = await this.aiToolsService.translate(
            prompt.inputLanguage as Language,
            Language.en,
            userInput,
            userId,
            sessionId
          )
          if(!response['text']) {
            this.logger.error(
              "Sorry, We are unable to translate given input, please try again"
            );
            this.monitoringService.incrementTotalFailureSessionsCount();
            this.monitoringService.incrementUnableToTranslateCount();
            return {
              error:
                "Sorry, We are unable to translate given input, please try again",
              conversationId: conversation?.id,
            };
          }
          prompt.inputTextInEnglish = response["text"];
        } catch (error) {
          this.logger.error(
            "Sorry, We are unable to translate given input, please try again"
          );
          this.monitoringService.incrementTotalFailureSessionsCount();
          this.monitoringService.incrementUnableToTranslateCount();
          return {
            error:
              "Sorry, We are unable to translate given input, please try again",
            conversationId: conversation?.id,
          };
        }
      } else {
        prompt.inputTextInEnglish = userInput;
      }

      if (
        type == "Audio" &&
        [
          "askingAadhaarNumber",
          "askingOTP",
          "askLastAaadhaarDigits",
          "confirmInput2",
          "confirmInput3",
          "confirmInput4",
        ].indexOf(botFlowService.state.context.currentState) != -1
      ) {
        let isOTP =
          [
            "askingOTP",
            "askLastAaadhaarDigits",
            "confirmInput3",
            "confirmInput4",
          ].indexOf(botFlowService.state.context.currentState) != -1;
        let number = wordToNumber(
          prompt.inputTextInEnglish,
          isOTP ? "otp" : "benId"
        );
        if (
          ((/^[6-9]\d{9}$/.test(number)) || 
          (number.length == 14 && /^[6-9]\d{9}$/.test(number.substring(0, 10))) || 
          (number.length == 12 && /^\d+$/.test(number))  ||
          (number.length == 11)) || 
          (isOTP && number.length==4)
        ) {
          prompt.inputTextInEnglish = number.toUpperCase();
          if (prompt.inputTextInEnglish == "")
            prompt.inputTextInEnglish = isOTP ? "1111" : "AB123123123";
          isNumber = true;
        }
      }
    }

    const currentContext = botFlowService.state.context;
    let updatedContext = {
      ...currentContext,
      inputType: type,
      type: "",
    };
    botFlowService.state.context = updatedContext;

    botFlowService.send("USER_INPUT", { data: prompt.inputTextInEnglish });

    await new Promise((resolve) => {
      botFlowService.subscribe((state) => {
        updatedContext = {
          ...state.context,
          //@ts-ignore
          currentState: state.value,
        };
        botFlowService.state.context = updatedContext;
        if (state.context.type == "pause") {
          resolve(state);
        }
      });
      botFlowService.onDone((state) => {
        const currentContext = botFlowService.state.context;
        let updatedContext = {
          ...currentContext,
          state: "Done",
        };
        botFlowService.state.context = updatedContext;
        resolve(state);
      });
    });

    let result = {
      textInEnglish: botFlowService.getSnapshot().context.response,
      text: botFlowService.getSnapshot().context.response,
      error: null,
      audio: null,
    };
    if (botFlowService.getSnapshot().context.error) {
      const currentContext = botFlowService.state.context;
      let updatedContext = {
        ...currentContext,
        state: "Done",
      };
      botFlowService.state.context = updatedContext;
      result.textInEnglish = null;
      result.text = null;
      result.error = botFlowService.getSnapshot().context.error;
    }
    prompt.inputLanguage = promptDto.inputLanguage;

    if (result.text) {
      let placeholder;
      if (
        result.text == engMessage["label.popUpTitle"] ||
        result.text == engMessage["label.popUpTitleValid"] ||
        result.text == engMessage["label.noRecordsFound"]
      ) {
        placeholder = engMessage["label.popUpTitle.short"];
      } else if (result.text == engMessage["label.popUpTitle2"]) {
        placeholder = engMessage["label.popUpTitle2.short"];
      } else if (result.text == engMessage["label.popUpTitle3"]) {
        placeholder = engMessage["label.popUpTitle3.short"];
      } else if (result.text == engMessage["label.invalid_question"]) {
        placeholder = engMessage["label.popUpTitle.short"];
      }
      if (prompt.inputLanguage != Language.en && !isNumber) {
        try {
          let response = await this.aiToolsService.translate(
            Language.en,
            prompt.inputLanguage as Language,
            result.text,
            userId,
            sessionId
          )
          if(!response['text']){
            this.logger.error(
              "Sorry, We are unable to translate given input, please try again"
            );
            this.monitoringService.incrementTotalFailureSessionsCount();
            this.monitoringService.incrementUnableToTranslateCount();
            result.error =
              "Sorry, We are unable to translate given input, please try again";
          }
          result.text = response["text"];
        } catch (error) {
          this.logger.error(error);
          this.monitoringService.incrementTotalFailureSessionsCount();
          this.monitoringService.incrementUnableToTranslateCount();
          return {
            error:
              "Sorry, We are unable to translate given input, please try again",
            conversationId: conversation?.id,
          };
        }
      }
      if (prompt.inputLanguage != Language.en && placeholder) {
        try {
          let response = await this.aiToolsService.translate(
            Language.en,
            prompt.inputLanguage as Language,
            placeholder,
            userId,
            sessionId
          )
          if(!response['text']){
            this.logger.error(
              "Sorry, We are unable to translate given input, please try again"
            );
            this.monitoringService.incrementTotalFailureSessionsCount();
            this.monitoringService.incrementUnableToTranslateCount();
            result.error =
              "Sorry, We are unable to translate given input, please try again";
          }
          result["placeholder"] = response["text"];
        } catch (error) {
          this.logger.error(error);
          this.monitoringService.incrementTotalFailureSessionsCount();
          this.monitoringService.incrementUnableToTranslateCount();
          return {
            error:
              "Sorry, We are unable to translate given input, please try again",
            conversationId: conversation?.id,
          };
        }
      } else if (placeholder) {
        result["placeholder"] = placeholder;
      }
      try {
        let textToaudio = result.text;
        if (botFlowService.state.context.currentState == "endFlow") {
          this.monitoringService.incrementTotalSuccessfullSessionsCount();
          switch (prompt.inputLanguage) {
            case Language.hi:
              this.monitoringService.incrementTotalSessionsInHindiCount();
              break;
            case Language.ta:
              this.monitoringService.incrementTotalSessionsInTamilCount();
              break;
            case Language.or:
              this.monitoringService.incrementTotalSessionsInOdiaCount();
              break;
            case Language.te:
              this.monitoringService.incrementTotalSessionsInTeluguCount();
              break;
            case Language.mr:
              this.monitoringService.incrementTotalSessionsInMarathiCount();
              break;
            case Language.bn:
              this.monitoringService.incrementTotalSessionsInBanglaCount();
              break;
            case Language.en:
              this.monitoringService.incrementTotalSessionsInEnglishCount();
              break;
            default:
              this.monitoringService.incrementTotalSessionsInEnglishCount();
              break;
          }
          messageType =
            botFlowService.state.context.queryType == "convo"
              ? "convo_response"
              : "final_response";
          if (botFlowService.state.context.isWadhwaniResponse == "false") {
            let resArray = result.text.split("\n");
            let compareText = result.textInEnglish.split("\n");
            if (
              compareText[compareText.length - 1].slice(0, 12) == "Registration"
            ) {
              textToaudio = "";
            } else {
              textToaudio = resArray.pop();
            }
            result.text = `${formatStringsToTable(resArray)}\n${textToaudio}`;
          }
        }
        let audioStartTime = Date.now();
        textToaudio = removeLinks(textToaudio)
        result['audio'] = await this.aiToolsService.textToSpeech(textToaudio,isNumber ? Language.en : prompt.inputLanguage,promptDto.audioGender,userId,sessionId)
      } catch (error) {
        result["audio"] = { text: "", error: error.message };
      }
    }
    conversation = await this.conversationService.saveConversation(
      sessionId,
      userId,
      botFlowService.getSnapshot().context,
      botFlowService.state.context.state,
      configid
    );

    let msg = await this.prismaService.message.create({
      data: {
        text: (() => {
          if (result && result.text) {
            return typeof result.text === 'string'
              ? result.text
              : JSON.stringify(result.text);
          }
          return JSON.stringify(result);
        })(),
        audio: null,
        type: "System",
        userId,
        flowId: configid || "3",
        messageType,
      },
    });
    result["messageId"] = msg.id;
    result["messageType"] = messageType;
    result["conversationId"] = conversation.id;
  
    // Sanitize the HTML inside the result (if available) by removing newlines and extra spaces
    if (
      result &&
      result.textInEnglish &&
      result.textInEnglish.content &&
      result.textInEnglish.content.html
    ) {
      result.textInEnglish.content.html = result.textInEnglish.content.html
        .replace(/\n/g, ' ')       // Remove newlines
        .replace(/\s\s+/g, ' ')     // Replace multiple spaces with a single space
        .trim();
    }
  
    this.logger.log(
      "userId =", userId,
      "sessionId =", sessionId,
      "current state while returning response =",
      botFlowService.state.context.currentState
    );
    switch (botFlowService.state.context.currentState) {
      case "askingAadhaarNumber":
        this.monitoringService.incrementStage3Count();
        break;
      case "askingOTP":
        this.monitoringService.incrementStage4Count();
        break;
      case "endFlow":
        if (!result.error) {
          this.monitoringService.incrementStage5Count();
        }
        break;
      default:
        break;
    }

    // verboseLogger("response text", result.text)
    // verboseLogger("response textInEnglish", result.textInEnglish)
    // verboseLogger("response error", result.error)
    return result;
  }
}
