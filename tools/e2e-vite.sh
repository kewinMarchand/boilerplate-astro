#!/bin/sh
# make e2e-vite : Playwright, projet desktop seul, sur les fichiers e2e ciblés, contre le build `dist/`
# réutilisé s'il est à jour. Lancé dans le conteneur `node`, à la racine du dépôt.
#   FICHIERS="tests/e2e/a.e2e.ts …" : ces fichiers ; GREP="motif" : les tests dont le titre correspond ;
#   sans l'un ni l'autre : fichiers modifiés par rapport à origin/main (--only-changed).
set -eu

PORT=4100
# Astro vide `dist/` à chaque build : un `make build` lancé ensuite (autre URL publique) efface l'empreinte
# et force la reconstruction.
EMPREINTE=dist/empreinte-e2e

# Empreinte de ce qui entre dans le build : fichiers suivis ou non ignorés hors tests et docs, fichiers
# d'environnement (ignorés par git, lus par Vite), variables `PUBLIC_*` lues au build.
empreinte() {
  {
    env | grep '^PUBLIC_' | sort || true
    git ls-files -z -co --exclude-standard -- . ':!:tests' ':!:*.md' ':!:*.test.ts' \
      ':!:playwright*.config.ts' ':!:.github' | xargs -0 sha256sum 2>/dev/null || true
    for fichier in .env .env.production .env.local .env.production.local; do
      if [ -f "$fichier" ]; then sha256sum "$fichier"; fi
    done
  } | sha256sum | cut -d ' ' -f 1
}

SOURCES=$(empreinte)
if [ -f "$EMPREINTE" ] && [ "$(cat "$EMPREINTE")" = "$SOURCES" ]; then
  echo "e2e-vite : build dist/ à jour, réutilisé"
else
  echo "e2e-vite : sources modifiées depuis le dernier build, reconstruction"
  PUBLIC_SITE_URL="http://localhost:$PORT" yarn build
  echo "$SOURCES" > "$EMPREINTE"
fi

set -- --project=desktop --pass-with-no-tests
if [ -n "${FICHIERS:-}" ]; then
  # shellcheck disable=SC2086 # une liste de fichiers séparés par des espaces
  set -- "$@" $FICHIERS
elif [ -n "${GREP:-}" ]; then
  set -- "$@" tests/e2e
else
  set -- "$@" tests/e2e --only-changed=origin/main
fi
if [ -n "${GREP:-}" ]; then set -- "$@" --grep "$GREP"; fi

E2E_SANS_BUILD=1 exec yarn playwright test "$@"
