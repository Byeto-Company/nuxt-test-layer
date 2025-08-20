const useServerSideAuthCheck = () => {
    const { checkAuth } = useAuth();
    const { suspense } = useGetAccount();

    onServerPrefetch(async () => {
        const isValid = await checkAuth();
        if (isValid) {
            await suspense();
        }
    });
};

export default useServerSideAuthCheck;
