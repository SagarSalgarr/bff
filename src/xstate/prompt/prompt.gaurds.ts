export const promptGuards = {
  ifText: (_, event) => event.data.prompt.input.type == "Text",

  ifAudio: (_, event) => event.data.inputType == "Audio",

  ifValidPhone: (_, event) => {
    // Check if the validation was successful
    return event.data === true;
  },

  ifSoilHealthCard: (context: any, event: any) => {
    return event.data?.class === "SHC PDF";
  },

  ifMultipleAadhaar: (_, event) =>
    event.data == "This mobile number taged with multiple records.",

  //   ifInValidScheme: (_, event) =>
  //     !VALID_SCHEMES.includes(event.data.prompt.input.schemeName),

  ifNoRecordsFound: (context, event) => {
    const pattern =
      /No Record Found for this \((.*?)\) Aadhar\/Ben_id\/Mobile\./;
    return (
      pattern.test(event.data) ||
      ((event.data as string).startsWith("No Record Found for this") &&
        (event.data as string).endsWith("Aadhar/Ben_id/Mobile."))
    );
  },
  // event.data ==
  //   `No Record Found for this (${context.userAadhaarNumber}) Aadhar/Ben_id/Mobile.`,

  ifOTPSend: (_, event) => event.data == "OTP send successfully!",

  ifTryAgain: (_, event) => event.data == "Try again",

  ifNotValidAadhaar: (_, event) =>
    event.data ==
    "Please enter a valid Beneficiary ID/Aadhaar Number/Phone number",

  ifInvalidOTP: (_, event) => event.data == "OTP not verified",

  resendOTP: (_, event) => event.data.query == "resend OTP",

  ifOTPHasBeenVerified: (context, _) => context.isOTPVerified,

  ifInvalidClassifier: (_, event) => event.data.class == "invalid",

  ifConvoStarterOrEnder: (_, event) => event.data.class == "convo",
};
