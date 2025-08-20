// imports

import { API_ENDPOINTS } from "~/constants/api-endpoints";

// types

export type VerifyRequest = {
    token: string;
};

const useVerify = () => {
    return useCreate<any, VerifyRequest>({
        customResource: {
            path: API_ENDPOINTS.user.verify.path,
        },
    });
};

export default useVerify;
