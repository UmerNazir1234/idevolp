"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import {
  Flyer,
  FlyerButton as FlyerButtonSettings,
  getFlyersForPage,
  getNavigationItems,
  NavigationItem,
  setFlyersForPage,
  subscribeToDemoChanges,
} from "@/lib/demo-store";
import ToastNotification, { useToast } from "@/components/ToastNotification";

const fieldClass = "mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";
const labelClass = "block text-sm font-bold text-neutral-800";

const defaultButton: FlyerButtonSettings = {
  enabled: true,
  text: "REGISTER NOW",
  link: "/",
  width: 0,
  height: 40,
  fontSize: 12,
  fontWeight: "700",
  borderRadius: 3,
  backgroundColor: "#b00000",
  textColor: "#ffffff",
  borderColor: "#b00000",
  borderWidth: 0,
  padding: 8,
  alignment: "center",
};

function createFlyer(link = "/"): Flyer {
  return {
    id: `flyer-${crypto.randomUUID()}`,
    image: "",
    title: "",
    description: "",
    button: { ...defaultButton, link },
  };
}

function isAllowedLink(value: string) {
  return value.startsWith("/") || /^(https?:|mailto:|tel:)/i.test(value);
}

export function FlyerButton({ button }: { button: FlyerButtonSettings }) {
  if (!button.enabled || !button.text.trim() || !button.link.trim()) return null;

  return (
    <div className={`flex ${button.alignment === "left" ? "justify-start" : button.alignment === "right" ? "justify-end" : "justify-center"}`}>
      <a
        href={button.link}
        className="inline-flex max-w-full items-center justify-center text-center transition hover:opacity-90"
        style={{
          boxSizing: "border-box",
          width: button.width === 0 ? "100%" : `${button.width}px`,
          maxWidth: "100%",
          height: `${button.height}px`,
          padding: `${button.padding}px`,
          border: `${button.borderWidth}px solid ${button.borderColor}`,
          borderRadius: `${button.borderRadius}px`,
          backgroundColor: button.backgroundColor,
          color: button.textColor,
          fontSize: `${button.fontSize}px`,
          fontWeight: Number(button.fontWeight),
        }}
      >
        {button.text}
      </a>
    </div>
  );
}

export function FlyerCard({ flyer, pageLabel, polished = false }: { flyer: Flyer; pageLabel: string; polished?: boolean }) {
  return (
    <article className={`min-w-0 overflow-hidden ${polished ? "rounded-xl border border-neutral-200 bg-white text-neutral-900 shadow-sm" : "text-white"}`}>
      {flyer.image && (
        // The image is kept at its intrinsic aspect ratio.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={flyer.image} alt={flyer.title || `Flyer for ${pageLabel}`} className="block h-auto w-full" />
      )}
      {(flyer.title || flyer.description || flyer.button.enabled) && (
        <div className={`space-y-3 ${polished ? "p-4 sm:p-5" : "pt-3"}`}>
          {flyer.title && <h3 className="font-serif text-xl font-bold sm:text-2xl">{flyer.title}</h3>}
          {flyer.description && <p className={`whitespace-pre-wrap leading-relaxed ${polished ? "text-neutral-700" : "text-white/85"}`}>{flyer.description}</p>}
          <FlyerButton button={flyer.button} />
        </div>
      )}
    </article>
  );
}

export function FlyerGrid({ flyers, pageLabel, polished = false }: { flyers: Flyer[]; pageLabel: string; polished?: boolean }) {
  if (!flyers.length) return null;
  return (
    <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2 md:gap-8">
      {flyers.map((flyer) => (
        <div key={flyer.id} className={flyers.length === 1 ? "mx-auto w-full max-w-2xl md:col-span-2" : "min-w-0"}>
          <FlyerCard flyer={flyer} pageLabel={pageLabel} polished={polished} />
        </div>
      ))}
    </div>
  );
}

export function FlyerPreview({ flyer, pageLabel }: { flyer: Flyer; pageLabel: string }) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-[#180e0e] p-4 sm:p-6" aria-label="Live flyer preview">
      <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-neutral-500">Live Preview</h3>
      {flyer.image ? (
        <FlyerCard flyer={flyer} pageLabel={pageLabel} />
      ) : (
        <div className="flex min-h-48 items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 bg-white px-5 text-center text-sm text-neutral-500">
          Select an image to preview your flyer.
        </div>
      )}
    </section>
  );
}

