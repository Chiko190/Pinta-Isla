import { useEffect, useState } from "react";

export function SingleImagePicker({ file, onChange, shape = "circle" }) {
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!file) return setPreview(null);
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <label className="group relative flex h-28 w-28 cursor-pointer items-center justify-center overflow-hidden border-2 border-dashed border-ink-950/20 bg-ink-50 text-ink-950/40 hover:border-ink-700"
      style={{ borderRadius: shape === "circle" ? "9999px" : "1rem" }}
    >
      {preview ? (
        <img src={preview} alt="" className="h-full w-full object-cover" />
      ) : (
        <span className="text-center text-xs">Upload<br />photo</span>
      )}
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
      />
    </label>
  );
}

export function MultiImagePicker({ files, onChange, max = 8 }) {
  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  function addFiles(newFiles) {
    const combined = [...files, ...Array.from(newFiles)].slice(0, max);
    onChange(combined);
  }

  function removeAt(idx) {
    onChange(files.filter((_, i) => i !== idx));
  }

  return (
    <div className="flex flex-wrap gap-3">
      {previews.map((src, i) => (
        <div key={i} className="relative h-24 w-24 overflow-hidden rounded-xl border border-ink-950/10">
          <img src={src} alt="" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => removeAt(i)}
            className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink-950/70 text-xs text-white"
          >
            ✕
          </button>
        </div>
      ))}
      {files.length < max && (
        <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-ink-950/20 text-ink-950/40 hover:border-ink-700">
          <span className="text-2xl leading-none">+</span>
          <span className="text-xs">Add</span>
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => addFiles(e.target.files)}
          />
        </label>
      )}
    </div>
  );
}
