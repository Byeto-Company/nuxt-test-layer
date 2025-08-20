// imports

import { API_ENDPOINTS } from "~/constants/api-endpoints";

// types

export type RefreshAuthRequest = {
    refresh: string;
};

export type RefreshAuthResponse = {
    access: string;
    refresh: string;
};

const useRefreshAuth = () => {
    return useCreate<RefreshAuthResponse, RefreshAuthRequest>({
        customResource: {
            path: API_ENDPOINTS.user.refresh.path,
        },
    });
};

export default useRefreshAuth;
