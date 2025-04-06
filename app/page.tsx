"use client";

import { FilePond } from "react-filepond";
import { useState, useEffect } from "react";
import { UploadOptions, UploadedFile, uploadFile } from "@/lib/api";
import "filepond/dist/filepond.min.css";
import "@/styles/filepond-theme.css";
import { toast } from "sonner";
import { FileCard } from "@/components/FileCard";
import { motion } from "framer-motion";
import { useFiles } from "@/context/FilesContext";

export default function Home() {
    const [options, setOptions] = useState<UploadOptions>({
        maxDownloads: -1,
        expiresIn: -1,
    });
    const [pond, setPond] = useState<FilePond | null>(null);
    const [isFileSelected, setIsFileSelected] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const { files: uploadedFiles, addFile, removeFile } = useFiles();

    useEffect(() => {
        const updateTheme = () => {
            const isDark = window.matchMedia(
                "(prefers-color-scheme: dark)"
            ).matches;
            document.documentElement.setAttribute(
                "data-theme",
                isDark ? "dark" : "light"
            );
        };

        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        mediaQuery.addEventListener("change", updateTheme);
        updateTheme();

        return () => mediaQuery.removeEventListener("change", updateTheme);
    }, []);

    const handleUploadComplete = (file: UploadedFile) => {
        const newFile = {
            ...file,
            url: `${window.location.origin}/download/${file.id}`,
            delete_url: `${window.location.origin}/api/files/${file.id}`,
        };
        addFile(newFile);
        setIsUploading(false);
        setIsFileSelected(false);

        if (pond) {
            pond.removeFile();
        }
    };

    const handleFileDelete = (id: string) => {
        removeFile(id);
    };

    const handleFileAdd = () => {
        setIsFileSelected(true);
    };

    const handleFileRemove = () => {
        setIsFileSelected(false);
    };

    const handleUploadClick = async () => {
        if (!pond || !pond.getFile()) {
            toast.error("Выберите файл для загрузки");
            return;
        }

        setIsUploading(true);
        try {
            pond.processFile();
        } catch {
            setIsUploading(false);
            toast.error("Ошибка при загрузке файла");
        }
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 100 },
        },
    };

    return (
        <main className="container mx-auto px-4 py-12">
            <motion.div
                className="max-w-3xl mx-auto space-y-12"
                initial="hidden"
                animate="show"
                variants={container}
            >
                <motion.div className="text-center" variants={item}>
                    <h1 className="text-5xl font-bold mb-6 text-gradient">
                        Secure File Upload
                    </h1>
                    <p className="text-xl text-muted-color mt-2 max-w-xl mx-auto">
                        Upload and share files anonymously with maximum data protection
                    </p>
                </motion.div>

                <motion.div
                    className="card border-t-4 border-t-primary-color relative overflow-hidden"
                    variants={item}
                >
                    <div className="absolute -right-16 -top-16 w-32 h-32 bg-primary-color opacity-10 rounded-full"></div>
                    <div className="absolute -left-20 -bottom-20 w-40 h-40 bg-secondary-color opacity-10 rounded-full"></div>

                    <h2 className="text-2xl font-bold mb-6 flex items-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 mr-2 text-primary-color"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                        </svg>
                        Upload New File
                    </h2>

                    <div className="grid gap-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium mb-1">
                                    File Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="File name (optional)"
                                    className="input"
                                    onChange={(e) =>
                                        setOptions({
                                            ...options,
                                            filename: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium mb-1">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    placeholder="Password (optional)"
                                    className="input"
                                    onChange={(e) =>
                                        setOptions({
                                            ...options,
                                            password: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Maximum Downloads
                                </label>
                                <input
                                    type="number"
                                    placeholder="Unlimited (-1)"
                                    className="input"
                                    value={options.maxDownloads}
                                    onChange={(e) =>
                                        setOptions({
                                            ...options,
                                            maxDownloads: parseInt(
                                                e.target.value
                                            ),
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Storage Period (hours)
                                </label>
                                <input
                                    type="number"
                                    placeholder="Unlimited (-1)"
                                    className="input"
                                    value={options.expiresIn}
                                    onChange={(e) =>
                                        setOptions({
                                            ...options,
                                            expiresIn: parseInt(e.target.value),
                                        })
                                    }
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <FilePond
                            ref={(ref) => setPond(ref)}
                            allowMultiple={false}
                            maxFiles={1}
                            server={{
                                process: async (fieldName, file) => {
                                    try {
                                        const response = await uploadFile(
                                            file as unknown as File,
                                            options
                                        );
                                        handleUploadComplete(response.data);
                                        toast.success("File uploaded successfully!");
                                        return {
                                            abortLoad: true,
                                        };
                                    } catch (error) {
                                        setIsUploading(false);
                                        toast.error(
                                            "Error uploading file"
                                        );
                                        throw error;
                                    }
                                },
                            }}
                            onaddfile={handleFileAdd}
                            onremovefile={handleFileRemove}
                            credits={false}
                            className="filepond--root"
                            labelIdle='Drag & drop your file or <span class="filepond--label-action">Browse</span>'
                            instantUpload={false}
                        />

                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{
                                opacity: isFileSelected ? 1 : 0,
                                height: isFileSelected ? "auto" : 0,
                            }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                        >
                            <button
                                onClick={handleUploadClick}
                                disabled={!isFileSelected || isUploading}
                                className="btn btn-primary w-full mt-4"
                            >
                                {isUploading ? (
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
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                        Uploading...
                                    </span>
                                ) : (
                                    "Upload File"
                                )}
                            </button>
                        </motion.div>
                    </div>
                </motion.div>

                <motion.div variants={item} className="bg-card rounded-xl p-6">
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="p-3 bg-primary-color bg-opacity-10 rounded-full">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6 text-primary-color"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold">
                            How it Works?
                        </h3>
                    </div>
                    <ul className="space-y-2 ml-6 list-disc text-muted-color">
                        <li>Upload any file type up to 100MB</li>
                        <li>Get a unique download link</li>
                        <li>Set a password for extra protection</li>
                        <li>Limit downloads or storage time</li>
                        <li>All files are encrypted and automatically deleted</li>
                    </ul>
                </motion.div>
            </motion.div>

            {uploadedFiles.length > 0 && (
                <motion.div
                    className="mt-16 space-y-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <h2 className="text-2xl font-bold text-center relative">
                        <span className="relative">
                            Your Files
                            <span className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-primary-color to-secondary-color"></span>
                        </span>
                    </h2>
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        variants={container}
                        initial="hidden"
                        animate="show"
                    >
                        {uploadedFiles.map((file, index) => (
                            <motion.div
                                key={file.id}
                                variants={item}
                                custom={index}
                                transition={{ delay: index * 0.05 }}
                            >
                                <FileCard
                                    file={file}
                                    onDelete={handleFileDelete}
                                />
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>
            )}
        </main>
    );
}
