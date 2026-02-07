

## Banner med direktlank till "Det ordnar sig"

En enkel, snygg banner langst upp pa startsidan (innan "Om mig"-sektionen) med texten och en lank till butiken.

### Vad som gors

**Fil: `src/pages/Home.tsx`**

- Lagg till en banner-sektion overst i sidans innehall (fore About-sektionen)
- Bannern innehaller texten: "En text for varje vecka pa aret. Kop min bok *Det ordnar sig*. (pekfinger-emoji) (bok-emoji)"
- "Det ordnar sig" renderas i kursiv stil
- Bannern lankar till `/butik` (butikssidan)
- Enkel, stilren design som foljer sidans befintliga typografi och farger
- Klickbar over hela ytan for enkel anvandning

### Tekniska detaljer

- Bannern laggs som en `Link`-komponent fran `react-router-dom` (redan importerad)
- Stilmassigt anvands befintliga Tailwind-klasser: subtil bakgrund, centrerad text, lagom padding
- "Det ordnar sig" wrappas i en `<em>`-tagg for kursiv stil
- Responsiv design med anpassad textstorlek for mobil/desktop
