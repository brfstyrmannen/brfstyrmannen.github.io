# Brf Styrmannens webbplats

Det här är källkoden för Brf Styrmannens webbplats på [brfstyrmannen.se](https://brfstyrmannen.se). Sidorna ligger i `docs/` och byggs med Jekyll och temat Just the Docs.

## Uppdatera innehåll

- Redigera motsvarande Markdown-fil i `docs/`; filnamnet bestämmer sidans adress. Ange `title` och `layout: home` i YAML-front matter. För undersidor måste `parent` stämma exakt med `title` på en befintlig föräldrasida.
- Lägg bilder och PDF:er i `docs/assets/`. Länka med relativa adresser, till exempel `assets/fil.pdf`. Tänk på att GitHub Pages skiljer på stora och små bokstäver i filnamn.
- Stäm av datum, avgifter, kontaktvägar och policytexter med styrelsen innan de publiceras. Ändra inte föreningens registrerade stadgar utan att kontrollera dem mot originalhandlingen.
- Lägg inte medlemsuppgifter eller andra sekretessbelagda handlingar i detta publika repository.

## Bygga lokalt

Installera Ruby 3.3 och Bundler. På Windows behövs även RubyInstallers utvecklingsverktyg (`ridk install 1 2 3`) för vissa gems. Kör följande från `docs/`:

```sh
bundle install
bundle exec jekyll serve
```

Öppna sedan `http://localhost:4000`. Kontrollera även länkarna i den genererade webbplatsen från repositoryts rot:

```sh
node scripts/check-links.js
```

Länkkontrollen kräver Node.js 22. Den kontrollerar lokala länkar och ankare i `docs/_site`, men inte externa webbplatser; kontrollera externa länkar separat.

## Publicering

`.github/workflows/ci.yml` bygger och kontrollerar länkar vid push och pull request. `.github/workflows/pages.yml` bygger och publicerar automatiskt vid ändringar på `main`. GitHub Pages måste vara inställt på **GitHub Actions** som källa. `docs/_config.yml` anger den publika domänen; URL:er som pekar på bokningssystemet på `www.brfstyrmannen.se` är en separat tjänst.
