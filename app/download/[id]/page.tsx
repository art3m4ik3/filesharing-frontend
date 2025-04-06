"use client";

import { useState, useEffect } from "react";
import { downloadFile, getFileInfo } from "@/lib/api";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";

interface ServerFileInfo {
    id: string;
    key: string;
    size: number;
    meta_data: {
        original_name: string;
        custom_name: string;
        mime_type: string;
        size: number;
        has_password: boolean;
        max_downloads: number;
        expires_at: string;
        uploaded_at: string;
        deletion_token: string;
        download_count: number;
    };
    last_modified: string;
    etag: string;
    is_expired: boolean;
}

const formatFileSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    return mb.toFixed(2) + " MB";
};

const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};

export default function DownloadPage() {
    const { id } = useParams();
    const [password, setPassword] = useState("");
    const [fileInfo, setFileInfo] = useState<ServerFileInfo | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [fileError, setFileError] = useState(false);
    const [showPasswordInput, setShowPasswordInput] = useState(false);
    const [downloadAttempted, setDownloadAttempted] = useState(false);

    useEffect(() => {
        const downloadedFiles = JSON.parse(
            localStorage.getItem("downloadedFiles") || "{}"
        );
        const fileData = downloadedFiles[id as string];
        if (fileData?.password) {
            setPassword(fileData.password);
        }

        getFileInfo(id as string)
            .then((data) => {
                setFileInfo(data.data);
                if (data.data.meta_data.has_password) {
                    setShowPasswordInput(true);
                }
            })
            .catch(() => {
                toast.error("Error getting file information");
                setFileError(true);
            });
    }, [id]);

    const attemptDownload = async (usePassword = false) => {
        try {
            setIsLoading(true);
            const blob = await downloadFile(
                id as string,
                usePassword ? password : ""
            );

            if (usePassword && password) {
                const downloadedFiles = JSON.parse(
                    localStorage.getItem("downloadedFiles") || "{}"
                );
                downloadedFiles[id as string] = {
                    password: password,
                    filename:
                        fileInfo?.meta_data.custom_name ||
                        fileInfo?.meta_data.original_name,
                    downloadedAt: new Date().toISOString(),
                };
                localStorage.setItem(
                    "downloadedFiles",
                    JSON.stringify(downloadedFiles)
                );
            }

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download =
                fileInfo?.meta_data.custom_name ||
                fileInfo?.meta_data.original_name ||
                "download";
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success("Download started!");

            if (usePassword) {
                setShowPasswordInput(false);
                setDownloadAttempted(false);
            }
        } catch (error: any) {
            if (error.code === 401) {
                if (!downloadAttempted && !usePassword) {
                    setShowPasswordInput(true);
                    setDownloadAttempted(true);
                    toast.error("Password required to download file");
                } else if (usePassword) {
                    toast.error("Incorrect password. Try again.");
                    setPassword("");
                }
            } else if (error.code === 403) {
                toast.error("Download limit exceeded");
            } else if (error.code === 410) {
                toast.error("File has expired");
            } else if (error.code === 429) {
                toast.error("Too many requests. Please wait");
            } else {
                toast.error("Error downloading file");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = () => {
        if (password && !showPasswordInput) {
            attemptDownload(true);
        } else if (showPasswordInput && password) {
            attemptDownload(true);
        } else {
            attemptDownload(false);
        }
    };

    const isDownloadAllowed = (): boolean => {
        if (!fileInfo) return false;

        if (fileInfo.is_expired) {
            return false;
        }

        if (
            fileInfo.meta_data.max_downloads > 0 &&
            fileInfo.meta_data.download_count >=
                fileInfo.meta_data.max_downloads
        ) {
            return false;
        }

        return true;
    };

    if (fileInfo && !isDownloadAllowed()) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col justify-center items-center min-h-[70vh] px-4"
            >
                <div className="w-24 h-24 mb-6 text-red-500">
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M15 9l-6 6M9 9l6 6" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold mb-2">File Unavailable</h1>
                <p className="text-muted-color text-center max-w-md">
                    {fileInfo.is_expired
                        ? "File has expired"
                        : "Download limit reached"}
                </p>
                <Link href="/" className="btn btn-primary mt-6">
                    Back to Home
                </Link>
            </motion.div>
        );
    }

    if (fileError) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col justify-center items-center min-h-[70vh] px-4"
            >
                <div className="w-24 h-24 mb-6 text-red-500">
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M15 9l-6 6M9 9l6 6" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold mb-2">File Not Found</h1>
                <p className="text-muted-color text-center max-w-md">
                    The file may have been deleted, expired, or reached its maximum download limit.
                </p>
                <Link href="/" className="btn btn-primary mt-6">
                    Back to Home
                </Link>
            </motion.div>
        );
    }

    if (!fileInfo) {
        return (
            <div className="h-[450px] flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-color"></div>
            </div>
        );
    }

    return (
        <motion.main
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="container mx-auto px-4 py-8"
        >
            <div className="max-w-2xl mx-auto">
                <motion.div
                    className="card"
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 100 }}
                >
                    <div className="flex items-center justify-center">
                        <div className="w-16 h-16 bg-primary-color bg-opacity-10 rounded-full flex items-center justify-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-8 w-8 text-primary-color"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                                />
                            </svg>
                        </div>
                    </div>

                    <h1 className="text-2xl font-bold mb-6 text-center">
                        Download File
                    </h1>

                    <div className="space-y-3">
                        <div className="space-y-2">
                            <div className="p-3 bg-primary-color bg-opacity-5 rounded-lg">
                                <p className="font-medium text-sm text-muted-color">
                                    File Name
                                </p>
                                <p className="font-semibold text-lg break-all">
                                    {fileInfo?.meta_data.custom_name ||
                                        fileInfo?.meta_data.original_name}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                <div className="p-3 bg-primary-color bg-opacity-5 rounded-lg">
                                    <p className="font-medium text-sm text-muted-color">
                                        Size
                                    </p>
                                    <p className="font-semibold">
                                        {formatFileSize(
                                            fileInfo?.meta_data.size || 0
                                        )}
                                    </p>
                                </div>

                                <div className="p-3 bg-primary-color bg-opacity-5 rounded-lg">
                                    <p className="font-medium text-sm text-muted-color">
                                        Downloads
                                    </p>
                                    <p className="font-semibold">
                                        {fileInfo?.meta_data.download_count ||
                                            0}
                                        {fileInfo?.meta_data.max_downloads >
                                            0 &&
                                            ` / ${fileInfo.meta_data.max_downloads}`}
                                    </p>
                                </div>

                                <div className="p-3 bg-primary-color bg-opacity-5 rounded-lg">
                                    <p className="font-medium text-sm text-muted-color">
                                        Uploaded
                                    </p>
                                    <p className="font-semibold">
                                        {formatDate(
                                            fileInfo?.meta_data.uploaded_at ||
                                                ""
                                        )}
                                    </p>
                                </div>

                                {fileInfo?.meta_data.expires_at && (
                                    <div className="p-3 bg-primary-color bg-opacity-5 rounded-lg">
                                        <p className="font-medium text-sm text-muted-color">
                                            Expires
                                        </p>
                                        <p
                                            className={`font-semibold ${
                                                fileInfo.is_expired
                                                    ? "text-red-500"
                                                    : ""
                                            }`}
                                        >
                                            {fileInfo.is_expired
                                                ? "Expired"
                                                : formatDate(
                                                      fileInfo.meta_data
                                                          .expires_at
                                                  )}
                                        </p>
                                    </div>
                                )}
                            </div>
                            {fileInfo?.meta_data.has_password && !password && (
                                <div className="p-3 bg-primary-color bg-opacity-5 rounded-lg">
                                    <p className="font-medium text-sm text-red-500">
                                        File is password protected
                                    </p>
                                </div>
                            )}
                        </div>

                        <motion.div className="space-y-3">
                            {showPasswordInput && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <label className="block text-sm font-medium mb-2">
                                        Download Password
                                    </label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        className="input"
                                        placeholder="Enter password to access file"
                                    />
                                </motion.div>
                            )}

                            <button
                                onClick={handleDownload}
                                disabled={
                                    isLoading ||
                                    (showPasswordInput && !password) ||
                                    !isDownloadAllowed()
                                }
                                className="btn btn-primary w-full group relative"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center">
                                        <svg
                                            className="animate-spin -ml-1 mr-2 h-5 w-5"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938л3-2.647z"
                                            ></path>
                                        </svg>
                                        Downloading...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5 mr-2 transition-transform group-hover:translate-y-1"
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
                                        {showPasswordInput
                                            ? "Download with Password"
                                            : "Download File"}
                                    </span>
                                )}
                            </button>
                        </motion.div>

                        <div className="text-sm text-muted-color text-center mt-4">
                            File will be available for download for a limited
                            time
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.main>
    );
}
