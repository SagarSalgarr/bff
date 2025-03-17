// @ts-nocheck
import { Logger } from "@nestjs/common";
import { assign } from "xstate";
const path = require("path");
const filePath = path.resolve(__dirname, "../../common/en.json");
const engMessage = require(filePath);

const logger = new Logger(
  'prompt'
);

export const botFlowMachine1: any = {
  /** @xstate-layout N4IgpgJg5mDOIC5QCMD2AXAYgG1QdwDoZ0BVWMAJwEUBXOdAS1QDsBiEgZQFEAlAfQCSAOQAKJACoBtAAwBdRKAAOqWA0YsFIAB6IAjAA4AzAQAsukwDZDAVhMAma3f26ANCACeiALR2DBXQCc0sHWAboWugDsutIWAL5xbmhYuIQAjnSw6swAwtgAhrCqAGYMlKwQLGAEDMwAbqgA1tXJOPgEGfRMuQVFDKWUCLUNAMb52TKyk5rKqtmaOgi61rqmJtb61tbS+hYm0tFunghmBNJ2VvoHAfrRJobmCUkYbemZ2XmFJWUUrJQUqAoBEUBXQxUBAFsCK1Uh13t1Pn0BhQhvVUGMJnJpkgQLM1N0Ft5ItYCE57BtDBZNtYLNYjt59PoCLtrJFdmELoZDHZIk8QDD2oVGrUoABBfIQAAW+XyFCENAhyHKnF4glEEmxShU+I0OMWUSZ4UsFgcPOCAXW9IQdhMkVJkQdhluFxWtmsfIFhDq+WwDAg4xF4qlMrlCqVv0qzGqwyaLResO9vv9jGYYol0tl8sVgxjGO6k01uO18z13kcFgIAQsARWkUpGyc+itjmkBGs3K5gQdkRr+g98faib9AdTQYzoezEaqNTRzWhA69PuHKbTwczYZzaLzLALunkOLxJdA+p2qx25cZ5gCDmbdlb7bsnYC3d7-ZSg6XycD6ZDWfDFWnGM509Aghy-Ucf3XSdUVGAMdyxOx9y1OYCVLBAaQCStpF0QxIhtW1OxMW97w7B5nwdV9En5BdQM-EdV3HP9ykjaNZzjd9FyTeix1-DcUVzODmALQwkKLFDdWPRAwlMXCbTsfDNktDxEBbNtSK7CiNjfV5aK4lceKg-9-kBYFQXBCgoRAsDuMgidwxg9FBILOQZmLVDJIQHxpBJQwax2fQa0MWILB2K1fLsNtIhNFZOWrbD3SokChRFAB5cQRHYbh+GEMQpBcg83Ik7Q9CMUxzBpHYnF0AxQuUhArmMJ0NnbbzOwsXlEpo6yVzSjKWJnBpgK6uievShztyErF8uQnVmEJE4HUrZ8LV8ewHBwq1qpsNSTHuRxNP0ExtITEbUvSgCowG2N5w43TlzOkRxqcrE91c8S5rQ6qIp5fZuWwmJIh2CxNuWJkVmkKsAhrKlGWOj89Iev4KABIEQXGczLOGhHU16p7MSmaaxNm+avHCJk72JJ0q0iXblhB7b212mweR7DYjs627ijAdARklEUyEoAARcZ8gu1jBvYnSuZ5vnUwFihhfQfI8fzKbRMPdziqWELTA2NkWw2KlpEMTbLGMVkeQMB0bQpOHCGl3n+fIBWRaRlHTPRyEbql7nHbl53FeVgT8cLDWisWUmosrfZiUh58IjsTaOwIWOQqCdtNgCO2CGMqdLqAyXYVzlX4IJ9XCo+jzSdZAhCKBu8HlpOk6uWaSNmWW1duiXCEio5hUAgOBNE9N7ibQrxWRMStq1ret9EbK0vCdCstlZXQLnuExr1sbPiHl2guiKsPK61o1TAdcILSCAGLkXuwobOLY8MfGtAaMeIOZ0zosgRXpvkoUeR5T64UrEFBwZsqyxUXkEZkAVfB4QtDYB02dkoQTXHZABBV3rzXMBFK4YR448j2GyTa7Z-BmBrL4K41VwjZ26t+dBTEKCAM1vqPwJhGSbHng8YKPIwrVjONeAi7UQoxGfCg2AwocbpRYeHPQ15a7tR7NyHkVZHCJzqoDYwsQjAWkcFvYIhg6GnWkSIWRJ99TbFMBvKIyx6xBGBnVZ8xhnC3ACpnahdhs4O1llAeWgdzE4MsNHB42xcJVmwgEJOvgU6UhwsSdq88jDZ1zoE8eURWyHUBpvSwDYmwt0sKsWwQi8K7HsMSFJzAICvDSR5AwRSoi4XuNFf6m1aStgiEFTha1QgJQSEAA */
  id: "botFlow",
  predictableActionArguments: true,
  initial: "checkStateAndJump",
  context: {
    userQuestion: "",
    query: "",
    queryType: "",
    response: "",
    userAadhaarNumber: "",
    otp: "",
    error: "",
    currentState: "getUserQuestion",
    type: "",
    inputType: "",
    inputLanguage: "",
    lastAadhaarDigits: "",
    state: "onGoing",
    userId: "",
    isOTPVerified: false,
  },
  states: {
    checkStateAndJump: {
      always: [
        {
          target: "getUserQuestion",
          cond: (context) => context.currentState === "getUserQuestion",
        },
        {
          target: "questionClassifier",
          cond: (context) => context.currentState === "questionClassifier",
        },
        {
          target: "askingAadhaarNumber",
          cond: (context) => context.currentState === "askingAadhaarNumber",
        },
        {
          target: "validatingAadhaarNumber",
          cond: (context) => context.currentState === "validatingAadhaarNumber",
        },
        {
          target: "askingOTP",
          cond: (context) => context.currentState === "askingOTP",
        },
        {
          target: "validatingOTP",
          cond: (context) => context.currentState === "validatingOTP",
        },
        {
          target: "fetchingUserData",
          cond: (context) => context.currentState === "fetchingUserData",
        },
        {
          target: "error",
          cond: (context) => context.currentState === "error",
        },
        {
          target: "endFlow",
          cond: (context) => context.currentState === "endFlow",
        },
      ],
    },
    getUserQuestion: {
      on: {
        USER_INPUT: {
          target: "questionClassifier",
          actions: [
            assign({
              query: (_, event) => event.data,
            }),
          ],
        },
      },
    },
    questionClassifier: {
      invoke: {
        src: "questionClassifier",
        onDone: [
          {
            cond: "ifInvalidClassifier",
            target: "getUserQuestion",
            actions: [
              assign({
                response: () => engMessage["message.invalid_question"],
                type: "pause",
              }),
            ],
          },
          {
            target: "askingAadhaarNumber",
            actions: [
              assign({
                response: () => engMessage["label.popUpTitle"],
                queryType: (_, event) => event.data,
                type: "pause",
              }),
            ],
          },
        ],
        onError: {
          target: "error",
          actions: [
            assign({
              error: (_, event) => event.data.message,
              type: "",
            }),
          ],
        },
      },
    },

    // New states for Soil Health Card flow
    askingSoilHealthPhone: {
      on: {
        USER_INPUT: {
          target: "validateSoilHealthPhone",
          actions: [
            assign({
              userPhone: (_, event) => event.data,
              type: "",
            }),
          ],
        },
      },
    },

    validateSoilHealthPhone: {
      invoke: {
        src: "validatePhoneNumber",
        onDone: [
          {
            cond: "ifValidPhone",
            target: "fetchingSoilHealthCard",
          },
          {
            target: "askingSoilHealthPhone",
            actions: [
              assign({
                response: () => "Please enter a valid 10-digit mobile number.",
                userPhone: "",
                type: "pause",
              }),
            ],
          },
        ],
        onError: {
          target: "error",
          actions: [
            assign({
              error: (_, event) => event.data.message,
              type: "",
            }),
          ],
        },
      },
    },

    fetchingSoilHealthCard: {
      invoke: {
        src: "fetchSoilHealthCard",
        onDone: {
          target: "endFlow",
          actions: [
            assign({
              response: (_, event) => event.data,
              userPhone: "",
              isSoilHealthCard: false,
              type: "",
            }),
          ],
        },
        onError: {
          target: "error",
          actions: [
            assign({
              error: (_, event) => event.data.message,
              userPhone: "",
              isSoilHealthCard: false,
              type: "",
            }),
          ],
        },
      },
    },

    askingAadhaarNumber: {
      on: {
        USER_INPUT: {
          target: "validatingAadhaarNumber",
          actions: [
            assign({
              userAadhaarNumber: (context, event) =>
                `${context.userAadhaarNumber}${event.data}`,
              type: "",
            }),
          ],
        },
      },
    },
    validatingAadhaarNumber: {
      invoke: {
        src: "validateAadhaarNumber",
        onDone: [
          {
            cond: "ifNotValidAadhaar",
            target: "askingAadhaarNumber",
            actions: [
              assign({
                response: () => engMessage["label.popUpTitleValid"],
                userAadhaarNumber: "",
                type: "pause",
              }),
            ],
          },
          {
            cond: "ifMultipleAadhaar",
            target: "askingAadhaarNumber",
            actions: [
              assign({
                response: () => engMessage["label.popUpTitle2"],
                type: "pause",
              }),
            ],
          },
          {
            cond: "ifNoRecordsFound",
            target: "askingAadhaarNumber",
            actions: [
              assign({
                response: (context) =>
                  `No records were found for ${context.userAadhaarNumber}, Please enter valid Mobile/Aadhaar/Benificiary Id again.`,
                userAadhaarNumber: "",
                type: "pause",
              }),
            ],
          },
          {
            cond: "ifTryAgain",
            target: "askingAadhaarNumber",
            actions: [
              assign({
                response: () => engMessage["label.popUpTitleValid"],
                userAadhaarNumber: "",
                type: "pause",
              }),
            ],
          },
          {
            cond: "ifOTPSend",
            target: "askingOTP",
            actions: [
              assign({
                response: () => engMessage["label.popUpTitle3"],
                type: "pause",
              }),
            ],
          },
          {
            target: "error",
            actions: [
              assign({
                error: (_, event) => event.data,
                type: "",
              }),
            ],
          },
        ],
        onError: {
          target: "error",
          actions: [
            assign({
              error: (_, event) => event.data.message,
              type: "",
            }),
          ],
        },
      },
    },
    askingOTP: {
      on: {
        USER_INPUT: {
          target: "validatingOTP",
          actions: [
            assign({
              otp: (_, event) => event.data,
              type: "",
            }),
          ],
        },
      },
    },
    validatingOTP: {
      invoke: {
        src: "validateOTP",
        onDone: [
          {
            cond: "ifInvalidOTP",
            target: "askingOTP",
            actions: [
              assign({
                response: () => engMessage["message.invalid_otp"],
                type: "pause",
              }),
            ],
          },
          {
            cond: "ifTryAgain",
            target: "askingOTP",
            actions: [
              assign({
                response: () => engMessage["label.popUpTitle3"],
                type: "pause",
              }),
            ],
          },
          {
            target: "fetchingUserData",
          },
        ],
        onError: {
          target: "error",
          actions: [
            assign({
              error: (_, event) => event.data.message,
              type: "",
            }),
          ],
        },
      },
    },
    fetchingUserData: {
      invoke: {
        src: "fetchUserData",
        onDone: {
          target: "endFlow",
          actions: [
            assign({
              response: (_, event) => event.data,
              type: "",
            }),
          ],
        },
        onError: {
          target: "error",
          actions: [
            assign({
              error: (_, event) => event.data.message,
              type: "",
            }),
          ],
        },
      },
    },
    error: {
      invoke: {
        src: "logError",
        onDone: "endFlow",
      },
    },
    endFlow: {
      type: "final",
    },
  },
};

