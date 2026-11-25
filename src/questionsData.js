export const SECTION_TIMERS = {
  1: 8 * 60, // 8 minutes (480 seconds)
  2: 8 * 60, // 8 minutes (480 seconds)
  3: 6 * 60, // 6 minutes (360 seconds)
};

export const CHARACTERS = {
  priya: {
    name: 'Priya Sharma',
    role: 'HR Manager, Talvexo',
    color: '#0D9488',
    initials: 'PS',
    welcomeMarketing:
      'Welcome to Talvexo! Today you face three real-world business challenges: Challenge 1 tests Marketing & Growth Aptitude, Challenge 2 tests Regional Sales & Brand Data Interpretation, and Challenge 3 tests Commercial Integrity & Sales Ethics. Let’s see how you think!',
    welcomeFinance:
      'Welcome to Talvexo! Today you face three real-world business challenges: Challenge 1 tests Financial & Margin Aptitude, Challenge 2 tests P&L & Liquidity Data Interpretation, and Challenge 3 tests Financial Governance & Reporting Ethics. Let’s see how you think!',
  },
  rohanMarketing: {
    name: 'Rohan Mehta',
    role: 'Regional Sales Head',
    color: '#4A90E2',
    initials: 'RM',
    intro:
      'Our Tier-2 numbers and brand margins need sharp commercial calls. Show me how you analyze data and prioritize growth under pressure.',
  },
  rohanFinance: {
    name: 'Rohan Mehta',
    role: 'CFO Office Lead',
    color: '#4A90E2',
    initials: 'RM',
    intro:
      'We are at a critical point for working capital and CapEx allocation. Walk me through your analytical reasoning.',
  },
  ananya: {
    name: 'Ananya Iyer',
    role: 'Ethics & Compliance Lead',
    color: '#F59E0B',
    initials: 'AI',
    intro:
      'This challenge tests Commercial & Governance Integrity—how you protect company standards when business targets create pressure.',
  },
};

