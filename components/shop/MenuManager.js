"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function MenuManager({
  shop,
  categories: initialCategories,
  items: initialItems,
}) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [items, setItems] = useState(initialItems);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    imageUrl: "",
    isAvailable: true,
  });

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      const response = await fetch("/api/menu/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopId: shop._id,
          name: newCategoryName,
          order: categories.length,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setCategories([...categories, data.category]);
      setNewCategoryName("");
      setIsAddingCategory(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!confirm("Delete this category and all its items?")) return;

    try {
      const response = await fetch(`/api/menu/categories/${categoryId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete");

      setCategories(categories.filter((c) => c._id !== categoryId));
      setItems(items.filter((i) => i.categoryId._id !== categoryId));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.price || !newItem.categoryId) {
      setError("Name, price, and category are required");
      return;
    }

    try {
      const response = await fetch("/api/menu/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newItem,
          shopId: shop._id,
          price: parseFloat(newItem.price),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setItems([...items, data.item]);
      setNewItem({
        name: "",
        description: "",
        price: "",
        categoryId: "",
        imageUrl: "",
        isAvailable: true,
      });
      setIsAddingItem(false);
      router.refresh();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!confirm("Delete this item?")) return;

    try {
      const response = await fetch(`/api/menu/items?id=${itemId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete");

      setItems(items.filter((i) => i._id !== itemId));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleAvailability = async (itemId, isAvailable) => {
    try {
      const response = await fetch(`/api/menu/items?id=${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable }),
      });

      if (!response.ok) throw new Error("Failed to update");

      setItems(
        items.map((i) => (i._id === itemId ? { ...i, isAvailable } : i)),
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const handleImageUpload = async (file) => {
    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "menu-items");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setNewItem((prev) => ({
        ...prev,
        imageUrl: data.url,
      }));
    } catch (error) {
      console.error("Image upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleImageUpload(file);
  };

  const handleSelect = (e) => {
    const file = e.target.files[0];
    if (file) handleImageUpload(file);
  };

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/shops"
          className="inline-flex items-center gap-2 text-coffee-medium hover:text-accent-orange transition-colors mb-4"
        >
          <span>←</span> Back to My Shops
        </Link>
        <h1 className="text-4xl font-serif font-bold text-coffee-dark">
          Manage Menu
        </h1>
        <p className="text-coffee-medium mt-2">{shop.name}</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Categories & Items */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Categories Sidebar */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-serif font-bold text-coffee-dark">
              Categories
            </h2>
            <button
              onClick={() => setIsAddingCategory(true)}
              className="text-accent-orange hover:text-coffee-dark text-2xl"
            >
              +
            </button>
          </div>

          {isAddingCategory && (
            <div className="mb-4 space-y-2">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Category name"
                className="input-field text-sm"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddCategory}
                  className="btn-primary text-sm py-1 px-3"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setIsAddingCategory(false);
                    setNewCategoryName("");
                  }}
                  className="text-sm text-coffee-medium hover:text-coffee-dark"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {categories.map((category) => (
              <div
                key={category._id}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedCategory === category._id
                    ? "bg-accent-orange text-white"
                    : "bg-cream hover:bg-cream-dark"
                }`}
                onClick={() => setSelectedCategory(category._id)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{category.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCategory(category._id);
                    }}
                    className="text-sm opacity-70 hover:opacity-100"
                  >
                    ✕
                  </button>
                </div>
                <div className="text-xs opacity-75 mt-1">
                  {
                    items.filter((i) => i.categoryId._id === category._id)
                      .length
                  }{" "}
                  items
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Menu Items */}
        <div className="md:col-span-2">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-serif font-bold text-coffee-dark">
                {selectedCategory
                  ? categories.find((c) => c._id === selectedCategory)?.name
                  : "All Items"}
              </h2>
              <button
                onClick={() => setIsAddingItem(true)}
                className="btn-primary text-sm"
              >
                + Add Item
              </button>
            </div>

            {/* Add Item Form */}
            {isAddingItem && (
              <div className="mb-6 p-4 bg-cream rounded-lg space-y-4">
                <input
                  type="text"
                  placeholder="Item name *"
                  value={newItem.name}
                  onChange={(e) =>
                    setNewItem({ ...newItem, name: e.target.value })
                  }
                  className="input-field"
                />
                <textarea
                  placeholder="Description"
                  value={newItem.description}
                  onChange={(e) =>
                    setNewItem({ ...newItem, description: e.target.value })
                  }
                  rows={2}
                  className="input-field"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Price *"
                    value={newItem.price}
                    onChange={(e) =>
                      setNewItem({ ...newItem, price: e.target.value })
                    }
                    className="input-field"
                  />
                  <select
                    value={newItem.categoryId}
                    onChange={(e) =>
                      setNewItem({ ...newItem, categoryId: e.target.value })
                    }
                    className="input-field"
                  >
                    <option value="">Select category *</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Image Upload */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-coffee-light rounded-lg p-6 text-center bg-white hover:bg-cream transition cursor-pointer"
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSelect}
                    className="hidden"
                    id="imageUpload"
                  />

                  <label htmlFor="imageUpload" className="cursor-pointer block">
                    {newItem.imageUrl ? (
                      <div className="space-y-3">
                        <img
                          src={newItem.imageUrl}
                          alt="Preview"
                          className="w-32 h-32 object-cover mx-auto rounded-lg"
                        />
                        <p className="text-xs text-gray-400">
                          Click or drop to change
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-coffee-dark font-medium">
                          Drag & Drop image here
                        </p>
                        <p className="text-sm text-gray-400">
                          or click to upload
                        </p>
                      </div>
                    )}
                  </label>
                </div>
                {uploading && (
                  <p className="text-sm text-gray-400 mt-2">
                    Uploading image...
                  </p>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={handleAddItem}
                    className="btn-primary text-sm"
                  >
                    Add Item
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingItem(false);
                      setNewItem({
                        name: "",
                        description: "",
                        price: "",
                        categoryId: "",
                        imageUrl: "",
                        isAvailable: true,
                      });
                    }}
                    className="text-sm text-coffee-medium hover:text-coffee-dark font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Items List */}
            <div className="space-y-4">
              {items
                .filter(
                  (item) =>
                    !selectedCategory ||
                    item.categoryId._id === selectedCategory,
                )
                .map((item) => (
                  <div
                    key={item._id}
                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-4 flex gap-4 items-start"
                  >
                    {/* Image */}
                    <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg bg-cream">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">
                          ☕
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg text-coffee-dark">
                          {item.name}
                        </h3>

                        <span
                          className={`text-xs px-3 py-1 rounded-full font-medium ${
                            item.isAvailable
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {item.isAvailable ? "Available" : "Unavailable"}
                        </span>
                      </div>

                      {item.description && (
                        <p className="text-sm text-coffee-medium mt-1 line-clamp-2">
                          {item.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-accent-orange text-base">
                            ${Number(item.price).toFixed(2)}
                          </span>
                          <span className="text-xs text-coffee-light bg-cream px-2 py-1 rounded-md">
                            {item.categoryId.name}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                          <button
                            onClick={() =>
                              handleToggleAvailability(
                                item._id,
                                !item.isAvailable,
                              )
                            }
                            className="text-sm hover:scale-110 transition"
                          >
                            {item.isAvailable ? "✅" : "❌"}
                          </button>

                          <button
                            onClick={() => handleDeleteItem(item._id)}
                            className="text-sm text-red-500 hover:scale-110 transition"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

              {items.filter(
                (item) =>
                  !selectedCategory || item.categoryId._id === selectedCategory,
              ).length === 0 && (
                <div className="text-center py-12 text-coffee-medium">
                  <div className="text-4xl mb-2">📋</div>
                  <p>No menu items yet</p>
                  <p className="text-sm">
                    Click "Add Item" to create your first item
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