export const botFlowMachine2: any = {
  /** @xstate-layout N4IgpgJg5mDOIC5QCMD2AXAYgG1QdwDoZ0BVWMAJwEUBXOdAS1QDsBiEgZQFEAlAfQCSAOQAKJACoBtAAwBdRKAAOqWA0YsFIAB6IAjAFZdBaQHZ9ANgBMATmsAOO-vsmANCACeiALS6zlggAsurbS1haWptIBAL7RbmhYuIQAxgAWYMkA1uLuimC6rBAsYAQMzABuqJklCTj4BGkZ2bn5CGWVyQCG6swysn2ayqo9mjoIXpYmAQS+AMzWlo6Ls9Lm5vpunuMGNgQmdpYBYfZHi+ax8Rh1KelZOXkFRcwl7VU1V0kNt80PbRWoXR6fUkunkSBAQzUTGYo0Q1iMln0+lmljW0kMdnM9k23l0KOmhnh0gcxN0dgClguIFqn0adxaBUoFFQFAIimw3QAZiyALYEGn1Ok-VqvQHQ4FyQYqKEacFjLx2EwmAjWFbo4k2XS6LE47ZWawERaKxX6AIBcwmKJUgUpFichgUHkCZiKGjoAqcXiCUQSAbgyEjOXeWb6GZ2FGWAzSWbmaSmay6nxBaSG6wmNbmsIWmPWj71ACOdFgPQAwhzYKp7ZRCsVSv9qvy84RC-RoWXOhWGFWKH8Ot1xXI-UppYHQGMtQbdKtMSZJhYtboAomp4q9gEnJbDpaAujc4kC0XS+XKwxq0yWWyOehuY7G-vm4e28eu6ee6L+ywJWDh8NobDxtYqwqtY5hmpagGTGYy7BAaAThlO8zwuYswmLMe7XAQHaZGUUAAIKdBAqSdJ0FBCDQPLINWnr8MIYhSJK-ojn+QYIAYRimOEtgOE4mJ2ImdggXsBxRIcMYhvo6G0t89xgJYNbPHWlQNjaXxNDJli9gCH69IODE-jKMIsRMUwzKhCxLOGqzrImSrKrMIYCYc9gHCY1iSYK0ktHJTwvPW7z3qp9J5Bp75AoOoJSr+spjnCCJIiiaIYpauiJhYKYrIuU7wgYYTuTcaleaw56suyXK8neGFCupmlip+unfhCTHRdo3iKsqqpxvoGrZeYfEeN4tkEPZ+h2KE6ZIjuElxNSTYNHaDpOi6bpydR3p0UOjVRYZMXjCGYYRlGMZxqNGz9eMoF2KZqHpqhxImMEeUEOUnTYAwED9sweEEURJFkRR1Y+YpbwVZ8z2ve9jCffhhHEaR5GUW+-y1Tp-R6ZtBn-l4pxDQl9lahiAnLmsQkLNqqKzHi5JodNKlg29H1fTDv3wwDtavMps10xDOHQz9cP-YjfZhf0EWMVt-4hv4qoZfZ9mWLMdiLkT5gk5GVjIZTATU5cAVcwzvOw39CPyb5Sn+RheuQ4zfNG5QNXacClgNQGzE7a50yWJMpgGA44amsrqtkxrCta49ls899hssxQJtAxzusvfTVsG8zAv28LkizM7TXbS1rGHAi4ZwZisbSIifVbD4xP7KT6sUyH2szQn4P65HqfG4D7Pm6Difc1Dbf8wj6cDv0ATZ+LLHagrBDmGSabSME5pdadlfairNeIumNj7BEJhh73rdM4PrMKV3IP1OH-dH7bgtaRn+jjxjRknMY8sHMhXHwpYAcb-oW9pgcfeLdk4DxvkVCgzISpXhvHyWmB8QHX2jsPOqqNH6jjzl4BYKstb7CcMiT+CYzpY0WAQfQNgsRWFNA4UONNZpYQADIdnQPhAeAARBgUA1CwHYNwGiPp6JoNdnnI4Bo8bmlGq5OM8tdSzGmGmJwZcAhKmjBEGItCApVRaAEWOZ8VKaLyAEZBKMNou2auOaeZdtR4gtEoyY1glxnTYqQ8I9k1gOBsArR6+iwDaM7n5c++Ugo+KMcCUW+l0FjC1gaQwWpQJYiRIBf2Z15hGBQhEPEURUKokpOoyqnkDHgMgZeMqt49H5OCaFEeJic6YzaiqNUXUDg9QrnoQwzirCuN6k03QOSdaVXmo6Z0rp0DaNWrRX0aNTG5zGDGZUo08Ra2OhSOCK9EArA9qBXB9itSRjsI9LCOEADy4gRA8K9OMgRkUn47V8KBVMmIpzIiUesQhWxZ4ElnMmewU51ZePKbMHR-iykFTyLMEJ9UrkRL0EES6cZ0y9TTGYLBupUIexRGmNYSoEWN2BUEgFfizYBMCsKMFlSUEgkEWY7wvUPbJgtKqbUSoUpnTTAaVYhglHIjLlYNRfSpIgrAPitmQLZreNJUjB2g4naQqEeObcgR9grHuoYEMDitisuMOsRcZgVjZJxaK-5hSLylWvOVXFJLwWoJlVS8YdSOrqm6dqV5iBUWGjEZGM05M3K5NpAMxawyAVjP4dUieNy4kqmRAcIIs5dXMq2AJUMZc2rcR2WsIBScjknMBYSuBwDM0iEtSG65edEQLBmNmdlHSLC6h6fMPY89fA9PXCNPZPqL7wPzdm4GuaM2fWOQWslxiwnoyhQgB5MwbCK06rOXqswa3ywNK5ZK91DhIgcOmvuUB+1dvjhbDtfaTmFulWLYt44sSzBmH-bKZpnAHHnVYPYqFTRl1MArYkG6GbbuKsU01pTOb7q3YewdX5rXTNagJQ0XUxJLpWH-XUI0VYU2CDYUwWIKTer5fUTkYB0BpBwmQSgrDuidB3d3LDOG8OfQIxQIj6BOiFsmTUyeUx-DIXXLOtWIE1WtIpDMHcqwwgmh3HvNthBsO4dSPh8gNHiNGqgSU2Bs1xOUagNR2j9HgMQpPaOhUgksS3Ncn-OMc7HHzGmNGYIDyyTiKmphwgxVSNEuKgxylYGEBkIRCBb53tGWuEcfdFM4ZFjRjjOueErbprMFQBAOAmgbSgcxghfwZcFZevsPCEzq9AIplnFBrW4ReqPWINR2grZmpTP-BEZLaxGXogEiBTL4GjD2IXpaDilkMNNzyQK3QCXJ6yJnn-DMBhMWAXMETCmQ0emTAOI4U4ra7NzWYPaQZS13R9Z2hMREpC4LmXxvPNMy5UuXvWOGBWs4F6dZUi2YsT4OwnkoBtvOjzSFf1RGQhwUxFTLnSaQ9lyIYwjR9vs2A2Er422jk98cBg9jpPO6qSYWJnUAV6oEASbGghhCQ38gVlgod6F2DGYIKJTQGBnS08YSpRFOAaasGMqIvF+qGctfH4xPYq1jETiIPKkKJkoYaY6yILq7lE09ADKdj4UFZ5iPj3zhNIQLomRZziKYiR5chkHmRGHFhYUfdhnD0DwG07KxA5oL0UjxOixEs9iTcd2heheQRUQ7nJDS-VGjykBFZ3BKWeIuqeyURqdMNajikPRcSMzQPAGi+SEztbXvjc2rJKGCMk0lQKzEjIyYhoggrAgmZzxouDkHpEKz3wqFIONqycZ1y8GpykPunBIIvUpgGBx3isvUw5mjVAoHxY5pv5nSyQLkCHLoxmjbzHuPAay9LyGhyiIri8Se11OF4w6JzRTE6vLXpXWe55pL53mMpDOcU1ResKYNafkEEcCoxUSijiPWU5Jqj0n1Od92FqX2VgI9TxrfMZLW3LHLFc0R6YqVnXTFMHiOMDWZvLUGtc9QIRCHpZPdMRUMA5gCAa4TvZCGeBlVENMbUU4GtZVGeerU0SYOxU0WIWIIAA */
  id: "botFlow",
  predictableActionArguments: true,
  initial: "checkStateAndJump",
  context: {
    userQuestion: "",
    query: "",
    queryType: "",
    response: "",
    userAadhaarNumber: "",
    otp: "",
    error: "",
    currentState: "getUserQuestion",
    type: "",
    inputType: "",
    inputLanguage: "",
    lastAadhaarDigits: "",
    state: "onGoing",
    userId: "",
    isOTPVerified: false,
  },
  states: {
    checkStateAndJump: {
      always: [
        {
          target: "getUserQuestion",
          cond: (context) => context.currentState === "getUserQuestion",
        },
        {
          target: "checkType1",
          cond: (context) => context.currentState === "checkType1",
        },
        {
          target: "confirmInput1",
          cond: (context) => context.currentState === "confirmInput1",
        },
        {
          target: "questionClassifier",
          cond: (context) => context.currentState === "questionClassifier",
        },
        {
          target: "askingAadhaarNumber",
          cond: (context) => context.currentState === "askingAadhaarNumber",
        },
        {
          target: "checkType2",
          cond: (context) => context.currentState === "checkType2",
        },
        {
          target: "confirmInput2",
          cond: (context) => context.currentState === "confirmInput2",
        },
        {
          target: "validatingAadhaarNumber",
          cond: (context) => context.currentState === "validatingAadhaarNumber",
        },
        {
          target: "askLastAaadhaarDigits",
          cond: (context) => context.currentState === "askLastAaadhaarDigits",
        },
        {
          target: "checkType4",
          cond: (context) => context.currentState === "checkType4",
        },
        {
          target: "confirmInput4",
          cond: (context) => context.currentState === "confirmInput4",
        },
        {
          target: "askingOTP",
          cond: (context) => context.currentState === "askingOTP",
        },
        {
          target: "checkType3",
          cond: (context) => context.currentState === "checkType3",
        },
        {
          target: "confirmInput3",
          cond: (context) => context.currentState === "confirmInput3",
        },
        {
          target: "validatingOTP",
          cond: (context) => context.currentState === "validatingOTP",
        },
        {
          target: "fetchingUserData",
          cond: (context) => context.currentState === "fetchingUserData",
        },
        {
          target: "error",
          cond: (context) => context.currentState === "error",
        },
        {
          target: "endFlow",
          cond: (context) => context.currentState === "endFlow",
        },
      ],
    },
    getUserQuestion: {
      on: {
        USER_INPUT: {
          target: "checkType1",
          actions: [
            assign({
              query: (_, event) => event.data,
              response: (_, event) => event.data,
            }),
          ],
        },
      },
    },
    checkType1: {
      invoke: {
        src: "getInput",
        onDone: [
          // {
          //   cond: "ifInValidScheme",
          //   target: "endFlow",
          //   actions: [
          //     assign({
          //       response: "Invalid Scheme, please send a valid scheme.",
          //       type: "pause",
          //     }),
          //   ],
          // },
          {
            cond: "ifAudio",
            target: "confirmInput1",
            actions: [
              assign({
                type: "pause",
              }),
            ],
          },
          {
            cond: "ifAudio",
            target: "confirmInput1",
            actions: [
              assign({
                type: "pause",
              }),
            ],
          },
          {
            cond: "ifAudio",
            target: "confirmInput1",
            actions: [
              assign({
                type: "pause",
              }),
            ],
          },
          {
            target: "questionClassifier",
            actions: [
              assign({
                userQuestion: (_, event) => event.data.query,
                query: (_, event) => event.data.query,
                response: engMessage["label.popUpTitle"],
              }),
            ],
          },
        ],
        onError: {
          target: "error",
          actions: [
            assign({
              error: (_, event) => event.data.message,
              type: "",
            }),
          ],
        },
      },
    },
    confirmInput1: {
      on: {
        USER_INPUT: {
          target: "checkType1",
          actions: [
            assign({
              query: (_, event) => event.data,
              response: (_, event) => event.data,
            }),
          ],
        },
      },
    },
    questionClassifier: {
      invoke: {
        src: "questionClassifier",
        onDone: [
          {
            cond: "ifInvalidClassifier",
            target: "getUserQuestion",
            actions: [
              assign({
                response: () => engMessage["message.invalid_question"],
                type: "pause",
              }),
            ],
          },
          {
            target: "askingAadhaarNumber",
            actions: [
              assign({
                response: () => engMessage["label.popUpTitle"],
                queryType: (_, event) => {
                  logger.log(`assigning queryType = ${event.data}`);
                  return event.data;
                },
                type: "pause",
              }),
            ],
          },
        ],
        onError: {
          target: "error",
          actions: [
            assign({
              error: (_, event) => event.data.message,
              type: "",
            }),
          ],
        },
      },
    },
    askingAadhaarNumber: {
      on: {
        USER_INPUT: {
          target: "checkType2",
          actions: [
            assign({
              query: (_, event) => event.data,
              response: (_, event) => event.data,
            }),
          ],
        },
      },
    },
    checkType2: {
      invoke: {
        src: "getInput",
        onDone: [
          {
            cond: "ifAudio",
            target: "confirmInput2",
            actions: [
              assign({
                type: "pause",
              }),
            ],
          },
          {
            target: "validatingAadhaarNumber",
            actions: [
              assign({
                query: (_, event) => event.data.query,
                userAadhaarNumber: (_, event) => {
                  return `${event.data.query}`;
                },
                type: "",
              }),
            ],
          },
        ],
        onError: {
          target: "error",
          actions: [
            assign({
              error: (_, event) => event.data.message,
              type: "",
            }),
          ],
        },
      },
    },
    confirmInput2: {
      on: {
        USER_INPUT: {
          target: "checkType2",
          actions: [
            assign({
              query: (_, event) => event.data,
              response: (_, event) => event.data,
            }),
          ],
        },
      },
    },
    validatingAadhaarNumber: {
      invoke: {
        src: "validateAadhaarNumber",
        onDone: [
          {
            cond: "ifNotValidAadhaar",
            target: "askingAadhaarNumber",
            actions: [
              assign({
                response: () => engMessage["label.popUpTitleValid"],
                userAadhaarNumber: "",
                type: "pause",
              }),
            ],
          },
          {
            cond: "ifMultipleAadhaar",
            target: "askLastAaadhaarDigits",
            actions: [
              assign({
                response: () => engMessage["label.popUpTitle2"],
                type: "pause",
              }),
            ],
          },
          {
            cond: "ifNoRecordsFound",
            target: "askingAadhaarNumber",
            actions: [
              assign({
                response: (context) =>
                  `No records were found for ${context.userAadhaarNumber}, Please enter valid Mobile/Aadhaar/Benificiary Id again.`,
                userAadhaarNumber: "",
                type: "pause",
              }),
            ],
          },
          {
            cond: "ifTryAgain",
            target: "askingAadhaarNumber",
            actions: [
              assign({
                response: () => engMessage["label.popUpTitleValid"],
                userAadhaarNumber: "",
                type: "pause",
              }),
            ],
          },
          {
            cond: "ifOTPSend",
            target: "askingOTP",
            actions: [
              assign({
                response: () => engMessage["label.popUpTitle3"],
                type: "pause",
              }),
            ],
          },
          {
            target: "error",
            actions: [
              assign({
                error: (_, event) => event.data,
                type: "",
              }),
            ],
          },
        ],
        onError: {
          target: "error",
          actions: [
            assign({
              error: (_, event) => event.data.message,
              type: "",
            }),
          ],
        },
      },
    },
    askLastAaadhaarDigits: {
      on: {
        USER_INPUT: {
          target: "checkType4",
          actions: [
            assign({
              query: (_, event) => event.data,
              response: (_, event) => event.data,
            }),
          ],
        },
      },
    },
    checkType4: {
      invoke: {
        src: "getInput",
        onDone: [
          {
            cond: "ifAudio",
            target: "confirmInput4",
            actions: [
              assign({
                type: "pause",
              }),
            ],
          },
          {
            target: "validatingAadhaarNumber",
            actions: [
              assign({
                query: (_, event) => event.data.query,
                lastAadhaarDigits: (_context, event) => {
                  return `${event.data.query}`;
                },
                type: "",
              }),
            ],
          },
        ],
        onError: {
          target: "error",
          actions: [
            assign({
              error: (_, event) => event.data.message,
              type: "",
            }),
          ],
        },
      },
    },
    confirmInput4: {
      on: {
        USER_INPUT: {
          target: "checkType4",
          actions: [
            assign({
              query: (_, event) => event.data,
              response: (_, event) => event.data,
            }),
          ],
        },
      },
    },
    askingOTP: {
      on: {
        USER_INPUT: {
          target: "checkType3",
          actions: [
            assign({
              query: (_, event) => event.data,
              response: (_, event) => event.data,
            }),
          ],
        },
      },
    },
    checkType3: {
      invoke: {
        src: "getInput",
        onDone: [
          {
            cond: "ifAudio",
            target: "confirmInput3",
            actions: [
              assign({
                type: "pause",
              }),
            ],
          },
          {
            cond: "resendOTP",
            target: "validatingAadhaarNumber",
            actions: [
              assign({
                response: engMessage["label.popUpTitle3"],
              }),
            ],
          },
          {
            target: "validatingOTP",
            actions: [
              assign({
                query: (_, event) => event.data.query,
                otp: (_context, event) => {
                  logger.log("setting user otp");
                  return `${event.data.query}`;
                },
                type: "",
              }),
            ],
          },
        ],
        onError: {
          target: "error",
          actions: [
            assign({
              error: (_, event) => event.data.message,
              type: "",
            }),
          ],
        },
      },
    },
    confirmInput3: {
      on: {
        USER_INPUT: {
          target: "checkType3",
          actions: [
            assign({
              query: (_, event) => event.data,
              response: (_, event) => event.data,
            }),
          ],
        },
      },
    },
    validatingOTP: {
      invoke: {
        src: "validateOTP",
        onDone: [
          {
            cond: "ifInvalidOTP",
            target: "askingOTP",
            actions: [
              assign({
                response: () => engMessage["message.invalid_otp"],
                type: "pause",
              }),
            ],
          },
          {
            cond: "ifTryAgain",
            target: "askingOTP",
            actions: [
              assign({
                response: () => engMessage["label.popUpTitle3"],
                type: "pause",
              }),
            ],
          },
          {
            target: "fetchingUserData",
          },
        ],
        onError: {
          target: "error",
          actions: [
            assign({
              error: (_, event) => event.data.message,
              type: "",
            }),
          ],
        },
      },
    },
    fetchingUserData: {
      invoke: {
        src: "fetchUserData",
        onDone: {
          target: "endFlow",
          actions: [
            assign({
              response: (_, event) => event.data,
              userAadhaarNumber: "",
              type: "",
            }),
          ],
        },
        onError: {
          target: "error",
          actions: [
            assign({
              error: (_, event) => event.data.message,
              userAadhaarNumber: "",
              type: "",
            }),
          ],
        },
      },
    },
    error: {
      invoke: {
        src: "logError",
        onDone: {
          target: "endFlow",
          actions: [
            assign({
              userAadhaarNumber: "",
            }),
          ],
        },
      },
    },
    endFlow: {
      type: "final",
    },
  },
};

