/**
 * GrantMaster's Ideal Customer Profile.
 *
 * The Fit score is the cosine similarity between an organization's mission
 * embedding and the centroid of these ideal-customer mission descriptions.
 * Tune Fit by editing this list — no other code changes needed; re-score with
 * `npx tsx scripts/rescore.ts` after changing it.
 *
 * These are grant-managing, social-impact NL/EU NGOs that juggle multiple
 * restricted grants and care about compliance + provable impact.
 */
export const ICP_SEED_MISSIONS: string[] = [
  // 1 — Migration / refugee support (NL)
  "We support newly arrived refugees and undocumented residents across three Dutch provinces with legal guidance, language coaching, and access to work. Our programs are funded by a mix of municipal subsidies, national integration grants, and two private foundations, each with its own reporting cycle. As a team of fewer than twenty, we're committed to spending every euro where it's promised and proving our impact to the funders who make this work possible.",

  // 2 — Social inclusion (NL/EU)
  "Our foundation helps people facing long-term social isolation — older adults, people with disabilities, and those leaving institutional care — rebuild connection and independence. We run neighbourhood programs in several cities, financed through provincial grants, EU social-fund allocations, and recurring partnerships with local government. Demonstrating measurable outcomes to multiple co-funders is central to how we operate and how we sustain the trust that keeps our grants renewed.",

  // 3 — Youth education / opportunity (NL)
  "We work to close the opportunity gap for children in under-resourced Dutch neighbourhoods through after-school learning, mentoring, and family support. Our funding comes from education ministries, municipal budgets, and several charitable trusts, which means we manage overlapping grant agreements and tight compliance deadlines year-round. We're a small, mission-driven organisation that believes rigorous accountability is what lets us keep showing up for the young people who rely on us.",

  // 4 — Climate / community sustainability (EU)
  "Our organisation helps local communities adapt to climate change through energy cooperatives, green-space restoration, and education for households and schools. We operate on a blend of EU climate programmes, national subsidies, and foundation grants, each demanding detailed financial and impact reporting. With a lean team stretched across multiple projects, disciplined grant management is essential to delivering on our commitments and to remaining a credible partner to our funders.",

  // 5 — Public health / wellbeing (NL)
  "We improve mental-health and wellbeing outcomes for vulnerable populations through community clinics, peer-support networks, and prevention programmes. Funded by health authorities, regional subsidies, and private donors, we juggle several restricted grants at once and answer to funders who expect transparent, evidence-based reporting. As a mid-sized nonprofit, our credibility — and our continued funding — depends on getting compliance and impact measurement right every single cycle.",

  // 6 — Women's economic empowerment (EU)
  "Our foundation advances economic independence for women facing barriers to work — survivors of violence, single parents, and recent migrants — through training, micro-grants, and employer partnerships. We are financed by EU equality programmes, national labour funds, and philanthropic foundations, each with distinct eligibility and reporting rules. We're a small professional team, and we treat meticulous grant stewardship as inseparable from our mission to use limited resources for maximum, provable impact.",

  // 7 — Cultural / civic participation (NL)
  "We strengthen civic and cultural participation in diverse communities through local arts, heritage, and dialogue programmes. Our work is sustained by municipal cultural funds, national grant schemes, and a handful of private patrons, requiring us to coordinate multiple funding streams and reporting obligations simultaneously. As a modest organisation with big ambitions, we rely on tight financial discipline and clear impact storytelling to keep earning the grants that fund our community.",
]
