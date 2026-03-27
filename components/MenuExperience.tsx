"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Container from "./Container";
import SectionHeader from "./SectionHeader";
import { RestaurantMenuCategory, RestaurantMenuItem } from "@/types/restaurant";

type MenuExperienceProps = {
  restaurantId: string;
  restaurantName: string;
  whatsappHref: string;
  phoneHref: string;
  categories: RestaurantMenuCategory[];
  menuItems: RestaurantMenuItem[];
};

export default function MenuExperience({
  restaurantId,
  restaurantName,
  whatsappHref,
  phoneHref,
  categories,
  menuItems
}: MenuExperienceProps) {
  const [cachedCategories, setCachedCategories] = useState(categories);
  const [cachedMenuItems, setCachedMenuItems] = useState(menuItems);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTag, setSelectedTag] = useState("all");
  const [trackedItems, setTrackedItems] = useState<Record<string, boolean>>({});
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const cacheKey = `tableflow_menu_cache_${restaurantId}`;

    try {
      const rawCache = window.localStorage.getItem(cacheKey);

      if (rawCache) {
        const parsed = JSON.parse(rawCache) as {
          categories?: RestaurantMenuCategory[];
          menuItems?: RestaurantMenuItem[];
        };

        if ((!categories.length || !menuItems.length) && parsed.categories && parsed.menuItems) {
          setCachedCategories(parsed.categories);
          setCachedMenuItems(parsed.menuItems);
        }
      }

      window.localStorage.setItem(
        cacheKey,
        JSON.stringify({
          categories,
          menuItems,
          cachedAt: new Date().toISOString()
        })
      );
    } catch {
      // Ignore cache storage errors and keep live props.
    }
  }, [restaurantId, categories, menuItems]);

  useEffect(() => {
    const syncNetworkState = () => setIsOffline(!window.navigator.onLine);

    syncNetworkState();
    window.addEventListener("online", syncNetworkState);
    window.addEventListener("offline", syncNetworkState);

    return () => {
      window.removeEventListener("online", syncNetworkState);
      window.removeEventListener("offline", syncNetworkState);
    };
  }, []);

  const liveCategories = categories.length > 0 ? categories : cachedCategories;
  const liveMenuItems = menuItems.length > 0 ? menuItems : cachedMenuItems;

  const categoryOptions = useMemo(() => {
    const categoryMap = new Map(liveCategories.map((category) => [category.id, category]));

    liveMenuItems.forEach((item) => {
      if (item.categoryId && !categoryMap.has(item.categoryId)) {
        categoryMap.set(item.categoryId, {
          id: item.categoryId,
          name: item.categoryName || "Menu",
          sortOrder: item.sortOrder
        });
      }
    });

    return Array.from(categoryMap.values()).sort((a, b) => a.sortOrder - b.sortOrder);
  }, [liveCategories, liveMenuItems]);

  const availableTags = useMemo(
    () =>
      Array.from(
        new Set(liveMenuItems.flatMap((item) => item.tags.map((tag) => tag.trim())).filter(Boolean))
      ).sort((a, b) => a.localeCompare(b)),
    [liveMenuItems]
  );

  const filteredItems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return liveMenuItems.filter((item) => {
      const inCategory =
        selectedCategory === "all" || item.categoryId === selectedCategory;
      const inTag =
        selectedTag === "all" ||
        item.tags.some((tag) => tag.toLowerCase() === selectedTag.toLowerCase());
      const inSearch =
        !normalizedSearch ||
        item.name.toLowerCase().includes(normalizedSearch) ||
        item.description.toLowerCase().includes(normalizedSearch) ||
        item.tags.some((tag) => tag.toLowerCase().includes(normalizedSearch));

      return inCategory && inTag && inSearch;
    });
  }, [liveMenuItems, search, selectedCategory, selectedTag]);

  const itemsByCategory = useMemo(() => {
    const categoryIds = categoryOptions.map((category) => category.id);
    const grouped = categoryOptions.map((category) => ({
      ...category,
      items: filteredItems.filter((item) => item.categoryId === category.id)
    }));

    const uncategorized = filteredItems.filter(
      (item) => !item.categoryId || !categoryIds.includes(item.categoryId)
    );

    if (uncategorized.length > 0) {
      grouped.push({
        id: "uncategorized",
        name: "More To Explore",
        sortOrder: 999,
        items: uncategorized
      });
    }

    return grouped.filter((category) => category.items.length > 0);
  }, [categoryOptions, filteredItems]);

  useEffect(() => {
    if (
      selectedCategory !== "all" &&
      !itemsByCategory.some((category) => category.id === selectedCategory)
    ) {
      setSelectedCategory("all");
    }
  }, [itemsByCategory, selectedCategory]);

  const trackMenuView = async (itemId: string) => {
    if (trackedItems[itemId]) {
      return;
    }

    setTrackedItems((current) => ({ ...current, [itemId]: true }));

    await fetch("/api/menu-item-view", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        restaurantId,
        itemId
      })
    });
  };

  const buildWaiterHref = (item: RestaurantMenuItem) => {
    const message = encodeURIComponent(
      `Hello ${restaurantName}, I would like ${item.name}.`
    );

    if (whatsappHref.startsWith("https://wa.me/")) {
      return `${whatsappHref}?text=${message}`;
    }

    return phoneHref;
  };

  return (
    <section id="menu" className="py-16">
      <Container className="space-y-10">
        <SectionHeader
          eyebrow="At Your Table"
          title="Take your time and explore the menu"
          subtitle="Browse by section, search for favourites, and see what is being served right now."
        />
        <div className="tf-panel space-y-6 p-4 sm:p-6">
          {isOffline ? (
            <div className="rounded-2xl border border-gold-200/20 bg-gold-200/10 px-4 py-3 text-sm text-gold-100">
              Your connection dropped for a moment. The latest menu is still here so you can keep browsing.
            </div>
          ) : null}
          <div className="sticky top-4 z-20 space-y-4 rounded-[28px] border border-white/10 bg-ink/95 p-4 backdrop-blur">
            <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.3em] text-ivory/55">
                  Find A Dish
                </span>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search for burger, pizza, coffee..."
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-ivory placeholder:text-ivory/35 focus:border-gold-200/60 focus:outline-none"
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.3em] text-ivory/55">
                  Food Preference
                </span>
                <select
                  value={selectedTag}
                  onChange={(event) => setSelectedTag(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-ivory focus:border-gold-200/60 focus:outline-none"
                >
                  <option value="all">Everything</option>
                  {availableTags.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2">
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
                  selectedCategory === "all"
                    ? "bg-gold-300 text-ink"
                    : "border border-white/10 bg-white/5 text-ivory/70 hover:border-gold-200/40"
                }`}
              >
                All
              </button>
              {categoryOptions.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(category.id);
                    const section = document.getElementById(`menu-category-${category.id}`);
                    section?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
                    selectedCategory === category.id
                      ? "bg-gold-300 text-ink"
                      : "border border-white/10 bg-white/5 text-ivory/70 hover:border-gold-200/40"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            {itemsByCategory.length > 0 ? (
              itemsByCategory.map((category) => (
                <div
                  key={category.id}
                  id={`menu-category-${category.id}`}
                  className="space-y-4 scroll-mt-40"
                >
                  <div className="flex items-end justify-between gap-4 border-b border-white/10 pb-3">
                    <div>
                      <h3 className="text-2xl font-semibold text-ivory">{category.name}</h3>
                      <p className="mt-1 text-sm text-ivory/55">
                        {category.items.length} {category.items.length === 1 ? "dish" : "dishes"}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    {category.items.map((item) => {
                      const waiterHref = buildWaiterHref(item);

                      return (
                        <article
                          key={item.id}
                          className={`overflow-hidden rounded-[28px] border p-4 transition ${
                            item.isAvailable
                              ? "border-white/10 bg-black/20 hover:border-gold-200/40"
                              : "border-red-400/20 bg-red-400/5"
                          }`}
                        >
                          <div className="flex gap-4">
                            <div className="relative h-24 w-24 flex-none overflow-hidden rounded-2xl bg-white/5">
                              <Image
                                src={item.imageUrl}
                                alt={item.name}
                                fill
                                className={`object-cover ${item.isAvailable ? "" : "opacity-50 grayscale"}`}
                                sizes="96px"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                  <h4 className="text-base font-semibold text-ivory">
                                    {item.name}
                                  </h4>
                                  <p className="mt-1 text-sm text-ivory/60">
                                    {item.description}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-semibold text-gold-200">
                                    {typeof item.price === "number"
                                      ? `${item.currency || "RWF"} ${item.price.toLocaleString()}`
                                      : "Ask your server"}
                                  </p>
                                  {!item.isAvailable ? (
                                    <span className="mt-2 inline-flex rounded-full border border-red-400/20 bg-red-400/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-red-300">
                                      Sold Out
                                    </span>
                                  ) : null}
                                </div>
                              </div>

                              <div className="mt-3 flex flex-wrap gap-2">
                                {item.isFeatured ? (
                                  <span className="rounded-full border border-gold-200/30 bg-gold-200/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-gold-200">
                                    Featured
                                  </span>
                                ) : null}
                                {item.tags.map((tag) => (
                                  <button
                                    key={`${item.id}-${tag}`}
                                    type="button"
                                    onClick={() => setSelectedTag(tag)}
                                    className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-ivory/60 transition hover:border-gold-200/40 hover:text-ivory"
                                  >
                                    {tag}
                                  </button>
                                ))}
                              </div>

                              <div className="mt-4">
                                {item.isAvailable ? (
                                  <a
                                    href={waiterHref}
                                    target={waiterHref.startsWith("http") ? "_blank" : undefined}
                                    rel={waiterHref.startsWith("http") ? "noreferrer" : undefined}
                                    onClick={() => trackMenuView(item.id)}
                                    className="inline-flex rounded-full bg-gold-300 px-4 py-2 text-sm font-semibold text-ink transition hover:bg-gold-200"
                                  >
                                    Ask About This Dish
                                  </a>
                                ) : (
                                  <button
                                    type="button"
                                    disabled
                                    className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-ivory/40"
                                  >
                                    Not Available Right Now
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[28px] border border-dashed border-white/15 bg-black/20 px-6 py-10 text-center">
                <p className="text-lg font-semibold text-ivory">Nothing matches that search yet.</p>
                <p className="mt-2 text-sm text-ivory/60">
                  Try a different word, choose another section, or clear the filter.
                </p>
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
