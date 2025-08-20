<script lang="ts" setup>
// import

import { helpers, required } from "@vuelidate/validators";
import { useVuelidate } from "@vuelidate/core";

// types

type LoginInfo = {
    phone: string;
};

// meta

definePageMeta({
    layout: "none",
    middleware: ["check-is-not-logged-in"],
});

// state

const runtimeConfig = useRuntimeConfig();
const otpInputsCount = runtimeConfig.public.appAuth.otpCount;
const otpInputsTimer = runtimeConfig.public.appAuth.otpTimer;

const { updateToken, updateRefreshToken } = useAuth();

const { refetch: refetchAccount } = useGetAccount();

const showOtp = ref(false);
const otpCode = ref("");

const formRules = computed(() => {
    return {
        phone: {
            required: helpers.withMessage("Phone is required", required),
            phoneValidator: helpers.withMessage("شماره تلفن وارد شده معتبر نمی باشد", helpers.regex(/^09\d{9}$/)),
        },
    };
});

const loginInfo = ref<LoginInfo>({
    phone: "",
});

const formValidator$ = useVuelidate(formRules, loginInfo);

const {
    timer: otpBlockerTimePassed,
    start: startOtpBlocker,
    reset: resetOtpBlocker,
    isPending: isResendOtpBlocked,
} = useTimer({
    duration: otpInputsTimer,
});

const { mutateAsync: sendOtp, isPending: sendOtpIsPending } = useOtp();
const { mutateAsync: signIn, isPending: signInIsPending } = useOtpSignIn();

// computed

const sendOtpHandler = async () => {
    await formValidator$.value.$validate();

    if (!sendOtpIsPending.value && !formValidator$.value.$errors.length) {
        try {
            await sendOtp({
                phone: loginInfo.value.phone,
            });
            resetOtpBlocker();
            startOtpBlocker();

            alert("code sent");

            // addToast({
            //     message: "کد برای شما ارسال شد",
            //     options: {
            //         status: "success",
            //     },
            // });

            showOtp.value = true;
        } catch (e) {
            alert("problem with sending code");
            resetOtpBlocker();

            // addToast({
            //     message: "مشکلی پیش آمده",
            //     options: {
            //         status: "error",
            //     },
            // });
        }
    }
};

const handleLogin = async () => {
    if (!showOtp.value) {
        await formValidator$.value.$validate();

        if (!formValidator$.value.$errors.length) {
            await sendOtpHandler();
        }
    } else {
        try {
            const response = await signIn({
                otp: otpCode.value,
                phone: loginInfo.value.phone,
            });

            updateToken(response.access);
            updateRefreshToken(response.refresh);
            await new Promise((resolve) => setTimeout(resolve, 1000));
            await refetchAccount();

            // addToast({
            //     message: "با موفقیت وارد شدید",
            //     options: {
            //         status: "success",
            //     },
            // });

            alert("signed in");

            window.location.href = "/";
        } catch (e) {
            otpCode.value = "";
            // addToast({ message: "مشکلی پیش آمده" });
            alert("problem with sign in");
        }
    }
};
</script>

