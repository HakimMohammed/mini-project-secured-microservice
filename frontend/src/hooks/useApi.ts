import { useState, useEffect } from 'react';
import { AxiosError } from 'axios';
import { ApiError } from '../types';

export const useApi = <T,>(
    apiFunc: () => Promise<T>,
    dependencies: any[] = []
) => {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await apiFunc();
            setData(result);
        } catch (err) {
            const axiosError = err as AxiosError<ApiError>;
            setError(
                axiosError.response?.data?.message ||
                'An error occurred while fetching data'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, dependencies);

    return { data, loading, error, refetch: fetchData };
};
