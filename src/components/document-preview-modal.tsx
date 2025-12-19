'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

interface DocumentPreviewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    document: {
        title: string;
        fileUrl: string;
    } | null;
}

export function DocumentPreviewModal({ open, onOpenChange, document }: DocumentPreviewModalProps) {
    const [fileType, setFileType] = useState<string>('');

    useEffect(() => {
        if (document?.fileUrl) {
            // Remove query params if any
            const cleanUrl = document.fileUrl.split('?')[0];
            const ext = cleanUrl.split('.').pop()?.toLowerCase();
            setFileType(ext || '');
        }
    }, [document]);

    if (!document) return null;

    const isPdf = fileType === 'pdf';
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileType);
    const isOffice = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(fileType);
    const isLocalhost = typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    const getPreviewContent = () => {
        if (isPdf) {
            return (
                <iframe
                    src={document.fileUrl}
                    className="w-full h-full rounded-md border-0"
                    title="PDF Preview"
                />
            );
        }
        if (isImage) {
            return (
                <div className="flex items-center justify-center p-4 bg-black/5 h-full w-full rounded-md overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={document.fileUrl}
                        alt={document.title}
                        className="max-w-full max-h-full object-contain shadow-sm"
                    />
                </div>
            );
        }
        if (isOffice) {
            if (isLocalhost) {
                return (
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center text-gray-500 gap-4">
                        <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg flex items-center gap-2 max-w-md">
                            <AlertCircle className="h-5 w-5 flex-shrink-0" />
                            <p className="text-sm">
                                Cannot preview Office documents on localhost because the viewer service (Google/Microsoft) cannot access your local files.
                            </p>
                        </div>
                        <Button variant="outline" onClick={() => window.open(document.fileUrl, '_blank')}>
                            Open in new tab
                        </Button>
                    </div>
                );
            }

            const encodedUrl = encodeURIComponent(document.fileUrl);
            const googleViewerUrl = `https://docs.google.com/viewer?url=${encodedUrl}&embedded=true`;
            // Microsoft Viewer alternative: `https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`

            return (
                <div className="w-full h-full flex flex-col relative">
                    <iframe
                        src={googleViewerUrl}
                        className="w-full h-full border-0"
                        title="Office Preview"
                    />
                </div>
            );
        }

        // Fallback for others
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-4">
                <p>Preview format ({fileType}) not supported directly.</p>
                <Button variant="outline" onClick={() => window.open(document.fileUrl, '_blank')}>
                    Open in new tab
                </Button>
            </div>
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl w-[95vw] h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
                <DialogHeader className="px-6 py-4 border-b flex flex-row items-center justify-between space-y-0 bg-white dark:bg-zinc-950 z-10">
                    <DialogTitle className="truncate pr-8 flex-1" title={document.title}>
                        {document.title}
                    </DialogTitle>

                </DialogHeader>
                <div className="flex-1 w-full bg-gray-100 dark:bg-zinc-900 overflow-hidden relative">
                    {getPreviewContent()}
                </div>
            </DialogContent>
        </Dialog>
    );
}
