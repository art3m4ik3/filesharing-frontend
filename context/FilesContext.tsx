"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { UploadedFile } from "@/lib/api";

type FilesContextType = {
    files: UploadedFile[];
    addFile: (file: UploadedFile) => void;
    removeFile: (id: string) => void;
};

const FilesContext = createContext<FilesContextType | null>(null);

export function FilesProvider({ children }: { children: React.ReactNode }) {
    const [files, setFiles] = useState<UploadedFile[]>([]);

    useEffect(() => {
        try {
            const savedFilesData = JSON.parse(
                localStorage.getItem("uploadedFiles") || "{}"
            );
            const filesArray = Object.values(savedFilesData).map(
                (fileData: any) => ({
                    ...fileData,
                    url:
                        fileData.url ||
                        `${window.location.origin}/download/${fileData.id}`,
                    delete_url:
                        fileData.delete_url ||
                        `${window.location.origin}/api/files/${fileData.id}`,
                })
            );
            setFiles(filesArray);
        } catch (error) {
            console.error("Error loading files:", error);
        }
    }, []);

    useEffect(() => {
        const filesObject = files.reduce((acc, file) => {
            acc[file.id] = file;
            return acc;
        }, {} as Record<string, UploadedFile>);

        localStorage.setItem("uploadedFiles", JSON.stringify(filesObject));
    }, [files]);

    const addFile = (file: UploadedFile) => {
        setFiles((prev) => [...prev, file]);
    };

    const removeFile = (id: string) => {
        setFiles((prev) => prev.filter((file) => file.id !== id));
    };

    return (
        <FilesContext.Provider value={{ files, addFile, removeFile }}>
            {children}
        </FilesContext.Provider>
    );
}

export function useFiles() {
    const context = useContext(FilesContext);
    if (!context) {
        throw new Error("useFiles must be used within a FilesProvider");
    }
    return context;
}
