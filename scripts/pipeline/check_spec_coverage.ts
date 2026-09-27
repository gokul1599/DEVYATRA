import { BENCHMARK_TEMPLES } from "./audit_benchmark";
import { CANONICAL_BENCHMARK_SPECS } from "./build_canonical_temple_index";

const specNames = new Set(CANONICAL_BENCHMARK_SPECS.map(s => s.benchmarkName.toLowerCase()));
const missingFromSpecs = BENCHMARK_TEMPLES.filter(b => !specNames.has(b.toLowerCase()));

console.log(`Total BENCHMARK_TEMPLES: ${BENCHMARK_TEMPLES.length}`);
console.log(`Total CANONICAL_BENCHMARK_SPECS: ${CANONICAL_BENCHMARK_SPECS.length}`);
console.log(`Missing from specs: ${missingFromSpecs.length}`, missingFromSpecs);
