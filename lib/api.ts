const API_URL = process.env.API_URL || "http://localhost:3000/api";

export type FileMetadata = {
    id: string;
    originalName: string;
    customName?: string;
    mimeType: string;
    size: number;
    hasPassword: boolean;
    maxDownloads: number;
    downloadsCount: number;
    expiresAt: string;
    createdAt: string;
    updatedAt: string;
};

export type UploadedFile = {
    password: string | null;
    id: string;
    filename: string;
    size: number;
    mime_type: string;
    url: string;
    delete_url: string;
    delete_token: string;
    expires_at: string | null;
};

export type UploadResponse = {
    status: "success";
    code: number;
    data: UploadedFile;
};

export type UploadOptions = {
    filename?: string;
    password?: string;
    maxDownloads?: number;
    expiresIn?: number;
};

export async function uploadFile(
    file: File,
    options?: UploadOptions
): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append("file", file);

    if (options?.filename) formData.append("filename", options.filename);
    if (options?.password) formData.append("password", options.password);
    if (options?.maxDownloads !== undefined)
        formData.append("maxDownloads", options.maxDownloads.toString());
    if (options?.expiresIn !== undefined)
        formData.append("expiresIn", options.expiresIn.toString());

    const response = await fetch(`${API_URL}/files`, {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        throw new Error("Upload failed");
    }

    return response.json();
}

export async function getFiles(page = 1, limit = 10) {
    const response = await fetch(
        `${API_URL}/files?page=${page}&limit=${limit}`
    );
    return response.json();
}

export async function updateFile(
    id: string,
    token: string,
    options: Partial<UploadOptions>
) {
    const response = await fetch(`${API_URL}/files/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(options),
    });

    if (!response.ok) {
        throw new Error("Update failed");
    }

    return response.json();
}

export async function deleteFile(id: string, token: string) {
    const response = await fetch(`${API_URL}/files/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Delete failed");
    }

    return response.json();
}

export async function downloadFile(id: string, password?: string) {
    const response = await fetch(
        `${API_URL}/files/${id}/download${
            password ? `?password=${password}` : ""
        }`
    );

    if (!response.ok) {
        throw new Error("Download failed");
    }

    return response.blob();
}

export async function getFileInfo(id: string) {
    const response = await fetch(`${API_URL}/files/${id}`);

    if (!response.ok) {
        throw new Error("Failed to get file info");
    }

    return response.json();
}