<template>
    <div
        class="bg-slate-900 w-full h-svh flex-center"
        dir="rtl"
    >
        <div class="w-[500px] bg-slate-800 rounded-2xl px-6 pt-20 pb-6">
            <h2 class="text-center text-slate-100 font-semibold text-4xl pb-20">فرم ورود به سایت</h2>
            <div class="flex flex-col w-full gap-10">
                <input
                    v-model="loginInfo.phone"
                    placeholder="شماره خود را وارد کنید"
                    type="text"
                    inputmode="numeric"
                    :class="formValidator$.phone.$error ? '!border-rose-500' : ''"
                    class="focus:border-blue-500 text-lg font-medium w-full px-4 h-[50px] rounded-xl bg-slate-700 text-white outline-none placeholder:text-slate-400 border-2 border-transparent"
                />

                <input
                    v-model="otpCode"
                    :placeholder="Array.from({ length: otpInputsCount }).fill('_').join('')"
                    type="text"
                    inputmode="numeric"
                    class="focus:border-blue-500 text-center text-lg font-medium tracking-[20px] w-full px-4 h-[50px] rounded-xl bg-slate-700 text-white outline-none placeholder:text-slate-400 border-2 border-transparent"
                />

                <div class="flex items-center gap-4 w-full">
                    <button
                        :disabled="
                            formValidator$.phone.$error || signInIsPending || isResendOtpBlocked || sendOtpIsPending
                        "
                        :class="
                            formValidator$.phone.$error || signInIsPending || isResendOtpBlocked || sendOtpIsPending
                                ? 'opacity-30'
                                : ''
                        "
                        @click="sendOtpHandler"
                        class="transition-all active:translate-y-1 hover:brightness-115 hover:bg-blue-500/10 cursor-pointer border-2 border-blue-500 h-[50px] text-blue-500 rounded-xl w-full"
                    >
                        <template v-if="sendOtpIsPending">
                            <Icon
                                name="svg-spinners:180-ring-with-bg"
                                class="size-[40px]"
                            />
                        </template>
                        <template v-else>
                            ارسال کد
                            {{ isResendOtpBlocked ? otpBlockerTimePassed : "" }}
                        </template>
                    </button>

                    <button
                        :disable="formValidator$.phone.$error || otpCode.length !== otpInputsCount"
                        :class="formValidator$.phone.$error || otpCode.length !== otpInputsCount ? 'opacity-30' : ''"
                        @click="handleLogin"
                        class="transition-all active:translate-y-1 hover:brightness-115 cursor-pointer bg-teal-500 h-[50px] text-white rounded-xl w-full"
                    >
                        <template v-if="signInIsPending">
                            <Icon
                                name="svg-spinners:180-ring-with-bg"
                                class="size-[40px]"
                            />
                        </template>
                        <template v-else> ورود به سایت </template>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<!--

<script lang="ts" setup>
// import

import { helpers, required } from "@vuelidate/validators";
import { useVuelidate } from "@vuelidate/core";
import useOtp from "~/composables/api/auth/useOtp";
import useSignIn from "~/composables/api/auth/useSignIn";
import { definePageMeta } from "#imports";
import useGetAccount from "~/composables/api/account/useGetAccount";
import { useAuth } from "~/composables/api/auth/useAuth";
import { useToast } from "~/composables/global/useToast";
import { useTimer } from "~/composables/global/useTimer";

// types

type LoginInfo = {
    phone: string;
};

// meta

definePageMeta({
    layout: "none",
    middleware: ["check-is-not-logged-in"],
});

// state

const { addToast } = useToast();

const { updateToken, updateRefreshToken } = useAuth();

const { refetch: refetchAccount } = useGetAccount();

const showOtp = ref(false);
const otpCode = ref([]);

const formRules = computed(() => {
    return {
        phone: {
            required: helpers.withMessage("Phone is required", required),
            phoneValidator: helpers.withMessage(
                "شماره تلفن وارد شده معتبر نمی باشد",
                helpers.regex(/^[1-9][0-9]{9}$/)
            ),
        },
    };
});

const loginInfo = ref<LoginInfo>({
    phone: "",
});

const formValidator$ = useVuelidate(formRules, loginInfo);

const {
    timer: otpBlockerTimePassed,
    start: startOtpBlocker,
    reset: resetOtpBlocker,
    isPending: isResendOtpBlocked,
} = useTimer({
    duration: 5000,
});

const { mutateAsync: sendOtp, isPending: sendOtpIsPending } = useOtp();
const {
    mutateAsync: signIn,
    isPending: signInIsPending,
    status: signInStatus,
} = useSignIn();

// computed

const sendOtpHandler = async () => {
    if (!sendOtpIsPending.value) {
        try {
            await sendOtp({
                phone: `0${loginInfo.value.phone}`,
            });

            addToast({
                message: "کد برای شما ارسال شد",
                options: {
                    status: "success",
                },
            });

            showOtp.value = true;
        } catch (e) {
            addToast({
                message: "مشکلی پیش آمده",
                options: {
                    status: "error",
                },
            });
        }
    }
};

const handleLogin = async () => {
    if (!showOtp.value) {
        await formValidator$.value.$validate();

        if (!formValidator$.value.$errors.length) {
            await sendOtpHandler();
        }
    } else {
        try {
            const response = await signIn({
                otp: otpCode.value.join(""),
                phone: `0${loginInfo.value.phone}`,
            });

            updateToken(response.access);
            updateRefreshToken(response.refresh);
            await new Promise((resolve) => setTimeout(resolve, 1000));
            await refetchAccount();

            addToast({
                message: "با موفقیت وارد شدید",
                options: {
                    status: "success",
                },
            });

            window.location.href = "/";
        } catch (e) {
            otpCode.value = [];
            addToast({ message: "مشکلی پیش آمده" });
        }
    }
};

