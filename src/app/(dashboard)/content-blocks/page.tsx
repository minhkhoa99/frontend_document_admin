
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import http from '@/lib/http';
import { Plus, Trash, Edit, Layers, ArrowUp, ArrowDown } from 'lucide-react';

interface ContentBlock {
    id: string;
    title: string;
    type: 'LATEST' | 'POPULAR' | 'FEATURED' | 'CATEGORY';
    order: number;
    isVisible: boolean;
    config?: any;
    createdAt: string;
}

export default function ContentBlocksPage() {
    const [blocks, setBlocks] = useState<ContentBlock[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBlock, setEditingBlock] = useState<ContentBlock | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        type: 'LATEST',
        order: 0,
        isVisible: true,
        // config related
        categoryId: '',
        limit: 10
    });

    const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);

    useEffect(() => {
        fetchBlocks();
        fetchCategories();
    }, []);

    const fetchBlocks = async () => {
        try {
            const res = await http.get('/content-blocks');
            setBlocks(res.data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await http.get('/categories');
            setCategories(res.data?.data || res.data || []);
        } catch (error) {
            console.error(error);
        }
    };

    const handleOpenModal = (block?: ContentBlock) => {
        if (block) {
            setEditingBlock(block);
            setFormData({
                title: block.title,
                type: block.type,
                order: block.order,
                isVisible: block.isVisible,
                categoryId: block.config?.categoryId || '',
                limit: block.config?.limit || 10
            });
        } else {
            setEditingBlock(null);
            setFormData({
                title: '',
                type: 'LATEST',
                order: blocks.length + 1,
                isVisible: true,
                categoryId: '',
                limit: 10
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const config: any = { limit: Number(formData.limit) };
        if (formData.type === 'CATEGORY') {
            config.categoryId = formData.categoryId;
        }

        const payload = {
            title: formData.title,
            type: formData.type,
            order: Number(formData.order),
            isVisible: formData.isVisible,
            config
        };

        try {
            if (editingBlock) {
                await http.patch(`/content-blocks/${editingBlock.id}`, payload);
            } else {
                await http.post('/content-blocks', payload);
            }
            fetchBlocks();
            setIsModalOpen(false);
        } catch (error) {
            console.error("Failed to save block", error);
            alert("Lỗi khi lưu khối hiển thị");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa khối này?')) return;
        try {
            await http.delete(`/content-blocks/${id}`);
            fetchBlocks();
        } catch (error) {
            console.error("Failed to delete", error);
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Layers className="h-8 w-8 text-blue-600" />
                    Quản lý Khối Hiển Thị
                </h1>
                <Button onClick={() => handleOpenModal()} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" /> Thêm mới
                </Button>
            </div>

            <div className="rounded-md border bg-white dark:bg-gray-800 shadow">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Thứ tự</TableHead>
                            <TableHead>Tiêu đề</TableHead>
                            <TableHead>Loại</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead className="text-right">Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {blocks.map((block) => (
                            <TableRow key={block.id}>
                                <TableCell className="font-medium">{block.order}</TableCell>
                                <TableCell>{block.title}</TableCell>
                                <TableCell>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {block.type}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    {block.isVisible ? (
                                        <span className="text-green-600 font-medium">Hiển thị</span>
                                    ) : (
                                        <span className="text-gray-500">Ẩn</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button variant="ghost" size="icon" onClick={() => handleOpenModal(block)}>
                                        <Edit className="h-4 w-4 text-gray-500" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(block.id)}>
                                        <Trash className="h-4 w-4 text-red-500" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{editingBlock ? 'Chỉnh sửa khối' : 'Thêm khối mới'}</DialogTitle>
                        <DialogDescription>
                            Cấu hình các khối nội dung hiển thị trên trang chủ.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="title" className="text-right">Tiêu đề</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="type" className="text-right">Loại</Label>
                            <div className="col-span-3">
                                <Select
                                    value={formData.type}
                                    onValueChange={(val: any) => setFormData({ ...formData, type: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn loại" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="LATEST">Mới nhất</SelectItem>
                                        <SelectItem value="POPULAR">Phổ biến</SelectItem>
                                        <SelectItem value="FEATURED">Nổi bật</SelectItem>
                                        <SelectItem value="CATEGORY">Theo danh mục</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {formData.type === 'CATEGORY' && (
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="category" className="text-right">Danh mục</Label>
                                <div className="col-span-3">
                                    <Select
                                        value={formData.categoryId}
                                        onValueChange={(val) => setFormData({ ...formData, categoryId: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn danh mục" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map(cat => (
                                                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="order" className="text-right">Thứ tự</Label>
                            <Input
                                id="order"
                                type="number"
                                value={formData.order}
                                onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                                className="col-span-3"
                            />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="limit" className="text-right">Số lượng</Label>
                            <Input
                                id="limit"
                                type="number"
                                value={formData.limit}
                                onChange={(e) => setFormData({ ...formData, limit: Number(e.target.value) })}
                                className="col-span-3"
                            />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Trạng thái</Label>
                            <div className="col-span-3 flex items-center space-x-2">
                                <Checkbox
                                    id="isVisible"
                                    checked={formData.isVisible}
                                    onCheckedChange={(checked) => setFormData({ ...formData, isVisible: checked as boolean })}
                                />
                                <label htmlFor="isVisible" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Hiển thị trên trang chủ
                                </label>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="submit">{editingBlock ? 'Cập nhật' : 'Tạo mới'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