export function FlyerForm({
  flyer,
  pageLabel,
  navigationItems,
  onChange,
  onSubmit,
  onCancel,
  isEditing,
  error,
}: {
  flyer: Flyer;
  pageLabel: string;
  navigationItems: NavigationItem[];
  onChange: (flyer: Flyer) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  isEditing: boolean;
  error: string;
}) {
  const imageInput = useRef<HTMLInputElement>(null);
  const [imageError, setImageError] = useState("");

  function updateButton<K extends keyof FlyerButtonSettings>(key: K, value: FlyerButtonSettings[K]) {
    onChange({ ...flyer, button: { ...flyer.button, [key]: value } });
  }

  function selectImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = "";
    if (!file.type.startsWith("image/")) {
      setImageError("Choose a supported image file.");
      return;
    }
    if (file.size > 1_500_000) {
      setImageError("Choose an image smaller than 1.5 MB.");
      return;
    }
    setImageError("");
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") onChange({ ...flyer, image: reader.result });
    };
    reader.onerror = () => {
      setImageError("The selected image could not be read. Please choose it again.");
    };
    reader.readAsDataURL(file);
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6 rounded-2xl bg-white p-5 text-neutral-900 shadow-xl sm:p-7 xl:grid-cols-2">
      <div className="space-y-5">
        <div>
          <span className={labelClass}>Flyer image <span className="text-red-700">*</span></span>
          <input ref={imageInput} type="file" accept="image/*" onChange={selectImage} className="sr-only" aria-label="Choose flyer image" />
          {flyer.image ? (
            <div className="mt-2 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={flyer.image} alt="Selected flyer preview" className="max-h-80 w-full object-contain" />
              <div className="flex flex-wrap gap-3 border-t border-neutral-200 p-3">
                <button type="button" onClick={() => imageInput.current?.click()} className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-bold hover:bg-neutral-100">Replace image</button>
                <button type="button" onClick={() => { onChange({ ...flyer, image: "" }); if (imageInput.current) imageInput.current.value = ""; }} className="rounded-full border border-red-200 px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-50">Remove image</button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => imageInput.current?.click()} className="mt-2 flex min-h-36 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 px-4 py-5 text-center hover:border-brand hover:bg-red-50/30">
              <span className="text-2xl text-brand" aria-hidden="true">＋</span>
              <span className="mt-2 font-bold">Choose a flyer image</span>
              <span className="mt-1 text-xs text-neutral-500">Image file, up to 1.5 MB</span>
            </button>
          )}
          {imageError && <p role="alert" className="mt-2 text-sm font-semibold text-red-700">{imageError}</p>}
        </div>

        <div>
          <label htmlFor="flyer-title" className={labelClass}>Flyer title <span className="font-normal text-neutral-500">(optional)</span></label>
          <input id="flyer-title" value={flyer.title} onChange={(event) => onChange({ ...flyer, title: event.target.value })} className={fieldClass} placeholder="Training Program" />
        </div>
        <div>
          <label htmlFor="flyer-description" className={labelClass}>Description <span className="font-normal text-neutral-500">(optional)</span></label>
          <textarea id="flyer-description" value={flyer.description} onChange={(event) => onChange({ ...flyer, description: event.target.value })} className={fieldClass} rows={3} placeholder="Add a short description..." />
        </div>

        <fieldset className="space-y-4 rounded-xl border border-neutral-200 p-4">
          <legend className="px-1 font-bold text-neutral-900">Custom button</legend>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" checked={flyer.button.enabled} onChange={(event) => updateButton("enabled", event.target.checked)} className="accent-brand" />
            Show button
          </label>
          {flyer.button.enabled && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label htmlFor="flyer-button-text" className={labelClass}>Button text</label><input id="flyer-button-text" value={flyer.button.text} onChange={(event) => updateButton("text", event.target.value)} className={fieldClass} placeholder="Learn More" /></div>
                <div><label htmlFor="flyer-button-link" className={labelClass}>Button link / URL</label><input id="flyer-button-link" list="flyer-navigation-routes" value={flyer.button.link} onChange={(event) => updateButton("link", event.target.value)} className={fieldClass} placeholder="/training/mern-stack or https://example.com" /><datalist id="flyer-navigation-routes">{navigationItems.map((item) => <option key={item.id} value={item.href}>{item.label}</option>)}</datalist></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <NumberField id="button-width" label="Width (px; 0 = full width)" value={flyer.button.width} min={0} max={1200} onChange={(value) => updateButton("width", value)} />
                <NumberField id="button-height" label="Height (px)" value={flyer.button.height} min={24} max={300} onChange={(value) => updateButton("height", value)} />
                <NumberField id="button-font-size" label="Font size (px)" value={flyer.button.fontSize} min={8} max={96} onChange={(value) => updateButton("fontSize", value)} />
                <div>
                  <label htmlFor="button-font-weight" className={labelClass}>Font weight</label>
                  <select id="button-font-weight" value={flyer.button.fontWeight} onChange={(event) => updateButton("fontWeight", event.target.value)} className={fieldClass}>
                    <option value="400">Regular</option><option value="500">Medium</option><option value="700">Bold</option><option value="900">Black</option>
                  </select>
                </div>
                <NumberField id="button-radius" label="Border radius (px)" value={flyer.button.borderRadius} min={0} max={200} onChange={(value) => updateButton("borderRadius", value)} />
                <NumberField id="button-border-width" label="Border width (px)" value={flyer.button.borderWidth} min={0} max={20} onChange={(value) => updateButton("borderWidth", value)} />
                <NumberField id="button-padding" label="Padding (px)" value={flyer.button.padding} min={0} max={80} onChange={(value) => updateButton("padding", value)} />
                <div>
                  <label htmlFor="button-alignment" className={labelClass}>Position / alignment</label>
                  <select id="button-alignment" value={flyer.button.alignment} onChange={(event) => updateButton("alignment", event.target.value as FlyerButtonSettings["alignment"])} className={fieldClass}>
                    <option value="left">Left</option><option value="center">Center</option><option value="right">Right</option>
                  </select>
                </div>
                <ColorField id="button-background" label="Background color" value={flyer.button.backgroundColor} onChange={(value) => updateButton("backgroundColor", value)} />
                <ColorField id="button-text-color" label="Text color" value={flyer.button.textColor} onChange={(value) => updateButton("textColor", value)} />
                <ColorField id="button-border-color" label="Border color" value={flyer.button.borderColor} onChange={(value) => updateButton("borderColor", value)} />
              </div>
            </>
          )}
        </fieldset>
        {error && <p role="alert" className="text-sm font-semibold text-red-700">{error}</p>}
        <div className="flex flex-wrap gap-3">
          <button type="submit" className="rounded-full bg-brand px-5 py-2.5 text-sm font-bold uppercase text-white hover:bg-brand-dark">{isEditing ? "Save flyer" : "Add flyer"}</button>
          <button type="button" onClick={onCancel} className="rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-bold">Cancel</button>
        </div>
      </div>

      <FlyerPreview flyer={flyer} pageLabel={pageLabel} />
    </form>
  );
}

