// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    devtools: { enabled: true },
    appAuth: {
        internalPage: false,
        otpCount: 4,
        otpTimer: 60,
        pagePath: "/login",
    },
});
