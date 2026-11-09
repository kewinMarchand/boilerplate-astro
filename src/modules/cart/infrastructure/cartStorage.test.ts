import { parseCart } from './cartStorage'

describe('parseCart', () => {
  it('lit un panier valide', () => {
    const lines = [
      {
        id: '1',
        slug: 'monstera-deliciosa',
        name: 'Monstera deliciosa',
        price: 3490,
        quantity: 2,
        translations: [{ locale: 'en', slug: 'swiss-cheese-plant', name: 'Swiss cheese plant' }],
      },
    ]

    expect(parseCart(JSON.stringify(lines))).toEqual(lines)
  })

  it('relit un panier enregistré avant les langues : le slug identifie la ligne', () => {
    const lines = [
      { slug: 'monstera-deliciosa', name: 'Monstera deliciosa', price: 3490, quantity: 2 },
    ]

    expect(parseCart(JSON.stringify(lines))).toEqual([
      { ...lines[0], id: 'monstera-deliciosa', translations: [] },
    ])
  })

  it('rend un panier vide pour une entrée absente, illisible ou invalide', () => {
    expect(parseCart(null)).toEqual([])
    expect(parseCart('{pas du json')).toEqual([])
    expect(parseCart(JSON.stringify({ slug: 'x' }))).toEqual([])
    expect(parseCart(JSON.stringify([{ slug: 'x', name: 'X', price: -1, quantity: 1 }]))).toEqual(
      [],
    )
    expect(parseCart(JSON.stringify([{ slug: 'x', name: 'X', price: 1, quantity: 100 }]))).toEqual(
      [],
    )
    expect(parseCart(JSON.stringify([{ slug: 'x', name: 'X', price: 1.5, quantity: 1 }]))).toEqual(
      [],
    )
    expect(
      parseCart(
        JSON.stringify([
          { slug: 'x', name: 'X', price: 1, quantity: 1, translations: [{ locale: 'en' }] },
        ]),
      ),
    ).toEqual([])
  })
})
