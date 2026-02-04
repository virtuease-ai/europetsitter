'use client';

import { useRef } from 'react';
import { Plus, X } from 'lucide-react';

const MAX_PHOTOS = 10;

interface PhotoGalleryProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  label?: string;
  description?: string;
}

export function PhotoGallery({
  photos,
  onChange,
  label = 'Galerie photos',
  description = 'Montrez le lieu de garde (attention aux systèmes de sécurité), la pièce dédiée, le jardin, les aires de promenade, par exemple.',
}: PhotoGalleryProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    const remaining = MAX_PHOTOS - photos.length;
    if (remaining <= 0) return;
    const toAdd = Math.min(files.length, remaining);
    const readers: FileReader[] = [];
    let done = 0;
    for (let i = 0; i < toAdd; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;
      const reader = new FileReader();
      reader.onload = () => {
        onChange([...photos, reader.result as string].slice(0, MAX_PHOTOS));
        done++;
      };
      reader.readAsDataURL(file);
      readers.push(reader);
    }
    e.target.value = '';
  };

  const remove = (index: number) => {
    onChange(photos.filter((_, i) => i !== index));
  };

  return (
    <div>
      <label className="block text-sm font-semibold mb-2">{label}</label>
      <p className="text-sm text-gray-600 mb-3">{description}</p>
      <div className="flex flex-wrap gap-3">
        {photos.map((url, i) => (
          <div key={i} className="relative group">
            <img
              src={url}
              alt={`Photo ${i + 1}`}
              className="w-24 h-24 object-cover rounded-lg border border-gray-200"
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-error text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        {photos.length < MAX_PHOTOS && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 hover:border-primary flex items-center justify-center text-gray-500 hover:text-primary transition-colors"
          >
            <Plus className="w-8 h-8" />
          </button>
        )}
      </div>
      <p className="text-xs text-gray-500 mt-1">{photos.length} / {MAX_PHOTOS} photos</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFile}
        className="hidden"
      />
    </div>
  );
}
