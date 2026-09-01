import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export interface FilterOption {
  value: string
  label: string
}

interface FilterSelectProps {
  label: string
  placeholder: string
  options: readonly FilterOption[]
  value: string | null
  onChange: (value: string | null) => void
}

export function FilterSelect({ label, placeholder, options, value, onChange }: FilterSelectProps) {
  const items = [{ value: null, label: placeholder }, ...options]

  return (
    <Select items={items} value={value} onValueChange={onChange}>
      <SelectTrigger size="sm" aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={null}>{placeholder}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
