// imports

import { API_ENDPOINTS } from "~/constants/api-endpoints";

// types

export type UpdateAccountRequest = UpdateAccountProfile;

export type UpdateAccountResponse = AccountProfile;

const useUpdateAccount = () => {
    return useUpdate<UpdateAccountResponse, UpdateAccountRequest>({
        customResource: {
            path: API_ENDPOINTS.user.profile.path,
        },
        contentType: "form",
        authorization: true,
    });
};

export default useUpdateAccount;
