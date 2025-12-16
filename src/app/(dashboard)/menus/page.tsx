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
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit2, Trash2, ChevronRight, Folder, FolderOpen } from 'lucide-react';
import http from '@/lib/http';
import { cn } from '@/lib/utils';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";


interface Menu {
    id: string;
    label: string;
    link: string;
    icon?: string;
    order: number;
    children?: Menu[];
    parentId?: string;
    parent?: Menu;
    isActive: boolean;
}

interface Category {
    id: string;
    name: string;
    slug: string;
}

export default function MenusPage() {
    const [menus, setMenus] = useState<Menu[]>([]);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [editingMenu, setEditingMenu] = useState<Menu | null>(null);

    // Form Status
    const [formData, setFormData] = useState({
        label: '',
        link: '',
        icon: '',
        parentId: 'root',
        order: 0,
    });

    const [flatMenus, setFlatMenus] = useState<Menu[]>([]); // For Parent Selection
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch tree for display
            const resTree = await http.get('/menus/tree');
            setMenus(resTree.data);

            // Fetch all for flattened parent selection (optional, or just flatten tree)
            const resAll = await http.get('/menus');
            setFlatMenus(resAll.data);

            const resCats = await http.get('/categories');
            setCategories(resCats.data);

        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateNextOrder = (parentId: string) => {
        let siblings: Menu[] = [];
        if (parentId === 'root') {
            siblings = flatMenus.filter(m => !m.parentId); // Assuming flatMenus has parentId populated or we check parent object
            // Actually API returns parent object relations usually in TypeORM if we requested it, or if we use flattened list?
            // "Fetch all for flattened parent selection... resAll.data"
            // If backend returns `parent: { id: ... }`, we need to check that.
            // Let's check `flatMenus` structure. If it's from `findAll`, it usually has `parent` relation object loaded.
            // Wait, I updated `findAll` to include `relations: ['parent']` in step 1377.
            // So `m.parent?.id` is the way.
            siblings = flatMenus.filter(m => !m.parent);
        } else {
            siblings = flatMenus.filter(m => m.parent?.id === parentId);
        }

        if (siblings.length === 0) return 1;
        const maxOrder = Math.max(...siblings.map(m => m.order || 0));
        return maxOrder + 1;
    };

    const handleCreate = () => {
        setEditingMenu(null);
        // Calculate next order for root by default
        const nextOrder = calculateNextOrder('root');
        setFormData({ label: '', link: '', icon: '', parentId: 'root', order: nextOrder });
        setIsOpen(true);
    };

    const handleEdit = (menu: Menu) => {
        setEditingMenu(menu);
        setFormData({
            label: menu.label,
            link: menu.link,
            icon: menu.icon || '',
            parentId: menu.parentId || menu.parent?.id || 'root',
            order: menu.order || 0,
        });
        setIsOpen(true);
    };

    // ...

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa menu này?')) return;
        try {
            await http.delete(`/menus/${id}`);
            fetchData();
        } catch (error) {
            console.error('Failed to delete', error);
            alert('Lỗi xóa menu');
        }
    };

    const saveMenu = async () => {
        try {
            // Basic payload
            const payload: any = {
                label: formData.label,
                link: formData.link,
                icon: formData.icon,
                order: Number(formData.order)
            };

            if (formData.parentId && formData.parentId !== 'root') {
                payload.parentId = formData.parentId;
            } else {
                payload.parentId = null; // Explicitly set null for root
            }

            if (editingMenu) {
                await http.patch(`/menus/${editingMenu.id}`, payload);
            } else {
                await http.post('/menus', payload);
            }
            setIsOpen(false);
            fetchData();
        } catch (error) {
            console.error('Failed to save', error);
            alert('Lỗi lưu menu');
        }
    };

    const renderRows = (items: Menu[], level = 0) => {
        return items.flatMap((item) => {
            const rows = [
                <TableRow key={item.id} className="dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <TableCell style={{ paddingLeft: `${level * 20 + 10}px` }}>
                        <div className="flex items-center gap-2">
                            {item.children && item.children.length > 0 ? (
                                <FolderOpen className="h-4 w-4 text-blue-500" />
                            ) : (
                                <ChevronRight className="h-4 w-4 text-gray-400" />
                            )}
                            <span className="font-medium text-gray-900 dark:text-gray-200">{item.label}</span>
                        </div>
                    </TableCell>
                    <TableCell>{item.link}</TableCell>
                    <TableCell>{item.order}</TableCell>
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
                // Recursively add children
                rows.push(...renderRows(item.children, level + 1));
            }
            return rows;
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Quản lý Menu</h1>
                    <p className="text-gray-500 dark:text-gray-400">Cấu hình menu hiển thị trên website.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={async () => {
                        if (!confirm('Hành động này sẽ đánh lại toàn bộ số thứ tự menu từ đầu (1, 2, 3...). Bạn có chắc chắn?')) return;
                        try {
                            await http.post('/menus/auto-increment');
                            fetchData();
                            alert('Đã cập nhật thứ tự thành công!');
                        } catch (e) {
                            console.error(e);
                            alert('Lỗi cập nhật');
                        }
                    }}>
                        Chuẩn hóa thứ tự
                    </Button>
                    <Button onClick={handleCreate}><Plus className="mr-2 h-4 w-4" /> Thêm Menu</Button>
                </div>
            </div>

            <div className="rounded-md border bg-white dark:bg-[#1a1c23] dark:border-gray-800">
                <Table>
                    <TableHeader>
                        <TableRow className="dark:border-gray-800 hover:bg-transparent">
                            <TableHead className="w-[400px]">Tên Menu</TableHead>
                            <TableHead>Liên kết</TableHead>
                            <TableHead>Thứ tự</TableHead>
                            <TableHead className="text-right">Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-24 text-gray-500">Đang tải...</TableCell>
                            </TableRow>
                        ) : (
                            renderRows(menus)
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Create/Edit Modal */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingMenu ? 'Chỉnh sửa Menu' : 'Thêm mới Menu'}</DialogTitle>
                        <DialogDescription>
                            Nhập thông tin menu hiển thị.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="label" className="text-right">
                                Nhãn
                            </Label>
                            <Input
                                id="label"
                                value={formData.label}
                                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="link" className="text-right">
                                Link
                            </Label>
                            <div className="col-span-3">
                                <Select
                                    value={formData.link}
                                    onValueChange={(val) => setFormData({ ...formData, link: val })}
                                >
                                    <SelectTrigger id="link">
                                        <SelectValue placeholder="Chọn liên kết danh mục" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="/">-- Trang chủ --</SelectItem>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.id} value={`/categories/${cat.slug}`}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                        {/* Preserve existing if not in list */}
                                        {formData.link && formData.link !== '/' && !categories.some(c => `/categories/${c.slug}` === formData.link) && (
                                            <SelectItem value={formData.link}>{formData.link} (Hiện tại)</SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="parent" className="text-right">
                                Menu cha
                            </Label>
                            <div className="col-span-3">
                                <Select
                                    value={formData.parentId}
                                    onValueChange={(val) => {
                                        const nextOrder = calculateNextOrder(val);
                                        setFormData({ ...formData, parentId: val, order: nextOrder });
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn menu cha" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="root">-- Gốc (Không có cha) --</SelectItem>
                                        {flatMenus
                                            // Prevent selecting itself as parent or circular dependency (simple check)
                                            .filter(m => m.id !== editingMenu?.id)
                                            .map(m => (
                                                <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="order" className="text-right">
                                Thứ tự
                            </Label>
                            <Input
                                id="order"
                                type="number"
                                value={formData.order}
                                onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" onClick={saveMenu}>Lưu thay đổi</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
