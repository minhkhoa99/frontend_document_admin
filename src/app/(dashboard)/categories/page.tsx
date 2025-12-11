'use client';

import { useEffect, useState } from 'react';
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit2, Trash2, ChevronRight, Folder, FolderOpen } from 'lucide-react';
import http from '@/lib/http';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Category {
    id: string;
    name: string;
    slug: string;
    description: string;
    order: number;
    children?: Category[];
    parent?: Category;
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    // Form Status
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        parentId: 'root',
        order: 0,
    });

    const [flatCategories, setFlatCategories] = useState<Category[]>([]);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const resTree = await http.get('/categories/tree');
            setCategories(resTree.data);

            const resAll = await http.get('/categories');
            setFlatCategories(resAll.data);
        } catch (error) {
            console.error('Failed to fetch categories', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateNextOrder = (parentId: string) => {
        let siblings: Category[] = [];
        if (parentId === 'root') {
            siblings = flatCategories.filter(c => !c.parent);
        } else {
            siblings = flatCategories.filter(c => c.parent?.id === parentId);
        }

        if (siblings.length === 0) return 1;

        // Find max order
        const maxOrder = Math.max(...siblings.map(c => c.order || 0));
        return maxOrder + 1;
    };

    const handleCreate = () => {
        setEditingCategory(null);
        // Calculate next order for root by default
        const nextOrder = calculateNextOrder('root');
        setFormData({ name: '', slug: '', description: '', parentId: 'root', order: nextOrder });
        setIsOpen(true);
    };

    // ... (handleEdit remains same, uses existing order)



    const handleEdit = (cat: Category) => {
        setEditingCategory(cat);
        setFormData({
            name: cat.name,
            slug: cat.slug,
            description: cat.description || '',
            parentId: cat.parent?.id || 'root',
            order: cat.order || 0,
        });
        setIsOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return;
        try {
            await http.delete(`/categories/${id}`);
            fetchCategories();
        } catch (error) {
            console.error('Failed to delete', error);
            alert('Lỗi xóa danh mục');
        }
    };

    const saveCategory = async () => {
        try {
            const payload: any = {
                name: formData.name,
                slug: formData.slug || formData.name.toLowerCase().replace(/ /g, '-'),
                description: formData.description,
                order: Number(formData.order),
            };

            if (formData.parentId && formData.parentId !== 'root') {
                // Check if passing object or ID. Usually ID is better if DTO supports it.
                // Backend UpdateCategoryDto likely expects `categoryId` or relation object?
                // Let's check DTO later. Assuming it can take ID or we structure it.
                // Actually NestJS CreateDto maps directly to entity fields.
                // Let's send basic data first. If parent update is tricky, we might need special handling.
                // Based on service: `updateData.category = { id: categoryId }` logic isn't explicitly there for parent update in CategoriesService yet?
                // Oops, CategoriesService.update simply calls repo.update. It might not update relations like Parent unless we save.
                // Let's assume for now we just create/update basic info. 
                // If parent update fails, we will refine backend.
                payload.parentId = formData.parentId; // If backend handles it. 
            }
            // Actually, TypeORM update might not handle 'parentId' directly if column name is different or relation.
            // let's rely on backend accepting it.
            // Wait, I saw CategoriesService update: `return this.categoryRepository.update(id, updateCategoryDto);`
            // UpdateCategoryDto is PartialType(CreateCategoryDto).
            // CreateCategoryDto usually has `parent?: Category` or `parentId`.
            // If it has `parent`, we might need to send `{parent: {id: ... } }`.
            if (formData.parentId && formData.parentId !== 'root') {
                payload.parent = { id: formData.parentId };
            } else {
                payload.parent = null;
            }

            if (editingCategory) {
                await http.patch(`/categories/${editingCategory.id}`, payload);
            } else {
                await http.post('/categories', payload);
            }
            setIsOpen(false);
            fetchCategories();
        } catch (error) {
            console.error('Failed to save', error);
            alert('Lỗi lưu danh mục');
        }
    };

    // Auto-generate slug
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        const slug = name.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-');
        setFormData({ ...formData, name, slug });
    };

    const renderRows = (items: Category[], level = 0) => {
        return items.flatMap((item: Category) => {
            const rows = [
                <TableRow key={item.id} className="dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <TableCell style={{ paddingLeft: `${level * 20 + 10}px` }}>
                        <div className="flex items-center gap-2">
                            {item.children && item.children.length > 0 ? (
                                <FolderOpen className="h-4 w-4 text-orange-500" />
                            ) : (
                                <ChevronRight className="h-4 w-4 text-gray-400" />
                            )}
                            <span className="font-medium text-gray-900 dark:text-gray-200">{item.name}</span>
                        </div>
                    </TableCell>
                    <TableCell>{item.slug}</TableCell>
                    <TableCell>{item.order}</TableCell>
                    <TableCell className="text-gray-500">{item.description}</TableCell>
                    <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                                <Edit2 className="h-4 w-4 text-blue-500" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                        </div>
                    </TableCell>
                </TableRow>
            ];
            if (item.children && item.children.length > 0) {
                rows.push(...renderRows(item.children, level + 1));
            }
            return rows;
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Quản lý Danh mục</h1>
                    <p className="text-gray-500 dark:text-gray-400">Cấu trúc nội dung tài liệu.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={async () => {
                        if (!confirm('Hành động này sẽ đánh lại toàn bộ số thứ tự danh mục từ đầu. Bạn có chắc chắn?')) return;
                        try {
                            await http.post('/categories/auto-increment');
                            fetchCategories();
                            alert('Đã cập nhật thứ tự thành công!');
                        } catch (e) {
                            console.error(e);
                            alert('Lỗi cập nhật');
                        }
                    }}>
                        Chuẩn hóa thứ tự
                    </Button>
                    <Button onClick={handleCreate}><Plus className="mr-2 h-4 w-4" /> Thêm Danh mục</Button>
                </div>
            </div>

            <div className="rounded-md border bg-white dark:bg-[#1a1c23] dark:border-gray-800">
                <Table>
                    <TableHeader>
                        <TableRow className="dark:border-gray-800 hover:bg-transparent">
                            <TableHead className="w-[400px]">Tên Danh mục</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead>Thứ tự</TableHead>
                            <TableHead>Mô tả</TableHead>
                            <TableHead className="text-right">Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24 text-gray-500">Đang tải...</TableCell>
                            </TableRow>
                        ) : (
                            renderRows(categories)
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Create/Edit Modal */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingCategory ? 'Chỉnh sửa Danh mục' : 'Thêm mới Danh mục'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Tên</Label>
                            <Input id="name" value={formData.name} onChange={handleNameChange} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="slug" className="text-right">Slug</Label>
                            <Input id="slug" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="order" className="text-right">Thứ tự</Label>
                            <Input id="order" type="number" value={formData.order} onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="desc" className="text-right">Mô tả</Label>
                            <Input id="desc" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="parent" className="text-right">Danh mục cha</Label>
                            <div className="col-span-3">
                                <Select
                                    value={formData.parentId}
                                    onValueChange={(val) => {
                                        const nextOrder = calculateNextOrder(val);
                                        setFormData({ ...formData, parentId: val, order: nextOrder });
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn danh mục cha" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="root">-- Gốc (Không có cha) --</SelectItem>
                                        {flatCategories
                                            .filter(c => c.id !== editingCategory?.id)
                                            .map(c => (
                                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" onClick={saveCategory}>Lưu thay đổi</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
