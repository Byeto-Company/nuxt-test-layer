// imports

import { API_ENDPOINTS } from "~/constants/api-endpoints";
import useAuth from "./useAuth";

// types

export type GetAccountResponse = AccountProfile;

const useGetAccount = () => {
    // state

    const { token } = useAuth();

    // computed

    const isEnabled = computed(() => {
        return !!token.value;
    });

    // methods

    return useOne<GetAccountResponse>({
        customResource: {
            name: API_ENDPOINTS.user.profile.key,
            path: API_ENDPOINTS.user.profile.path,
        },
        authorization: true,
        queryOptions: {
            enabled: isEnabled,
            select: (data: GetAccountResponse) => {
                return {
                    ...data,
                    first_name: data.first_name?.length === 0 ? null : data.first_name,
                    last_name: data.last_name?.length === 0 ? null : data.last_name,
                };
            },
        },
    });
};

export default useGetAccount;
