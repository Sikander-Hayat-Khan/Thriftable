"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";

const DEFAULT_CATEGORIES = [
  {
    num: "01",
    id: "streetwear",
    name: "Streetwear",
    eyebrow: "For the everyday uniform",
    headline: "Worn in. Never worn out.",
    body: "Oversized fits, bold graphics, the kind of pieces that already have a story before they meet yours. Streetwear that looks lived-in because it actually was.",
    cta: "Shop Streetwear →",
    image: "/hero_section/sections/streetwear.jpg",
  },
  {
    num: "02",
    id: "footwear",
    name: "Footwear",
    eyebrow: "Step into something with history",
    headline: "Broken in beats brand new.",
    body: "From scuffed classics to barely-touched finds, every pair has already done the hard work of getting comfortable. Now they're ready for your miles.",
    cta: "Shop Footwear →",
    image: "/hero_section/sections/footwear.jpg",
  },
  {
    num: "03",
    id: "eyewear",
    name: "Eyewear",
    eyebrow: "See it your way",
    headline: "Frames with a point of view.",
    body: "Vintage shapes and forgotten designer finds you won't see on every third face on the street. One-of-one, literally.",
    cta: "Shop Eyewear →",
    image: "/hero_section/sections/eyewear.jpg",
  },
  {
    num: "04",
    id: "vintage",
    name: "Vintage",
    eyebrow: "The good stuff, dug up",
    headline: "Old is the new original.",
    body: "Pieces that predate fast fashion – real fabric, real cuts, real character. Every rack is a different decade.",
    cta: "Shop Vintage →",
    image: "/hero_section/sections/vintage.jpg",
  },
  {
    num: "05",
    id: "kids",
    name: "Kids",
    eyebrow: "Little sizes, zero compromise",
    headline: "They'll outgrow it. Not outwear it.",
    body: "Gently loved clothing built to survive a kid's day, at prices that make sense for how fast they grow.",
    cta: "Shop Kids →",
    image: "/hero_section/sections/kids.jpg",
  },
  {
    num: "06",
    id: "accessories",
    name: "Accessories",
    eyebrow: "The details that finish a look",
    headline: "Small pieces, big personality.",
    body: "Bags, belts, hats, and jewelry that turn an outfit into a whole mood. Easy to thrift, hard to put down.",
    cta: "Shop Accessories →",
    image: "/hero_section/sections/accessories.jpg",
  },
  {
    num: "07",
    id: "athletic",
    name: "Athletic Wear",
    eyebrow: "Built to move, made to last",
    headline: "Already warmed up for you.",
    body: "Durable activewear that's been tested – literally – so you know it holds up. Sweat proof style at a fraction of retail.",
    cta: "Shop Athletic Wear →",
    image: "/hero_section/sections/athletic.jpg",
  },
];

