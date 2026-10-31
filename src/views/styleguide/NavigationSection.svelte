<script lang="ts">
  import { Chip, Icon } from '@/shared/ui/kit'

  import Section from './Section.svelte'
</script>

<Section id="navigation" title="Navigation">
  <div class="flex flex-col gap-6">
    <nav class="bui-breadcrumb" aria-label="Fil d’Ariane (exemple)">
      <ol class="bui-breadcrumb__list">
        <li class="bui-breadcrumb__item">
          <a class="bui-link" href="/">Accueil</a>
        </li>
        <li class="bui-breadcrumb__item">
          <a class="bui-link" href="/plan-du-site">Plan du site</a>
        </li>
        <li class="bui-breadcrumb__item">
          <span class="bui-breadcrumb__current" aria-current="page">Page courante</span>
        </li>
      </ol>
    </nav>
    <nav class="bui-pagination" aria-label="Pagination (exemple)">
      <ul class="bui-pagination__list">
        <li>
          <a class="bui-pagination__link" href="/plan-du-site" aria-current="page"
            ><span class="bui-visually-hidden">Page&nbsp;</span>1</a
          >
        </li>
        <li>
          <a class="bui-pagination__link" href="/plan-du-site"
            ><span class="bui-visually-hidden">Page&nbsp;</span>2</a
          >
        </li>
        <li class="bui-pagination__ellipsis" aria-hidden="true">…</li>
        <li>
          <a class="bui-pagination__link" href="/plan-du-site" rel="next"
            ><span class="bui-pagination__label">Suivant</span><Icon name="chevron-right" /></a
          >
        </li>
      </ul>
    </nav>
    <ul class="bui-chip-list">
      <li><Chip href="/plan-du-site" removable>Mi-ombre</Chip></li>
      <li><Chip href="/plan-du-site" aria-current="page">Puce active</Chip></li>
    </ul>
    <p class="flex flex-wrap gap-6">
      <a href="/plan-du-site" class="bui-link">Lien interne</a>
      <a
        href="https://www.numerique.gouv.fr/publications/rgaa-accessibilite/"
        class="bui-link"
        rel="external"
      >
        Lien externe : RGAA
      </a>
    </p>
  </div>
</Section>
