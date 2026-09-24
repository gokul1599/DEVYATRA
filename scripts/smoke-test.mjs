async function smokeTest() {
  const endpoints = [
    'https://templeora.vercel.app/api/destinations?category=BEACHES',
    'https://templeora.vercel.app/places/hampi-group-of-monuments',
    'https://templeora.vercel.app/map?category=heritage',
    'https://templeora.vercel.app/api/map/viewport?bbox=75,10,80,16&category=ALL',
    'https://templeora.vercel.app/'
  ];

  console.log('--- PRODUCTION SMOKE TEST: https://templeora.vercel.app ---');
  for (const ep of endpoints) {
    const start = Date.now();
    try {
      const res = await fetch(ep);
      const text = await res.text();
      const elapsed = Date.now() - start;
      console.log(`[PASS] ${res.status} (${elapsed}ms): ${ep}`);
      if (ep.includes('/api/destinations')) {
        const json = JSON.parse(text);
        console.log(`  -> Fetched ${json.items?.length} items (total: ${json.total}), first: ${json.items?.[0]?.name}`);
      } else if (ep.includes('/api/map/viewport')) {
        const json = JSON.parse(text);
        console.log(`  -> Map viewport features returned: ${json.features?.length ?? json.data?.length}`);
      } else if (ep.includes('/places/')) {
        console.log(`  -> Destination Page has 'Pilgrimage Bridge / Sacred Anchor': ${text.includes('Sacred Anchor') || text.includes('Pilgrimage Bridge')}`);
      } else if (ep === 'https://templeora.vercel.app/') {
        console.log(`  -> Home has 'Begin Your Journey': ${text.includes('Begin Your Journey')}`);
        console.log(`  -> Home has 'Beyond the Temple': ${text.includes('Beyond the Temple')}`);
        console.log(`  -> Home has 'Weekend Escapes': ${text.includes('Weekend Escapes')}`);
      }
    } catch (err) {
      console.error(`[FAIL] ${ep}: ${err.message}`);
    }
  }
}

smokeTest();
