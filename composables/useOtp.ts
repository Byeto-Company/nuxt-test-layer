// imports

import { API_ENDPOINTS } from "~/constants/api-endpoints";

// types

export type OtpRequest = {
    phone: string;
};

const useOtp = () => {
    return useCreate<any, OtpRequest>({
        customResource: {
            path: API_ENDPOINTS.user.otp.path,
        },
    });
};

export default useOtp;
