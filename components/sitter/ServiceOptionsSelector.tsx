'use client';

interface Option {
  id: string;
  label: string;
}

interface ServiceOptionsSelectorProps {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  title?: string;
  description?: string;
  multiple?: boolean;
}

export function ServiceOptionsSelector({
  options,
  selected,
  onChange,
  title,
  description,
  multiple = true,
}: ServiceOptionsSelectorProps) {
  const toggle = (id: string) => {
    if (multiple) {
      if (selected.includes(id)) {
        onChange(selected.filter((s) => s !== id));
      } else {
        onChange([...selected, id]);
      }
    } else {
      onChange(selected.includes(id) ? [] : [id]);
    }
  };

  if (options.length === 0) return null;

  return (
    <div className="space-y-2">
      {title && <p className="font-medium text-gray-800">{title}</p>}
      {description && <p className="text-sm text-gray-600">{description}</p>}
      <div className="space-y-2 pl-2">
        {options.map((opt) => (
          <label
            key={opt.id}
            className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
          >
            <input
              type={multiple ? 'checkbox' : 'radio'}
              name={title?.replace(/\s/g, '-')}
              checked={selected.includes(opt.id)}
              onChange={() => toggle(opt.id)}
              className="mt-1 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm">{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
