import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import { Workbench } from '@/Workbench'
import { ScheduleProvider } from '@/state/ScheduleProvider'
import { DATASET } from '@/test/fixtures'

function open() {
  const user = userEvent.setup()
  render(
    <ScheduleProvider dataset={DATASET}>
      <Workbench />
    </ScheduleProvider>,
  )
  return user
}

const sectionsPanel = () => screen.getByRole('region', { name: 'Секции' })
const grid = () => screen.getByRole('group', { name: 'Недельное расписание' })

const sectionCard = (code: string) =>
  within(sectionsPanel())
    .getAllByRole('button')
    .find((button) => button.textContent?.startsWith(code))!

const lessonCard = (code: string, room: string) =>
  within(grid())
    .getAllByRole('button')
    .find((button) => button.textContent?.includes(code) && button.textContent?.includes(room))!

const status = () => screen.getByRole('status', { name: 'Подсказка' })

beforeEach(() => {
  window.localStorage.clear()
})

describe('рабочий экран', () => {
  it('показывает секции с предметом, числом студентов и прогрессом', () => {
    open()
    const card = sectionCard('CS101-01')

    expect(card).toHaveTextContent('Основы программирования')
    expect(card).toHaveTextContent('24 студ.')
    expect(card).toHaveTextContent('А. Иванов')
    expect(card).toHaveTextContent('2/3')
  })

  it('помечает секцию без преподавателя', () => {
    open()

    expect(sectionCard('AI310-01')).toHaveTextContent('преподаватель не назначен')
  })

  it('считает общий прогресс в шапке', () => {
    open()

    expect(screen.getByRole('banner')).toHaveTextContent('10')
    expect(screen.getByRole('banner')).toHaveTextContent('/ 23')
  })

  it('показывает занятие с преподавателем и аудиторией', () => {
    open()

    expect(lessonCard('CS101-01', 'B-201')).toHaveTextContent('А. Иванов')
  })

  it('ищет секции по названию предмета', async () => {
    const user = open()

    await user.type(screen.getByLabelText('Поиск секции'), 'базы данных')

    expect(within(sectionsPanel()).getAllByRole('button', { pressed: false })).toHaveLength(1)
    expect(sectionCard('DB202-01')).toBeInTheDocument()
  })

  it('фильтрует секции по преподавателю', async () => {
    const user = open()

    await user.selectOptions(screen.getByLabelText('Фильтр по преподавателю'), 'T4')

    const visible = within(sectionsPanel()).getAllByRole('button', { pressed: false })
    expect(visible).toHaveLength(3)
    expect(visible[0]).toHaveTextContent('DB202-01')
    expect(visible[1]).toHaveTextContent('CS205-01')
    expect(visible[2]).toHaveTextContent('AI310-01')
  })

  it('по клику на секцию показывает расклад недели', async () => {
    const user = open()

    await user.click(sectionCard('MATH201-01'))

    expect(status()).toHaveTextContent('MATH201-01')
    expect(status()).toHaveTextContent('26')
    expect(status()).toHaveTextContent('4')
  })

  it('Escape снимает выбор секции', async () => {
    const user = open()

    await user.click(sectionCard('MATH201-01'))
    await user.keyboard('{Escape}')

    expect(status()).toHaveTextContent('Перетащите секцию')
  })

  it('второй клик по той же секции тоже снимает выбор', async () => {
    const user = open()

    await user.click(sectionCard('MATH201-01'))
    await user.click(sectionCard('MATH201-01'))

    expect(status()).toHaveTextContent('Перетащите секцию')
  })
})

describe('редактор занятия', () => {
  it('открывается по клику и показывает слот', async () => {
    const user = open()

    await user.click(lessonCard('DB202-01', 'LAB-1'))

    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveTextContent('Базы данных')
    expect(dialog).toHaveTextContent('Среда')
    expect(dialog).toHaveTextContent('08:30')
  })

  it('меняет аудиторию занятия', async () => {
    const user = open()

    await user.click(lessonCard('DB202-01', 'LAB-1'))
    const dialog = await screen.findByRole('dialog')
    await user.selectOptions(within(dialog).getByLabelText(/Аудитория/i), 'R301')
    await user.click(within(dialog).getByLabelText('Закрыть'))

    expect(lessonCard('DB202-01', 'B-301')).toBeInTheDocument()
  })

  it('меняет преподавателя занятия', async () => {
    const user = open()

    await user.click(lessonCard('DB202-01', 'LAB-1'))
    const dialog = await screen.findByRole('dialog')
    await user.selectOptions(within(dialog).getByLabelText(/Преподаватель/i), 'T1')
    await user.click(within(dialog).getByLabelText('Закрыть'))

    expect(lessonCard('DB202-01', 'LAB-1')).toHaveTextContent('А. Иванов')
  })

  it('предупреждает о конфликте выбранной пары', async () => {
    const user = open()

    await user.click(lessonCard('DB202-01', 'LAB-1'))
    const dialog = await screen.findByRole('dialog')
    await user.selectOptions(within(dialog).getByLabelText(/Аудитория/i), 'R101')

    expect(dialog).toHaveTextContent('A-101')
    expect(dialog).toHaveTextContent(/не компьютерный класс/i)
  })

  it('убирает занятие и обновляет счётчик секции', async () => {
    const user = open()

    await user.click(lessonCard('DB202-01', 'LAB-1'))
    await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: /Убрать/ }))

    expect(sectionCard('DB202-01')).toHaveTextContent('0/2')
    expect(status()).toHaveTextContent('DB202-01 возвращена в нераспределённые')
  })

  it('копирует занятие в свободный слот', async () => {
    const user = open()

    await user.click(lessonCard('DB202-01', 'LAB-1'))
    await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: /Копировать/ }))

    expect(sectionCard('DB202-01')).toHaveTextContent('2/2')
    expect(status()).toHaveTextContent(/Копия DB202-01 поставлена/)
  })
})

describe('отмена действий', () => {
  it('возвращает удалённое занятие', async () => {
    const user = open()

    await user.click(lessonCard('DB202-01', 'LAB-1'))
    await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: /Убрать/ }))
    expect(sectionCard('DB202-01')).toHaveTextContent('0/2')

    await user.click(screen.getByRole('button', { name: 'Отменить' }))

    expect(sectionCard('DB202-01')).toHaveTextContent('1/2')
  })

  it('работает по Ctrl+Z и Ctrl+Shift+Z', async () => {
    const user = open()

    await user.click(lessonCard('DB202-01', 'LAB-1'))
    await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: /Убрать/ }))

    await user.keyboard('{Control>}z{/Control}')
    expect(sectionCard('DB202-01')).toHaveTextContent('1/2')

    await user.keyboard('{Control>}{Shift>}z{/Shift}{/Control}')
    expect(sectionCard('DB202-01')).toHaveTextContent('0/2')
  })

  it('кнопка отмены выключена, пока ничего не сделано', () => {
    open()

    expect(screen.getByRole('button', { name: 'Отменить' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Вернуть' })).toBeDisabled()
  })

  it('сброс возвращает исходное расписание', async () => {
    const user = open()

    await user.click(lessonCard('DB202-01', 'LAB-1'))
    await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: /Убрать/ }))
    await user.click(screen.getByRole('button', { name: 'Вернуть исходные данные' }))

    expect(sectionCard('DB202-01')).toHaveTextContent('1/2')
  })
})