export const botFlowMachine3: any = {
  id: "botFlow3",
  predictableActionArguments: true,
  initial: "checkStateAndJump",
  context: {
    userQuestion: "",
    query: "",
    queryType: "",
    response: "",
    userAadhaarNumber: "",
    otp: "",
    error: "",
    currentState: "getUserQuestion",
    type: "",
    inputType: "",
    inputLanguage: "",
    lastAadhaarDigits: "",
    state: "onGoing",
    userId: "",
    isOTPVerified: false,
    isWadhwaniResponse: "false",
    userPhone: "",
    schemeName: "",
    isSoilHealthCard: false
  },
  states: {
    checkStateAndJump: {
      always: [
        {
          target: "getUserQuestion",
          cond: (context) => context.currentState === "getUserQuestion",
        },
        {
          target: "checkType1",
          cond: (context) => context.currentState === "checkType1",
        },
        {
          target: "confirmInput1",
          cond: (context) => context.currentState === "confirmInput1",
        },
        {
          target: "questionClassifier",
          cond: (context) => context.currentState === "questionClassifier",
        },
        {
          target: "askingAadhaarNumber",
          cond: (context) => context.currentState === "askingAadhaarNumber",
        },
        {
          target: "checkType2",
          cond: (context) => context.currentState === "checkType2",
        },
        {
          target: "confirmInput2",
          cond: (context) => context.currentState === "confirmInput2",
        },
        {
          target: "validatingAadhaarNumber",
          cond: (context) => context.currentState === "validatingAadhaarNumber",
        },
        {
          target: "askLastAaadhaarDigits",
          cond: (context) => context.currentState === "askLastAaadhaarDigits",
        },
        {
          target: "checkType4",
          cond: (context) => context.currentState === "checkType4",
        },
        {
          target: "confirmInput4",
          cond: (context) => context.currentState === "confirmInput4",
        },
        {
          target: "askingOTP",
          cond: (context) => context.currentState === "askingOTP",
        },
        {
          target: "checkType3",
          cond: (context) => context.currentState === "checkType3",
        },
        {
          target: "confirmInput3",
          cond: (context) => context.currentState === "confirmInput3",
        },
        {
          target: "validatingOTP",
          cond: (context) => context.currentState === "validatingOTP",
        },
        {
          target: "fetchingUserData",
          cond: (context) => context.currentState === "fetchingUserData",
        },
        {
          target: "error",
          cond: (context) => context.currentState === "error",
        },
        {
          target: "endFlow",
          cond: (context) => context.currentState === "endFlow",
        },
        {
          target: "askingSoilHealthPhone",
          cond: (context) => context.currentState === "askingSoilHealthPhone",
        },
        {
          target: "fetchingSoilHealthCard",
          cond: (context) => context.currentState === "fetchingSoilHealthCard",
        },
      ],
    },
    getUserQuestion: {
      on: {
        USER_INPUT: {
          target: "checkType1",
          actions: [
            assign({
              query: (_, event) => event.data,
              response: (_, event) => event.data,
            }),
          ],
        },
      },
    },
    checkType1: {
      invoke: {
        src: "getInput",
        onDone: [
          // {
          //   cond: "ifInValidScheme",
          //   target: "endFlow",
          //   actions: [
          //     assign({
          //       response: "Invalid Scheme, please send a valid scheme.",
          //       type: "pause",
          //     }),
          //   ],
          // },
          {
            cond: "ifAudio",
            target: "confirmInput1",
            actions: [
              assign({
                type: "pause",
              }),
            ],
          },
          {
            cond: "ifAudio",
            target: "confirmInput1",
            actions: [
              assign({
                type: "pause",
              }),
            ],
          },
          {
            cond: "ifAudio",
            target: "confirmInput1",
            actions: [
              assign({
                type: "pause",
              }),
            ],
          },
          {
            target: "questionClassifier",
            actions: [
              assign({
                userQuestion: (_, event) => event.data.query,
                query: (_, event) => event.data.query,
                response: engMessage["label.popUpTitle"],
              }),
            ],
          },
        ],
        onError: {
          target: "error",
          actions: [
            assign({
              error: (_, event) => event.data.message,
              type: "",
            }),
          ],
        },
      },
    },
    confirmInput1: {
      on: {
        USER_INPUT: {
          target: "checkType1",
          actions: [
            assign({
              query: (_, event) => event.data,
              response: (_, event) => event.data,
            }),
          ],
        },
      },
    },
    questionClassifier: {
      invoke: {
        src: "questionClassifier",
        onDone: [
          {
            cond: "ifSoilHealthCard",
            target: "askingSoilHealthPhone",
            actions: [
              assign({
                response: () => "Please enter your registered mobile number to fetch your Soil Health Card.",
                queryType: (_, event) => event.data,
                isSoilHealthCard: true,
                type: "pause",
              }),
            ],
          },
          {
            cond: "ifConvoStarterOrEnder",
            target: "endFlow",
            actions: [
              assign({
                queryType: (_, event) => event.data,
                response: (_, event) => event.data.response,
                isWadhwaniResponse: "true",
              }),
            ],
          },
          {
            cond: "ifInvalidClassifier",
            target: "endFlow",
            actions: [
              assign({
                response: (_, event) => event.data.response,
                isWadhwaniResponse: "true",
              }),
            ],
          },
          {
            target: "checkIfOTPHasBeenVerified",
            actions: [
              assign({
                queryType: (_, event) => event.data,
                isWadhwaniResponse: "false",
              }),
            ],
          },
        ],
        onError: {
          target: "error",
          actions: [
            assign({
              error: (_, event) => event.data.message,
              type: "",
            }),
          ],
        },
      },
    },
    wadhwaniClassifier: {
      invoke: {
        src: "wadhwaniClassifier",
        onDone: {
          target: "endFlow",
          actions: [
            assign({
              response: (_, event) => event.data,
              userAadhaarNumber: "",
              lastAadhaarDigits: "",
              isOTPVerified: false,
              type: "",
            }),
          ],
        },
        onError: {
          target: "error",
          actions: [
            assign({
              userAadhaarNumber: "",
              lastAadhaarDigits: "",
              isOTPVerified: false,
              error: (_, event) => event.data.message,
              type: "",
            }),
          ],
        },
      },
    },
    checkIfOTPHasBeenVerified: {
      invoke: {
        src: "getInput",
        onDone: [
          {
            cond: "ifOTPHasBeenVerified",
            target: "fetchingUserData",
          },
          {
            target: "askingAadhaarNumber",
            actions: [
              assign({
                response: () => engMessage["label.popUpTitle"],
                type: "pause",
              }),
            ],
          },
        ],
      },
    },
    askingAadhaarNumber: {
      on: {
        USER_INPUT: {
          target: "checkType2",
          actions: [
            assign({
              query: (_, event) => event.data,
              response: (_, event) => event.data,
            }),
          ],
        },
      },
    },
    checkType2: {
      invoke: {
        src: "getInput",
        onDone: [
          {
            cond: "ifAudio",
            target: "confirmInput2",
            actions: [
              assign({
                type: "pause",
              }),
            ],
          },
          {
            target: "validatingAadhaarNumber",
            actions: [
              assign({
                query: (_, event) => event.data.query,
                userAadhaarNumber: (_, event) => {
                  return `${event.data.query}`;
                },
                type: "",
              }),
            ],
          },
        ],
        onError: {
          target: "error",
          actions: [
            assign({
              error: (_, event) => event.data.message,
              type: "",
            }),
          ],
        },
      },
    },
    confirmInput2: {
      on: {
        USER_INPUT: {
          target: "checkType2",
          actions: [
            assign({
              query: (_, event) => event.data,
              response: (_, event) => event.data,
            }),
          ],
        },
      },
    },
    validatingAadhaarNumber: {
      invoke: {
        src: "validateAadhaarNumber",
        onDone: [
          {
            cond: "ifNotValidAadhaar",
            target: "askingAadhaarNumber",
            actions: [
              assign({
                response: () => engMessage["label.popUpTitleValid"],
                userAadhaarNumber: "",
                type: "pause",
              }),
            ],
          },
          {
            cond: "ifMultipleAadhaar",
            target: "askLastAaadhaarDigits",
            actions: [
              assign({
                response: () => engMessage["label.popUpTitle2"],
                type: "pause",
              }),
            ],
          },
          {
            cond: "ifNoRecordsFound",
            target: "askingAadhaarNumber",
            actions: [
              assign({
                response: (context) =>
                  `No records were found for ${context.userAadhaarNumber}, Please enter valid Mobile/Aadhaar/Benificiary Id again.`,
                userAadhaarNumber: "",
                type: "pause",
              }),
            ],
          },
          {
            cond: "ifTryAgain",
            target: "askingAadhaarNumber",
            actions: [
              assign({
                response: () => engMessage["label.popUpTitleValid"],
                userAadhaarNumber: "",
                type: "pause",
              }),
            ],
          },
          {
            cond: "ifOTPSend",
            target: "askingOTP",
            actions: [
              assign({
                response: () => engMessage["label.popUpTitle3"],
                type: "pause",
              }),
            ],
          },
          {
            target: "error",
            actions: [
              assign({
                error: (_, event) => event.data,
                type: "",
              }),
            ],
          },
        ],
        onError: {
          target: "error",
          actions: [
            assign({
              error: (_, event) => event.data.message,
              type: "",
            }),
          ],
        },
      },
    },
    askLastAaadhaarDigits: {
      on: {
        USER_INPUT: {
          target: "checkType4",
          actions: [
            assign({
              query: (_, event) => event.data,
              response: (_, event) => event.data,
            }),
          ],
        },
      },
    },
    checkType4: {
      invoke: {
        src: "getInput",
        onDone: [
          {
            cond: "ifAudio",
            target: "confirmInput4",
            actions: [
              assign({
                type: "pause",
              }),
            ],
          },
          {
            target: "validatingAadhaarNumber",
            actions: [
              assign({
                query: (_, event) => event.data.query,
                lastAadhaarDigits: (_context, event) => {
                  return `${event.data.query}`;
                },
                type: "",
              }),
            ],
          },
        ],
        onError: {
          target: "error",
          actions: [
            assign({
              error: (_, event) => event.data.message,
              type: "",
            }),
          ],
        },
      },
    },
    confirmInput4: {
      on: {
        USER_INPUT: {
          target: "checkType4",
          actions: [
            assign({
              query: (_, event) => event.data,
              response: (_, event) => event.data,
            }),
          ],
        },
      },
    },
    askingOTP: {
      on: {
        USER_INPUT: {
          target: "checkType3",
          actions: [
            assign({
              query: (_, event) => event.data,
              response: (_, event) => event.data,
            }),
          ],
        },
      },
    },
    checkType3: {
      invoke: {
        src: "getInput",
        onDone: [
          {
            cond: "ifAudio",
            target: "confirmInput3",
            actions: [
              assign({
                type: "pause",
              }),
            ],
          },
          {
            cond: "resendOTP",
            target: "validatingAadhaarNumber",
            actions: [
              assign({
                response: engMessage["label.popUpTitle3"],
              }),
            ],
          },
          {
            target: "validatingOTP",
            actions: [
              assign({
                query: (_, event) => event.data.query,
                otp: (_context, event) => {
                  logger.log("setting user otp");
                  return `${event.data.query}`;
                },
                type: "",
              }),
            ],
          },
        ],
        onError: {
          target: "error",
          actions: [
            assign({
              error: (_, event) => event.data.message,
              type: "",
            }),
          ],
        },
      },
    },
    confirmInput3: {
      on: {
        USER_INPUT: {
          target: "checkType3",
          actions: [
            assign({
              query: (_, event) => event.data,
              response: (_, event) => event.data,
            }),
          ],
        },
      },
    },
    validatingOTP: {
      invoke: {
        src: "validateOTP",
        onDone: [
          {
            cond: "ifInvalidOTP",
            target: "askingOTP",
            actions: [
              assign({
                response: () => engMessage["message.invalid_otp"],
                type: "pause",
              }),
            ],
          },
          {
            cond: "ifTryAgain",
            target: "askingOTP",
            actions: [
              assign({
                response: () => engMessage["label.popUpTitle3"],
                type: "pause",
              }),
            ],
          },
          {
            target: "fetchingUserData",
            // actions: 'updateUserAsValidated'
          },
        ],
        onError: {
          target: "error",
          actions: [
            assign({
              error: (_, event) => event.data.message,
              type: "",
            }),
          ],
        },
      },
    },
    fetchingUserData: {
      invoke: {
        src: "fetchUserData",
        onDone: {
          target: "endFlow",
          actions: [
            assign({
              response: (_, event) => event.data,
              userAadhaarNumber: "",
              lastAadhaarDigits: "",
              isOTPVerified: false,
              type: "",
            }),
          ],
        },
        onError: {
          target: "error",
          actions: [
            assign({
              userAadhaarNumber: "",
              lastAadhaarDigits: "",
              isOTPVerified: false,
              error: (_, event) => event.data.message,
              type: "",
            }),
          ],
        },
      },
    },
    error: {
      invoke: {
        src: "logError",
        onDone: {
          target: "endFlow",
          actions: [
            assign({
              userAadhaarNumber: "",
              lastAadhaarDigits: "",
              isOTPVerified: false,
              type: "",
            }),
          ],
        },
      },
    },
    endFlow: {
      type: "final",
    },
    askingSoilHealthPhone: {
      on: {
        USER_INPUT: {
          target: "validateSoilHealthPhone",
          actions: [
            assign({
              userPhone: (_, event) => event.data,
              type: "",
            }),
          ],
        },
      },
    },
    validateSoilHealthPhone: {
      invoke: {
        src: "validatePhoneNumber",
        onDone: [
          {
            cond: "ifValidPhone",
            target: "fetchingSoilHealthCard",
          },
          {
            target: "askingSoilHealthPhone",
            actions: [
              assign({
                response: () => "Please enter a valid 10-digit mobile number.",
                userPhone: "",
                type: "pause",
              }),
            ],
          },
        ],
        onError: {
          target: "error",
          actions: [
            assign({
              error: (_, event) => event.data.message,
              type: "",
            }),
          ],
        },
      },
    },
    fetchingSoilHealthCard: {
      invoke: {
        src: "fetchSoilHealthCard",
        onDone: {
          target: "endFlow",
          actions: [
            assign({
              response: (_, event) => event.data,
              userPhone: "",
              isSoilHealthCard: false,
              type: "",
            }),
          ],
        },
        onError: {
          target: "error",
          actions: [
            assign({
              error: (_, event) => event.data.message,
              userPhone: "",
              isSoilHealthCard: false,
              type: "",
            }),
          ],
        },
      },
    },
  },
};
