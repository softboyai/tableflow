"use client";

import Image from "next/image";
import type { Dispatch, SetStateAction } from "react";
import { useMemo, useState } from "react";

type Category = {
  id: string;
  name: string;
  sortOrder: number;
};

type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number | null;
  currency: string | null;
  imageUrl: string | null;
  tags: string[];
  isAvailable: boolean;
  isFeatured: boolean;
  categoryId: string | null;
  categoryName: string | null;
};

type RestaurantMenuManagerProps = {
  restaurantId: string;
  slug: string;
  categories: Category[];
  menuItems: MenuItem[];
};

type ItemFormState = {
  name: string;
  description: string;
  price: string;
  currency: string;
  imageUrl: string;
  tags: string;
  categoryId: string;
  isFeatured: boolean;
};

const emptyItemForm: ItemFormState = {
  name: "",
  description: "",
  price: "",
  currency: "RWF",
  imageUrl: "",
  tags: "",
  categoryId: "",
  isFeatured: false
};

function toItemForm(item?: MenuItem): ItemFormState {
  if (!item) {
    return emptyItemForm;
  }

  return {
    name: item.name,
    description: item.description,
    price: item.price !== null ? String(item.price) : "",
    currency: item.currency || "RWF",
    imageUrl: item.imageUrl || "",
    tags: item.tags.join(", "),
    categoryId: item.categoryId || "",
    isFeatured: item.isFeatured
  };
}

function buildItemPayload(
  restaurantId: string,
  form: ItemFormState,
  imageFile: File | null,
  isAvailable = true
) {
  const payload = new FormData();
  payload.append("restaurantId", restaurantId);
  payload.append("name", form.name);
  payload.append("description", form.description);
  payload.append("price", form.price);
  payload.append("currency", form.currency);
  payload.append("imageUrl", form.imageUrl);
  payload.append("tags", form.tags);
  payload.append("categoryId", form.categoryId);
  payload.append("isFeatured", String(form.isFeatured));
  payload.append("isAvailable", String(isAvailable));

  if (imageFile) {
    payload.append("imageFile", imageFile);
  }

  return payload;
}

