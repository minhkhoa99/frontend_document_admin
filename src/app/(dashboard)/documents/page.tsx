'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Check, X, Eye, FileText } from 'lucide-react';
import http from '@/lib/http';
import { cn } from '@/lib/utils';
import { DocumentPreviewModal } from '@/components/document-preview-modal';

interface Document {
    id: string;
    title: string;
    status: 'pending' | 'approved' | 'rejected';
    price?: { amount: number; currency: string };
    author?: { fullName: string; email: string };
    category?: { name: string };
    createdAt: string;
    fileUrl: string;
}

export default function DocumentsPage() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
    const [previewOpen, setPreviewOpen] = useState(false);

    const handlePreview = (doc: Document) => {
        setPreviewDoc(doc);
        setPreviewOpen(true);
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const res = await http.get('/documents');
            // Mock sort by date desc
            const docs = (res.data.data || []).sort((a: Document, b: Document) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setDocuments(docs);
        } catch (error) {
            console.error('Failed to fetch documents', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        try {
            await http.patch(`/documents/${id}/approve`);
            setDocuments(documents.map(d => d.id === id ? { ...d, status: 'approved' } : d));
        } catch (error) {
            console.error('Failed to approve', error);
            alert('Lỗi phê duyệt tài liệu');
        }
    };

    const handleReject = async (id: string) => {
        if (!confirm('Bạn có chắc chắn muốn từ chối tài liệu này?')) return;
        try {
            await http.patch(`/documents/${id}/reject`);
            setDocuments(documents.map(d => d.id === id ? { ...d, status: 'rejected' } : d));
        } catch (error) {
            console.error('Failed to reject', error);
            alert('Lỗi từ chối tài liệu');
        }
    };

    const filteredDocuments = documents.filter(doc => {
        if (filter === 'all') return true;
        return doc.status === filter;
    });

    if (loading) return <div className="p-8 text-center text-gray-500">Đang tải danh sách tài liệu...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Kiểm duyệt Tài liệu</h1>
                    <p className="text-gray-500 dark:text-gray-400">Quản lý và phê duyệt nội dung đăng tải.</p>
                </div>
            </div>

            <Tabs defaultValue="all" className="w-full" onValueChange={setFilter}>
                <TabsList className="bg-white dark:bg-[#1a1c23] border dark:border-gray-800">
                    <TabsTrigger value="all">Tất cả</TabsTrigger>
                    <TabsTrigger value="pending" className="data-[state=active]:text-yellow-600">Chờ duyệt</TabsTrigger>
                    <TabsTrigger value="approved" className="data-[state=active]:text-green-600">Đã duyệt</TabsTrigger>
                    <TabsTrigger value="rejected" className="data-[state=active]:text-red-600">Đã từ chối</TabsTrigger>
                </TabsList>

                <div className="mt-4 rounded-md border bg-white dark:bg-[#1a1c23] dark:border-gray-800">
                    <Table>
                        <TableHeader>
                            <TableRow className="dark:border-gray-800 hover:bg-transparent">
                                <TableHead className="w-[300px]">Tên tài liệu</TableHead>
                                <TableHead>Tác giả</TableHead>
                                <TableHead>Danh mục</TableHead>
                                <TableHead>Giá</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead className="text-right">Hành động</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredDocuments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24 text-gray-500">
                                        Không có tài liệu nào.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredDocuments.map((doc) => (
                                    <TableRow key={doc.id} className="dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-900 dark:text-gray-200 line-clamp-1" title={doc.title}>
                                                    {doc.title}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(doc.createdAt).toLocaleDateString('vi-VN')}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                                    {doc.author?.fullName || 'Unknown'}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {doc.author?.email}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="font-normal">
                                                {doc.category?.name || 'Chưa phân loại'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {doc.price?.amount
                                                ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(doc.price.amount)
                                                : 'Miễn phí'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={cn(
                                                doc.status === 'approved' ? 'bg-green-100 text-green-700 hover:bg-green-100' :
                                                    doc.status === 'pending' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' :
                                                        'bg-red-100 text-red-700 hover:bg-red-100'
                                            )}>
                                                {doc.status === 'approved' ? 'Đã duyệt' :
                                                    doc.status === 'pending' ? 'Chờ duyệt' : 'Từ chối'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" title="Xem trước" onClick={() => handlePreview(doc)}>
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                {doc.status === 'pending' && (
                                                    <>
                                                        <Button
                                                            variant="outline" size="icon"
                                                            className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                                                            onClick={() => handleApprove(doc.id)}
                                                            title="Duyệt"
                                                        >
                                                            <Check className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="outline" size="icon"
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                                            onClick={() => handleReject(doc.id)}
                                                            title="Từ chối"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Tabs>

            <DocumentPreviewModal
                open={previewOpen}
                onOpenChange={setPreviewOpen}
                document={previewDoc}
            />
        </div >
    );
}
