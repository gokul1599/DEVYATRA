/**
 * Production Live Smoke Test Suite for https://templeora.vercel.app
 */

const BASE_URL = "https://templeora.vercel.app";

interface SmokeResult {
  endpoint: string;
  status: number;
  expectedStatus: number;
  pass: boolean;
  notes: string;
  latencyMs: number;
}

const results: SmokeResult[] = [];

async function testEndpoint(
  endpoint: string,
  options: RequestInit = {},
  expectedStatus = 200,
  validator?: (body: string, res: Response) => boolean
): Promise<SmokeResult> {
  const url = `${BASE_URL}${endpoint}`;
  const start = Date.now();
  let status = 0;
  let pass = false;
  let notes = "";

  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "User-Agent": "Devyatra-SmokeTest/1.0",
        ...(options.headers || {}),
      },
      redirect: "manual",
    });
    status = res.status;
    const body = await res.text();
    const duration = Date.now() - start;

    if (status === expectedStatus) {
      if (validator) {
        pass = validator(body, res);
        notes = pass ? "Validator passed" : "Content validation failed";
      } else {
        pass = true;
        notes = "Status code matched";
      }
    } else {
      notes = `Expected ${expectedStatus}, got ${status}`;
    }

    return { endpoint, status, expectedStatus, pass, notes, latencyMs: duration };
  } catch (err: any) {
    return {
      endpoint,
      status: 0,
      expectedStatus,
      pass: false,
      notes: `Fetch failed: ${err.message}`,
      latencyMs: Date.now() - start,
    };
  }
}

async function runSmokeTests() {
  console.log("==================================================");
  console.log(`🌐 DEVYATRA PRODUCTION LIVE SMOKE TEST`);
  console.log(`Target: ${BASE_URL}`);
  console.log("==================================================\n");

  // 1. Homepage
  results.push(
    await testEndpoint("/", {}, 200, (body) => {
      return body.includes("Devyatra") || body.includes("Templeora") || body.includes("temple");
    })
  );

  // 2. Directory Page 1
  results.push(
    await testEndpoint("/temples", {}, 200, (body) => {
      return body.includes("temples") || body.includes("Directory");
    })
  );

  // 3. Directory Page 2
  results.push(
    await testEndpoint("/temples?page=2", {}, 200, (body) => {
      return body.includes("page=1") || body.includes("page=3");
    })
  );

  // 4. Explore India Root
  results.push(
    await testEndpoint("/explore", {}, 200, (body) => {
      return body.includes("Andhra Pradesh") || body.includes("Tamil Nadu");
    })
  );

  // 5. Explore State: Andhra Pradesh
  results.push(
    await testEndpoint("/explore/andhra-pradesh", {}, 200, (body) => {
      return body.includes("Andhra Pradesh");
    })
  );

  // 6. Temple Detail: Sri Venkateswara Temple
  results.push(
    await testEndpoint("/temples/andhra-pradesh/sri-venkateswara-temple", {}, 200, (body) => {
      return body.includes("Venkateswara") || body.includes("Tirumala");
    })
  );

  // 7. Temple Detail: Meenakshi Amman Temple
  results.push(
    await testEndpoint("/temples/tamil-nadu/meenakshi-amman-temple", {}, 200, (body) => {
      return body.includes("Meenakshi") || body.includes("Madurai");
    })
  );

  // 8. Temple Detail: Dequarantined ASI Monument (Phase 6B)
  results.push(
    await testEndpoint(
      "/temples/rajasthan/yupa-pillars-in-bichpuria-temple-rajasthan-000519",
      {},
      200,
      (body) => {
        return body.includes("Bichpuria") || body.includes("Yupa");
      }
    )
  );

  // 9. Interactive Map
  results.push(
    await testEndpoint("/map", {}, 200, (body) => {
      return body.includes("map") || body.includes("Map");
    })
  );

  // 10. Admin Protection: Unauthenticated requests must not access the admin console
  results.push(
    await testEndpoint("/admin", { redirect: "follow" }, 200, (body) => {
      // Must render login page and NOT the admin verification console
      return (body.includes("Sign in") || body.includes("login")) && !body.includes("Temple Verification & Provenance Console");
    })
  );

  // 11. REST API V1 Temples Listing
  results.push(
    await testEndpoint("/api/v1/temples?limit=5", {}, 200, (body) => {
      try {
        const json = JSON.parse(body);
        return json.success === true && json.pagination.total === 1655 && json.data.length === 5;
      } catch {
        return false;
      }
    })
  );

  // 12. Multilingual Search API
  results.push(
    await testEndpoint("/api/search?q=Tirupati", {}, 200, (body) => {
      try {
        const json = JSON.parse(body);
        return Array.isArray(json.temples) && json.temples.length > 0;
      } catch {
        return false;
      }
    })
  );

  // 13. AI Ask API (Grounded)
  results.push(
    await testEndpoint(
      "/api/ai/ask",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templeId: "sri-venkateswara-temple",
          question: "When does general darshan open at Tirumala?",
        }),
      },
      200,
      (body) => {
        try {
          const json = JSON.parse(body);
          return Boolean(json.answer && json.answer.length > 10);
        } catch {
          return false;
        }
      }
    )
  );

  // Print results
  let passCount = 0;
  let failCount = 0;

  for (const r of results) {
    const symbol = r.pass ? "✅ [PASS]" : "❌ [FAIL]";
    console.log(`${symbol} ${r.endpoint} → HTTP ${r.status} (${r.latencyMs}ms) — ${r.notes}`);
    if (r.pass) passCount++;
    else failCount++;
  }

  console.log("\n==================================================");
  console.log(`Smoke Test Summary: ${passCount} PASSED, ${failCount} FAILED`);
  console.log("==================================================");

  if (failCount > 0) {
    process.exit(1);
  }
}

runSmokeTests().catch((err) => {
  console.error("Smoke test suite crashed:", err);
  process.exit(1);
});
