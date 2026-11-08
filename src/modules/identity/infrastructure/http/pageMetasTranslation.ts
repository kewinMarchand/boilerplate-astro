import type { PageMetas } from '@/modules/identity/domain/pageMetas'
import type { components } from '@/shared/api/client'

type PageMetaDto = components['schemas']['PageMeta']

export const toPageMetas = (dtos: PageMetaDto[]): PageMetas =>
  Object.fromEntries(
    dtos.map((dto) => [dto.page, { title: dto.title.trim(), description: dto.description.trim() }]),
  )
