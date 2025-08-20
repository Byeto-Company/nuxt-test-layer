// imports

import { API_ENDPOINTS } from "~/constants/api-endpoints";

// types

export type SignOutRequest = {
    refresh_token: string;
};

const useSignOut = () => {
    return useCreate<any, SignOutRequest>({
        customResource: {
            path: API_ENDPOINTS.user.logout.path,
        },
    });
};

export default useSignOut;
