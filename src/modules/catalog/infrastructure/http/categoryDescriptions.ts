/**
 * Descriptions éditoriales des catégories, propres au site : l'API ne les fournit pas. Elles
 * servent de texte d'introduction et de meta description à chaque page du catalogue. Rangées par
 * langue puis par slug français (celui de la langue par défaut des fixtures).
 */
const ROOT_DESCRIPTION =
  'Catalogue de notre jardinerie tropicale : plantes d’intérieur, d’extérieur et aquatiques, filtrables par exposition, taille et prix.'

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  'plantes-interieur':
    'Plantes tropicales d’intérieur : feuillages graphiques et plantes à fleurs faciles à vivre, sélectionnées pour la lumière de la maison.',
  feuillages:
    'Monstera et fougères aux feuillages découpés, pour apporter une ambiance de jungle à la maison sans exposition plein soleil.',
  'plantes-a-fleurs':
    'Anthuriums et strelitzias en pot : des floraisons tropicales durables pour égayer un salon ou un bureau bien éclairé.',
  'plantes-exterieur':
    'Palmiers et arbustes tropicaux pour le jardin ou la terrasse, choisis pour leur rusticité et leur floraison généreuse.',
  'arbustes-a-fleurs':
    'Heliconias et calliandras : des arbustes à fleurs spectaculaires qui attirent colibris, papillons et regards.',
  'plantes-aquatiques':
    'Plantes aquatiques pour bassins et bacs : nénuphars et lotus qui fleurissent en plein soleil pendant toute la belle saison.',
  monstera:
    'Monstera deliciosa, adansonii et variegata : des feuilles ajourées spectaculaires pour les pièces lumineuses à mi-ombre.',
  fougeres:
    'Fougères de Boston, nid d’oiseau et arborescente : des plantes d’ombre qui aiment l’humidité de la salle de bain.',
  anthurium:
    'Anthuriums rouges, blancs ou à feuillage veiné : une floraison presque continue, à mi-ombre et sans soleil direct.',
  strelitzia:
    'Strelitzias, ou oiseaux de paradis : silhouettes graphiques et fleurs orangées pour les pièces très lumineuses.',
  palmiers:
    'Palmiers rustiques et d’orangerie : Trachycarpus, Kentia et Chamaerops pour structurer un jardin ou une terrasse.',
  heliconia:
    'Heliconias à bractées rouges et jaunes : l’emblème des jardins tropicaux, en plein soleil ou à mi-ombre.',
  calliandra:
    'Calliandras aux pompons d’étamines rouges ou roses : une floraison légère et colorée pour les massifs ensoleillés.',
  nenuphars:
    'Nénuphars blancs ou roses et lotus sacré : des fleurs flottantes pour bassins, à installer en plein soleil.',
}

const ROOT_DESCRIPTION_EN =
  'Catalogue of our tropical garden centre: indoor, outdoor and aquatic plants, filterable by exposure, size and price.'

const CATEGORY_DESCRIPTIONS_EN: Record<string, string> = {
  'plantes-interieur':
    'Tropical indoor plants: striking foliage and easy-going flowering plants, chosen for the light of the home.',
  feuillages:
    'Monsteras and ferns with cut-out leaves, to bring a jungle feel to the home without full sun.',
  'plantes-a-fleurs':
    'Potted anthuriums and strelitzias: long-lasting tropical blooms to brighten a well-lit living room or office.',
  'plantes-exterieur':
    'Tropical palms and shrubs for the garden or terrace, chosen for their hardiness and generous flowering.',
  'arbustes-a-fleurs':
    'Heliconias and calliandras: spectacular flowering shrubs that attract hummingbirds, butterflies and admiring looks.',
  'plantes-aquatiques':
    'Aquatic plants for ponds and tubs: water lilies and lotus that flower in full sun all summer long.',
  monstera:
    'Monstera deliciosa, adansonii and variegata: spectacular split leaves for bright rooms in partial shade.',
  fougeres:
    'Boston, bird’s nest and tree ferns: shade plants that love the humidity of a bathroom.',
  anthurium:
    'Red, white or veined anthuriums: almost continuous flowering, in partial shade and out of direct sun.',
  strelitzia:
    'Strelitzias, or birds of paradise: graphic silhouettes and orange flowers for very bright rooms.',
  palmiers:
    'Hardy and orangery palms: Trachycarpus, Kentia and Chamaerops to give structure to a garden or terrace.',
  heliconia:
    'Heliconias with red and yellow bracts: the emblem of tropical gardens, in full sun or partial shade.',
  calliandra:
    'Calliandras with red or pink stamen pompoms: light, colourful flowering for sunny borders.',
  nenuphars:
    'White or pink water lilies and sacred lotus: floating flowers for ponds, to set in full sun.',
}

const DESCRIPTIONS: Record<string, { root: string; categories: Record<string, string> }> = {
  fr: { root: ROOT_DESCRIPTION, categories: CATEGORY_DESCRIPTIONS },
  en: { root: ROOT_DESCRIPTION_EN, categories: CATEGORY_DESCRIPTIONS_EN },
}

/** Description dans la langue de la réponse de l'API, celle de la racine pour une catégorie sans texte, le français à défaut. */
export const categoryDescription = (language: string, frenchSlug?: string) => {
  const { root, categories } = DESCRIPTIONS[language] ?? {
    root: ROOT_DESCRIPTION,
    categories: CATEGORY_DESCRIPTIONS,
  }
  return (frenchSlug && categories[frenchSlug]) || root
}
