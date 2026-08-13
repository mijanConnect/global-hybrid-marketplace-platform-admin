import { useCallback, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronDown,
  ImageIcon,
  Pencil,
  Star,
  Trash2,
  Upload,
} from "lucide-react";

import { PageShell } from "@/components/PageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from "@/services/categoriesApi";
import type { Category } from "@/services/categoriesApi";

const baseApiUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";
const hostUrl = baseApiUrl.replace(/\/api\/v\d+\/?$/, "");

function getImageUrl(path?: string) {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("data:")) return path;
  return `${hostUrl}${path.startsWith("/") ? "" : "/"}${path}`;
}

const slugify = (text: string) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w-]+/g, "") // Remove all non-word chars
    .replace(/--+/g, "-"); // Replace multiple - with single -

const MotionTableRow = motion(TableRow);

function CategoryThumbnail({ url }: { url: string }) {
  const t = url.trim();
  const isHex = /^#([0-9a-f]{3,8})$/i.test(t);

  if (t && !isHex) {
    return (
      <img
        src={getImageUrl(t)}
        alt=""
        className="h-10 w-10 rounded-lg border border-[#EEE7DF] object-cover"
      />
    );
  }
  return (
    <div
      className="h-10 w-10 shrink-0 rounded-lg border border-[#EEE7DF]"
      style={{ background: isHex ? t : "#f4f4f5" }}
    />
  );
}

function CategoryImageFill({ url }: { url: string }) {
  const t = url.trim();
  const isHex = /^#([0-9a-f]{3,8})$/i.test(t);

  if (t && !isHex) {
    return (
      <img src={getImageUrl(t)} alt="" className="h-full w-full object-cover" />
    );
  }
  return (
    <div
      className="h-full w-full"
      style={{ background: isHex ? t : "#f4f4f5" }}
    />
  );
}

function StatusBadge({ status }: { status: string }) {
  return status === "active" ? (
    <Badge variant="success">active</Badge>
  ) : (
    <Badge variant="secondary">inactive</Badge>
  );
}

function FeaturedToggle({
  featured,
  onToggle,
}: {
  featured: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={featured}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={
        featured
          ? "inline-flex h-7 w-12 shrink-0 items-center justify-end rounded-full bg-[#895129] p-0.5 transition-colors"
          : "inline-flex h-7 w-12 shrink-0 items-center justify-start rounded-full bg-gray-300 p-0.5 transition-colors shadow-inner"
      }
    >
      <span className="block h-5 w-5 rounded-full bg-white shadow-md" />
    </button>
  );
}

function CompactSwitch({
  checked,
  onCheckedChange,
  id,
}: {
  checked: boolean;
  onCheckedChange: () => void;
  id?: string;
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onCheckedChange}
      className={
        checked
          ? "inline-flex h-5 w-9 shrink-0 items-center justify-end rounded-full bg-[#895129] p-px transition-colors"
          : "inline-flex h-5 w-9 shrink-0 items-center justify-start rounded-full bg-gray-300 p-px transition-colors shadow-inner"
      }
    >
      <span className="pointer-events-none block h-4 w-4 rounded-full bg-white shadow-md ring-1 ring-black/10" />
    </button>
  );
}

type CategoryFormDraft = {
  id?: string;
  name: string;
  slug: string;
  imageFile: File | null;
  imageUrl: string;
  featured: boolean;
  active: boolean;
  type: string;
};

function emptyDraft(): CategoryFormDraft {
  return {
    name: "",
    slug: "",
    imageFile: null,
    imageUrl: "",
    featured: false,
    active: true,
    type: "product",
  };
}

