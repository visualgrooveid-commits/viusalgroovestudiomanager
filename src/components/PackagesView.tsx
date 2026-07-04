/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { formatRupiah } from "../utils";
import { StudioPackage, EventType } from "../types";
import { EVENT_TYPES } from "../data";
import {
  Clock,
  ShieldCheck,
  CheckCircle2,
  Plus,
  Edit,
  Trash2,
  X,
  Sparkles,
  Save,
  Layers
} from "lucide-react";

interface PackagesViewProps {
  packages: StudioPackage[];
  onAddPackage: (newPkg: Omit<StudioPackage, "id">) => void;
  onUpdatePackage: (updatedPkg: StudioPackage) => void;
  onDeletePackage: (id: string) => void;
}

export default function PackagesView({
  packages,
  onAddPackage,
  onUpdatePackage,
  onDeletePackage
}: PackagesViewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<StudioPackage | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [eventType, setEventType] = useState<EventType>("Wedding");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [featuresText, setFeaturesText] = useState("");
  const [popular, setPopular] = useState(false);
  const [formError, setFormError] = useState("");

  const handleOpenNew = () => {
    setEditingPackage(null);
    setTitle("");
    setEventType("Wedding");
    setDuration("4 Hours");
    setPrice(5000000);
    setFeaturesText("Premium photo editing\n1 Photographer + 1 Assistant\nHigh-resolution digital delivery");
    setPopular(false);
    setFormError("");
    setIsOpen(true);
  };

  const handleOpenEdit = (pkg: StudioPackage) => {
    setEditingPackage(pkg);
    setTitle(pkg.title);
    setEventType(pkg.eventType);
    setDuration(pkg.duration);
    setPrice(pkg.price);
    setFeaturesText(pkg.features.join("\n"));
    setPopular(!!pkg.popular);
    setFormError("");
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError("Judul paket wajib diisi");
      return;
    }
    if (price < 0) {
      setFormError("Harga tidak boleh negatif");
      return;
    }

    const features = featuresText
      .split("\n")
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    const packageData = {
      title: title.trim(),
      eventType,
      duration: duration.trim() || "Session",
      price: Number(price),
      features,
      popular
    };

    if (editingPackage) {
      onUpdatePackage({
        ...packageData,
        id: editingPackage.id
      });
    } else {
      onAddPackage(packageData);
    }

    setIsOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus paket "${name}"?`)) {
      onDeletePackage(id);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-serif tracking-tight font-medium text-slate-900">
            Studio Packages
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Preset package templates, price structures, and creative inclusions.
          </p>
        </div>
        <button
          onClick={handleOpenNew}
          className="inline-flex items-center space-x-2 bg-black hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Paket Custom</span>
        </button>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pack) => (
          <div
            key={pack.id}
            className={`bg-white rounded-3xl p-6 border relative flex flex-col justify-between shadow-[0_4px_24px_rgba(0,0,0,0.01)] hover:shadow-xs transition-all duration-200 group ${
              pack.popular ? "border-slate-900" : "border-slate-200"
            }`}
          >
            {/* Popular Badge */}
            {pack.popular && (
              <span className="absolute -top-3 left-6 bg-black text-white font-mono text-[9px] uppercase tracking-widest px-3 py-1 rounded-full font-bold shadow-xs">
                Popular Package
              </span>
            )}

            {/* Edit / Delete overlay buttons */}
            <div className="absolute top-4 right-4 flex items-center space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleOpenEdit(pack)}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-black border border-slate-200 transition-all cursor-pointer"
                title="Edit Paket"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(pack.id, pack.title)}
                className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 border border-rose-200 transition-all cursor-pointer"
                title="Hapus Paket"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Type and Duration */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400">
                  {pack.eventType} Template
                </span>
                <div className="flex items-center text-slate-500 space-x-1 font-mono text-xs pr-14 group-hover:pr-14 md:pr-0">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{pack.duration}</span>
                </div>
              </div>

              {/* Title & Price */}
              <div className="space-y-1.5">
                <h3 className="text-lg font-semibold text-slate-900 leading-snug group-hover:text-black transition-colors">
                  {pack.title}
                </h3>
                <p className="text-xl font-serif font-medium text-slate-950">
                  {formatRupiah(pack.price)}
                </p>
              </div>

              {/* Divider */}
              <div className="h-px bg-slate-100" />

              {/* Features List */}
              <ul className="space-y-2.5">
                {pack.features.map((feat, idx) => (
                  <li key={`${pack.id}-feat-${idx}`} className="flex items-start space-x-2 text-xs text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
                {pack.features.length === 0 && (
                  <li className="text-xs text-slate-400 italic">No custom descriptions added yet.</li>
                )}
              </ul>
            </div>

            {/* Bottom Inclusions */}
            <div className="mt-8 pt-4 border-t border-slate-100 bg-slate-50/50 -mx-6 -mb-6 p-6 rounded-b-3xl flex items-center justify-between">
              <div className="flex items-center space-x-1 text-slate-500 text-xs">
                <ShieldCheck className="w-4 h-4 text-slate-950" />
                <span className="font-semibold text-slate-800">VisualGroove License</span>
              </div>
              <span className="text-[10px] font-mono uppercase bg-white border border-slate-200 px-2.5 py-0.5 rounded text-slate-700">
                Print Ready
              </span>
            </div>
          </div>
        ))}

        {packages.length === 0 && (
          <div className="col-span-full py-16 bg-white border border-slate-200 rounded-3xl text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
            <Layers className="w-8 h-8 text-slate-300 animate-pulse" />
            <p className="text-sm font-medium">Belum ada paket studio custom.</p>
            <button
              onClick={handleOpenNew}
              className="text-xs font-semibold text-slate-800 underline hover:text-black"
            >
              Buat Paket Baru Sekarang
            </button>
          </div>
        )}
      </div>

      {/* Package Creation / Editing Slide-out Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-neutral-950/30 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsOpen(false)}
          />

          {/* Form Panel */}
          <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto z-10 animate-slide-in">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-serif font-semibold text-slate-900">
                  {editingPackage ? "Edit Paket Studio" : "Tambah Paket Custom Baru"}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Customize prices, event structures, and client deliverables.
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-900 hover:border-slate-300 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1 overflow-y-auto no-scrollbar">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl text-xs font-medium">
                  {formError}
                </div>
              )}

              {/* Package Identification */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Nama Paket (Package Title) *</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g., Heritage Portraiture Session"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-950 focus:bg-white transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Tipe Kategori Event</label>
                    <select
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value as EventType)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-slate-950 focus:bg-white transition-all cursor-pointer"
                    >
                      {EVENT_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Durasi Sesi</label>
                    <input
                      type="text"
                      placeholder="E.g., 4 Hours"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-950 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Harga Paket (Rupiah) *</label>
                  <input
                    type="number"
                    required
                    placeholder="8500000"
                    value={price || ""}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-950 focus:bg-white transition-all"
                  />
                </div>

                {/* Features (One per line) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700">Inklusi & Deskripsi Fitur</label>
                    <span className="text-[10px] font-mono text-slate-400">Satu fitur per baris</span>
                  </div>
                  <textarea
                    rows={6}
                    placeholder={"Satu Lead Photographer\nFine Art color grading (30 previews)\nHigh-Res digital files"}
                    value={featuresText}
                    onChange={(e) => setFeaturesText(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-950 focus:bg-white transition-all resize-none"
                  />
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Setiap baris teks baru dalam kotak di atas akan diubah menjadi poin inklusi (bullet point) yang terpisah di kartu paket.
                  </p>
                </div>

                {/* Popular toggle */}
                <div className="pt-2">
                  <label className="flex items-center space-x-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={popular}
                      onChange={(e) => setPopular(e.target.checked)}
                      className="w-4.5 h-4.5 rounded border-slate-300 text-black focus:ring-black accent-black cursor-pointer"
                    />
                    <div className="text-left">
                      <span className="text-xs font-semibold text-slate-800 group-hover:text-black">
                        Tampilkan Badge Terpopuler (Popular Package)
                      </span>
                      <p className="text-[10px] text-slate-400">Menambahkan aksen border hitam yang elegan untuk menarik minat klien.</p>
                    </div>
                  </label>
                </div>
              </div>
            </form>

            {/* Bottom Actions */}
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-5 py-2.5 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-600 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2.5 bg-black hover:bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Paket</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
