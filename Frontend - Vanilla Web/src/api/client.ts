const API_BASE: string = import.meta.env.VITE_API_URL;

export async function get<TResponse>(
    url: string
): Promise<TResponse | null> {

    const response = await fetch(`${API_BASE}${url}`);

    if (response.status === 404)
        return null;

    if (!response.ok)
        throw new Error(await response.text());

    return response.json();
}

export async function post<TRequest, TResponse>(
    url: string,
    body?: TRequest
): Promise<TResponse> {

    const response = await fetch(`${API_BASE}${url}`, {
        method: "POST",
        ...(body !== undefined && {
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        })
    });

    if (!response.ok)
        throw new Error(await response.text());

    return response.json();
}

export async function put<TRequest, TResponse>(
    url: string,
    body?: TRequest
): Promise<TResponse> {

    const response = await fetch(`${API_BASE}${url}`, {
        method: "PUT",
        ...(body !== undefined && {
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        })
    });

    if (!response.ok)
        throw new Error(await response.text());

    return response.json();
}

export async function del<TResponse>(
    url: string
): Promise<TResponse> {

    const response = await fetch(`${API_BASE}${url}`, {
        method: "DELETE"
    });

    if (!response.ok)
        throw new Error(await response.text());

    return response.json();
}