export default function CategoriesPage() {
  const [q, setQ] = useState("");
  const [featuredFilter, setFeaturedFilter] = useState<"all" | "yes" | "no">(
    "all",
  );
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const { data: categoriesData, isLoading } = useGetCategoriesQuery({
    page,
    limit: pageSize,
    searchTerm: q || undefined,
    isFeatured: featuredFilter === "all" ? undefined : featuredFilter === "yes",
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const [createCategory] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const categories = categoriesData?.data || [];
  const totalPages = categoriesData?.pagination?.totalPage || 1;
  const totalCategories = categoriesData?.pagination?.total || 0;

  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState(emptyDraft());
  const modalFileInputRef = useRef<HTMLInputElement>(null);
  const [imageDropActive, setImageDropActive] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const pageNumbers = useMemo(() => {
    const delta = 2;
    const start = Math.max(1, page - delta);
    const end = Math.min(totalPages, page + delta);
    const nums: number[] = [];
    for (let p = start; p <= end; p++) nums.push(p);
    return nums;
  }, [page, totalPages]);

  function openCreate() {
    setDraft(emptyDraft());
    setModalOpen(true);
  }

  function openEdit(row: Category) {
    setDraft({
      id: row._id,
      name: row.name,
      slug: row.slug,
      imageFile: null,
      imageUrl: row.image || "",
      featured: row.isFeatured,
      active: row.status === "active",
      type: row.type || "product",
    });
    setModalOpen(true);
  }

  const readImageFiles = useCallback((files: FileList | File[] | null) => {
    const file = files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      if (result)
        setDraft((d) => ({ ...d, imageFile: file, imageUrl: result }));
    };
    reader.readAsDataURL(file);
  }, []);

  async function upsertDraft() {
    const name = draft.name.trim();
    const slug = slugify(draft.slug.trim() || name);
    if (!name || !slug) return;

    const formData = new FormData();
    formData.append("name", name);
    formData.append("slug", slug);
    formData.append("type", draft.type);
    formData.append("isFeatured", String(draft.featured));
    formData.append("status", draft.active ? "active" : "inactive");
    if (draft.imageFile) {
      formData.append("image", draft.imageFile);
    }

    try {
      if (draft.id) {
        await updateCategory({ id: draft.id, body: formData }).unwrap();
      } else {
        await createCategory(formData).unwrap();
      }
      setModalOpen(false);
      setDraft(emptyDraft());
    } catch (err) {
      console.error(err);
    }
  }

  async function removeRow(id: string) {
    try {
      await deleteCategory(id).unwrap();
      setDeleteTarget(null);
      if (categories.length === 1 && page > 1) {
        setPage((p) => p - 1);
      }
    } catch (err) {
      console.error(err);
    }
  }

  function toggleFeatured(category: Category) {
    const fd = new FormData();
    fd.append("name", category.name);
    fd.append("slug", category.slug);
    fd.append("type", category.type);
    fd.append("isFeatured", String(!category.isFeatured));
    fd.append("status", category.status);
    updateCategory({ id: category._id, body: fd });
  }

  function setHidden(category: Category) {
    const fd = new FormData();
    fd.append("name", category.name);
    fd.append("slug", category.slug);
    fd.append("type", category.type);
    fd.append("isFeatured", String(category.isFeatured));
    fd.append("status", "inactive");
    updateCategory({ id: category._id, body: fd });
  }

  function setActive(category: Category) {
    const fd = new FormData();
    fd.append("name", category.name);
    fd.append("slug", category.slug);
    fd.append("type", category.type);
    fd.append("isFeatured", String(category.isFeatured));
    fd.append("status", "active");
    updateCategory({ id: category._id, body: fd });
  }

  return (
    <PageShell
      title="Categories"
      description="Manage catalog categories, featured storefront placement, and visibility."
      right={
        <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
          <Input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Search category…"
            className="w-full md:w-65"
          />
          <select
            value={featuredFilter}
            onChange={(e) => {
              setFeaturedFilter(e.target.value as typeof featuredFilter);
              setPage(1);
            }}
            className="h-10 rounded-lg border border-[#EEE7DF] bg-white px-3 text-sm"
          >
            <option value="all">Featured: all</option>
            <option value="yes">Featured</option>
            <option value="no">Not featured</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as typeof statusFilter);
              setPage(1);
            }}
            className="h-10 rounded-lg border border-[#EEE7DF] bg-white px-3 text-sm"
          >
            <option value="all">Status: all</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <Button onClick={openCreate}>Add category</Button>
        </div>
      }
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="space-y-4"
      >
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Categories</CardTitle>
            <div className="text-sm text-muted-foreground">
              {totalCategories} total
            </div>
          </CardHeader>
          <CardContent>
            <div className="w-full overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-18 py-3 text-xs font-medium uppercase tracking-wide text-[#895129b3]">
                      Image
                    </TableHead>
                    <TableHead className="min-w-40 py-3 text-xs font-medium uppercase tracking-wide text-[#895129b3]">
                      Category Name
                    </TableHead>
                    <TableHead className="min-w-30 py-3 text-xs font-medium uppercase tracking-wide text-[#895129b3]">
                      Slug
                    </TableHead>
                    <TableHead className="w-27.5 py-3 text-center text-xs font-medium uppercase tracking-wide text-[#895129b3]">
                      Type
                    </TableHead>
                    <TableHead className="w-25 py-3 text-center text-xs font-medium uppercase tracking-wide text-[#895129b3]">
                      Featured
                    </TableHead>
                    <TableHead className="w-27.5 py-3 text-xs font-medium uppercase tracking-wide text-[#895129b3]">
                      Status
                    </TableHead>
                    <TableHead className="w-30 py-3 text-xs font-medium uppercase tracking-wide text-[#895129b3]">
                      Created
                    </TableHead>
                    <TableHead className="w-35 py-3 pr-6 text-right text-xs font-medium uppercase tracking-wide text-[#895129b3]">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-10 text-center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : categories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-10">
                        <div className="text-center text-sm text-muted-foreground">
                          No categories match your filters.
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    categories.map((row) => (
                      <MotionTableRow
                        key={row._id}
                        whileHover={{ scale: 1.005 }}
                        transition={{ duration: 0.12 }}
                      >
                        <TableCell className="py-3 align-middle">
                          <CategoryThumbnail url={row.image} />
                        </TableCell>
                        <TableCell className="py-3 align-middle font-medium">
                          {row.name}
                        </TableCell>
                        <TableCell className="py-3 align-middle text-muted-foreground">
                          {row.slug}
                        </TableCell>
                        <TableCell className="py-3 text-center align-middle capitalize">
                          {row.type}
                        </TableCell>
                        <TableCell className="py-3 text-center align-middle">
                          <FeaturedToggle
                            featured={row.isFeatured}
                            onToggle={() => toggleFeatured(row)}
                          />
                        </TableCell>
                        <TableCell className="py-3 align-middle">
                          <StatusBadge status={row.status} />
                        </TableCell>
                        <TableCell className="py-3 align-middle text-muted-foreground">
                          {row.createdAt?.slice?.(0, 10) ?? "—"}
                        </TableCell>
                        <TableCell className="w-35 py-3 pr-6 text-right align-middle">
                          <div className="flex items-center justify-end">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  type="button"
                                  className="h-9 w-30 justify-between rounded-lg border border-[#89512920] bg-white px-3 text-xs text-[#895129] hover:bg-[#faf7f3]"
                                >
                                  Actions
                                  <ChevronDown className="h-3.5 w-3.5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="min-w-40"
                              >
                                <DropdownMenuItem onClick={() => openEdit(row)}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => toggleFeatured(row)}
                                >
                                  <Star className="mr-2 h-4 w-4" />
                                  {row.isFeatured ? "Unfeature" : "Feature"}
                                </DropdownMenuItem>
                                {row.status === "active" ? (
                                  <DropdownMenuItem
                                    onClick={() => setHidden(row)}
                                  >
                                    Hide
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                    onClick={() => setActive(row)}
                                  >
                                    Activate
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600 focus:text-red-600"
                                  onClick={() => setDeleteTarget(row)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </MotionTableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-3"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Prev
                </Button>
                {pageNumbers.map((pNum) => (
                  <Button
                    key={pNum}
                    variant={pNum === page ? "default" : "outline"}
                    size="sm"
                    className="h-9 w-9 px-0"
                    onClick={() => setPage(pNum)}
                  >
                    {pNum}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-3"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) {
            setImageDropActive(false);
            if (modalFileInputRef.current) modalFileInputRef.current.value = "";
          }
        }}
      >
        <DialogContent className="max-w-100 gap-0 p-4 sm:max-w-105 sm:p-5">
          <DialogHeader className="space-y-1 pb-3">
            <DialogTitle className="text-base">
              {draft.id ? "Edit category" : "Add category"}
            </DialogTitle>
            <DialogDescription className="text-xs leading-snug">
              Name, image, and visibility for catalog and storefront.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2.5">
            <div className="grid gap-1">
              <label
                htmlFor="cat-name"
                className="text-xs font-medium text-muted-foreground"
              >
                Category name
              </label>
              <Input
                id="cat-name"
                className="h-9 text-sm"
                value={draft.name}
                onChange={(e) =>
                  setDraft((d) => {
                    const name = e.target.value;
                    const auto = slugify(d.name);
                    const nextSlug =
                      d.slug.trim() === "" || d.slug === auto
                        ? slugify(name)
                        : d.slug;
                    return { ...d, name, slug: nextSlug };
                  })
                }
              />
            </div>
            <div className="grid gap-1">
              <label
                htmlFor="cat-slug"
                className="text-xs font-medium text-muted-foreground"
              >
                Slug
              </label>
              <Input
                id="cat-slug"
                className="h-9 text-sm"
                value={draft.slug}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, slug: e.target.value }))
                }
              />
            </div>

            <div className="grid gap-1">
              <label
                htmlFor="cat-type"
                className="text-xs font-medium text-muted-foreground"
              >
                Type
              </label>
              <select
                id="cat-type"
                value={draft.type}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, type: e.target.value }))
                }
                className="h-9 rounded-md border border-[#EEE7DF] bg-white px-3 text-sm"
              >
                <option value="product">Product</option>
                <option value="service">Service</option>
              </select>
            </div>

            <div className="grid gap-1">
              <span className="text-xs font-medium text-muted-foreground">
                Category image
              </span>
              <input
                ref={modalFileInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                aria-label="Upload category image"
                onChange={(e) => {
                  readImageFiles(e.target.files);
                  e.target.value = "";
                }}
              />
              <div
                onDragEnter={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setImageDropActive(true);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setImageDropActive(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!e.currentTarget.contains(e.relatedTarget as Node))
                    setImageDropActive(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setImageDropActive(false);
                  readImageFiles(e.dataTransfer.files);
                }}
                className={
                  imageDropActive
                    ? "flex items-center gap-3 rounded-xl border border-dashed border-primary bg-primary/5 px-2.5 py-2 outline-none ring-2 ring-primary/25 transition-colors"
                    : "flex items-center gap-3 rounded-xl border border-dashed border-[#89512930] bg-[#faf9f7] px-2.5 py-2 outline-none transition-colors"
                }
              >
                <div className="relative h-13 w-13 shrink-0 overflow-hidden rounded-xl border border-[#EEE7DF] bg-white">
                  {draft.imageUrl.trim() ? (
                    <CategoryImageFill url={draft.imageUrl} />
                  ) : (
                    <div className="grid h-full w-full place-items-center">
                      <ImageIcon
                        className="h-7 w-7 text-muted-foreground/55"
                        aria-hidden
                      />
                    </div>
                  )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 w-fit gap-1.5 rounded-lg border-[#89512920] px-3 text-xs text-[#895129] hover:bg-[#faf7f3]"
                    onClick={() => modalFileInputRef.current?.click()}
                  >
                    <Upload className="h-3.5 w-3.5" aria-hidden />
                    Upload image
                  </Button>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    JPG, PNG · drop file here
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-[#EEE7DF]">
              <div className="flex h-10 items-center justify-between gap-3 border-b border-[#EEE7DF] px-3 last:border-b-0">
                <label
                  htmlFor="switch-featured"
                  className="text-sm font-medium text-foreground"
                >
                  Featured
                </label>
                <CompactSwitch
                  id="switch-featured"
                  checked={draft.featured}
                  onCheckedChange={() =>
                    setDraft((d) => ({ ...d, featured: !d.featured }))
                  }
                />
              </div>
              <div className="flex h-10 items-center justify-between gap-3 px-3">
                <label
                  htmlFor="switch-active"
                  className="text-sm font-medium text-foreground"
                >
                  Active
                </label>
                <CompactSwitch
                  id="switch-active"
                  checked={draft.active}
                  onCheckedChange={() =>
                    setDraft((d) => ({ ...d, active: !d.active }))
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter className="mt-3 gap-1.5 pt-0 sm:justify-end">
            <Button
              variant="outline"
              type="button"
              size="sm"
              className="h-9 rounded-lg border-[#89512920] px-4 text-sm"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-9 rounded-lg bg-primary px-4 text-sm text-primary-foreground hover:bg-primary/90"
              onClick={upsertDraft}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete category?</DialogTitle>
            <DialogDescription>
              {deleteTarget
                ? `This will permanently remove "${deleteTarget.name}". Products still assigned keep the label until reassigned on the Products page.`
                : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              type="button"
              onClick={() => deleteTarget && removeRow(deleteTarget._id)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