const resendOtp = async () => {
    try {
        await sendOtpHandler();
        resetOtpBlocker();
        startOtpBlocker();
    } catch (e) {
        resetOtpBlocker();
    }
};

const resetForm = () => {
    loginInfo.value.phone = "";
    formValidator$.value.$reset();
    otpCode.value = [];
    showOtp.value = false;
};
</script>

<template>
    <div class="w-full flex h-svh items-center relative container">
        <div
            class="bg-[url(/img/pattern-1.png)] -z-10 size-full absolute opacity-70"
            :style="{
                backgroundSize: 150,
                mask: 'linear-gradient(to bottom, black 0%, rgba(0,0,0,0.3) 80%)',
            }"
        />
        <div class="flex items-center justify-center flex-col size-full translate-y-[-80px]">
            <video
                class="aspect-square w-[450px] translate-y-[157px] animate-fade-in"
                src="/video/heymlz/heymlz-handshake-full.webm"
                :style="{
                    filter: 'drop-shadow(0px 4px 20px rgba(0, 0, 0, 0.15))'
                }"
                autoplay
                playsinline
                webkit-playsinline
                muted
            />

            <div
                class="max-w-[600px] w-full p-6 h-[400px] flex flex-col items-center bg-white border shadow-black/10 justify-center border-slate-300 rounded-2xl"
            >
                <h1 class="typo-h-5 mt-8">شماره خود را وارد کنید</h1>

                <form @submit.prevent class="max-w-[500px] w-full mt-12">
                    <Input
                        v-if="!showOtp"
                        class="w-full tracking-[3px] persian-number"
                        v-model="loginInfo.phone"
                        placeholder="۹۳۸۰۱۲۳۴۵۶"
                        dir="ltr"
                        :error="formValidator$.phone.$error"
                    >
                        <template #startItem>
                            <div class="flex items-center gap-3">
                                <Icon
                                    class="translate-y-[-1px] static-icon"
                                    name="twemoji:flag-iran"
                                    size="24"
                                />
                                <span class="text-slate-500 typo-label-sm">
                                    +۹۸
                                </span>
                            </div>
                        </template>
                    </Input>

                    <OtpInput
                        v-else
                        v-model="otpCode"
                        :status="
                            signInStatus === 'success'
                                ? 'success'
                                : signInStatus === 'error'
                                ? 'error'
                                : 'idle'
                        "
                        :disabled="signInIsPending || sendOtpIsPending"
                        :autofocus="true"
                        @complete="handleLogin"
                    />

                    <Button
                        data-testid="send-otp-code-button"
                        v-if="!showOtp"
                        class="rounded-full w-full mt-4"
                        type="submit"
                        @click="handleLogin"
                        :loading="sendOtpIsPending"
                        :disabled="sendOtpIsPending"
                    >
                        ارسال کد
                    </Button>

                    <div v-else class="flex items-center w-full gap-4 mt-4">
                        <Button
                            class="rounded-full w-full mt-4"
                            type="button"
                            variant="secondary"
                            @click="resetForm"
                            :disabled="signInIsPending || sendOtpIsPending"
                        >
                            تغییر شماره
                        </Button>
                        <Button
                            class="rounded-full w-full mt-4"
                            type="submit"
                            @click="resendOtp"
                            :loading="signInIsPending || sendOtpIsPending"
                            :disabled="
                                signInIsPending ||
                                isResendOtpBlocked ||
                                sendOtpIsPending
                            "
                        >
                            ارسال مجدد کد
                            {{ isResendOtpBlocked ? otpBlockerTimePassed : "" }}
                        </Button>
                    </div>

                    <NuxtLink
                        to="/"
                        class="flex items-center gap-2 justify-center mt-6"
                    >
                        <span> بازگشت به فروشگاه </span>
                        <Icon name="ci:left-rotation" size="24" />
                    </NuxtLink>
                </form>
            </div>
        </div>
    </div>
</template>


-->
