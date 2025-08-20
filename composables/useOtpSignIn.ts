// imports

import { API_ENDPOINTS } from "~/constants/api-endpoints";

// types

export type OtpSignInRequest = {
    otp: string;
    phone: string;
};

export type OtpSignInResponse = {
    access: string;
    refresh: string;
};

const useOtpSignIn = () => {
    return useCreate<OtpSignInResponse, OtpSignInRequest>({
        customResource: {
            path: API_ENDPOINTS.user.signin.path,
        },
    });
};

export default useOtpSignIn;