function NumberField({ id, label, value, min, max, onChange }: { id: string; label: string; value: number; min: number; max: number; onChange: (value: number) => void }) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>{label}</label>
      <input id={id} type="number" min={min} max={max} value={value} onChange={(event) => onChange(Math.min(max, Math.max(min, Number(event.target.value) || min)))} className={fieldClass} />
    </div>
  );
}

function ColorField({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>{label}</label>
      <div className="mt-1 flex gap-2">
        <input id={id} type="color" value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-12 cursor-pointer rounded border border-neutral-300 bg-white p-1" />
        <input value={value} onChange={(event) => onChange(event.target.value)} className="min-w-0 flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm" aria-label={`${label} hex value`} />
      </div>
    </div>
  );
}

export function FlyerSection({ pageId, pageLabel, fullScreen = false }: { pageId: string; pageLabel: string; fullScreen?: boolean }) {
  const [flyers, setFlyers] = useState<Flyer[]>([]);

  useEffect(() => {
    const refresh = () => {
      const hasChildren = getNavigationItems().some((item) => item.parentId === pageId);
      setFlyers(hasChildren ? [] : getFlyersForPage(pageId));
    };
    refresh();
    return subscribeToDemoChanges(refresh);
  }, [pageId]);

  if (!flyers.length) return null;
  const polished = pageId === "default-home" && !fullScreen;
  return (
    <section className={`${polished ? "bg-white py-7 sm:py-9" : ""} ${fullScreen ? "min-h-[40vh]" : ""}`} aria-label={`${pageLabel} flyers`}>
      {polished ? (
        <div className="site-container"><FlyerGrid flyers={flyers} pageLabel={pageLabel} polished /></div>
      ) : (
        <FlyerGrid flyers={flyers} pageLabel={pageLabel} />
      )}
    </section>
  );
}

