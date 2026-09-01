export type PluralForms = readonly [one: string, few: string, many: string]

export const LESSONS: PluralForms = ['занятие', 'занятия', 'занятий']
export const STUDENTS: PluralForms = ['студент', 'студента', 'студентов']
export const CONFLICTS: PluralForms = ['конфликт', 'конфликта', 'конфликтов']
export const SLOTS: PluralForms = ['слот', 'слота', 'слотов']
export const DAYS: PluralForms = ['день', 'дня', 'дней']
export const PAIRS: PluralForms = ['пара', 'пары', 'пар']
export const SECTIONS: PluralForms = ['секция', 'секции', 'секций']

export function plural(count: number, forms: PluralForms): string {
  const hundreds = Math.abs(count) % 100
  if (hundreds > 10 && hundreds < 20) return forms[2]

  const tens = hundreds % 10
  if (tens === 1) return forms[0]
  if (tens > 1 && tens < 5) return forms[1]
  return forms[2]
}

export function withCount(count: number, forms: PluralForms): string {
  return `${count} ${plural(count, forms)}`
}