export default function RestaurantMenuManager({
  restaurantId,
  slug,
  categories,
  menuItems
}: RestaurantMenuManagerProps) {
  const [categoryName, setCategoryName] = useState("");
  const [categoryStatus, setCategoryStatus] = useState("");
  const [itemForm, setItemForm] = useState<ItemFormState>({
    ...emptyItemForm,
    categoryId: categories[0]?.id || ""
  });
  const [createImageFile, setCreateImageFile] = useState<File | null>(null);
  const [itemStatus, setItemStatus] = useState("");
  const [busyItemId, setBusyItemId] = useState("");
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingForm, setEditingForm] = useState<ItemFormState>(emptyItemForm);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editStatus, setEditStatus] = useState("");

  const groupedItems = useMemo(
    () =>
      categories.map((category) => ({
        ...category,
        items: menuItems.filter((item) => item.categoryId === category.id)
      })),
    [categories, menuItems]
  );

  const uncategorizedItems = useMemo(
    () => menuItems.filter((item) => !item.categoryId),
    [menuItems]
  );

  const addCategory = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCategoryStatus("");

    const response = await fetch(`/api/restaurants/${slug}/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name: categoryName, restaurantId })
    });

    const data = (await response.json()) as { error?: string };

    if (!response.ok) {
      setCategoryStatus(data.error || "We couldn't add that section yet.");
      return;
    }

    window.location.reload();
  };

  const addMenuItem = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setItemStatus("");

    const response = await fetch(`/api/restaurants/${slug}/menu-items`, {
      method: "POST",
      body: buildItemPayload(restaurantId, itemForm, createImageFile)
    });

    const data = (await response.json()) as { error?: string };

    if (!response.ok) {
      setItemStatus(data.error || "We couldn't add that dish yet.");
      return;
    }

    window.location.reload();
  };

  const toggleAvailability = async (item: MenuItem) => {
    setBusyItemId(item.id);

    const response = await fetch(
      `/api/restaurants/${slug}/menu-items/${item.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          restaurantId,
          isAvailable: !item.isAvailable
        })
      }
    );

    setBusyItemId("");

    if (!response.ok) {
      return;
    }

    window.location.reload();
  };

  const startEditing = (item: MenuItem) => {
    setEditingItemId(item.id);
    setEditImageFile(null);
    setEditStatus("");
    setEditingForm(toItemForm(item));
  };

  const saveEdit = async (item: MenuItem) => {
    setBusyItemId(item.id);
    setEditStatus("");

    try {
      const response = await fetch(
        `/api/restaurants/${slug}/menu-items/${item.id}`,
        {
          method: "PATCH",
          body: buildItemPayload(
            restaurantId,
            editingForm,
            editImageFile,
            item.isAvailable
          )
        }
      );

      const data = (await response.json()) as { error?: string };

      setBusyItemId("");

      if (!response.ok) {
        setEditStatus(data.error || "We couldn't save those changes yet.");
        return;
      }

      window.location.reload();
    } catch {
      setBusyItemId("");
      setEditStatus("The update could not reach the server. Please try again.");
    }
  };

  const deleteItem = async (item: MenuItem) => {
    const confirmed = window.confirm(
      `Delete "${item.name}" from the menu? This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setBusyItemId(item.id);
    setEditStatus("");

    try {
      const response = await fetch(
        `/api/restaurants/${slug}/menu-items/${item.id}?restaurantId=${encodeURIComponent(
          restaurantId
        )}`,
        {
          method: "DELETE"
        }
      );

      const data = (await response.json()) as { error?: string };

      setBusyItemId("");

      if (!response.ok) {
        setEditStatus(data.error || "We couldn't delete that dish yet.");
        return;
      }

      window.location.reload();
    } catch {
      setBusyItemId("");
      setEditStatus("The delete request could not reach the server. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="tf-panel p-6">
          <p className="tf-eyebrow">
            Menu Sections
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-ivory">
            Organise the menu in a way that feels natural
          </h2>
          <form className="mt-5 space-y-4" onSubmit={addCategory}>
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.3em] text-ivory/60">
                Section Name
              </span>
              <input
                value={categoryName}
                onChange={(event) => setCategoryName(event.target.value)}
                placeholder="Appetizers"
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-ivory focus:border-gold-200/60 focus:outline-none"
              />
            </label>
            <button
              type="submit"
              className="rounded-full bg-gold-300 px-5 py-3 text-sm font-semibold text-ink transition hover:bg-gold-200"
            >
              Add Section
            </button>
            {categoryStatus ? (
              <p className="text-sm text-red-300">{categoryStatus}</p>
            ) : null}
          </form>
          <div className="mt-6 flex flex-wrap gap-2">
            {categories.length > 0 ? (
              categories.map((category) => (
                <span
                  key={category.id}
                  className="rounded-full border border-white/10 bg-black/25 px-3 py-2 text-sm text-ivory/75"
                >
                  {category.name}
                </span>
              ))
            ) : (
              <p className="text-sm text-ivory/60">
                No sections yet. Add your first one to start shaping the menu.
              </p>
            )}
          </div>
        </div>

        <div className="tf-panel p-6">
          <p className="tf-eyebrow">
            Dishes And Drinks
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-ivory">
            Add what guests can discover at the table
          </h2>
          <form className="mt-5 space-y-4" onSubmit={addMenuItem}>
            <ItemFields
              form={itemForm}
              categories={categories}
              onChange={setItemForm}
              imageFile={createImageFile}
              onImageFileChange={setCreateImageFile}
            />
            <button
              type="submit"
              className="rounded-full bg-gold-300 px-5 py-3 text-sm font-semibold text-ink transition hover:bg-gold-200"
            >
              Add Dish
            </button>
            {itemStatus ? (
              <p className="text-sm text-red-300">{itemStatus}</p>
            ) : null}
          </form>
        </div>
      </div>

      <div className="tf-panel p-6">
        <p className="tf-eyebrow">
          On The Menu
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-ivory">
          Keep the menu current through service
        </h2>
        <div className="mt-6 space-y-6">
          {groupedItems.map((category) => (
            <div key={category.id} className="space-y-3">
              <h3 className="text-lg font-semibold text-ivory">{category.name}</h3>
              {category.items.length > 0 ? (
                category.items.map((item) => (
                  <MenuItemRow
                    key={item.id}
                    item={item}
                    categories={categories}
                    isBusy={busyItemId === item.id}
                    isEditing={editingItemId === item.id}
                    editingForm={editingForm}
                    editImageFile={editImageFile}
                    editStatus={editStatus}
                    onStartEditing={() => startEditing(item)}
                    onCancelEditing={() => {
                      setEditingItemId(null);
                      setEditImageFile(null);
                      setEditStatus("");
                    }}
                    onEditFormChange={setEditingForm}
                    onEditImageFileChange={setEditImageFile}
                    onSaveEdit={() => saveEdit(item)}
                    onToggle={() => toggleAvailability(item)}
                    onDelete={() => deleteItem(item)}
                  />
                ))
              ) : (
                <p className="text-sm text-ivory/50">Nothing added here yet.</p>
              )}
            </div>
          ))}

          {uncategorizedItems.length > 0 ? (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-ivory">More To Place</h3>
              {uncategorizedItems.map((item) => (
                <MenuItemRow
                  key={item.id}
                  item={item}
                  categories={categories}
                  isBusy={busyItemId === item.id}
                  isEditing={editingItemId === item.id}
                  editingForm={editingForm}
                  editImageFile={editImageFile}
                  editStatus={editStatus}
                  onStartEditing={() => startEditing(item)}
                  onCancelEditing={() => {
                    setEditingItemId(null);
                    setEditImageFile(null);
                    setEditStatus("");
                  }}
                  onEditFormChange={setEditingForm}
                  onEditImageFileChange={setEditImageFile}
                  onSaveEdit={() => saveEdit(item)}
                  onToggle={() => toggleAvailability(item)}
                  onDelete={() => deleteItem(item)}
                />
              ))}
            </div>
          ) : null}

          {menuItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/15 bg-black/20 px-4 py-5">
              <p className="text-sm text-ivory/60">
                No dishes yet. Add a few favourites here so guests have something beautiful to browse.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ItemFields({
  form,
  categories,
  onChange,
  imageFile,
  onImageFileChange
}: {
  form: ItemFormState;
  categories: Category[];
  onChange: Dispatch<SetStateAction<ItemFormState>>;
  imageFile: File | null;
  onImageFileChange: (file: File | null) => void;
}) {
  return (
    <>
      <label className="space-y-2">
        <span className="text-xs uppercase tracking-[0.3em] text-ivory/60">
          Item Name
        </span>
        <input
          value={form.name}
          onChange={(event) =>
            onChange((current) => ({ ...current, name: event.target.value }))
          }
          placeholder="Margherita Pizza"
          className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-ivory focus:border-gold-200/60 focus:outline-none"
        />
      </label>

      <label className="space-y-2">
        <span className="text-xs uppercase tracking-[0.3em] text-ivory/60">
          Description
        </span>
        <textarea
          value={form.description}
          onChange={(event) =>
            onChange((current) => ({
              ...current,
              description: event.target.value
            }))
          }
          rows={3}
          className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-ivory focus:border-gold-200/60 focus:outline-none"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.3em] text-ivory/60">
            Price
          </span>
          <input
            value={form.price}
            onChange={(event) =>
              onChange((current) => ({ ...current, price: event.target.value }))
            }
            placeholder="12000"
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-ivory focus:border-gold-200/60 focus:outline-none"
          />
        </label>
        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.3em] text-ivory/60">
            Currency
          </span>
          <input
            value={form.currency}
            onChange={(event) =>
              onChange((current) => ({
                ...current,
                currency: event.target.value
              }))
            }
            placeholder="RWF"
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-ivory focus:border-gold-200/60 focus:outline-none"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.3em] text-ivory/60">
            Add A Photo
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={(event) =>
              onImageFileChange(event.target.files?.[0] || null)
            }
            className="w-full rounded-2xl border border-dashed border-white/15 bg-black/20 px-4 py-3 text-sm text-ivory/70 file:mr-3 file:rounded-full file:border-0 file:bg-gold-300 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-ink"
          />
          {imageFile ? (
            <p className="text-xs text-gold-200">{imageFile.name}</p>
          ) : null}
        </label>
        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.3em] text-ivory/60">
            Section
          </span>
          <select
            value={form.categoryId}
            onChange={(event) =>
              onChange((current) => ({
                ...current,
                categoryId: event.target.value
              }))
            }
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-ivory focus:border-gold-200/60 focus:outline-none"
          >
            <option value="">No section yet</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="space-y-2">
        <span className="text-xs uppercase tracking-[0.3em] text-ivory/60">
          Photo Link
        </span>
        <input
          value={form.imageUrl}
          onChange={(event) =>
            onChange((current) => ({
              ...current,
              imageUrl: event.target.value
            }))
          }
          placeholder="Optional link to an existing photo"
          className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-ivory focus:border-gold-200/60 focus:outline-none"
        />
      </label>

      <label className="space-y-2">
        <span className="text-xs uppercase tracking-[0.3em] text-ivory/60">
          Short Labels
        </span>
        <input
          value={form.tags}
          onChange={(event) =>
            onChange((current) => ({
              ...current,
              tags: event.target.value
            }))
          }
          placeholder="Spicy, Vegan, Popular"
          className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-ivory focus:border-gold-200/60 focus:outline-none"
        />
        <p className="text-xs text-ivory/50">
          Separate each label with a comma so guests can narrow things down more easily.
        </p>
      </label>

      <label className="flex items-center gap-3 text-sm text-ivory/75">
        <input
          type="checkbox"
          checked={form.isFeatured}
          onChange={(event) =>
            onChange((current) => ({
              ...current,
              isFeatured: event.target.checked
            }))
          }
          className="h-4 w-4 rounded border-white/20 bg-black/30 text-gold-300"
        />
        Highlight this on the menu
      </label>
    </>
  );
}

function MenuItemRow({
  item,
  categories,
  isBusy,
  isEditing,
  editingForm,
  editImageFile,
  editStatus,
  onStartEditing,
  onCancelEditing,
  onEditFormChange,
  onEditImageFileChange,
  onSaveEdit,
  onToggle,
  onDelete
}: {
  item: MenuItem;
  categories: Category[];
  isBusy: boolean;
  isEditing: boolean;
  editingForm: ItemFormState;
  editImageFile: File | null;
  editStatus: string;
  onStartEditing: () => void;
  onCancelEditing: () => void;
  onEditFormChange: Dispatch<SetStateAction<ItemFormState>>;
  onEditImageFileChange: (file: File | null) => void;
  onSaveEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-4">
          {item.imageUrl ? (
            <div className="relative h-20 w-20 overflow-hidden rounded-2xl bg-white/5">
              <Image src={item.imageUrl} alt={item.name} fill className="object-cover" sizes="80px" />
            </div>
          ) : null}
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm font-semibold text-ivory">{item.name}</p>
              {item.isFeatured ? (
                <span className="rounded-full border border-gold-200/30 bg-gold-200/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-gold-200">
                  Recommended
                </span>
              ) : null}
              <span
                className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.2em] ${
                  item.isAvailable
                    ? "border border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                    : "border border-red-400/20 bg-red-400/10 text-red-300"
                }`}
              >
                {item.isAvailable ? "Available" : "Sold Out"}
              </span>
            </div>
            <p className="mt-2 text-xs text-ivory/60">{item.description}</p>
            <p className="mt-2 text-sm text-gold-200">
              {item.price !== null
                ? `${item.currency || "RWF"} ${item.price.toLocaleString()}`
                : "Price on request"}
            </p>
            {item.tags.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <span
                    key={`${item.id}-${tag}`}
                    className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-ivory/60"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onStartEditing}
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-ivory transition hover:border-gold-200/50"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={onToggle}
            disabled={isBusy}
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-ivory transition hover:border-gold-200/50 disabled:opacity-60"
          >
            {isBusy ? "Saving..." : item.isAvailable ? "Mark Sold Out" : "Bring Back"}
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={isBusy}
            className="rounded-full border border-red-400/20 bg-red-400/10 px-4 py-2 text-sm font-semibold text-red-200 transition hover:bg-red-400/20 disabled:opacity-60"
          >
            Delete
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="mt-5 rounded-2xl border border-gold-200/20 bg-black/20 p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-ivory">Edit this dish</p>
            <button
              type="button"
              onClick={onCancelEditing}
              className="text-xs uppercase tracking-[0.2em] text-ivory/50 transition hover:text-ivory"
            >
              Cancel
            </button>
          </div>
          <div className="space-y-4">
            <ItemFields
              form={editingForm}
              categories={categories}
              onChange={onEditFormChange}
              imageFile={editImageFile}
              onImageFileChange={onEditImageFileChange}
            />
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onSaveEdit}
                disabled={isBusy}
                className="rounded-full bg-gold-300 px-5 py-3 text-sm font-semibold text-ink transition hover:bg-gold-200 disabled:opacity-60"
              >
                {isBusy ? "Saving..." : "Save"}
              </button>
              {editStatus ? (
                <p className="self-center text-sm text-red-300">{editStatus}</p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
