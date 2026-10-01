import { existsSync } from "node:fs";
if (existsSync(".env.local")) process.loadEnvFile(".env.local");
else if (existsSync(".env")) process.loadEnvFile(".env");

import { NextRequest } from "next/server";
import { GET as searchGet } from "../../src/app/api/search/route";
import { GET as viewportGet } from "../../src/app/api/map/viewport/route";

async function testQuery(q: string) {
  const req = new NextRequest(`http://localhost:3000/api/search?q=${encodeURIComponent(q)}&limit=10`);
  const res = await searchGet(req);
  const data = await res.json();
  console.log(`\n========================================`);
  console.log(`QUERY: "${q}"`);
  console.log(`Localities (${data.localities?.length || 0}):`, data.localities?.map((l: any) => `${l.name} (${l.parent})`));
  console.log(`Temples (${data.temples?.length || 0}):`, data.temples?.slice(0, 5).map((t: any) => `${t.name} [${t.location || t.district}]`));
  console.log(`Destinations (${data.destinations?.length || 0}):`, data.destinations?.slice(0, 5).map((d: any) => `${d.name} (${d.district})`));
  
  if (data.localities?.length > 0) {
    const loc = data.localities[0];
    const vpUrl = `http://localhost:3000/api/map/viewport?city=${encodeURIComponent(loc.name)}&state=${encodeURIComponent(loc.state || "")}&allIndia=true`;
    const vpReq = new NextRequest(vpUrl);
    const vpRes = await viewportGet(vpReq);
    const vpData = await vpRes.json();
    console.log(`Viewport for city="${loc.name}": ${vpData.features?.length || 0} features returned`);
    const inside = vpData.features?.filter((f: any) => f.properties.isInside);
    console.log(`  Inside "${loc.name}": ${inside?.length || 0} features ->`, inside?.slice(0, 5).map((f: any) => f.properties.name));
  }
}

async function run() {
  await testQuery("Sringeri");
  await testQuery("Kukke");
  await testQuery("temples in Madurai");
  await testQuery("Puri");
  await testQuery("Ayodhya");
  await testQuery("Hampi");
}

run().catch(console.error);
