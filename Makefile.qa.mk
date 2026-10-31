qa: lint icons-check format-check typecheck test-unit ## QA rapide : lint (dont architecture), sprite d'icônes, format, types, tests unitaires

qa-full: qa test-e2e test-a11y metrics ## QA complète : QA rapide + e2e + a11y + Lighthouse

lint: ## ESLint
	$(RUN) yarn lint

icons-check: ## Échoue si public/icons.svg ou le type des noms ne correspondent plus à icons.json
	$(RUN) node tools/icons.ts --check

lint-fix: ## ESLint avec correction automatique
	$(RUN) yarn lint:fix

format: ## Prettier (écriture)
	$(RUN) yarn format

format-check: ## Prettier (vérification)
	$(RUN) yarn format:check

typecheck: ## Vérification des types TypeScript
	$(RUN) yarn typecheck

test: test-unit test-e2e test-a11y ## Tous les tests

test-unit: ## Tests unitaires (Vitest)
	$(RUN) yarn test:unit

test-e2e: ## Tests end-to-end desktop et mobile (Playwright)
	$(RUN) yarn test:e2e

test-a11y: ## Tests d'accessibilité WCAG 2.1 AA (axe-core + Playwright)
	$(RUN) yarn test:a11y

metrics: build ## Métriques Lighthouse CI en clair puis en sombre (perf ≥ 90, a11y et SEO = 100)
	$(RUN) sh -c 'export CHROME_PATH=$$(node -e "console.log(require(\"@playwright/test\").chromium.executablePath())") && yarn lhci && yarn lhci:sombre'

.PHONY: qa qa-full lint icons-check lint-fix format format-check typecheck test test-unit test-e2e test-a11y metrics