export default function AdminCMSPage() {
  const [activeTab, setActiveTab] = useState("hero"); // 'hero', 'categories', 'announcement', 'community'
  const [selectedCatId, setSelectedCatId] = useState("streetwear");

  // 1. Announcement Ribbon State
  const [announcement, setAnnouncement] = useState(
    "Curated Pre-Loved Archive • Complimentary Carbon-Neutral Shipping on Acquisitions Over $100"
  );
  const [announcementActive, setAnnouncementActive] = useState(true);

  // 2. Hero Section State (Exact matching Homepage)
  const [heroEyebrow, setHeroEyebrow] = useState("Find it. Thrift it. Love it.");
  const [heroTitle, setHeroTitle] = useState("THRIFTABLE");
  const [heroSubtitle, setHeroSubtitle] = useState(
    "Thriftable is where secondhand feels like the best decision you made all week."
  );
  const [heroCta, setHeroCta] = useState("Shop Now");
  const [heroImage, setHeroImage] = useState("/hero_section/hero_image_3.png");

  // 3. Homepage Category Split Sections State
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);

  // 4. Community Testimonials Header
  const [communityTitle, setCommunityTitle] = useState("Community Stories & Archival Curation");
  const [communitySubtitle, setCommunitySubtitle] = useState(
    "Real collector stories and authentic feedback from fellow thrifters."
  );

  const [saveSuccess, setSaveSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const heroFileInputRef = useRef(null);
  const catFileInputRef = useRef(null);

  const supabase = useMemo(() => createClient(), []);

  // Handle local device image for Hero
  const handleHeroDeviceImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setHeroImage(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle local device image for Category Split
  const handleCatDeviceImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        handleCategoryChange("image", event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Fetch CMS data from LocalStorage & Supabase
  useEffect(() => {
    // 1. Instant hydration from LocalStorage
    try {
      const cached = localStorage.getItem("thriftable_cms_settings");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.announcement) setAnnouncement(parsed.announcement);
        if (parsed.announcementActive !== undefined) setAnnouncementActive(parsed.announcementActive);
        if (parsed.heroEyebrow) setHeroEyebrow(parsed.heroEyebrow);
        if (parsed.heroTitle) setHeroTitle(parsed.heroTitle);
        if (parsed.heroSubtitle) setHeroSubtitle(parsed.heroSubtitle);
        if (parsed.heroCta) setHeroCta(parsed.heroCta);
        if (parsed.heroImage) setHeroImage(parsed.heroImage);
        if (parsed.categories) setCategories(parsed.categories);
        if (parsed.communityTitle) setCommunityTitle(parsed.communityTitle);
        if (parsed.communitySubtitle) setCommunitySubtitle(parsed.communitySubtitle);
      }
    } catch {}

    // 2. Fetch latest from Supabase
    async function loadCMS() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("store_settings")
          .select("*")
          .eq("id", "global")
          .maybeSingle();

        if (!error && data) {
          if (data.announcement_text) setAnnouncement(data.announcement_text);
          if (data.announcement_active !== undefined) setAnnouncementActive(data.announcement_active);
          if (data.hero_title) setHeroTitle(data.hero_title);
          if (data.hero_subtitle) setHeroSubtitle(data.hero_subtitle);
          if (data.hero_cta) setHeroCta(data.hero_cta);
        }
      } catch (err) {
        console.warn("CMS fetch exception:", err);
      } finally {
        setLoading(false);
      }
    }

    loadCMS();
  }, [supabase]);

  // Update selected category field
  const handleCategoryChange = (field, value) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === selectedCatId ? { ...c, [field]: value } : c))
    );
  };

  // Save all CMS settings to LocalStorage and Supabase
  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess("Publishing homepage copy...");

    const fullCmsData = {
      announcement,
      announcementActive,
      heroEyebrow,
      heroTitle,
      heroSubtitle,
      heroCta,
      heroImage,
      categories,
      communityTitle,
      communitySubtitle,
      updatedAt: new Date().toISOString(),
    };

    // 1. Save to LocalStorage immediately so it persists on refresh in all tabs
    try {
      localStorage.setItem("thriftable_cms_settings", JSON.stringify(fullCmsData));
    } catch {}

    // 2. Save to Supabase
    try {
      const payload = {
        id: "global",
        announcement_text: announcement,
        announcement_active: announcementActive,
        hero_title: heroTitle,
        hero_subtitle: heroSubtitle,
        hero_cta: heroCta,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("store_settings").upsert(payload);

      if (!error) {
        setSaveSuccess("Homepage content published and saved successfully!");
      } else {
        setSaveSuccess("Homepage content saved to browser archive.");
      }
    } catch (err) {
      console.warn("CMS save exception:", err);
      setSaveSuccess("Saved to local archive.");
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveSuccess(""), 4000);
    }
  };

  const selectedCategory = categories.find((c) => c.id === selectedCatId) || categories[0];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-black/10 dark:border-white/10">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-[#B2A376] font-calluna font-semibold">
            Storefront Editorial
          </span>
          <h1 className="text-2xl sm:text-3xl font-macsans font-bold text-neutral-900 dark:text-white mt-1">
            Homepage Content Management (CMS)
          </h1>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="px-5 py-2.5 bg-[#B2A376] text-black font-calluna text-xs uppercase font-semibold hover:opacity-90 transition-opacity self-start sm:self-auto cursor-pointer"
        >
          {isSaving ? "Publishing..." : "Publish Content Changes"}
        </button>
      </div>

      {/* Alert */}
      {saveSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-calluna">
          ✓ {saveSuccess}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-black/10 dark:border-white/10 overflow-x-auto pb-px font-calluna text-xs tracking-wider">
        <button
          type="button"
          onClick={() => setActiveTab("hero")}
          className={`px-4 py-2.5 border-b-2 cursor-pointer transition-colors uppercase whitespace-nowrap ${
            activeTab === "hero"
              ? "border-[#B2A376] text-[#B2A376] font-bold"
              : "border-transparent text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
          }`}
        >
          00. Hero Section
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("categories")}
          className={`px-4 py-2.5 border-b-2 cursor-pointer transition-colors uppercase whitespace-nowrap ${
            activeTab === "categories"
              ? "border-[#B2A376] text-[#B2A376] font-bold"
              : "border-transparent text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
          }`}
        >
          01-07. Categories (7 Sections)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("announcement")}
          className={`px-4 py-2.5 border-b-2 cursor-pointer transition-colors uppercase whitespace-nowrap ${
            activeTab === "announcement"
              ? "border-[#B2A376] text-[#B2A376] font-bold"
              : "border-transparent text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
          }`}
        >
          Top Announcement Bar
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("community")}
          className={`px-4 py-2.5 border-b-2 cursor-pointer transition-colors uppercase whitespace-nowrap ${
            activeTab === "community"
              ? "border-[#B2A376] text-[#B2A376] font-bold"
              : "border-transparent text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
          }`}
        >
          08. Community Testimonials
        </button>
      </div>

      {/* TAB 1: HERO SECTION */}
      {activeTab === "hero" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 p-6 sm:p-8 space-y-4">
            <h3 className="font-macsans font-bold text-base text-neutral-900 dark:text-white pb-2 border-b border-black/10 dark:border-white/10">
              Homepage Hero Viewport (Section 00)
            </h3>

            <div className="space-y-4 text-xs font-macsans">
              <div>
                <label className="block uppercase font-bold text-neutral-500 mb-1 font-calluna">
                  Hero Eyebrow Tagline
                </label>
                <input
                  type="text"
                  value={heroEyebrow}
                  onChange={(e) => setHeroEyebrow(e.target.value)}
                  className="w-full p-3 bg-neutral-50 dark:bg-neutral-800 border border-black/15 dark:border-white/15 text-neutral-900 dark:text-white font-proda tracking-widest focus:outline-none focus:border-[#B2A376]"
                />
              </div>

              <div>
                <label className="block uppercase font-bold text-neutral-500 mb-1 font-calluna">
                  Hero Main Logo / Brand Title
                </label>
                <input
                  type="text"
                  value={heroTitle}
                  onChange={(e) => setHeroTitle(e.target.value)}
                  className="w-full p-3 bg-neutral-50 dark:bg-neutral-800 border border-black/15 dark:border-white/15 text-neutral-900 dark:text-white font-logo font-bold text-base tracking-widest focus:outline-none focus:border-[#B2A376]"
                />
              </div>

              <div>
                <label className="block uppercase font-bold text-neutral-500 mb-1 font-calluna">
                  Hero Subtitle Copy
                </label>
                <textarea
                  rows={3}
                  value={heroSubtitle}
                  onChange={(e) => setHeroSubtitle(e.target.value)}
                  className="w-full p-3 bg-neutral-50 dark:bg-neutral-800 border border-black/15 dark:border-white/15 text-neutral-900 dark:text-white font-proda leading-relaxed focus:outline-none focus:border-[#B2A376]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase font-bold text-neutral-500 mb-1 font-calluna">
                    Primary CTA Button Text
                  </label>
                  <input
                    type="text"
                    value={heroCta}
                    onChange={(e) => setHeroCta(e.target.value)}
                    className="w-full p-3 bg-neutral-50 dark:bg-neutral-800 border border-black/15 dark:border-white/15 text-neutral-900 dark:text-white font-calluna font-bold focus:outline-none focus:border-[#B2A376]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block uppercase font-bold text-neutral-500 font-calluna">
                      Background Image Path
                    </label>
                    <button
                      type="button"
                      onClick={() => heroFileInputRef.current?.click()}
                      className="text-[11px] font-calluna uppercase text-[#B2A376] hover:underline cursor-pointer"
                    >
                      📁 Select From Device
                    </button>
                    <input
                      ref={heroFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleHeroDeviceImage}
                      className="hidden"
                    />
                  </div>
                  <input
                    type="text"
                    value={heroImage}
                    onChange={(e) => setHeroImage(e.target.value)}
                    className="w-full p-3 bg-neutral-50 dark:bg-neutral-800 border border-black/15 dark:border-white/15 text-neutral-900 dark:text-white font-calluna focus:outline-none focus:border-[#B2A376]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Live Preview Card */}
          <div className="border border-black/10 dark:border-white/10 bg-black p-6 flex flex-col justify-center items-center text-center space-y-4 self-start relative overflow-hidden min-h-75">
            <span className="absolute top-3 left-3 text-[10px] font-calluna uppercase tracking-widest text-[#B2A376] z-10">
              Live Hero Mockup
            </span>
            <p className="text-[11px] font-proda tracking-[0.25em] text-[#B2A376] uppercase">
              {heroEyebrow}
            </p>
            <h2 className="font-logo text-3xl font-extrabold tracking-widest text-white">
              {heroTitle}
            </h2>
            <p className="text-xs text-neutral-300 font-proda max-w-xs">
              {heroSubtitle}
            </p>
            <div className="pt-2">
              <span className="px-6 py-2 bg-[#B2A376] text-black font-semibold text-xs uppercase tracking-widest">
                {heroCta} →
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CATEGORIES (01-07) */}
      {activeTab === "categories" && (
        <div className="space-y-6">
          {/* Category Switcher Pills */}
          <div className="flex items-center gap-2 flex-wrap pb-2 font-calluna text-xs uppercase">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCatId(cat.id)}
                className={`px-3 py-1.5 border transition-colors cursor-pointer ${
                  selectedCatId === cat.id
                    ? "bg-[#B2A376] text-black font-bold border-[#B2A376]"
                    : "bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-black/10 dark:border-white/10 hover:border-[#B2A376]"
                }`}
              >
                {cat.num}. {cat.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10">
                <h3 className="font-macsans font-bold text-base text-neutral-900 dark:text-white">
                  Section {selectedCategory.num}: {selectedCategory.name}
                </h3>
                <span className="text-xs font-mono text-[#B2A376]">
                  #{selectedCategory.id}
                </span>
              </div>

              <div className="space-y-4 text-xs font-macsans">
                <div>
                  <label className="block uppercase font-bold text-neutral-500 mb-1 font-calluna">
                    Eyebrow Subheader
                  </label>
                  <input
                    type="text"
                    value={selectedCategory.eyebrow}
                    onChange={(e) => handleCategoryChange("eyebrow", e.target.value)}
                    className="w-full p-3 bg-neutral-50 dark:bg-neutral-800 border border-black/15 dark:border-white/15 text-neutral-900 dark:text-white font-proda tracking-wider focus:outline-none focus:border-[#B2A376]"
                  />
                </div>

                <div>
                  <label className="block uppercase font-bold text-neutral-500 mb-1 font-calluna">
                    Section Headline
                  </label>
                  <input
                    type="text"
                    value={selectedCategory.headline}
                    onChange={(e) => handleCategoryChange("headline", e.target.value)}
                    className="w-full p-3 bg-neutral-50 dark:bg-neutral-800 border border-black/15 dark:border-white/15 text-neutral-900 dark:text-white font-macsans font-bold text-sm tracking-wide focus:outline-none focus:border-[#B2A376]"
                  />
                </div>

                <div>
                  <label className="block uppercase font-bold text-neutral-500 mb-1 font-calluna">
                    Editorial Story Body
                  </label>
                  <textarea
                    rows={3}
                    value={selectedCategory.body}
                    onChange={(e) => handleCategoryChange("body", e.target.value)}
                    className="w-full p-3 bg-neutral-50 dark:bg-neutral-800 border border-black/15 dark:border-white/15 text-neutral-900 dark:text-white font-proda leading-relaxed focus:outline-none focus:border-[#B2A376]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block uppercase font-bold text-neutral-500 mb-1 font-calluna">
                      CTA Button Text
                    </label>
                    <input
                      type="text"
                      value={selectedCategory.cta}
                      onChange={(e) => handleCategoryChange("cta", e.target.value)}
                      className="w-full p-3 bg-neutral-50 dark:bg-neutral-800 border border-black/15 dark:border-white/15 text-neutral-900 dark:text-white font-calluna font-bold focus:outline-none focus:border-[#B2A376]"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block uppercase font-bold text-neutral-500 font-calluna">
                        Section Split Image
                      </label>
                      <button
                        type="button"
                        onClick={() => catFileInputRef.current?.click()}
                        className="text-[11px] font-calluna uppercase text-[#B2A376] hover:underline cursor-pointer"
                      >
                        📁 Choose Image
                      </button>
                      <input
                        ref={catFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleCatDeviceImage}
                        className="hidden"
                      />
                    </div>
                    <input
                      type="text"
                      value={selectedCategory.image}
                      onChange={(e) => handleCategoryChange("image", e.target.value)}
                      className="w-full p-3 bg-neutral-50 dark:bg-neutral-800 border border-black/15 dark:border-white/15 text-neutral-900 dark:text-white font-calluna focus:outline-none focus:border-[#B2A376]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Live Category Split Mockup */}
            <div className="border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 p-6 space-y-4 self-start">
              <span className="text-xs uppercase font-bold text-neutral-400 font-calluna block pb-2 border-b border-black/10 dark:border-white/10">
                Split Section Preview
              </span>

              <div className="relative aspect-4/3 w-full bg-neutral-100 dark:bg-neutral-800 border border-black/10 dark:border-white/10 overflow-hidden">
                <Image
                  src={selectedCategory.image || "/hero_section/sections/streetwear.jpg"}
                  alt={selectedCategory.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[#B2A376] font-proda font-bold text-base">
                    {selectedCategory.num}
                  </span>
                  <span className="text-[#B2A376] font-proda uppercase text-[10px] tracking-wider">
                    {selectedCategory.eyebrow}
                  </span>
                </div>
                <h4 className="font-macsans font-bold text-sm text-neutral-900 dark:text-white">
                  {selectedCategory.headline}
                </h4>
                <p className="text-[11px] font-proda text-neutral-500 leading-relaxed">
                  {selectedCategory.body}
                </p>
                <div className="pt-2">
                  <span className="inline-block px-3 py-1 bg-[#B2A376] text-black font-semibold text-[10px] uppercase">
                    {selectedCategory.cta}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ANNOUNCEMENT RIBBON */}
      {activeTab === "announcement" && (
        <div className="p-6 sm:p-8 border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 space-y-4 max-w-3xl">
          <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10">
            <h3 className="font-macsans font-bold text-base text-neutral-900 dark:text-white">
              Announcement Top Ribbon Banner
            </h3>
            <button
              type="button"
              onClick={() => setAnnouncementActive(!announcementActive)}
              className={`px-3 py-1 text-xs font-sans uppercase border cursor-pointer ${
                announcementActive
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                  : "bg-neutral-500/10 text-neutral-400 border-neutral-500/30"
              }`}
            >
              {announcementActive ? "● Visible Storewide" : "○ Hidden"}
            </button>
          </div>

          <div>
            <label className="block uppercase font-bold text-neutral-500 mb-1 font-calluna text-xs">
              Banner Announcement Copy
            </label>
            <input
              type="text"
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              className="w-full p-3 bg-neutral-50 dark:bg-neutral-800 border border-black/15 dark:border-white/15 text-neutral-900 dark:text-white font-calluna text-xs focus:outline-none focus:border-[#B2A376]"
            />
          </div>
        </div>
      )}

      {/* TAB 4: COMMUNITY TESTIMONIALS */}
      {activeTab === "community" && (
        <div className="p-6 sm:p-8 border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 space-y-4 max-w-3xl">
          <h3 className="font-macsans font-bold text-base text-neutral-900 dark:text-white pb-3 border-b border-black/10 dark:border-white/10">
            Homepage Testimonials Carousel Header (Section 08)
          </h3>

          <div className="space-y-4 text-xs font-macsans">
            <div>
              <label className="block uppercase font-bold text-neutral-500 mb-1 font-calluna">
                Section Heading
              </label>
              <input
                type="text"
                value={communityTitle}
                onChange={(e) => setCommunityTitle(e.target.value)}
                className="w-full p-3 bg-neutral-50 dark:bg-neutral-800 border border-black/15 dark:border-white/15 text-neutral-900 dark:text-white font-bold focus:outline-none focus:border-[#B2A376]"
              />
            </div>

            <div>
              <label className="block uppercase font-bold text-neutral-500 mb-1 font-calluna">
                Section Subtitle
              </label>
              <textarea
                rows={2}
                value={communitySubtitle}
                onChange={(e) => setCommunitySubtitle(e.target.value)}
                className="w-full p-3 bg-neutral-50 dark:bg-neutral-800 border border-black/15 dark:border-white/15 text-neutral-900 dark:text-white font-proda focus:outline-none focus:border-[#B2A376]"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
