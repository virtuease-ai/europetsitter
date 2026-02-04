'use client';

import { useRef } from 'react';
import { Camera } from 'lucide-react';

interface AvatarUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export function AvatarUpload({ value, onChange, label = 'Photo ou logo de votre profil' }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div>
      <label className="block text-sm font-semibold mb-2">{label}</label>
      <div
        onClick={() => inputRef.current?.click()}
        className="w-28 h-28 rounded-full border-2 border-dashed border-gray-300 hover:border-primary cursor-pointer flex items-center justify-center overflow-hidden bg-gray-50 transition-colors"
      >
        {value ? (
          <img src={value} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <Camera className="w-10 h-10 text-gray-400" />
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />
    </div>
  );
}
