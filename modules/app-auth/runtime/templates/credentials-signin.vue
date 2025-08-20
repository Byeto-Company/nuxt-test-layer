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