export const QUESTION_BANK = {
  Marketing: {
    roleTitle: 'Sales Executive',
    sectionTitles: {
      1: 'Marketing & Growth Aptitude',
      2: 'Regional Sales & Brand Data Interpretation',
      3: 'Commercial Integrity & Sales Ethics',
    },
    sectionBadges: {
      1: {
        title: 'Commercial Calculator',
        desc: 'Challenge 1 completed: Marketing & Growth Aptitude.',
      },
      2: {
        title: 'Market Diagnostician',
        desc: 'Challenge 2 completed: Regional Sales & Brand Data Interpretation.',
      },
      3: {
        title: 'Compliance Decision-Maker',
        desc: 'Challenge 3 completed: Commercial Integrity & Sales Ethics.',
      },
    },
    section1: [
      {
        id: 'M_S1_Q1',
        tag: 'Oral Care Division • Growth Projection',
        question:
          'Talvexo FMCG launched an herbal facewash in 5 metro cities with Month 1 sales of ₹10,00,000. If monthly sales grow at a compounded rate of 20% per month, what will the sales be in Month 3?',
        options: [
          { id: 'A', text: '₹14,00,000', marks: 0 },
          { id: 'B', text: '₹14,40,000', marks: 2 },
          { id: 'C', text: '₹12,40,000', marks: 0 },
        ],
      },
      {
        id: 'M_S1_Q2',
        tag: 'Beverage Division • Acquisition Cost',
        question:
          'A digital campaign for Talvexo’s new energy drink spent ₹4,50,000 and generated 60,000 website clicks, of which 2.5% converted into paying customers. What is the Customer Acquisition Cost (CAC)?',
        options: [
          { id: 'A', text: '₹300', marks: 2 },
          { id: 'B', text: '₹180', marks: 0 },
          { id: 'C', text: '₹250', marks: 0 },
        ],
      },
      {
        id: 'M_S1_Q3',
        tag: 'Edible Oils Division • Discount Break-Even',
        question:
          'Talvexo sells a 1-liter cooking oil pack to distributors at ₹200 with a variable cost of ₹140 per pack (current volume: 30,000 packs/month). If you offer a 10% price discount, how many packs must be sold monthly just to maintain the current total contribution?',
        options: [
          { id: 'A', text: '35,000 packs', marks: 0 },
          { id: 'B', text: '45,000 packs', marks: 2 },
          { id: 'C', text: '40,000 packs', marks: 0 },
        ],
      },
      {
        id: 'M_S1_Q4',
        tag: 'Hair Care Division • Rural Sachet Sizing',
        question:
          'In a target district of 10,00,000 households, 50% buy shampoo sachets, averaging 4 sachets per month. If Talvexo captures a 20% market share at a net realization of ₹6 per sachet, what is the monthly revenue?',
        options: [
          { id: 'A', text: '₹24,00,000', marks: 2 },
          { id: 'B', text: '₹30,00,000', marks: 0 },
          { id: 'C', text: '₹18,00,000', marks: 0 },
        ],
      },
    ],
    dashboard: {
      type: 'marketing',
      barTitle: 'Regional Quarterly Sales (₹ Lakhs)',
      bars: [
        { name: 'North', value: 420 },
        { name: 'South', value: 380 },
        { name: 'West', value: 350 },
        { name: 'Central', value: 290 },
        { name: 'East', value: 210 },
      ],
      segmentsTitle: 'Customer Segment Revenue Share',
      segments: [
        { name: 'Urban Mid', pct: 40 },
        { name: 'Tier-2 Towns', pct: 30 },
        { name: 'Urban Premium', pct: 18 },
        { name: 'Rural', pct: 12 },
      ],
      kpis: [
        { label: 'Overall CAC', value: '₹240' },
        { label: 'Net Promoter Score', value: '+42' },
        { label: 'Repeat Purchase Rate', value: '64%' },
      ],
    },
    section2: [
      {
        id: 'M_S2_Q1',
        tag: 'Regional Sales Chart • Budget Reallocation',
        question:
          'Looking at the Regional Quarterly Sales chart, East Zone (₹210L) currently lags behind all other regions. If you allocate ₹15L of fresh promotional budget to East Zone and achieve a 3x incremental revenue return on that spend, what will East Zone’s new quarterly revenue be?',
        options: [
          { id: 'A', text: '₹225L', marks: 0 },
          { id: 'B', text: '₹255L', marks: 2 },
          { id: 'C', text: '₹240L', marks: 0 },
        ],
      },
      {
        id: 'M_S2_Q2',
        tag: 'Customer Segment Data • Retention Strategy',
        question:
          'According to the Customer Segment Revenue Share chart, Urban Mid (40%) and Tier-2 Towns (30%) generate 70% of total company revenue. Which commercial initiative best protects this core revenue base against local price competitors?',
        options: [
          {
            id: 'A',
            text: 'Shift 80% of national advertising spend exclusively into Rural markets where current share is 12%.',
            marks: 0,
          },
          {
            id: 'B',
            text: 'Launch multi-pack value bundles and retailer loyalty rebates tailored specifically to Urban Mid and Tier-2 stores.',
            marks: 2,
          },
          {
            id: 'C',
            text: 'Discontinue all mid-tier SKUs and focus solely on Urban Premium shoppers.',
            marks: 0,
          },
        ],
      },
      {
        id: 'M_S2_Q3',
        tag: 'Organic Tea Launch • Marketing Mix (4Ps)',
        question:
          'Talvexo’s organic green tea sells briskly in metro supermarkets, but Tier-2 shoppers hesitate to buy the ₹450 glass jar for a first-time trial. Which Marketing Mix adjustment directly solves this trial barrier without hurting metro brand equity?',
        options: [
          {
            id: 'A',
            text: 'Introduce a ₹49 trial pouch (Product & Pricing) for Tier-2 kirana stores while keeping the ₹450 flagship jar intact.',
            marks: 2,
          },
          {
            id: 'B',
            text: 'Permanently slash the ₹450 jar price to ₹220 across all metro supermarkets.',
            marks: 0,
          },
          {
            id: 'C',
            text: 'Increase television celebrity endorsements while keeping only the ₹450 jar size.',
            marks: 0,
          },
        ],
      },
      {
        id: 'M_S2_Q4',
        tag: 'Digestive Biscuits • STP Framework',
        question:
          'Talvexo is launching a sugar-free digestive biscuit specifically formulated for working professionals aged 28–45 managing workplace stress and irregular meals. In the STP framework, selecting this specific consumer group represents which step?',
        options: [
          { id: 'A', text: 'Positioning', marks: 0 },
          { id: 'B', text: 'Targeting', marks: 2 },
          { id: 'C', text: 'Mass Distribution', marks: 0 },
        ],
      },
      {
        id: 'M_S2_Q5',
        tag: 'Cold-Pressed Juice • Brand Positioning',
        question:
          'Rivals in the packaged juice aisle compete on "lowest price per liter." Talvexo positions its new cold-pressed juice around "100% farm-traceable fruit with zero added preservatives" at a 15% price premium. What execution priority is critical for this positioning to succeed?',
        options: [
          {
            id: 'A',
            text: 'Secure eye-level retail shelf placement with clear front-of-pack quality proof points that justify the 15% premium.',
            marks: 2,
          },
          {
            id: 'B',
            text: 'Match competitor weekend discounts every week so the price premium disappears.',
            marks: 0,
          },
          {
            id: 'C',
            text: 'Reduce real fruit content to cut production costs while keeping the premium price tag.',
            marks: 0,
          },
        ],
      },
    ],
    section3: [
      {
        id: 'M_S3_Q1',
        tag: 'West Zone Personal Care • Quarter-End Targets',
        question:
          'It is the final two days of Q3, and your territory is ₹6,00,000 short of its quarterly target. A major distributor offers to place an immediate ₹6,50,000 order for Talvexo body wash—provided you verbally promise to take back unsold stock as "transit damaged returns" in Week 1 of Q4 without penalty. What do you do?',
        options: [
          {
            id: 'A',
            text: 'Process the order under standard billing terms while keeping a private note to honor the return promise next month so the team hits its Q3 bonus.',
            marks: 0,
          },
          {
            id: 'B',
            text: 'Decline the informal return guarantee and offer a smaller, policy-approved Q3 display incentive based on realistic sell-through, even if the territory finishes slightly below target.',
            marks: 4,
          },
          {
            id: 'C',
            text: 'Forward the distributor’s conditional request to the Regional Finance Controller for formal written evaluation, allowing the Q3 billing cutoff to pass without closing a deal.',
            marks: 2,
          },
        ],
      },
      {
        id: 'M_S3_Q2',
        tag: 'North Zone Health Foods • Packaging Compliance',
        question:
          'Days before launching Talvexo’s new protein bar, a quality check shows actual protein is 11.2g per bar, whereas 40,000 printed wrappers state "12g High Protein" (within broad regulatory tolerance, though slightly below the bold front claim). Reprinting wrappers will miss the festive retail window. What do you recommend?',
        options: [
          {
            id: 'A',
            text: 'Dispatch the festive batch immediately with existing wrappers since it falls within general tolerance limits, and revise the artwork for the next print run.',
            marks: 0,
          },
          {
            id: 'B',
            text: 'Hold dispatch for 3 days to apply compliant corrective nutrition stickers over the front claim before shipping to retailers.',
            marks: 4,
          },
          {
            id: 'C',
            text: 'Cancel the festive launch altogether until brand-new wrappers are manufactured from scratch, ceding shelf space to competitors.',
            marks: 2,
          },
        ],
      },
      {
        id: 'M_S3_Q3',
        tag: 'South Zone Trade Marketing • Vendor Evaluation',
        question:
          'You are scoring final bids from three event agencies for Talvexo’s annual dealer summit. Agency X—a strong contender—delivers an expensive smartwatch to your home address with a festive greeting card the evening before final selection. How do you respond?',
        options: [
          {
            id: 'A',
            text: 'Keep the watch sealed in a drawer until after the tender closes so it does not affect your judgment, and score all three agencies strictly on merit.',
            marks: 0,
          },
          {
            id: 'B',
            text: 'Return the smartwatch to Agency X immediately citing Talvexo’s gift policy, and formally log the incident with Ethics & Compliance before submitting your bid scores.',
            marks: 4,
          },
          {
            id: 'C',
            text: 'Hand the watch over to HR to include in the annual employee raffle pool so you receive no personal gain, while continuing the vendor evaluation normally.',
            marks: 2,
          },
        ],
      },
    ],
  },

  Finance: {
    roleTitle: 'Financial Analyst',
    sectionTitles: {
      1: 'Financial & Margin Aptitude',
      2: 'P&L & Liquidity Data Interpretation',
      3: 'Financial Governance & Reporting Ethics',
    },
    sectionBadges: {
      1: {
        title: 'Margin Modeler',
        desc: 'Challenge 1 completed: Financial & Margin Aptitude.',
      },
      2: {
        title: 'Statement Analyst',
        desc: 'Challenge 2 completed: P&L & Liquidity Data Interpretation.',
      },
      3: {
        title: 'Governance Auditor',
        desc: 'Challenge 3 completed: Financial Governance & Reporting Ethics.',
      },
    },
    section1: [
      {
        id: 'F_S1_Q1',
        tag: 'Corporate Treasury • Debt Repayment',
        question:
          'Talvexo borrowed ₹25,00,000 at 12% per annum simple interest for 2 years to upgrade a packaging line. What is the total repayment amount (principal + interest) at maturity?',
        options: [
          { id: 'A', text: '₹28,00,000', marks: 0 },
          { id: 'B', text: '₹31,00,000', marks: 2 },
          { id: 'C', text: '₹31,36,000', marks: 0 },
        ],
      },
      {
        id: 'F_S1_Q2',
        tag: 'Home Care Plant • CapEx Break-Even',
        question:
          'Talvexo invests ₹36,00,000 in automated machinery for a new detergent bar. Each bar sells to distributors at ₹30, with raw material and packaging costs of ₹18 per bar. How many units must be sold to break even on the machinery investment?',
        options: [
          { id: 'A', text: '3,00,000 units', marks: 2 },
          { id: 'B', text: '2,00,000 units', marks: 0 },
          { id: 'C', text: '1,20,000 units', marks: 0 },
        ],
      },
      {
        id: 'F_S1_Q3',
        tag: 'Beverage Bottling Line • Bottleneck Contribution',
        question:
          'Factory line capacity is capped at 8,000 machine hours this month. SKU A yields ₹24 contribution per unit and takes 0.4 machine hours; SKU B yields ₹18 contribution per unit and takes 0.25 machine hours. Which SKU maximizes total profit under the bottleneck?',
        options: [
          { id: 'A', text: 'SKU A (₹60/hr)', marks: 0 },
          { id: 'B', text: 'SKU B (₹72/hr)', marks: 2 },
          { id: 'C', text: 'Both yield identical contribution per machine hour', marks: 0 },
        ],
      },
      {
        id: 'F_S1_Q4',
        tag: 'Modern Trade Channel • Credit Extension Cost',
        question:
          'To onboard a national supermarket chain, Talvexo extends credit terms from 30 days to 60 days on annual sales of ₹3,60,00,000 (360-day year). If Talvexo’s short-term borrowing cost is 10% p.a., what is the annual financing cost of this credit extension?',
        options: [
          { id: 'A', text: '₹6,00,000', marks: 0 },
          { id: 'B', text: '₹3,00,000', marks: 2 },
          { id: 'C', text: '₹1,50,000', marks: 0 },
        ],
      },
    ],
    dashboard: {
      type: 'finance',
      barTitle: 'Quarterly Revenue Progression (₹ Lakhs)',
      bars: [
        { name: 'Q1', value: 500 },
        { name: 'Q2', value: 540 },
        { name: 'Q3', value: 580 },
        { name: 'Q4', value: 620 },
      ],
      pnlTitle: 'Comparative P&L Summary (Q3 vs. Q4)',
      pnlRows: [
        { metric: 'Revenue', q3: '₹580.0L', q4: '₹620.0L (+6.9%)' },
        { metric: 'Cost of Goods Sold (COGS)', q3: '₹348.0L (60%)', q4: '₹390.6L (63%)' },
        { metric: 'Gross Profit', q3: '₹232.0L (40%)', q4: '₹229.4L (37%)' },
        { metric: 'Operating Expenses (OpEx)', q3: '₹145.0L', q4: '₹148.8L' },
        { metric: 'Net Profit', q3: '₹87.0L (15%)', q4: '₹80.6L (13%)' },
      ],
      kpis: [
        { label: 'Current Ratio (Norm: 1.50x)', value: '1.15x' },
        { label: 'Debt-to-Equity', value: '0.65x' },
        { label: 'Inventory Days (Prior: 52d)', value: '68 days' },
      ],
    },
    section2: [
      {
        id: 'F_S2_Q1',
        tag: 'Comparative P&L Table • Margin Diagnosis',
        question:
          'Looking at the Comparative P&L table, Net Profit fell from ₹87L in Q3 to ₹80.6L in Q4 despite revenue rising to ₹620L. What is the primary financial cause of this profit contraction?',
        options: [
          {
            id: 'A',
            text: 'A 300-basis-point surge in COGS as a percentage of revenue (from 60% to 63%), compressing gross margin.',
            marks: 2,
          },
          {
            id: 'B',
            text: 'Excessive interest expense from high Debt-to-Equity leverage.',
            marks: 0,
          },
          {
            id: 'C',
            text: 'Uncontrolled Operating Expense growth, which doubled in Q4.',
            marks: 0,
          },
        ],
      },
      {
        id: 'F_S2_Q2',
        tag: 'Ratio Cards • Liquidity Risk Diagnosis',
        question:
          'Looking at the Ratio Cards, Talvexo’s Current Ratio is 1.15x (below the 1.50x industry benchmark) while Inventory Days jumped from 52 to 68 days. What immediate risk does this signal?',
        options: [
          {
            id: 'A',
            text: 'Cash is increasingly locked in slow-moving inventory, tightening short-term liquidity to meet near-term payables.',
            marks: 2,
          },
          {
            id: 'B',
            text: 'The company holds too much idle cash and should immediately issue a special dividend.',
            marks: 0,
          },
          {
            id: 'C',
            text: 'Long-term insolvency caused by excessive long-term debt.',
            marks: 0,
          },
        ],
      },
      {
        id: 'F_S2_Q3',
        tag: 'Supply Chain Finance • Working Capital',
        question:
          'A regional distribution hub has ₹1.2 crore tied up in excess safety stock and overdue distributor receivables. Which action improves short-term cash flow without harming supplier relationships?',
        options: [
          {
            id: 'A',
            text: 'Offer early-payment cash discounts to distributors and run targeted clearance schemes on slow-moving SKUs.',
            marks: 2,
          },
          {
            id: 'B',
            text: 'Use short-term bank overdraft funds to acquire long-term warehouse real estate.',
            marks: 0,
          },
          {
            id: 'C',
            text: 'Delay paying raw material suppliers by 90 days past agreed contract terms.',
            marks: 0,
          },
        ],
      },
      {
        id: 'F_S2_Q4',
        tag: 'Warehouse Automation • Capital Budgeting',
        question:
          'The CFO is evaluating two mutually exclusive warehouse automation projects. Project Alpha has an NPV of +₹42L and IRR of 16%; Project Beta has an NPV of +₹58L and IRR of 14.5% (both exceed Talvexo’s 11% cost of capital). Under standard corporate finance rules, which project should you recommend?',
        options: [
          {
            id: 'A',
            text: 'Project Beta, because maximizing Net Present Value (+₹58L) directly maximizes firm value.',
            marks: 2,
          },
          {
            id: 'B',
            text: 'Project Alpha, because a higher IRR always creates more rupee wealth regardless of project scale.',
            marks: 0,
          },
          {
            id: 'C',
            text: 'Reject both projects because their IRRs are below 20%.',
            marks: 0,
          },
        ],
      },
      {
        id: 'F_S2_Q5',
        tag: 'Balance Sheet Impact • Ratio Mechanics',
        question:
          'A subsidiary currently has Current Assets of ₹230L and Current Liabilities of ₹200L (Current Ratio = 1.15x). If the subsidiary uses ₹40L of cash to pay down ₹40L of short-term accounts payable, what happens to its Current Ratio?',
        options: [
          {
            id: 'A',
            text: 'The Current Ratio increases from 1.15x to 1.1875x.',
            marks: 2,
          },
          {
            id: 'B',
            text: 'The Current Ratio drops below 1.00x.',
            marks: 0,
          },
          {
            id: 'C',
            text: 'The Current Ratio stays mathematically unchanged at 1.15x.',
            marks: 0,
          },
        ],
      },
    ],
    section3: [
      {
        id: 'F_S3_Q1',
        tag: 'Accounts Payable • Duplicate Payment Discovery',
        question:
          'During your first month in Corporate Finance, you uncover that a logistics vendor invoice of ₹3,00,000 was accidentally approved and paid twice last week. Your reporting manager signed off on both vouchers without noticing, and year-end audit prep starts tomorrow. What is your immediate step?',
        options: [
          {
            id: 'A',
            text: 'Quietly adjust next month’s vendor ledger to deduct ₹3,00,000 from future bills without raising an error log so your manager is protected during the audit.',
            marks: 0,
          },
          {
            id: 'B',
            text: 'Document the duplicate voucher numbers clearly, alert your reporting manager privately with a recovery plan to issue a formal debit note to the vendor, and log the adjustment in the audit trail.',
            marks: 4,
          },
          {
            id: 'C',
            text: 'Bypass your reporting manager and email the external statutory auditors directly before verifying whether the vendor has already initiated a refund.',
            marks: 2,
          },
        ],
      },
      {
        id: 'F_S3_Q2',
        tag: 'Plant Expansion • Expense Capitalization Pressure',
        question:
          'To meet Q4 EBITDA targets, a Business Unit Head asks you to classify ₹18,00,000 of routine annual machinery maintenance expenses as "Capital Expenditure (CapEx)" so the cost is depreciated over 5 years instead of hitting this quarter’s P&L. How do you handle this?',
        options: [
          {
            id: 'A',
            text: 'Reclassify the ₹18,00,000 as CapEx for Q4 to support the unit’s EBITDA target, and plan to reverse the entry gradually next year.',
            marks: 0,
          },
          {
            id: 'B',
            text: 'Decline the CapEx reclassification citing accounting standards, present the accurate EBITDA impact transparently, and highlight legitimate discretionary OpEx deferrals if cost savings are needed.',
            marks: 4,
          },
          {
            id: 'C',
            text: 'Leave the ₹18,00,000 invoice unrecorded in the Q4 ledger until Q1 so neither Q4 EBITDA nor CapEx rules are affected.',
            marks: 2,
          },
        ],
      },
      {
        id: 'F_S3_Q3',
        tag: 'Strategy Desk • Confidential M&A Data',
        question:
          'You are building the valuation model for Talvexo’s confidential acquisition of a regional snack brand (to be announced next week). A close college friend—who works as an equity research analyst—messages you asking if rumors about Talvexo acquiring a snack company are true. What do you do?',
        options: [
          {
            id: 'A',
            text: 'Give a subtle hint that "next week’s announcement will be exciting" without sharing exact valuation numbers so you haven’t leaked confidential documents.',
            marks: 0,
          },
          {
            id: 'B',
            text: 'Neither confirm nor deny any market rumors, state clearly that company policy prohibits commenting on corporate developments, and keep all valuation files encrypted.',
            marks: 4,
          },
          {
            id: 'C',
            text: 'Tell your friend the acquisition is happening so they don’t publish an inaccurate report, on the strict condition that they hold their report until the official press release.',
            marks: 2,
          },
        ],
      },
    ],
  },
};

