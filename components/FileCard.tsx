"use client";

import { useState } from "react";
import { UploadedFile, updateFile, deleteFile } from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";
import { motion } from "framer-motion";

type FileCardProps = {
    file: UploadedFile;
    onDelete: (id: string) => void;
};

export function FileCard({ file, onDelete }: FileCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [password, setPassword] = useState("");
    const [maxDownloads, setMaxDownloads] = useState<number | undefined>();
    const [expiresIn, setExpiresIn] = useState<number | undefined>();
    const [copied, setCopied] = useState(false);

    const handleUpdate = async () => {
        try {
            await updateFile(file.id, file.delete_token, {
                password,
                maxDownloads,
                expiresIn,
            });
            toast.success("File updated");
            setIsEditing(false);
        } catch {
            toast.error("Error updating file");
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this file?")) return;

        try {
            await deleteFile(file.id, file.delete_token);
            toast.success("File deleted");
            onDelete(file.id);
        } catch {
            toast.error("Error deleting file");
        }
    };

    const copyLink = () => {
        navigator.clipboard.writeText(
            `${window.location.origin}/download/${file.id}`
        );
        setCopied(true);
        toast.success("Link copied!");
        setTimeout(() => setCopied(false), 2000);
    };

    const getFileExtension = (filename: string) => {
        return filename.split(".").pop()?.toLowerCase() || "";
    };

    const extension = getFileExtension(file.filename);

    const getFileIcon = () => {
        if (["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(extension)) {
            return (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-purple-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                </svg>
            );
        } else if (["mp4", "avi", "mov", "webm"].includes(extension)) {
            return (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                </svg>
            );
        } else if (["mp3", "wav", "ogg"].includes(extension)) {
            return (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                    />
                </svg>
            );
        } else if (
            ["pdf", "doc", "docx", "txt", "xls", "xlsx"].includes(extension)
        ) {
            return (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                </svg>
            );
        } else if (["zip", "rar", "7z", "tar", "gz"].includes(extension)) {
            return (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-amber-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                    />
                </svg>
            );
        } else {
            return (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                </svg>
            );
        }
    };

    return (
        <motion.div
            className="card relative overflow-hidden group"
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
        >
            <div className="absolute inset-0 bg-gradient-to-r from-primary-color to-secondary-color opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"></div>

            <div className="relative flex flex-col">
                <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-lg bg-card-hover-color">
                        {getFileIcon()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate pr-8">
                            {file.filename}
                        </h3>
                        <p className="text-xs text-muted-color mt-1">
                            ID: {file.id}
                        </p>
                    </div>
                </div>

                <div className="relative mt-4 pt-4 border-t border-border-color">
                    <div className="flex items-center justify-between mb-3">
                        <Link
                            href={`/download/${file.id}`}
                            className="inline-flex items-center text-primary-color hover:underline text-sm transition-all hover:translate-x-1"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                />
                            </svg>
                            Download
                        </Link>

                        <button
                            onClick={copyLink}
                            className="text-sm text-muted-color hover:text-foreground-color transition-colors flex items-center"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className={`h-4 w-4 mr-1 ${
                                    copied ? "text-green-500" : ""
                                }`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                {copied ? (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                    />
                                ) : (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                                    />
                                )}
                            </svg>
                            {copied ? "Copied" : "Copy Link"}
                        </button>
                    </div>

                    <div className="flex gap-2 mt-3">
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="flex-1 py-1.5 rounded border border-primary-color text-primary-color text-sm hover:bg-primary-color hover:text-white transition-colors"
                        >
                            {isEditing ? "Cancel" : "Settings"}
                        </button>
                        <button
                            onClick={handleDelete}
                            className="flex items-center justify-center py-1.5 px-3 rounded border border-red-500 text-red-500 text-sm hover:bg-red-500 hover:text-white transition-colors"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                            </svg>
                        </button>
                    </div>

                    {isEditing && (
                        <motion.div
                            className="mt-4 space-y-3"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            <div>
                                <label className="block text-xs font-medium mb-1">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    placeholder="Leave empty if not needed"
                                    className="input text-sm py-2"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1">
                                    Max Downloads
                                </label>
                                <input
                                    type="number"
                                    placeholder="-1 = unlimited"
                                    className="input text-sm py-2"
                                    value={maxDownloads ?? ""}
                                    onChange={(e) =>
                                        setMaxDownloads(
                                            parseInt(e.target.value) ||
                                                undefined
                                        )
                                    }
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1">
                                    Storage Period (hours)
                                </label>
                                <input
                                    type="number"
                                    placeholder="-1 = unlimited"
                                    className="input text-sm py-2"
                                    value={expiresIn ?? ""}
                                    onChange={(e) =>
                                        setExpiresIn(
                                            parseInt(e.target.value) ||
                                                undefined
                                        )
                                    }
                                />
                            </div>
                            <button
                                onClick={handleUpdate}
                                className="btn-primary w-full text-sm py-2"
                            >
                                Save Changes
                            </button>
                        </motion.div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
