import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

/**
 * Auto-test des règles d'architecture : écrit chaque violation volontaire à son emplacement
 * réel, exige qu'ESLint échoue avec le message attendu, puis retire le fichier. Une règle
 * débranchée ou mal écrite fait échouer `make qa`.
 */
interface Violation {
  readonly rule: string
  readonly file: string
  readonly source: string
  readonly expected: string
}

const GENERATED_TYPES = 'src/shared/api/schema.d.ts'

const VIOLATIONS: readonly Violation[] = [
  {
    rule: 'domaine vers infrastructure, par chemin relatif',
    file: 'src/modules/catalog/domain/archSelftestViolation.ts',
    source: "export { findCatalogListing } from '../infrastructure/catalogRepository'\n",
    expected: 'la couche « domain » ne peut pas importer « infrastructure »',
  },
  {
    rule: 'domaine vers framework',
    file: 'src/modules/catalog/domain/archSelftestViolation.ts',
    source: "export { navigate } from 'astro:transitions/client'\n",
    expected: 'Le domaine ne dépend d’aucun framework',
  },
  {
    rule: 'application vers framework',
    file: 'src/modules/catalog/application/archSelftestViolation.ts',
    source: "export { defineMiddleware } from 'astro:middleware'\n",
    expected: 'L’application ne dépend d’aucun framework',
  },
  {
    rule: 'module vers autre module',
    file: 'src/modules/blog/ui/archSelftestViolation.ts',
    source: "export { CatalogPage } from '@/modules/catalog'\n",
    expected: 'la couche « ui » ne peut pas importer « module »',
  },
  {
    rule: 'interface vers infrastructure dans un module à couche application',
    file: 'src/modules/catalog/ui/archSelftestViolation.ts',
    source:
      "export { findCatalogListing } from '@/modules/catalog/infrastructure/catalogRepository'\n",
    expected: 'la couche « ui » ne peut pas importer « infrastructure »',
  },
  {
    rule: 'socle vers module',
    file: 'src/shared/ui/layout/archSelftestViolation.ts',
    source: "export { CatalogPage } from '@/modules/catalog'\n",
    expected: 'la couche « shared » ne peut pas importer « module »',
  },
  {
    rule: 'socle vers module, dans un composant Astro',
    file: 'src/shared/ui/layout/ArchSelftestViolation.astro',
    source: "---\nimport { CatalogPage } from '@/modules/catalog'\n---\n\n<CatalogPage />\n",
    expected: 'la couche « shared » ne peut pas importer « module »',
  },
  {
    rule: 'vue vers intérieur de module',
    file: 'src/views/home/archSelftestViolation.ts',
    source:
      "export { findCatalogListing } from '@/modules/catalog/infrastructure/catalogRepository'\n",
    expected: 'la couche « views » ne peut pas importer « infrastructure »',
  },
  {
    rule: 'routage vers intérieur de module',
    file: 'src/pages/archSelftestViolation.ts',
    source:
      "export { findCatalogListing } from '@/modules/catalog/infrastructure/catalogRepository'\n",
    expected: 'la couche « routes » ne peut pas importer « infrastructure »',
  },
  {
    rule: 'types générés de l’API hors infrastructure',
    file: 'src/modules/catalog/ui/archSelftestViolation.ts',
    source: "export type { components } from '@/shared/api/schema'\n",
    expected: 'la couche « ui » ne peut pas importer « shared-api »',
  },
]

const createdApiFolder = !existsSync(dirname(GENERATED_TYPES))
const createdGeneratedTypes = !existsSync(GENERATED_TYPES)
if (createdGeneratedTypes) {
  mkdirSync(dirname(GENERATED_TYPES), { recursive: true })
  writeFileSync(GENERATED_TYPES, 'export interface components {\n  schemas: never\n}\n')
}

let failures = 0
try {
  for (const violation of VIOLATIONS) {
    writeFileSync(violation.file, violation.source)
    try {
      const result = spawnSync('node_modules/.bin/eslint', ['--no-cache', violation.file], {
        encoding: 'utf8',
      })
      const output = `${result.stdout}${result.stderr}`
      if (result.status === 0) {
        failures++
        console.error(
          `ÉCHEC  ${violation.rule} : ESLint accepte la violation, la règle est débranchée.`,
        )
      } else if (!output.includes(violation.expected)) {
        failures++
        console.error(`ÉCHEC  ${violation.rule} : ESLint échoue pour une autre raison :\n${output}`)
      } else {
        console.info(`OK     ${violation.rule} : violation détectée.`)
      }
    } finally {
      rmSync(violation.file, { force: true })
    }
  }
} finally {
  if (createdGeneratedTypes) rmSync(GENERATED_TYPES, { force: true })
  if (createdApiFolder) rmSync(dirname(GENERATED_TYPES), { recursive: true, force: true })
}

console.info(
  failures === 0
    ? `${VIOLATIONS.length} violations volontaires détectées, fichiers retirés.`
    : `${failures} règle(s) inopérante(s) sur ${VIOLATIONS.length}.`,
)
process.exitCode = failures === 0 ? 0 : 1
