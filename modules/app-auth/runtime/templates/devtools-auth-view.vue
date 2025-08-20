<script lang="ts" setup>
// imports

import { useJwt } from "@vueuse/integrations/useJwt";

// state

definePageMeta({
    layout: "none",
});

const { token, refreshToken, updateToken, updateRefreshToken, logout, isLoggedIn } = useAuth();
const { refetch: refetchAccount } = useGetAccount();
const { mutateAsync: developSignIn, isPending: isDevelopSignInPending } = useDevelopSignin();

const accessTokenValue = computed(() => unref(token) ?? "");
const refreshTokenValue = computed(() => unref(refreshToken) ?? "");
const { header: accessHeader, payload: accessPayload } = useJwt(accessTokenValue);
const { header: refreshHeader, payload: refreshPayload } = useJwt(refreshTokenValue);

const runtimeConfig = useRuntimeConfig();
const otpInputsCount = runtimeConfig.public.appAuth.otpCount;
const otpInputsTimer = runtimeConfig.public.appAuth.otpTimer;

// computed

const todayText = computed(() => toReadableDateString(new Date()));

const tokenDetails = computed(() => {
    const accessExpDate = new Date((accessPayload.value?.exp ?? 0) * 1000);
    const refreshExpDate = new Date((refreshPayload.value?.exp ?? 0) * 1000);

    const accessDateString = toReadableDateString(accessExpDate);
    const refreshDateString = toReadableDateString(refreshExpDate);

    return {
        accessExp: accessDateString,
        refreshExp: refreshDateString,
    };
});

// methods

const signInHandler = () => {
    developSignIn(
        {},
        {
            onSuccess: (response) => {
                updateToken(response.access);
                updateRefreshToken(response.refresh);
            },
            onError: () => {},
        }
    );
};

const signOutHandler = async () => {
    await logout();
};
</script>

<template>
    <div
        class="size-full"
        dir="ltr"
    >
        <div class="w-full flex flex-col gap-8 p-12">
            <div class="flex items-center gap-2">
                <span class="text-xl font-semibold"> Today :</span>

                <UBadge
                    variant="subtle"
                    size="xl"
                    class="w-fit tracking-wider px-2.5"
                >
                    {{ todayText }}
                </UBadge>
            </div>

            <div class="grid grid-cols-2 gap-4 w-full">
                <div class="bg-neutral-900 p-6 rounded-xl flex flex-col gap-4">
                    <UBadge
                        variant="soft"
                        class="w-fit"
                    >
                        Access Token
                    </UBadge>
                    <div class="w-full break-words text-neutral-300">
                        {{ token ?? "You are signed out" }}
                    </div>
                    <div v-if="token">
                        <UBadge
                            class="tracking-wider px-2.5"
                            variant="soft"
                            color="neutral"
                            size="lg"
                        >
                            {{ tokenDetails.accessExp }}
                        </UBadge>
                    </div>
                </div>
                <div class="bg-neutral-900 p-6 rounded-xl flex flex-col gap-4">
                    <UBadge
                        variant="soft"
                        class="w-fit"
                    >
                        Refresh Token
                    </UBadge>
                    <div class="w-full break-words text-neutral-300">
                        {{ refreshToken ?? "You are signed out" }}
                    </div>
                    <div v-if="refreshToken">
                        <UBadge
                            class="tracking-wider px-2.5"
                            variant="soft"
                            color="neutral"
                            size="lg"
                        >
                            {{ tokenDetails.refreshExp }}
                        </UBadge>
                    </div>
                </div>
            </div>

            <div class="flex items-center gap-4">
                <UButton
                    @click="signInHandler"
                    :loading="isDevelopSignInPending"
                    variant="subtle"
                >
                    Sign In With Develop Token
                    <UIcon
                        name="fa-solid:arrow-right"
                        class="text-base"
                    />
                </UButton>
                <UButton
                    v-if="isLoggedIn"
                    @click="signOutHandler"
                    :loading="isDevelopSignInPending"
                    color="error"
                    variant="subtle"
                    :disabled="!isLoggedIn"
                >
                    Logout
                    <UIcon
                        name="fa-solid:arrow-right-from-bracket"
                        class="text-base"
                    />
                </UButton>
            </div>
        </div>
    </div>
</template>
