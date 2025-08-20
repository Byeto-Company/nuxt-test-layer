import type { AxiosError } from "axios";

const useAuth = () => {
    // state

    const { mutateAsync: refreshAuth } = useRefreshAuth();
    const { mutateAsync: verify } = useVerify();
    const { mutateAsync: signOut } = useSignOut();

    const token = useCookie("token");
    const refreshToken = useCookie("refresh-token");

    // methods

    const updateToken = (newToken: string) => {
        token.value = newToken;
    };

    const updateRefreshToken = (newToken: string) => {
        refreshToken.value = newToken;
    };

    const logout = async (reload?: boolean) => {
        if (refreshToken.value) {
            token.value = undefined;
            refreshToken.value = undefined;
            await signOut({ refresh_token: refreshToken.value! });
            if (reload) window.location.href = "/";
        }
    };

    const checkAuth = async () => {
        if (!!token.value) {
            // 1.1 - token is there

            try {
                await verify({
                    token: token.value,
                });

                return true;

                // 2.1 - token is valid, finish
            } catch (e) {
                const err = e as AxiosError;

                if (err?.status && err.status >= 400) {
                    // 2.2 - token is there, but not valid, try to refresh token

                    if (!!refreshToken.value) {
                        // 3.1 - refresh token is there, try to refresh

                        try {
                            const refreshResponse = await refreshAuth({
                                refresh: refreshToken.value,
                            });

                            // 4.1 - token is refreshed successfully, finish

                            updateToken(refreshResponse.access);
                            updateRefreshToken(refreshResponse.refresh);

                            return true;
                        } catch (e) {
                            const err = e as AxiosError;

                            if (err?.status && err.status >= 400) {
                                // 4.2 - cant refreshing token, logout

                                logout();
                            }
                        }
                    } else {
                        // 3.2 - refresh token is not exist, logout

                        logout();
                    }
                }

                return false;
            }
        } else {
            // 1.2 - token is not exist, try refresh token    logout
            if (!!refreshToken.value) {
                try {
                    const refreshResponse = await refreshAuth({
                        refresh: refreshToken.value,
                    });

                    updateToken(refreshResponse.access);
                    updateRefreshToken(refreshResponse.refresh);

                    return true;
                } catch (e) {
                    const err = e as AxiosError;

                    if (err?.status && err.status >= 400) {
                        logout();
                    }
                }
            } else {
                logout();
            }

            return false;
        }
    };

    // computed

    const isLoggedIn = computed(() => !!token.value);

    return {
        token,
        refreshToken,
        updateRefreshToken,
        updateToken,
        logout,
        isLoggedIn,
        checkAuth,
    };
};

export default useAuth;
