import { describe, it, expect } from 'vitest';
import { indexAnbiXml } from '../src/sources/anbiRegistry.js';
import { htmlToText } from '../src/pipeline/missionScraper.js';

const XML = `<?xml version="1.0" encoding="ISO-8859-1"?>
<publicatieAnbiInstellingen>
<header><aanmaakDatum>2026-06-22</aanmaakDatum></header>
<beschikking>
<fiscaalNummer>002871452</fiscaalNummer>
<dossierNummer>123</dossierNummer>
<naam>NEDERLANDSE HARTSTICHTING</naam>
<vestigingsPlaats>DEN HAAG</vestigingsPlaats>
<webSite>http://www.hartstichting.nl</webSite>
<ingangsDatum>2008-01-01</ingangsDatum>
</beschikking>
<beschikking>
<dossierNummer>1</dossierNummer>
<naam>Staat der Nederlanden</naam>
<aliasNaam>Nederlandse staat</aliasNaam>
</beschikking>
</publicatieAnbiInstellingen>`;

describe('indexAnbiXml', () => {
  const idx = indexAnbiXml(XML);

  it('indexes records by normalized name with rsin + website', () => {
    const hart = idx.get('hartstichting'); // nameKey('NEDERLANDSE HARTSTICHTING')
    expect(hart?.rsin).toBe('002871452');
    expect(hart?.website).toBe('http://www.hartstichting.nl');
  });

  it('also indexes the aliasNaam', () => {
    // nameKey('Nederlandse staat') -> 'staat'
    expect(idx.get('staat')?.naam).toBe('Staat der Nederlanden');
  });
});

describe('htmlToText', () => {
  it('strips scripts, styles, comments and tags', () => {
    const html =
      '<html><head><style>h1{color:red}</style><script>track()</script></head>' +
      '<body><h1>Onze missie</h1><!--x--><p>Wij&nbsp;helpen kinderen.</p></body></html>';
    const text = htmlToText(html);
    expect(text).toContain('Onze missie');
    expect(text).toContain('Wij helpen kinderen');
    expect(text).not.toContain('track()');
    expect(text).not.toContain('color:red');
  });
});
