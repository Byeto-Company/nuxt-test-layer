import { createResolver, defineNuxtModule, extendPages } from "@nuxt/kit";
import { defu } from "defu";
import { addCustomTab } from "@nuxt/devtools-kit";

type ModuleOptions = {
    internalPage: boolean;
    pagePath: string;
    otpCount: number;
    otpTimer: number;
    strategy: "otp" | "credentials";
};

export default defineNuxtModule<ModuleOptions>({
    meta: {
        name: "app-auth",
        configKey: "appAuth",
    },

    defaults: {
        internalPage: true,
        pagePath: "/signin",
        otpCount: 6,
        otpTimer: 60,
        strategy: "otp",
    },

    async setup(moduleOptions, nuxt) {
        const resolver = createResolver(import.meta.url);

        nuxt.options.runtimeConfig.public.appAuth = defu(nuxt.options.runtimeConfig.public.appAuth, {
            pagePath: moduleOptions.pagePath,
            otpCount: moduleOptions.otpCount,
            otpTimer: moduleOptions.otpTimer,
            internalPage: moduleOptions.internalPage,
            strategy: moduleOptions.strategy,
        });

        if (moduleOptions?.internalPage && moduleOptions.pagePath.length > 0) {
            if (moduleOptions.strategy === "otp") {
                extendPages((pages) => {
                    pages.unshift({
                        name: "signin",
                        path: (moduleOptions.pagePath as string) ?? "/signin",
                        file: resolver.resolve("runtime/templates/otp-signin.vue"),
                    });
                });
            } else if (moduleOptions.strategy === "credentials") {
                extendPages((pages) => {
                    pages.unshift({
                        name: "signin",
                        path: (moduleOptions.pagePath as string) ?? "/signin",
                        file: resolver.resolve("runtime/templates/credentials-signin.vue"),
                    });
                });
            }
        }

        extendPages((pages) => {
            pages.unshift({
                name: "devtools-auth-view",
                path: "/devtools-auth-view",
                file: resolver.resolve("runtime/templates/devtools-auth-view.vue"),
            });
        });

        addCustomTab({
            name: "app-auth",
            title: "App Auth",
            icon: "lucide:lock-keyhole",
            view: {
                type: "iframe",
                src: "/devtools-auth-view",
            },
        });
    },
});
