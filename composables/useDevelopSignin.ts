// imports

import { API_ENDPOINTS } from "~/constants/api-endpoints";

// types

export type DevelopSignInRequest = any;

export type DevelopSignInResponse = {
    access: string;
    refresh: string;
};

const useOtp = () => {
    return useCreate<DevelopSignInResponse, DevelopSignInRequest>({
        customResource: {
            path: API_ENDPOINTS.user.develop_token.path,
        },
    });
};

export default useOtp;