export const SURVEY_ITEMS = [
  {
    id: 'q1',
    section: 'Candidate Enjoyment & Preference',
    text: 'I found this assessment format to be engaging and enjoyable.',
  },
  {
    id: 'q2',
    section: 'Candidate Enjoyment & Preference',
    text: 'I prefer this assessment format over standard campus recruitment tests.',
  },
  {
    id: 'q3',
    section: 'Candidate Enjoyment & Preference',
    text: 'The challenge level of the questions matched my current skills.',
  },
  {
    id: 'q4',
    section: 'Perceived Fairness & Effectiveness',
    text: 'I felt this assessment gave me a fair opportunity to prove my actual skills.',
  },
  {
    id: 'q5',
    section: 'Perceived Fairness & Effectiveness',
    text: 'The content of the test felt highly relevant to the duties of a management trainee.',
  },
  {
    id: 'q6',
    section: 'Perceived Fairness & Effectiveness',
    text: 'I believe this format is an effective and reasonable way to evaluate candidates.',
  },
  {
    id: 'q7',
    section: 'Organizational Attractiveness',
    text: 'An assessment format like this makes a company more attractive to me as a potential employer.',
  },
  {
    id: 'q8',
    section: 'Organizational Attractiveness',
    text: 'I would speak positively about a company that uses this specific hiring process.',
  },
  {
    id: 'q9',
    section: 'Organizational Attractiveness',
    text: "This experience gave me a positive impression of the organization's culture.",
  },
  {
    id: 'q10',
    section: 'Clarity & Competence',
    text: 'The assessment gave me a clear idea of the types of data and scenarios I would handle in this job.',
  },
  {
    id: 'q11',
    section: 'Clarity & Competence',
    text: 'I felt I was competent enough to meet the demands of the situations presented.',
  },
  {
    id: 'q12',
    section: 'Clarity & Competence',
    text: 'The goals and instructions of the assessment were clearly defined.',
  },
];

export function getBadgeTier(totalScore) {
  if (totalScore >= 25) {
    return {
      tier: 'Top Strategist',
      color: '#0D9488',
      desc: 'Outstanding analytical precision and rock-solid ethical judgment across all three business rounds.',
    };
  }
  if (totalScore >= 18) {
    return {
      tier: 'Skilled Analyst',
      color: '#4A90E2',
      desc: 'Solid commercial reasoning and sound decision-making, with a few complex details left to sharpen.',
    };
  }
  if (totalScore >= 10) {
    return {
      tier: 'Developing Trainee',
      color: '#F59E0B',
      desc: 'You grasped the core business fundamentals, though several analytical and policy trade-offs need closer review.',
    };
  }
  return {
    tier: 'Needs Practice',
    color: '#64748B',
    desc: 'This attempt highlights clear gaps in quantitative analysis and policy application—a useful baseline to build from.',
  };
}