export function FlyerManager() {
  const [items, setItems] = useState<NavigationItem[]>(() => getNavigationItems());
  const parents = items.filter((item) => !item.parentId);
  const [parentId, setParentId] = useState(() => {
    const current = getNavigationItems();
    return current.find((item) => !item.parentId && current.some((child) => child.parentId === item.id))?.id
      ?? current.find((item) => !item.parentId)?.id
      ?? "";
  });
  const children = items.filter((item) => item.parentId === parentId);
  const [subMenuId, setSubMenuId] = useState("");
  const [flyers, setFlyers] = useState<Flyer[]>([]);
  const [draft, setDraft] = useState<Flyer>(() => createFlyer("/"));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const { toast, showToast, dismissToast } = useToast();
  const selectedParent = items.find((item) => item.id === parentId);
  const selectedSubMenu = children.find((item) => item.id === subMenuId);
  const selectedPage = children.length ? selectedSubMenu : selectedParent;
  const pageId = selectedPage?.id ?? "";

  useEffect(() => {
    const refresh = () => {
      const nextItems = getNavigationItems();
      setItems(nextItems);
      setParentId((current) => nextItems.some((item) => item.id === current && !item.parentId)
        ? current
        : nextItems.find((item) => !item.parentId && nextItems.some((child) => child.parentId === item.id))?.id
          ?? nextItems.find((item) => !item.parentId)?.id
          ?? "");
    };
    return subscribeToDemoChanges(refresh);
  }, []);
  useEffect(() => {
    setSubMenuId((current) => children.some((item) => item.id === current) ? current : children[0]?.id ?? "");
  }, [parentId, items]);

  useEffect(() => {
    if (!pageId) {
      setFlyers([]);
      setShowForm(false);
      setEditingId(null);
      setError("");
      return;
    }
    setFlyers(getFlyersForPage(pageId));
    setDraft(createFlyer(getNavigationItems().find((item) => item.id === pageId)?.href ?? "/"));
    setEditingId(null);
    setShowForm(false);
    setError("");
  }, [pageId]);

  function saveFlyer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!pageId) {
      setError(children.length
        ? "Select a sub menu before saving a flyer."
        : "Select a parent menu before saving a flyer.");
      return;
    }
    if (!draft.image) {
      setError("Choose an image before saving the flyer.");
      return;
    }
    if (draft.button.enabled && (!draft.button.text.trim() || !draft.button.link.trim())) {
      setError("Enter both button text and a button link, or hide the button.");
      return;
    }
    if (draft.button.enabled && !isAllowedLink(draft.button.link.trim())) {
      setError("Use a relative link or a URL beginning with http://, https://, mailto:, or tel:.");
      return;
    }
    const nextFlyers = editingId
      ? flyers.map((flyer) => flyer.id === editingId ? draft : flyer)
      : [...flyers, draft];
    const wasEditing = Boolean(editingId);
    try {
      setFlyersForPage(pageId, nextFlyers);
      setFlyers(nextFlyers);
      setDraft(createFlyer(selectedPage?.href ?? "/"));
      setEditingId(null);
      setShowForm(!wasEditing);
      showToast(wasEditing ? "Flyer updated." : "Flyer added. Add another flyer or close the form.");
    } catch {
      const message = "The flyer could not be saved in this browser. Try a smaller image and save again.";
      setError(message);
      showToast(message, "error");
    }
  }

  function startAddFlyer() {
    setDraft(createFlyer(selectedPage?.href ?? "/"));
    setEditingId(null);
    setShowForm(true);
    setError("");
  }

  function editFlyer(flyer: Flyer) {
    setDraft(flyer);
    setEditingId(flyer.id);
    setShowForm(true);
    setError("");
    showToast(`Editing "${flyer.title || "flyer"}". Save changes when finished.`, "info");
  }

  function removeFlyer(flyer: Flyer) {
    const nextFlyers = flyers.filter((entry) => entry.id !== flyer.id);
    try {
      setFlyersForPage(pageId, nextFlyers);
      setFlyers(nextFlyers);
      showToast(`"${flyer.title || "Flyer"}" removed.`);
    } catch {
      const message = "The flyer could not be removed from this browser.";
      setError(message);
      showToast(message, "error");
    }
  }

  if (!items.length) {
    return <p className="rounded-xl bg-white p-6 text-neutral-700">Add a parent menu in Navigation Management before managing flyers.</p>;
  }

  return (
    <div className="space-y-7">
      <ToastNotification toast={toast} onDismiss={dismissToast} />
      <section className="rounded-2xl bg-white p-5 text-neutral-900 shadow-xl sm:p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="flyer-parent-menu" className={labelClass}>Parent Menu</label>
            <select id="flyer-parent-menu" value={parentId} onChange={(event) => { setParentId(event.target.value); setSubMenuId(""); }} className={fieldClass}>
              {parents.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="flyer-sub-menu" className={labelClass}>Sub Menu</label>
            <select id="flyer-sub-menu" value={subMenuId} onChange={(event) => setSubMenuId(event.target.value)} disabled={!selectedParent} className={fieldClass}>
              {children.length
                ? <><option value="" disabled>Select a Sub Menu</option>{children.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</>
                : <option value="">None (Parent Menu Only)</option>}
            </select>
          </div>
        </div>
        <p className="mt-3 text-sm text-neutral-600">
          {selectedParent && selectedPage
            ? `Flyers saved here appear on ${subMenuId ? `${selectedParent.label} → ${selectedPage.label}` : `${selectedParent.label} only`}. There is no limit to how many flyers you can add.`
            : selectedParent && children.length
              ? `Select a sub menu under ${selectedParent.label} to manage its flyers. There is no limit to how many flyers you can add.`
            : "Add a parent menu in Navigation Management, then come back to add flyers."}
        </p>
      </section>

      {selectedPage && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-serif text-2xl font-bold">Flyers for {selectedParent?.label}{subMenuId ? ` → ${selectedPage.label}` : " (Parent Menu Only)"}</h2>
            <button type="button" onClick={startAddFlyer} className="rounded-full bg-brand px-5 py-2.5 text-sm font-bold uppercase text-white hover:bg-brand-dark">+ Add Flyer</button>
          </div>
          {showForm && (
            <div>
              <h3 className="mb-4 font-serif text-xl font-bold">{editingId ? `Edit flyer for ${selectedPage.label}` : `Add a flyer to ${selectedPage.label}`}</h3>
              <FlyerForm
                key={draft.id}
                flyer={draft}
                pageLabel={selectedPage.label}
                navigationItems={items}
                onChange={setDraft}
                onSubmit={saveFlyer}
                onCancel={() => { setDraft(createFlyer(selectedPage.href)); setEditingId(null); setShowForm(false); setError(""); }}
                isEditing={Boolean(editingId)}
                error={error}
              />
            </div>
          )}
          <section>
            <h2 className="mb-4 font-serif text-2xl font-bold">Saved flyers <span className="text-lg text-white/60">({flyers.length})</span></h2>
            {flyers.length ? (
              <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-2">
                {flyers.map((flyer) => (
                  <div key={flyer.id} className="space-y-3">
                    <FlyerCard flyer={flyer} pageLabel={selectedPage.label} />
                    <div className="flex gap-4">
                      <button type="button" onClick={() => editFlyer(flyer)} className="text-sm font-bold text-red-200 hover:underline">Edit</button>
                      <button type="button" onClick={() => removeFlyer(flyer)} className="text-sm font-bold text-red-200 hover:underline">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="rounded-xl border border-white/15 bg-black/20 p-5 text-white/70">No flyers have been added to this {subMenuId ? "sub menu" : "parent menu"} yet. Use + Add Flyer to create the first one.</p>}
          </section>
        </>
      )}
    </div>
  );
}
