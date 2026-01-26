

export const getSessions = async () => {
    const res = await fetch('/api/chat/sessions', {
        method: "GET"
    });

    return await res.json();
}