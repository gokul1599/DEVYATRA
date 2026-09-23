const fs = require('fs');
const data = require('./phase14_gap_data.json');

const targetStates = ['UP', 'MP', 'BR', 'AS', 'MH', 'KA', 'PB', 'HR', 'OD', 'RJ'];

for (const code of targetStates) {
  const s = data.stateStats.find(x => x.code === code);
  if (!s) continue;
  console.log(`\n================== ${s.state} (${s.code}) - ${s.unrepresentedDistricts} Unrepresented ==================`);
  s.unrepresentedList.forEach(d => {
    console.log(`  - Code: "${d.code}", Name: "${d.name}", Slug: "${d.slug}"`);
  });
}
