<script lang="ts">
  import ButtonsSection from './ButtonsSection.svelte'
  import ColorsSection from './ColorsSection.svelte'
  import FeedbackSection from './FeedbackSection.svelte'
  import FormsSection from './FormsSection.svelte'
  import IconsSection from './IconsSection.svelte'
  import LogoSection from './LogoSection.svelte'
  import MediaSection from './MediaSection.svelte'
  import NavigationSection from './NavigationSection.svelte'
  import SpacingSection from './SpacingSection.svelte'
  import TypographySection from './TypographySection.svelte'

  import type { Dictionary } from '@/shared/i18n'

  interface Props {
    cardLabels: Pick<Dictionary, 'catalog' | 'language'>
  }

  const { cardLabels }: Props = $props()
</script>

<ColorsSection />
<TypographySection />
<SpacingSection />
<ButtonsSection />
<FormsSection />
<FeedbackSection />
<NavigationSection />
<MediaSection {cardLabels} />
<IconsSection />
<LogoSection />
