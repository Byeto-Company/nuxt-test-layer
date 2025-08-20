export default defineNuxtRouteMiddleware((from, to) => {
    const runtimeConfig = useRuntimeConfig();
    const pagePath = runtimeConfig.public.appAuth.pagePath;

    const { token } = useAuth();
    const localePath = useLocalePath();

    if (!token.value) {
        return navigateTo(
            localePath({
                path: pagePath,
                query: {
                    cb: from?.path ?? to.path,
                },
            })
        );
    }
});
