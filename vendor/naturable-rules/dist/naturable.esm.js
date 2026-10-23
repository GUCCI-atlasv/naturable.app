/* naturable-rules 1.2.0 · packs en-v1.1 / zh-v1.1 · code MIT, rule data CC BY 4.0 */

// packs/en.json
var en_default = {
  version: "en-v1.1",
  language: "en",
  released: "2026-10-22",
  changelog: [
    "Initial EN formal pack: hollow -> structure -> assistant -> lexicon; Wikipedia/blader/no-ai-slop patterns deduped.",
    'v1.1: fix positive_negative_parallel (never matched without a comma before "or"); add en.structure.dash_dense (thresholds are initial and need calibration).'
  ],
  layer_order: [
    "hollow",
    "structure",
    "artifact",
    "lexicon"
  ],
  rules: [
    {
      id: "en.hollow.vague_source",
      name_en: "Vague source",
      name_zh: "\u6A21\u7CCA\u6765\u6E90",
      layer: "hollow",
      category: "evidence",
      severity: "strong",
      confidence: "high",
      purpose_weights: {
        blog: 1.1,
        email: 1,
        marketing: 1.2,
        general: 1,
        academic: 1.4,
        social: 0.9,
        technical: 1.2
      },
      detect: {
        type: "regex",
        pattern: "\\b(experts (?:believe|say|agree)|studies (?:show|suggest|indicate)|research (?:shows|suggests)|it is widely (?:believed|known|accepted)|many people believe)\\b",
        flags: "gi"
      },
      rewrite: "Name the source, date, or remove the attribution.",
      reason: "The attribution cannot be checked as written.",
      before: "Experts believe this approach works.",
      after: "A 2024 NIST brief found this approach works.",
      auto: false,
      evidence_policy: "never_invent",
      docs: "https://naturable.app/en/signs-of-ai-writing/#vague-sources"
    },
    {
      id: "en.hollow.generic_conclusion",
      name_en: "Generic conclusion",
      name_zh: "\u7A7A\u6D1E\u7ED3\u8BBA",
      layer: "hollow",
      category: "evidence",
      severity: "strong",
      confidence: "medium",
      purpose_weights: {
        blog: 1.1,
        email: 0.9,
        marketing: 1.2,
        general: 1,
        academic: 1.1,
        social: 1,
        technical: 0.8
      },
      detect: {
        type: "regex",
        pattern: "\\b(the future looks bright|the possibilities are endless|only time will tell|the sky['\u2019]s the limit|a brighter tomorrow|transform(?:ing|s)? the way we (?:live|work|think))\\b",
        flags: "gi"
      },
      rewrite: "End with a specific result, limit, or next step.",
      reason: "The ending makes a broad claim without evidence or action.",
      before: "The future looks bright.",
      after: "Ship the pilot to three teams next quarter.",
      auto: false,
      evidence_policy: "never_invent",
      docs: "https://naturable.app/en/signs-of-ai-writing/#generic-conclusions"
    },
    {
      id: "en.hollow.fake_certainty",
      name_en: "Fake certainty",
      name_zh: "\u7A7A\u6CDB\u65AD\u5B9A",
      layer: "hollow",
      category: "evidence",
      severity: "strong",
      confidence: "medium",
      purpose_weights: {
        blog: 1,
        email: 1,
        marketing: 1.1,
        general: 1,
        academic: 1.2,
        social: 0.8,
        technical: 1.1
      },
      detect: {
        type: "regex",
        pattern: "\\b(it is (?:clear|obvious|evident) that|needless to say|without a doubt|there is no doubt that)\\b",
        flags: "gi"
      },
      rewrite: "State the claim and the evidence; drop the certainty filler.",
      reason: "Certainty language stands in for missing proof.",
      before: "It is clear that adoption will rise.",
      after: "Adoption rose 12% after the pilot.",
      auto: false,
      evidence_policy: "never_invent",
      docs: "https://naturable.app/en/signs-of-ai-writing/#fake-certainty"
    },
    {
      id: "en.hollow.unsourced_everyone",
      name_en: "Unsourced everyone-claim",
      name_zh: "\u65E0\u51FA\u5904\u5168\u79F0\u6982\u62EC",
      layer: "hollow",
      category: "evidence",
      severity: "suggestion",
      confidence: "medium",
      purpose_weights: {
        blog: 1,
        email: 0.9,
        marketing: 1.1,
        general: 1,
        academic: 1.3,
        social: 0.8,
        technical: 1
      },
      detect: {
        type: "regex",
        pattern: "\\b(everyone knows that|as we all know|in today['\u2019]s (?:fast-paced|ever-changing) world)\\b",
        flags: "gi"
      },
      rewrite: "Drop the chorus claim; open with the concrete point.",
      reason: "Appeals to an unnamed consensus instead of a fact.",
      before: "As we all know, speed matters.",
      after: "Speed matters when checkout takes over three seconds.",
      auto: false,
      evidence_policy: "never_invent",
      docs: "https://naturable.app/en/signs-of-ai-writing/#template-openers"
    },
    {
      id: "en.hollow.specificity_cover",
      name_en: "Specificity cover-up risk",
      name_zh: "\u6982\u62EC\u76D6\u4F4F\u5DF2\u6709\u6570\u5B57",
      layer: "hollow",
      category: "evidence",
      severity: "strong",
      confidence: "high",
      purpose_weights: {
        blog: 1.2,
        email: 1.1,
        marketing: 1.3,
        general: 1.1,
        academic: 1.4,
        social: 1,
        technical: 1.3
      },
      detect: {
        type: "heuristic",
        name: "specificity_cover"
      },
      rewrite: "Keep the numbers and names already in the draft; do not replace them with empty summary.",
      reason: "A hollow summary sits next to concrete figures that should stay visible.",
      before: "Revenue hit $4.2M. Experts believe growth is strong.",
      after: "Revenue hit $4.2M, up 18% year over year.",
      auto: false,
      evidence_policy: "keep_numbers",
      docs: "https://naturable.app/en/how-it-works/#rule-en-hollow-specificity_cover"
    },
    {
      id: "en.structure.not_just_but",
      name_en: "Not-just / but frame",
      name_zh: "\u7FFB\u6848\u8154\uFF08\u82F1\u6587\uFF09",
      layer: "structure",
      category: "sentence",
      severity: "strong",
      confidence: "high",
      purpose_weights: {
        blog: 1.1,
        email: 1,
        marketing: 1.2,
        general: 1,
        academic: 0.9,
        social: 1.1,
        technical: 0.8
      },
      detect: {
        type: "regex",
        pattern: "\\b(?:it['\u2019]s|it is|this is|that is|is) not (?:just|only|about)\\b[^.!?]{0,120}?\\b(?:it['\u2019]s|it is)\\b",
        flags: "gi"
      },
      rewrite: "State the main claim directly without the fake contrast.",
      reason: "The 'not just X, it is Y' frame often sounds rehearsed.",
      before: "This technology is not just a tool, it's a pivotal shift.",
      after: "The change cuts review time in half.",
      auto: false,
      evidence_policy: "never_invent",
      docs: "https://naturable.app/en/signs-of-ai-writing/#not-just-frame"
    },
    {
      id: "en.structure.colon_throat",
      name_en: "Colon throat-clearing",
      name_zh: "\u5192\u53F7\u7A7A\u8F6C\u5F15\u5BFC",
      layer: "structure",
      category: "structure",
      severity: "suggestion",
      confidence: "high",
      purpose_weights: {
        blog: 1.1,
        email: 1,
        marketing: 1.2,
        general: 1,
        academic: 0.8,
        social: 1,
        technical: 0.9
      },
      detect: {
        type: "regex",
        pattern: "\\b((?:here['\u2019]s|here is) what you need to know|the (?:key|bottom line|truth) is this|consider the following)\\s*:",
        flags: "gi"
      },
      rewrite: "Delete the empty lead-in; keep the content after the colon.",
      reason: "The phrase announces content instead of delivering it.",
      before: "Here's what you need to know: ship weekly.",
      after: "Ship weekly.",
      auto: true,
      fix: {
        type: "delete"
      },
      evidence_policy: "keep_numbers",
      docs: "https://naturable.app/en/signs-of-ai-writing/#throat-clearing"
    },
    {
      id: "en.structure.list_intro_empty",
      name_en: "Empty list intro",
      name_zh: "\u7A7A\u8F6C\u5217\u8868\u5F15\u5BFC",
      layer: "structure",
      category: "structure",
      severity: "suggestion",
      confidence: "medium",
      purpose_weights: {
        blog: 1.1,
        email: 1,
        marketing: 1.2,
        general: 1,
        academic: 0.7,
        social: 0.9,
        technical: 0.8
      },
      detect: {
        type: "regex",
        pattern: "\\b(there are (?:several|many|numerous) (?:benefits|reasons|ways|factors|things)|the (?:benefits|advantages) (?:are|include) (?:numerous|many))\\b[^.!?]{0,40}:",
        flags: "gi"
      },
      rewrite: "Remove the empty intro; keep the list items intact.",
      reason: "A throat-clearing sentence adds no information before a list.",
      before: "There are several benefits:",
      after: "(keep the list; drop the intro)",
      auto: true,
      fix: {
        type: "delete"
      },
      evidence_policy: "keep_numbers",
      docs: "https://naturable.app/en/signs-of-ai-writing/#throat-clearing"
    },
    {
      id: "en.structure.signpost",
      name_en: "Formulaic signpost",
      name_zh: "\u516C\u5F0F\u5316\u8DEF\u6807",
      layer: "structure",
      category: "structure",
      severity: "suggestion",
      confidence: "medium",
      purpose_weights: {
        blog: 1.2,
        email: 0.9,
        marketing: 1.3,
        general: 1,
        academic: 0.7,
        social: 1.1,
        technical: 0.6
      },
      detect: {
        type: "regex",
        pattern: "\\b(let['\u2019]s dive in|without further ado|in today['\u2019]s (?:world|landscape|digital (?:age|landscape|world))|at the end of the day)\\b",
        flags: "gi"
      },
      rewrite: "Begin with the concrete point.",
      reason: "The opening announces content instead of delivering it.",
      before: "In today's digital landscape, teams ship faster.",
      after: "Teams ship faster when reviews finish same-day.",
      auto: true,
      fix: {
        type: "delete"
      },
      evidence_policy: "keep_numbers",
      docs: "https://naturable.app/en/signs-of-ai-writing/#template-openers"
    },
    {
      id: "en.structure.adjacent_parallel",
      name_en: "Adjacent parallel sentences",
      name_zh: "\u90BB\u53E5\u540C\u6784",
      layer: "structure",
      category: "rhythm",
      severity: "suggestion",
      confidence: "medium",
      purpose_weights: {
        blog: 1.1,
        email: 1,
        marketing: 1.2,
        general: 1,
        academic: 0.9,
        social: 1,
        technical: 0.8
      },
      detect: {
        type: "heuristic",
        name: "adjacent_parallel"
      },
      rewrite: "Vary openings and sentence shape; keep the facts.",
      reason: "Neighboring sentences share the same template.",
      before: "It improves speed. It improves quality. It improves trust.",
      after: "It improves speed. Quality follows when reviews shrink. Trust rises when numbers stay visible.",
      auto: false,
      evidence_policy: "never_invent",
      docs: "https://naturable.app/en/signs-of-ai-writing/#same-shape-sentences"
    },
    {
      id: "en.structure.rule_of_three_slogans",
      name_en: "Empty rule-of-three slogan",
      name_zh: "\u7A7A\u8F6C\u4E09\u9879\u6392\u6BD4",
      layer: "structure",
      category: "sentence",
      severity: "suggestion",
      confidence: "medium",
      purpose_weights: {
        blog: 1,
        email: 0.8,
        marketing: 1.3,
        general: 1,
        academic: 0.6,
        social: 1.1,
        technical: 0.5
      },
      detect: {
        type: "regex",
        pattern: "\\b(better|faster|stronger|smarter|simpler),\\s+(better|faster|stronger|smarter|simpler),\\s+and\\s+(better|faster|stronger|smarter|simpler)\\b",
        flags: "gi"
      },
      rewrite: "Replace the slogan triad with one measurable claim.",
      reason: "Three vague adjectives read like marketing filler.",
      before: "Better, faster, and stronger results await.",
      after: "Median review time dropped from 4 days to 1.",
      auto: false,
      evidence_policy: "never_invent",
      docs: "https://naturable.app/en/how-it-works/#rule-en-structure-rule_of_three_slogans"
    },
    {
      id: "en.structure.in_conclusion",
      name_en: "Stock conclusion opener",
      name_zh: "\u5957\u8BDD\u6536\u5C3E\u5F15\u5BFC",
      layer: "structure",
      category: "structure",
      severity: "suggestion",
      confidence: "high",
      purpose_weights: {
        blog: 1,
        email: 0.8,
        marketing: 1,
        general: 1,
        academic: 0.7,
        social: 0.9,
        technical: 0.7
      },
      detect: {
        type: "regex",
        pattern: "\\b(in conclusion|to (?:summarize|sum up|conclude)|all in all|in summary)\\b[,:]?",
        flags: "gi"
      },
      rewrite: "Delete the stock opener; keep the closing point.",
      reason: "The phrase signals a template ending.",
      before: "In conclusion, ship the smaller release first.",
      after: "Ship the smaller release first.",
      auto: true,
      fix: {
        type: "delete"
      },
      evidence_policy: "keep_numbers",
      docs: "https://naturable.app/en/signs-of-ai-writing/#generic-conclusions"
    },
    {
      id: "en.structure.dash_dense",
      name_en: "Dense em dashes",
      name_zh: "\u7834\u6298\u53F7\u8FC7\u5BC6\uFF08\u82F1\u6587\uFF09",
      layer: "structure",
      category: "rhythm",
      severity: "suggestion",
      confidence: "medium",
      purpose_weights: {
        blog: 1,
        email: 1,
        marketing: 1,
        general: 1,
        academic: 0.8,
        social: 1,
        technical: 0.8
      },
      detect: {
        type: "heuristic",
        name: "en_dash_dense",
        params: {
          min_count: 3,
          per_1000_words: 8
        }
      },
      rewrite: "Swap some dashes for a comma, period, colon or parentheses. Keep the ones doing real work.",
      reason: "Frequent em dashes are a common chatbot habit. A few are fine; a steady stream reads as a template.",
      before: "The plan \u2014 including the dates \u2014 is ready \u2014 and approved.",
      after: "The plan, including the dates, is ready and approved.",
      auto: false,
      evidence_policy: "never_invent",
      docs: "https://naturable.app/en/signs-of-ai-writing/#em-dashes"
    },
    {
      id: "en.structure.positive_negative_parallel",
      name_en: "Whether-or parallelism",
      name_zh: "\u662F\u5426\u5BF9\u79F0\u6392\u6BD4",
      layer: "structure",
      category: "sentence",
      severity: "suggestion",
      confidence: "medium",
      purpose_weights: {
        blog: 1,
        email: 0.9,
        marketing: 1.1,
        general: 1,
        academic: 0.8,
        social: 1,
        technical: 0.7
      },
      detect: {
        type: "regex",
        pattern: "\\bwhether (?:you['\u2019]re|it['\u2019]s|you are|it is) [^.!?]{3,60}?,? or [^.!?]{3,60}?,\\s*(?:this|it|that) (?:is|can be|remains|will be)",
        flags: "gi"
      },
      rewrite: "Pick the relevant case; drop the mirrored fork.",
      reason: "Mirrored whether/or frames often pad a thin claim.",
      before: "Whether you're a beginner or an expert, this is essential.",
      after: "New editors should learn the shortcut first.",
      auto: false,
      evidence_policy: "never_invent",
      docs: "https://naturable.app/en/how-it-works/#rule-en-structure-positive_negative_parallel"
    },
    {
      id: "en.artifact.chat",
      name_en: "Assistant chatter",
      name_zh: "\u52A9\u624B\u5BD2\u6684",
      layer: "artifact",
      category: "artifact",
      severity: "strong",
      confidence: "high",
      purpose_weights: {
        blog: 1.3,
        email: 1.2,
        marketing: 1.3,
        general: 1.2,
        academic: 1.4,
        social: 1.1,
        technical: 1.3
      },
      detect: {
        type: "regex",
        pattern: "\\b(Great question[!.]?|I hope this helps[!.]?|let me know if[^.!?]*|feel free to (?:ask|reach out)[^.!?]*|I['\u2019]d be happy to help[^.!?]*)",
        flags: "gi"
      },
      rewrite: "Delete the aside and address the reader directly.",
      reason: "Leftover assistant phrasing distracts from the document.",
      before: "Great question! Ship weekly.",
      after: "Ship weekly.",
      auto: true,
      fix: {
        type: "delete"
      },
      evidence_policy: "keep_numbers",
      docs: "https://naturable.app/en/signs-of-ai-writing/#assistant-leftovers"
    },
    {
      id: "en.artifact.disclaimer",
      name_en: "Model disclaimer",
      name_zh: "\u6A21\u578B\u514D\u8D23\u58F0\u660E",
      layer: "artifact",
      category: "artifact",
      severity: "strong",
      confidence: "high",
      purpose_weights: {
        blog: 1.3,
        email: 1.2,
        marketing: 1.2,
        general: 1.2,
        academic: 1.4,
        social: 1.1,
        technical: 1.3
      },
      detect: {
        type: "regex",
        pattern: "\\b(as of my last (?:update|knowledge cutoff)|based on the available sources|information may be incomplete|as an AI(?: language)? model[^.!]*)\\b",
        flags: "gi"
      },
      rewrite: "Verify the claim or remove the disclaimer.",
      reason: "This reads like a model limitation rather than document content.",
      before: "As of my last update, the API supports streaming.",
      after: "The API supports streaming as of March 2026.",
      auto: true,
      fix: {
        type: "delete"
      },
      evidence_policy: "keep_numbers",
      docs: "https://naturable.app/en/signs-of-ai-writing/#model-disclaimers"
    },
    {
      id: "en.artifact.let_me",
      name_en: "Assistant scaffolding",
      name_zh: "\u52A9\u624B\u811A\u624B\u67B6",
      layer: "artifact",
      category: "artifact",
      severity: "suggestion",
      confidence: "high",
      purpose_weights: {
        blog: 1.1,
        email: 1,
        marketing: 1.1,
        general: 1,
        academic: 1.2,
        social: 0.9,
        technical: 1
      },
      detect: {
        type: "regex",
        pattern: "\\b(let me (?:explain|break (?:this|it) down|walk you through)|here['\u2019]s a (?:quick )?(?:overview|summary) of)\\b",
        flags: "gi"
      },
      rewrite: "Drop the scaffolding; start with the content.",
      reason: "Assistant staging language is not part of the document voice.",
      before: "Let me explain: we ship on Fridays.",
      after: "We ship on Fridays.",
      auto: true,
      fix: {
        type: "delete"
      },
      evidence_policy: "keep_numbers",
      docs: "https://naturable.app/en/how-it-works/#rule-en-artifact-let_me"
    },
    {
      id: "en.lexicon.filler_phrase",
      name_en: "Wordy filler phrase",
      name_zh: "\u5197\u957F\u586B\u5145\u8BED",
      layer: "lexicon",
      category: "vocabulary",
      severity: "suggestion",
      confidence: "high",
      purpose_weights: {
        blog: 1,
        email: 1.1,
        marketing: 1,
        general: 1,
        academic: 0.7,
        social: 1,
        technical: 0.9
      },
      detect: {
        type: "regex",
        pattern: "\\b(in order to|due to the fact that|it is important to note that|it is worth noting that|for all intents and purposes)\\b",
        flags: "gi"
      },
      rewrite: "Use the shorter alternative.",
      reason: "The phrase adds length without useful meaning.",
      before: "In order to finish, cut scope.",
      after: "To finish, cut scope.",
      auto: true,
      fix: {
        type: "map",
        map: {
          "in order to": "to",
          "due to the fact that": "because",
          "it is important to note that": "",
          "it is worth noting that": "",
          "for all intents and purposes": "essentially"
        }
      },
      evidence_policy: "keep_numbers",
      docs: "https://naturable.app/en/signs-of-ai-writing/#filler-phrases"
    },
    {
      id: "en.lexicon.cliche",
      name_en: "Generic AI diction",
      name_zh: "\u6CDB\u5316 AI \u7528\u8BCD",
      layer: "lexicon",
      category: "vocabulary",
      severity: "strong",
      confidence: "medium",
      purpose_weights: {
        blog: 1.1,
        email: 1,
        marketing: 0.8,
        general: 1,
        academic: 0.5,
        social: 1,
        technical: 0.7
      },
      detect: {
        type: "regex",
        pattern: "\\b(delve|tapestry|realm|showcas(?:e|ing)|leverage|myriad|plethora|seamless(?:ly)?|robust|pivotal|foster(?:ing)?|embark|elevate|harness(?:ing)?|underscore(?:s|d|ing)? the importance|landscape|nestled|boasts)\\b",
        flags: "gi"
      },
      rewrite: "Replace it with a plain, precise word.",
      reason: "This wording is common in polished but nonspecific drafts.",
      before: "We leverage a robust solution.",
      after: "We use Postgres with read replicas.",
      auto: false,
      evidence_policy: "never_invent",
      docs: "https://naturable.app/en/ai-words-to-avoid/#top-words"
    },
    {
      id: "en.lexicon.transition_stack",
      name_en: "Stock transition opener",
      name_zh: "\u5957\u8BDD\u8F6C\u6298\u5F00\u7BC7",
      layer: "lexicon",
      category: "vocabulary",
      severity: "suggestion",
      confidence: "high",
      purpose_weights: {
        blog: 1.1,
        email: 1,
        marketing: 1.1,
        general: 1,
        academic: 0.6,
        social: 1,
        technical: 0.7
      },
      detect: {
        type: "regex",
        pattern: "(^|[.!?\\n]\\s*)(Furthermore|Moreover|Additionally|In addition|Consequently|Hence|Thus|Therefore)\\b",
        flags: "gim"
      },
      rewrite: "Delete or replace with a plain connective that fits the logic.",
      reason: "Sentence-initial stock transitions often mark assistant cadence.",
      before: "Furthermore, costs fell.",
      after: "Costs fell.",
      auto: true,
      fix: {
        type: "replace_match",
        strip: true
      },
      evidence_policy: "keep_numbers",
      docs: "https://naturable.app/en/signs-of-ai-writing/#transition-openers"
    },
    {
      id: "en.lexicon.hedge_stack",
      name_en: "Stacked hedging",
      name_zh: "\u5BF9\u51B2\u8BCD\u5806\u53E0",
      layer: "lexicon",
      category: "sentence",
      severity: "suggestion",
      confidence: "medium",
      purpose_weights: {
        blog: 1,
        email: 1,
        marketing: 1.1,
        general: 1,
        academic: 0.6,
        social: 0.9,
        technical: 0.8
      },
      detect: {
        type: "regex",
        pattern: "\\b(could potentially|may possibly|it (?:could|might) be argued that|tends to somewhat)\\b",
        flags: "gi"
      },
      rewrite: "Keep one qualifier and state the evidence.",
      reason: "Multiple qualifiers make the claim vague.",
      before: "Teams could potentially rethink their work.",
      after: "Teams may rethink their work after the pilot.",
      auto: true,
      fix: {
        type: "map",
        map: {
          "could potentially": "could",
          "may possibly": "may",
          "it could be argued that": "",
          "it might be argued that": "",
          "tends to somewhat": "tends to"
        }
      },
      evidence_policy: "keep_numbers",
      docs: "https://naturable.app/en/signs-of-ai-writing/#stacked-hedges"
    },
    {
      id: "en.lexicon.play_role",
      name_en: "Play a role filler",
      name_zh: "\u53D1\u6325\u4F5C\u7528\u5957\u8BDD",
      layer: "lexicon",
      category: "vocabulary",
      severity: "suggestion",
      confidence: "medium",
      purpose_weights: {
        blog: 1,
        email: 0.9,
        marketing: 1.1,
        general: 1,
        academic: 0.7,
        social: 0.9,
        technical: 0.8
      },
      detect: {
        type: "regex",
        pattern: "\\b(play(?:s|ed|ing)? a (?:vital|important|key|crucial) role|serves? as a testament to)\\b",
        flags: "gi"
      },
      rewrite: "Say what the subject actually does.",
      reason: "The idiom asserts importance without describing the action.",
      before: "Caching plays a vital role in latency.",
      after: "Caching cuts p95 latency by 40%.",
      auto: false,
      evidence_policy: "never_invent",
      docs: "https://naturable.app/en/signs-of-ai-writing/#role-and-journey"
    },
    {
      id: "en.lexicon.journey_unlock",
      name_en: "Journey / unlock cliche",
      name_zh: "\u65C5\u7A0B\u89E3\u9501\u5957\u8BDD",
      layer: "lexicon",
      category: "vocabulary",
      severity: "suggestion",
      confidence: "medium",
      purpose_weights: {
        blog: 1.1,
        email: 0.9,
        marketing: 0.9,
        general: 1,
        academic: 0.5,
        social: 1.1,
        technical: 0.6
      },
      detect: {
        type: "regex",
        pattern: "\\b(embark(?:s|ed|ing)? on a (?:journey|quest)|unlock(?:s|ed|ing)? the (?:full )?potential|game-?changer)\\b",
        flags: "gi"
      },
      rewrite: "Name the concrete change.",
      reason: "Motivational cliches hide the actual mechanism.",
      before: "This unlocks the full potential of the team.",
      after: "This frees two engineers from weekly triage.",
      auto: false,
      evidence_policy: "never_invent",
      docs: "https://naturable.app/en/signs-of-ai-writing/#role-and-journey"
    }
  ]
};

// packs/zh.json
var zh_default = {
  version: "zh-v1.1",
  language: "zh",
  released: "2026-10-22",
  beta: true,
  changelog: [
    "ZH Beta: only 11 validated classes from 283-wan-zi study; banned \u5C11\u7528\u6BD4\u55BB/\u5220\u9664\u8BBE\u95EE/\u53E5\u957F\u5FC5\u987B\u4E0D\u5747\u5300/\u786C\u8865\u5C31.",
    "v1.1: de_stack example had only two \u7684 and could never trigger the 3+ rule; example corrected, pattern unchanged."
  ],
  layer_order: [
    "hollow",
    "structure",
    "artifact",
    "lexicon"
  ],
  banned_rules: [
    {
      id: "zh.banned.less_metaphor",
      label: "\u5C11\u7528\u6BD4\u55BB",
      reason: "Humans use more metaphors; problem is persona type, not metaphor count."
    },
    {
      id: "zh.banned.delete_rhetorical",
      label: "\u5220\u9664\u8BBE\u95EE",
      reason: "Removing rhetorical questions makes text less human."
    },
    {
      id: "zh.banned.force_uneven_length",
      label: "\u53E5\u957F\u5FC5\u987B\u4E0D\u5747\u5300",
      reason: "No difference after corrected segmentation."
    },
    {
      id: "zh.banned.force_jiu",
      label: "\u786C\u8865\u5C31",
      reason: "Directionally plausible but not productizable."
    }
  ],
  class_ids: [
    "zh.para.zero_anaphora",
    "zh.metaphor.ideal_persona",
    "zh.colon.list_intro",
    "zh.colon.prompt",
    "zh.flip.not_but",
    "zh.opener.filler",
    "zh.ordinal.fake_heading",
    "zh.dash.dense",
    "zh.adjacent.parallel",
    "zh.enumeration.dense",
    "zh.translationese"
  ],
  rules: [
    {
      id: "zh.para.zero_anaphora",
      class_id: "zh.para.zero_anaphora",
      name_en: "Paragraph-start zero anaphora comment",
      name_zh: "\u6BB5\u9996\u96F6\u56DE\u6307\u8BC4\u8BBA",
      layer: "structure",
      category: "structure",
      severity: "suggestion",
      confidence: "medium",
      purpose_weights: {
        blog: 1.2,
        email: 1,
        marketing: 1.1,
        general: 1,
        academic: 0.9,
        social: 1,
        technical: 0.8
      },
      detect: {
        type: "heuristic",
        name: "zh_zero_anaphora"
      },
      rewrite: "\u5728\u6BB5\u9996\u8BC4\u4EF7\u524D\u8865\u4E0A\u201C\u8FD9/\u8BE5\u2026\u201D\u56DE\u6307\uFF0C\u6216\u5E76\u5165\u4E0A\u6BB5\u3002",
      reason: "\u6BB5\u9996\u76F4\u63A5\u4E0B\u8BC4\u4EF7\u5374\u7F3A\u5C11\u56DE\u6307\uFF0C\u8BFB\u8D77\u6765\u50CF\u6A21\u677F\u8BC4\u8BBA\u3002",
      before: "\u503C\u5F97\u80AF\u5B9A\u3002\u4EA7\u54C1\u8282\u594F\u66F4\u5FEB\u4E86\u3002",
      after: "\u8FD9\u4E00\u70B9\u503C\u5F97\u80AF\u5B9A\uFF1A\u4EA7\u54C1\u8282\u594F\u66F4\u5FEB\u4E86\u3002",
      auto: false,
      evidence_policy: "never_invent",
      docs: "https://naturable.app/zh-cn/how-it-works/"
    },
    {
      id: "zh.metaphor.ideal_persona",
      class_id: "zh.metaphor.ideal_persona",
      name_en: "Ideal-persona metaphor",
      name_zh: "\u62DF\u4EBA\u5316\u7406\u60F3\u4EBA\u683C\u55BB\u4F53",
      layer: "hollow",
      category: "vocabulary",
      severity: "strong",
      confidence: "high",
      purpose_weights: {
        blog: 1.2,
        email: 1,
        marketing: 1.3,
        general: 1.1,
        academic: 1,
        social: 1.1,
        technical: 0.9
      },
      detect: {
        type: "regex",
        pattern: "(\u667A\u6167\u7684\u5BFC\u5E08|\u4E0D\u77E5\u75B2\u5026\u7684\u52A9\u624B|\u8D34\u5FC3\u7684\u4F19\u4F34|\u5FE0\u8BDA\u7684\u536B\u58EB|\u6C89\u9ED8\u7684\u5B88\u671B\u8005|\u667A\u80FD\u52A9\u624B\u5C31\u50CF[^\u3002\uFF01\uFF1F]{0,20}\u8001\u5E08)",
        flags: "g"
      },
      rewrite: "\u6362\u6210\u5177\u4F53\u7684\u4EBA\u6216\u5220\u6389\u55BB\u4F53\uFF0C\u53EA\u4FDD\u7559\u5B9E\u9645\u4F5C\u7528\u3002",
      reason: "\u7406\u60F3\u4EBA\u683C\u5F0F\u55BB\u4F53\u662F\u4E2D\u6587 AI \u7A3F\u5E38\u89C1\u7A7A\u6D1E\u4FEE\u8F9E\u3002",
      before: "\u5B83\u50CF\u4E00\u4F4D\u667A\u6167\u7684\u5BFC\u5E08\uFF0C\u6307\u5F15\u65B9\u5411\u3002",
      after: "\u503C\u73ED\u5DE5\u7A0B\u5E08\u4F1A\u5728\u544A\u8B66\u540E15\u5206\u949F\u5185\u63A5\u624B\u3002",
      auto: false,
      evidence_policy: "never_invent",
      docs: "https://naturable.app/zh-cn/how-it-works/"
    },
    {
      id: "zh.colon.list_intro",
      class_id: "zh.colon.list_intro",
      name_en: "Empty colon list intro",
      name_zh: "\u5192\u53F7\u6EE5\u7528\xB7\u7A7A\u8F6C\u53E5\u5F15\u5217\u8868",
      layer: "structure",
      category: "structure",
      severity: "suggestion",
      confidence: "high",
      purpose_weights: {
        blog: 1.1,
        email: 1,
        marketing: 1.2,
        general: 1,
        academic: 0.8,
        social: 0.9,
        technical: 0.9
      },
      detect: {
        type: "regex",
        pattern: "(\u5177\u4F53(?:\u6765\u8BF4|\u800C\u8A00)|\u4E3B\u8981\u5305\u62EC|\u6709\u4EE5\u4E0B\u51E0\u70B9|\u53EF\u4EE5\u4ECE\u4EE5\u4E0B\u51E0\u4E2A\u65B9\u9762|\u5305\u62EC\u4EE5\u4E0B\u51E0\u70B9)[:\uFF1A]",
        flags: "g"
      },
      rewrite: "\u5220\u6389\u7A7A\u8F6C\u5F15\u5BFC\uFF0C\u4FDD\u7559\u5217\u8868\u5185\u5BB9\u4E0E\u987A\u5E8F\u3002",
      reason: "\u7A7A\u8F6C\u5F15\u5BFC\u53E5\u4E0D\u589E\u52A0\u4FE1\u606F\uFF0C\u53EA\u662F\u5728\u5F15\u5217\u8868\u3002",
      before: "\u5177\u4F53\u6765\u8BF4\uFF1A\u6210\u672C\u4E0B\u964D\uFF0C\u901F\u5EA6\u63D0\u5347\u3002",
      after: "\u6210\u672C\u4E0B\u964D\uFF0C\u901F\u5EA6\u63D0\u5347\u3002",
      auto: true,
      fix: {
        type: "delete"
      },
      evidence_policy: "keep_numbers",
      docs: "https://naturable.app/zh-cn/how-it-works/"
    },
    {
      id: "zh.colon.prompt",
      class_id: "zh.colon.prompt",
      name_en: "Colon prompt filler",
      name_zh: "\u5192\u53F7\u6EE5\u7528\xB7\u63D0\u793A\u8BED",
      layer: "structure",
      category: "structure",
      severity: "suggestion",
      confidence: "high",
      purpose_weights: {
        blog: 1.1,
        email: 1,
        marketing: 1.1,
        general: 1,
        academic: 0.8,
        social: 1,
        technical: 0.9
      },
      detect: {
        type: "regex",
        pattern: "(\u6838\u5FC3\u662F|\u5173\u952E\u5728\u4E8E|\u91CD\u70B9\u662F|\u672C\u8D28\u4E0A\u662F|\u7B80\u5355\u8BF4\u5C31\u662F)[:\uFF1A]",
        flags: "g"
      },
      rewrite: "\u5220\u6389\u63D0\u793A\u8BED\uFF0C\u76F4\u63A5\u5199\u540E\u9762\u7684\u5185\u5BB9\u3002",
      reason: "\u5192\u53F7\u524D\u7684\u63D0\u793A\u8BED\u5E38\u662F\u52A9\u624B\u8154\u811A\u624B\u67B6\u3002",
      before: "\u6838\u5FC3\u662F\uFF1A\u628A\u8BC4\u5BA1\u65F6\u95F4\u538B\u5230\u4E00\u5929\u5185\u3002",
      after: "\u628A\u8BC4\u5BA1\u65F6\u95F4\u538B\u5230\u4E00\u5929\u5185\u3002",
      auto: true,
      fix: {
        type: "delete"
      },
      evidence_policy: "keep_numbers",
      docs: "https://naturable.app/zh-cn/how-it-works/"
    },
    {
      id: "zh.flip.not_but",
      class_id: "zh.flip.not_but",
      name_en: "Not-A-but-B flip",
      name_zh: "\u7FFB\u6848\u8154\uFF08\u4E0D\u662F\u2026\u2026\u800C\u662F\u2026\u2026\uFF09",
      layer: "structure",
      category: "sentence",
      severity: "strong",
      confidence: "high",
      purpose_weights: {
        blog: 1.2,
        email: 1.1,
        marketing: 1.3,
        general: 1.1,
        academic: 0.9,
        social: 1.2,
        technical: 0.8
      },
      detect: {
        type: "regex",
        pattern: "\u4E0D\u662F[^\u3002\uFF01\uFF1F\uFF1B]{1,30}\u800C\u662F[^\u3002\uFF01\uFF1F\uFF1B]{1,40}",
        flags: "g"
      },
      rewrite: "\u53BB\u6389\u5047\u5BF9\u7ACB\uFF0C\u76F4\u63A5\u9648\u8FF0\u4E3B\u5224\u65AD\u3002",
      reason: "\u5047\u5BF9\u7ACB\u7FFB\u6848\u8154\u662F\u4E2D\u6587 AI \u7A3F\u9AD8\u9891\u7ED3\u6784\u3002",
      before: "\u8FD9\u4E0D\u662F\u5DE5\u5177\u95EE\u9898\uFF0C\u800C\u662F\u6D41\u7A0B\u95EE\u9898\u3002",
      after: "\u8BC4\u5BA1\u6392\u961F\u62D6\u6162\u4E86\u53D1\u5E03\u3002",
      auto: false,
      evidence_policy: "never_invent",
      docs: "https://naturable.app/zh-cn/how-it-works/"
    },
    {
      id: "zh.opener.filler",
      class_id: "zh.opener.filler",
      name_en: "Opener filler",
      name_zh: "\u8D77\u9996\u8BED\u586B\u5145",
      layer: "lexicon",
      category: "vocabulary",
      severity: "suggestion",
      confidence: "high",
      purpose_weights: {
        blog: 1.1,
        email: 1,
        marketing: 1.1,
        general: 1,
        academic: 0.8,
        social: 1,
        technical: 0.9
      },
      detect: {
        type: "regex",
        pattern: "(\u8BF4\u767D\u4E86|\u7B80\u5355\u6765\u8BF4|\u603B\u7684\u6765\u8BF4|\u503C\u5F97\u4E00\u63D0\u7684\u662F|\u4E0D\u53EF\u5426\u8BA4\u7684\u662F|\u6BCB\u5EB8\u7F6E\u7591\u7684\u662F|\u9700\u8981\u6307\u51FA\u7684\u662F)",
        flags: "g"
      },
      rewrite: "\u5220\u9664\u8D77\u9996\u8BED\uFF0C\u6216\u6539\u5199\u6210\u5E26\u5224\u65AD\u7684\u5B8C\u6574\u53E5\u3002",
      reason: "\u8D77\u9996\u586B\u5145\u8BED\u5E38\u53EF\u76F4\u63A5\u5220\u6389\u800C\u4E0D\u635F\u5931\u4FE1\u606F\u3002",
      before: "\u8BF4\u767D\u4E86\uFF0C\u6210\u672C\u5DF2\u7ECF\u4E0B\u964D\u3002",
      after: "\u6210\u672C\u5DF2\u7ECF\u4E0B\u964D\u3002",
      auto: true,
      fix: {
        type: "delete"
      },
      evidence_policy: "keep_numbers",
      docs: "https://naturable.app/zh-cn/how-it-works/"
    },
    {
      id: "zh.ordinal.fake_heading",
      class_id: "zh.ordinal.fake_heading",
      name_en: "Ordinals as fake headings",
      name_zh: "\u5E8F\u6570\u8BCD\u5F53\u5C0F\u6807\u9898",
      layer: "structure",
      category: "structure",
      severity: "suggestion",
      confidence: "medium",
      purpose_weights: {
        blog: 1.1,
        email: 0.9,
        marketing: 1.2,
        general: 1,
        academic: 0.7,
        social: 0.9,
        technical: 0.8
      },
      detect: {
        type: "regex",
        pattern: "(?:^|[\\n\u3002\uFF1B])\\s*(\u7B2C[\u4E00\u4E8C\u4E09\u56DB\u4E94\u516D\u4E03\u516B\u4E5D\u53411-9]|\u9996\u5148|\u5176\u6B21|\u518D\u6B21|\u6700\u540E)[\uFF0C,\u3001]",
        flags: "gm"
      },
      rewrite: "\u964D\u4E3A\u6B63\u6587\u8854\u63A5\uFF0C\u6216\u6539\u6210\u771F\u6B63\u7684\u5C0F\u6807\u9898\uFF0C\u907F\u514D\u5047\u76EE\u5F55\u611F\u3002",
      reason: "\u8FDE\u7EED\u5E8F\u6570\u5F00\u6BB5\u4F1A\u9020\u6210\u6A21\u677F\u63D0\u7EB2\u611F\u3002",
      before: "\u9996\u5148\uFF0C\u63D0\u5347\u6548\u7387\u3002\u5176\u6B21\uFF0C\u964D\u4F4E\u6210\u672C\u3002",
      after: "\u6548\u7387\u5148\u63D0\u5347\uFF1B\u6210\u672C\u4E5F\u4F1A\u8DDF\u7740\u4E0B\u964D\u3002",
      auto: false,
      evidence_policy: "never_invent",
      docs: "https://naturable.app/zh-cn/how-it-works/"
    },
    {
      id: "zh.dash.dense",
      class_id: "zh.dash.dense",
      name_en: "Dense dash usage",
      name_zh: "\u7834\u6298\u53F7\u8FC7\u5BC6",
      layer: "structure",
      category: "rhythm",
      severity: "suggestion",
      confidence: "medium",
      purpose_weights: {
        blog: 1,
        email: 0.9,
        marketing: 1,
        general: 1,
        academic: 0.8,
        social: 1,
        technical: 0.8
      },
      detect: {
        type: "heuristic",
        name: "zh_dash_dense"
      },
      rewrite: "\u964D\u4F4E\u7834\u6298\u53F7\u5BC6\u5EA6\uFF1B\u80FD\u7528\u9017\u53F7\u6216\u53E5\u53F7\u5904\u4F18\u5148\u6539\u5199\u3002\u6CE8\u610F\uFF1A\u90E8\u5206\u6A21\u578B\u66F4\u7231\u7528\u7834\u6298\u53F7\uFF0C\u8FD9\u4E0D\u662F\u4F5C\u8005\u5224\u51B3\u3002",
      reason: "\u7834\u6298\u53F7\u8FC7\u5BC6\u4F1A\u5F62\u6210\u53EF\u8FA8\u8BA4\u7684\u6A21\u578B\u75D5\u8FF9\uFF08Claude/DeepSeek \u66F4\u91CD\uFF09\u3002",
      before: "\u65B9\u6848\u2014\u2014\u5305\u62EC\u6392\u671F\u2014\u2014\u5DF2\u7ECF\u2014\u2014\u786E\u8BA4\u3002",
      after: "\u65B9\u6848\uFF08\u542B\u6392\u671F\uFF09\u5DF2\u7ECF\u786E\u8BA4\u3002",
      auto: false,
      evidence_policy: "never_invent",
      docs: "https://naturable.app/zh-cn/how-it-works/"
    },
    {
      id: "zh.adjacent.parallel",
      class_id: "zh.adjacent.parallel",
      name_en: "Adjacent parallel structure",
      name_zh: "\u76F8\u90BB\u53E5\u7ED3\u6784\u540C\u6B3E",
      layer: "structure",
      category: "rhythm",
      severity: "suggestion",
      confidence: "medium",
      purpose_weights: {
        blog: 1.1,
        email: 1,
        marketing: 1.2,
        general: 1,
        academic: 0.9,
        social: 1,
        technical: 0.8
      },
      detect: {
        type: "heuristic",
        name: "zh_adjacent_parallel"
      },
      rewrite: "\u62C6\u5F00\u540C\u6784\uFF0C\u8BA9\u53E5\u5F0F\u8DDF\u7740\u4FE1\u606F\u53D8\u5316\u3002",
      reason: "\u76F8\u90BB\u53E5\u540C\u4E00\u6A21\u677F\u662F\u4E2D\u6587 AI \u7A3F\u5E38\u89C1\u7ED3\u6784\u95EE\u9898\u3002",
      before: "\u5B83\u63D0\u5347\u4E86\u6548\u7387\u3002\u5B83\u964D\u4F4E\u4E86\u6210\u672C\u3002\u5B83\u6539\u5584\u4E86\u4F53\u9A8C\u3002",
      after: "\u6548\u7387\u5148\u4E0A\u53BB\uFF1B\u6210\u672C\u968F\u6279\u91CF\u4E0B\u964D\u3002\u4F53\u9A8C\u5219\u6765\u81EA\u66F4\u77ED\u7684\u7B49\u5F85\u3002",
      auto: false,
      evidence_policy: "never_invent",
      docs: "https://naturable.app/zh-cn/how-it-works/"
    },
    {
      id: "zh.enumeration.dense",
      class_id: "zh.enumeration.dense",
      name_en: "Dense enumeration pauses",
      name_zh: "\u987F\u53F7\u7F57\u5217\u8FC7\u5BC6",
      layer: "structure",
      category: "sentence",
      severity: "suggestion",
      confidence: "medium",
      purpose_weights: {
        blog: 1,
        email: 0.9,
        marketing: 1.1,
        general: 1,
        academic: 0.8,
        social: 0.9,
        technical: 0.9
      },
      detect: {
        type: "heuristic",
        name: "zh_enumeration_dense"
      },
      rewrite: "\u62C6\u6210\u77ED\u53E5\uFF0C\u6216\u5220\u6389\u5F31\u9879\uFF0C\u907F\u514D\u4E00\u957F\u4E32\u987F\u53F7\u5806\u53E0\u3002",
      reason: "\u987F\u53F7\u8FC7\u5BC6\u4F1A\u8BA9\u4FE1\u606F\u53D8\u6210\u6E05\u5355\u800C\u4E0D\u662F\u8BBA\u8FF0\u3002",
      before: "\u6DB5\u76D6\u6548\u7387\u3001\u8D28\u91CF\u3001\u4F53\u9A8C\u3001\u6210\u672C\u3001\u5B89\u5168\u3001\u5408\u89C4\u3001\u6269\u5C55\u3002",
      after: "\u5148\u770B\u6548\u7387\u4E0E\u8D28\u91CF\uFF1B\u6210\u672C\u3001\u5B89\u5168\u53E6\u5F00\u4E00\u8282\u3002",
      auto: false,
      evidence_policy: "never_invent",
      docs: "https://naturable.app/zh-cn/how-it-works/"
    },
    {
      id: "zh.translationese.passive",
      class_id: "zh.translationese",
      name_en: "Translationese passive",
      name_zh: "\u7FFB\u8BD1\u8154\xB7\u88AB\u52A8\u5806\u53E0",
      layer: "lexicon",
      category: "sentence",
      severity: "suggestion",
      confidence: "medium",
      purpose_weights: {
        blog: 1,
        email: 1,
        marketing: 1,
        general: 1,
        academic: 0.8,
        social: 0.9,
        technical: 0.9
      },
      detect: {
        type: "regex",
        pattern: "(\u88AB[^\u3002\uFF01\uFF1F]{0,8}\u6240[^\u3002\uFF01\uFF1F]{1,12}|\u88AB\u8FDB\u884C|\u88AB\u4E88\u4EE5)",
        flags: "g"
      },
      rewrite: "\u6539\u6210\u4E3B\u52A8\u8868\u8FF0\uFF0C\u8BF4\u660E\u8C01\u505A\u4E86\u4EC0\u4E48\u3002",
      reason: "\u6B27\u5316\u88AB\u52A8\u662F\u7FFB\u8BD1\u8154\u5B50\u7C7B\u4E4B\u4E00\u3002",
      before: "\u65B9\u6848\u88AB\u56E2\u961F\u6240\u8BA4\u53EF\u3002",
      after: "\u56E2\u961F\u8BA4\u53EF\u4E86\u8FD9\u5957\u65B9\u6848\u3002",
      auto: false,
      evidence_policy: "never_invent",
      docs: "https://naturable.app/zh-cn/how-it-works/"
    },
    {
      id: "zh.translationese.de_stack",
      class_id: "zh.translationese",
      name_en: "Translationese \u7684-stack",
      name_zh: "\u7FFB\u8BD1\u8154\xB7\u7684\u5B57\u94FE",
      layer: "lexicon",
      category: "vocabulary",
      severity: "suggestion",
      confidence: "medium",
      purpose_weights: {
        blog: 1,
        email: 1,
        marketing: 1,
        general: 1,
        academic: 0.9,
        social: 0.9,
        technical: 0.9
      },
      detect: {
        type: "regex",
        pattern: "([\\u4e00-\\u9fff]{1,6}\u7684){3,}[\\u4e00-\\u9fff]{1,8}",
        flags: "g"
      },
      rewrite: "\u6253\u65AD\u201C\u7684\u201D\u5B57\u94FE\uFF0C\u6539\u6210\u77ED\u53E5\u6216\u52A8\u8BCD\u7ED3\u6784\u3002",
      reason: "\u8FDE\u7EED\u201C\u7684\u201D\u5B57\u94FE\u662F\u7FFB\u8BD1\u8154\u5E38\u89C1\u8868\u9762\u7279\u5F81\u3002",
      before: "\u8FD9\u662F\u6211\u4EEC\u56E2\u961F\u7684\u975E\u5E38\u91CD\u8981\u7684\u9700\u8981\u91CD\u89C6\u7684\u95EE\u9898\u3002",
      after: "\u8FD9\u4E2A\u95EE\u9898\u9700\u8981\u8BA4\u771F\u5BF9\u5F85\u3002",
      auto: false,
      evidence_policy: "never_invent",
      docs: "https://naturable.app/zh-cn/how-it-works/"
    },
    {
      id: "zh.translationese.men",
      class_id: "zh.translationese",
      name_en: "Translationese \u4EEC abuse",
      name_zh: "\u7FFB\u8BD1\u8154\xB7\u4EEC\u5B57\u6EE5\u7528",
      layer: "lexicon",
      category: "vocabulary",
      severity: "suggestion",
      confidence: "medium",
      purpose_weights: {
        blog: 0.9,
        email: 0.9,
        marketing: 1,
        general: 1,
        academic: 0.8,
        social: 0.9,
        technical: 0.8
      },
      detect: {
        type: "regex",
        pattern: "(\u7528\u6237\u4EEC|\u8BFB\u8005\u4EEC|\u5F00\u53D1\u8005\u4EEC|\u4EBA\u4EEC\u4EEC)",
        flags: "g"
      },
      rewrite: "\u4E2D\u6587\u590D\u6570\u5E38\u53EF\u7701\u7565\u201C\u4EEC\u201D\uFF0C\u6216\u6539\u6210\u5177\u4F53\u7FA4\u4F53\u540D\u3002",
      reason: "\u4E0D\u5FC5\u8981\u7684\u201C\u4EEC\u201D\u5E38\u6765\u81EA\u82F1\u6587\u590D\u6570\u76F4\u8BD1\u3002",
      before: "\u7528\u6237\u4EEC\u53EF\u4EE5\u5BFC\u51FA\u7ED3\u679C\u3002",
      after: "\u7528\u6237\u53EF\u4EE5\u5BFC\u51FA\u7ED3\u679C\u3002",
      auto: true,
      fix: {
        type: "map",
        map: {
          \u7528\u6237\u4EEC: "\u7528\u6237",
          \u8BFB\u8005\u4EEC: "\u8BFB\u8005",
          \u5F00\u53D1\u8005\u4EEC: "\u5F00\u53D1\u8005",
          \u4EBA\u4EEC\u4EEC: "\u4EBA\u4EEC"
        }
      },
      evidence_policy: "keep_numbers",
      docs: "https://naturable.app/zh-cn/how-it-works/"
    },
    {
      id: "zh.translationese.ongoing",
      class_id: "zh.translationese",
      name_en: "Translationese progressive padding",
      name_zh: "\u7FFB\u8BD1\u8154\xB7\u8FDB\u884C\u65F6\u57AB\u8BDD",
      layer: "lexicon",
      category: "vocabulary",
      severity: "suggestion",
      confidence: "medium",
      purpose_weights: {
        blog: 1,
        email: 1,
        marketing: 1,
        general: 1,
        academic: 0.8,
        social: 0.9,
        technical: 0.9
      },
      detect: {
        type: "regex",
        pattern: "(\u6B63\u5728\u8FDB\u884C\u7740?|\u8FDB\u884C\u4E00\u4E2A|\u505A\u51FA\u4E00\u4E2A[^\u3002\uFF01\uFF1F]{0,6}\u7684?(?:\u51B3\u5B9A|\u9009\u62E9|\u6539\u53D8))",
        flags: "g"
      },
      rewrite: "\u5220\u6389\u8FDB\u884C\u65F6\u57AB\u8BDD\uFF0C\u76F4\u63A5\u7528\u52A8\u8BCD\u3002",
      reason: "\u8FDB\u884C\u65F6\u57AB\u8BDD\u591A\u6765\u81EA\u82F1\u6587\u8FDB\u884C\u4F53\u76F4\u8BD1\u3002",
      before: "\u6211\u4EEC\u6B63\u5728\u8FDB\u884C\u7740\u8BC4\u4F30\u3002",
      after: "\u6211\u4EEC\u5728\u8BC4\u4F30\u3002",
      auto: true,
      fix: {
        type: "map",
        map: {
          \u6B63\u5728\u8FDB\u884C\u7740: "\u5728",
          \u6B63\u5728\u8FDB\u884C: "\u5728"
        }
      },
      evidence_policy: "keep_numbers",
      docs: "https://naturable.app/zh-cn/how-it-works/"
    },
    {
      id: "zh.translationese.one_of",
      class_id: "zh.translationese",
      name_en: "Translationese one-of stack",
      name_zh: "\u7FFB\u8BD1\u8154\xB7\u4E4B\u4E00\u5806\u53E0",
      layer: "lexicon",
      category: "vocabulary",
      severity: "suggestion",
      confidence: "medium",
      purpose_weights: {
        blog: 1,
        email: 0.9,
        marketing: 1.1,
        general: 1,
        academic: 0.8,
        social: 1,
        technical: 0.8
      },
      detect: {
        type: "regex",
        pattern: "(\u6700[^\u3002\uFF01\uFF1F]{0,8}\u4E4B\u4E00|\u4E4B\u4E00[^\u3002\uFF01\uFF1F]{0,6}\u4E4B\u4E00)",
        flags: "g"
      },
      rewrite: "\u80FD\u8BF4\u7A0B\u5EA6\u5C31\u8BF4\u7A0B\u5EA6\uFF0C\u907F\u514D\u7A7A\u6D1E\u201C\u4E4B\u4E00\u201D\u3002",
      reason: "\u201C\u6700\u2026\u4E4B\u4E00\u201D\u5E38\u662F\u82F1\u6587 one of the \u76F4\u8BD1\u57AB\u8BDD\u3002",
      before: "\u8FD9\u662F\u6700\u91CD\u8981\u7684\u6311\u6218\u4E4B\u4E00\u3002",
      after: "\u8FD9\u662F\u773C\u4E0B\u6700\u7D27\u7684\u6311\u6218\u3002",
      auto: false,
      evidence_policy: "never_invent",
      docs: "https://naturable.app/zh-cn/how-it-works/"
    },
    {
      id: "zh.artifact.chat",
      name_en: "ZH assistant chatter",
      name_zh: "\u52A9\u624B\u5BD2\u6684",
      layer: "artifact",
      category: "artifact",
      severity: "strong",
      confidence: "high",
      purpose_weights: {
        blog: 1.3,
        email: 1.2,
        marketing: 1.3,
        general: 1.2,
        academic: 1.4,
        social: 1.1,
        technical: 1.3
      },
      detect: {
        type: "regex",
        pattern: "(\u5F88\u9AD8\u5174\u4E3A\u4F60\u89E3\u7B54[\uFF01!]?|\u5E0C\u671B\u8FD9\u5BF9\u4F60\u6709\u6240\u5E2E\u52A9[\uFF01!]?|\u5982\u679C\u4F60\u8FD8\u6709\u4EFB\u4F55\u95EE\u9898[^\u3002\uFF01\uFF1F!?]*)",
        flags: "g"
      },
      rewrite: "\u5220\u9664\u5BD2\u6684\uFF0C\u76F4\u63A5\u8FDB\u5165\u5185\u5BB9\u3002",
      reason: "\u8FD9\u662F\u5BF9\u8BDD\u52A9\u624B\u6B8B\u7559\uFF0C\u4E0D\u5C5E\u4E8E\u6B63\u6587\u3002",
      before: "\u5E0C\u671B\u8FD9\u5BF9\u4F60\u6709\u6240\u5E2E\u52A9\uFF01\u6210\u672C\u5DF2\u4E0B\u964D\u3002",
      after: "\u6210\u672C\u5DF2\u4E0B\u964D\u3002",
      auto: true,
      fix: {
        type: "delete"
      },
      evidence_policy: "keep_numbers",
      docs: "https://naturable.app/zh-cn/how-it-works/"
    }
  ]
};

// src/text.js
function detectLanguage(text) {
  const zh = (text.match(/[㐀-鿿]/g) || []).length;
  const en = (text.match(/[A-Za-z]/g) || []).length;
  if (zh && en && zh / (zh + en) > 0.18 && en / (zh + en) > 0.18) return "mixed";
  if (zh > en * 0.18) return "zh";
  if (en) return "en";
  return "unknown";
}
function sentences(text, language) {
  if (language === "zh") {
    return text.split(/(?<=[。！？；!?])\s*/).map((x) => x.trim()).filter(Boolean);
  }
  return text.replace(/\n+/g, " ").split(/(?<=[.!?])\s+/).map((x) => x.trim()).filter(Boolean);
}
function sentenceLengths(text, language) {
  return sentences(text, language).map(
    (s) => language === "zh" ? (s.match(/[㐀-鿿A-Za-z0-9]/g) || []).length : s.split(/\s+/).filter(Boolean).length
  );
}
function burstiness(text, language) {
  const lens = sentenceLengths(text, language);
  if (lens.length < 2) return { cv: 0, mean: lens[0] || 0, sd: 0, n: lens.length, lengths: lens };
  const mean = lens.reduce((a, b) => a + b, 0) / lens.length;
  const sd = Math.sqrt(lens.reduce((a, b) => a + (b - mean) ** 2, 0) / lens.length);
  return { cv: mean ? sd / mean : 0, mean, sd, n: lens.length, lengths: lens };
}
function wordCount(text, language) {
  if (language === "zh") return (text.match(/[㐀-鿿]/g) || []).length;
  const t = text.trim();
  return t ? t.split(/\s+/).length : 0;
}
function extractFacts(text) {
  const numbers = text.match(/\d+(?:[.,]\d+)?%?/g) || [];
  const money = text.match(/\$\d+(?:[.,]\d+)?[MBKmbk]?/g) || [];
  const enNames = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b/g) || [];
  const zhNames = text.match(/[一-鿿]{2,4}(?:先生|女士|老师|教授|博士|公司|大学)/g) || [];
  return {
    numbers: /* @__PURE__ */ new Set([...numbers, ...money]),
    names: /* @__PURE__ */ new Set([...enNames, ...zhNames])
  };
}
function conservesInformation(before, after) {
  const b = extractFacts(before);
  const a = extractFacts(after);
  for (const n of b.numbers) {
    if (![...a.numbers].some((x) => x === n) && !after.includes(n)) return false;
  }
  for (const n of a.numbers) {
    if (![...b.numbers].some((x) => x === n) && !before.includes(n)) return false;
  }
  for (const name of a.names) {
    if (!b.names.has(name) && !before.includes(name)) return false;
  }
  return true;
}
function normalizeAfterFix(text) {
  return text.replace(/[ \t]{2,}/g, " ").replace(/\s+([,.!?;:，。！？；：])/g, "$1").replace(/([.!?。！？])\s*[.!?。！？]+/g, "$1").replace(/([.!?。！？])\s*[,，;；:：]+\s*/g, "$1 ").replace(/ +\n/g, "\n").replace(/^\s*[,，;；:：]+\s*/gm, "").replace(/(^|\n)\s+/g, "$1").trim().replace(/(^|[.!?]\s+)([a-z])/g, (m, p, c) => p + c.toUpperCase());
}

// src/heuristics.js
function locate(text, needle, from) {
  const at = text.indexOf(needle, from);
  return at >= 0 ? at : text.indexOf(needle);
}
var HEURISTICS = {
  adjacent_parallel(text, language) {
    if (language !== "en") return [];
    const hits = [];
    const s = sentences(text, "en");
    let cursor = 0;
    for (let i = 0; i < s.length - 1; i++) {
      const a = s[i], b = s[i + 1];
      const start = locate(text, a, cursor);
      if (start >= 0) cursor = start + a.length;
      const wa = (a.match(/^\W*([A-Za-z]+)/) || [])[1];
      const wb = (b.match(/^\W*([A-Za-z]+)/) || [])[1];
      if (!wa || !wb) continue;
      if (wa.toLowerCase() === wb.toLowerCase() && a.split(/\s+/).length <= 12 && b.split(/\s+/).length <= 12) {
        if (start >= 0) hits.push({ start, end: start + a.length, text: a });
      }
    }
    return hits;
  },
  specificity_cover(text) {
    const hits = [];
    if (!/\d/.test(text)) return hits;
    const hollow = /\b(experts (?:believe|say)|studies (?:show|suggest)|growth is strong|significant (?:impact|progress))\b/gi;
    let m;
    while (m = hollow.exec(text)) hits.push({ start: m.index, end: m.index + m[0].length, text: m[0] });
    return hits;
  },
  // New in en-v1.1: per-dash hits once em-dash density crosses the threshold.
  en_dash_dense(text, language, params = {}) {
    if (language !== "en") return [];
    const minCount = params.min_count ?? 3;
    const perThousand = params.per_1000_words ?? 8;
    const re = /\s?(?:—|--)\s?/g;
    const found = [];
    let m;
    while (m = re.exec(text)) found.push({ start: m.index, end: m.index + m[0].length, text: m[0] });
    const words = wordCount(text, "en") || 1;
    if (found.length >= minCount && found.length / words * 1e3 >= perThousand) return found;
    return [];
  },
  zh_adjacent_parallel(text, language) {
    if (language !== "zh") return [];
    const hits = [];
    const s = sentences(text, "zh");
    let cursor = 0;
    for (let i = 0; i < s.length - 1; i++) {
      const a = s[i], b = s[i + 1];
      const start = locate(text, a, cursor);
      if (start >= 0) cursor = start + a.length;
      if (a.length < 4 || b.length < 4) continue;
      const ha = a.slice(0, 1), hb = b.slice(0, 1);
      const sameVerbShape = /^(它|他|她|这|那|我们|他们)/.test(a) && ha === hb && Math.abs(a.length - b.length) <= 4;
      if (sameVerbShape || a.slice(0, 2) === b.slice(0, 2)) {
        if (start >= 0) hits.push({ start, end: start + a.length, text: a });
      }
    }
    return hits;
  },
  zh_dash_dense(text, language) {
    if (language !== "zh") return [];
    const dashes = (text.match(/——|—/g) || []).length;
    const chars = (text.match(/[㐀-鿿]/g) || []).length || 1;
    if (dashes >= 3 && dashes / chars > 0.02) {
      return [{ start: 0, end: Math.min(text.length, 12), text: text.slice(0, 12), document: true }];
    }
    return [];
  },
  zh_enumeration_dense(text, language) {
    if (language !== "zh") return [];
    const hits = [];
    const re = /[^、\n]{1,12}(?:、[^、\n]{1,12}){4,}/g;
    let m;
    while (m = re.exec(text)) hits.push({ start: m.index, end: m.index + m[0].length, text: m[0] });
    return hits;
  },
  zh_zero_anaphora(text, language) {
    if (language !== "zh") return [];
    const hits = [];
    const evalStart = /^(值得肯定|令人振奋|至关重要|显而易见|不难发现|总而言之)/;
    const re = /[^\n]+/g;
    let m;
    while (m = re.exec(text)) {
      const para = m[0];
      const trimmed = para.trim();
      if (trimmed && evalStart.test(trimmed) && !/^(这|该|上述|此)/.test(trimmed)) {
        const start = m.index + para.indexOf(trimmed);
        const slice = trimmed.slice(0, Math.min(12, trimmed.length));
        hits.push({ start, end: start + slice.length, text: slice });
      }
    }
    return hits;
  }
};
function heuristicHits(rule, text, language) {
  const name = rule.detect && rule.detect.name;
  const fn = HEURISTICS[name];
  if (!fn) return [];
  return fn(text, language, rule.detect.params);
}
var HEURISTIC_NAMES = Object.keys(HEURISTICS);

// src/fix.js
function applyFixSpec(spec, matchText, matchArr) {
  if (!spec) return matchText;
  switch (spec.type) {
    case "delete":
      return "";
    case "map": {
      const key = String(matchText);
      if (Object.prototype.hasOwnProperty.call(spec.map, key)) return spec.map[key];
      const lower = key.toLowerCase();
      for (const [k, v] of Object.entries(spec.map)) if (k.toLowerCase() === lower) return v;
      return matchText;
    }
    case "replace_match":
      return matchArr && matchArr.length > 2 ? matchArr[1] || "" : "";
    case "replace":
      return typeof spec.with === "string" ? spec.with : matchText;
    default:
      return matchText;
  }
}

// src/score.js
function documentIssues(text, language) {
  if (language !== "en" && language !== "zh") return [];
  const s = sentences(text, language);
  if (s.length < 4) return [];
  const starts = s.map((x) => language === "zh" ? x.slice(0, 2) : (x.match(/^\W*([A-Za-z]+)/) || [])[1]?.toLowerCase()).filter(Boolean);
  const freq = {};
  starts.forEach((x) => {
    freq[x] = (freq[x] || 0) + 1;
  });
  const best = Object.entries(freq).sort((a, b) => b[1] - a[1])[0];
  if (!best || best[1] / s.length < 0.6) return [];
  const zh = language === "zh";
  const reason = zh ? `${s.length} \u4E2A\u53E5\u5B50\u4E2D\u6709 ${best[1]} \u4E2A\u4EE5\u201C${best[0]}\u201D\u5F00\u5934\u3002` : `${best[1]} of ${s.length} sentences begin with \u201C${best[0]}\u201D.`;
  return [{
    id: `${language}.rhythm.repeated_start:doc`,
    rule: {
      id: `${language}.rhythm.repeated_start`,
      language,
      layer: "structure",
      category: "rhythm",
      severity: "suggestion",
      confidence: "medium",
      title: zh ? "\u53E5\u9996\u540C\u6784" : "Repeated sentence openings",
      reason,
      suggestion: zh ? "\u8C03\u6574\u53E5\u9996\u4E0E\u53E5\u5B50\u91CD\u5FC3\u3002" : "Vary the opening and sentence focus.",
      auto: false,
      safeFix: false,
      weight: 1,
      docs: zh ? "https://naturable.app/zh-cn/how-it-works/" : "https://naturable.app/en/signs-of-ai-writing/#same-shape-sentences"
    },
    start: null,
    end: null,
    text: "",
    document: true,
    layer: "structure"
  }];
}
function score(text, issues, language) {
  const counts = { vocabulary: 0, sentence: 0, structure: 0, rhythm: 0, evidence: 0, artifact: 0 };
  for (const i of issues) {
    const w = i.rule.weight || 1;
    const base = i.rule.severity === "strong" ? 8 : 4;
    const cat = i.rule.category || "vocabulary";
    counts[cat] = (counts[cat] || 0) + base * w;
  }
  const b = language === "en" || language === "zh" ? burstiness(text, language) : { n: 0, cv: 0 };
  const rhythm = b.n < 3 ? null : Math.max(35, Math.min(100, Math.round(55 + b.cv * 55)));
  const dimensions = {
    clarity: Math.max(0, 100 - counts.vocabulary - counts.sentence),
    specificity: Math.max(0, 100 - counts.evidence * 1.4),
    rhythm,
    structure: Math.max(0, 100 - counts.structure - counts.rhythm),
    artifactFree: Math.max(0, 100 - counts.artifact * 1.8)
  };
  const vals = Object.values(dimensions).filter((x) => x !== null);
  const raw = Math.round(vals.reduce((a, v) => a + v, 0) / vals.length);
  const strong = issues.filter((i) => i.rule.severity === "strong").length;
  const artifacts = issues.filter((i) => i.rule.severity === "strong" && i.rule.category === "artifact").length;
  let cap = 100;
  if (strong >= 5) cap = 64;
  else if (strong >= 3) cap = 72;
  else if (strong >= 1) cap = 86;
  if (artifacts) cap = Math.min(cap, 68);
  return { total: Math.min(raw, cap), raw, cap, dimensions, rhythm: b, strong, suggestions: issues.length - strong };
}

// src/engine.js
var ENGINE_VERSION = "3.0.0";
var LAYER_ORDER = ["hollow", "structure", "artifact", "lexicon"];
var LAYER_RANK = Object.fromEntries(LAYER_ORDER.map((l, i) => [l, i]));
var PURPOSES = ["general", "blog", "email", "marketing", "academic", "social", "technical"];
var rank = (layer) => LAYER_RANK[layer] ?? 99;
function makeRe(pattern, flags) {
  const f = flags || "g";
  return new RegExp(pattern, f.includes("g") ? f : f + "g");
}
function compileRule(raw, packVersion, language) {
  const detect = raw.detect || {};
  const rule = {
    id: raw.id,
    class_id: raw.class_id || null,
    language,
    layer: raw.layer || "lexicon",
    category: raw.category || raw.layer || "vocabulary",
    severity: raw.severity || "suggestion",
    confidence: raw.confidence || "medium",
    name_en: raw.name_en,
    name_zh: raw.name_zh,
    title: language === "zh" ? raw.name_zh || raw.name_en : raw.name_en || raw.name_zh,
    reason: raw.reason || "",
    suggestion: raw.rewrite || "",
    before: raw.before || "",
    after: raw.after || "",
    auto: !!raw.auto,
    fixSpec: raw.fix || null,
    evidence_policy: raw.evidence_policy || "never_invent",
    purpose_weights: raw.purpose_weights || {},
    docs: raw.docs || null,
    packVersion,
    detect
  };
  if (detect.type === "regex") rule.re = makeRe(detect.pattern, detect.flags);
  return rule;
}
function issueKey(issue) {
  return `${issue.rule.id}:${(issue.text || "").toLowerCase()}`;
}
function createEngine({ packs: packs2 }) {
  const rules = [];
  for (const lang of Object.keys(packs2)) {
    const pack = packs2[lang];
    if (!pack) continue;
    (pack.rules || []).forEach((raw) => rules.push(compileRule(raw, pack.version, pack.language || lang)));
  }
  rules.sort((a, b) => rank(a.layer) - rank(b.layer));
  function effectiveRule(rule, purpose) {
    const w = typeof rule.purpose_weights[purpose] === "number" ? rule.purpose_weights[purpose] : 1;
    let { severity, confidence } = rule;
    if (w < 0.75 && severity === "strong") {
      severity = "suggestion";
      confidence = "medium";
    }
    return { ...rule, severity, confidence, weight: w, safeFix: rule.auto && !!rule.fixSpec };
  }
  function scan(text, opts = {}) {
    const purpose = opts.purpose || "general";
    const ignoredRules = opts.ignoredRules || /* @__PURE__ */ new Set();
    const ignoredKeys = opts.ignoredKeys || /* @__PURE__ */ new Set();
    const detected = opts.language && opts.language !== "auto" ? opts.language : detectLanguage(text);
    const languages = detected === "mixed" ? ["en", "zh"] : [detected];
    const found = [];
    for (const r of rules) {
      if (!languages.includes(r.language)) continue;
      if (opts.only && !opts.only.has(r.id)) continue;
      if (ignoredRules.has(r.id)) continue;
      const eff = effectiveRule(r, purpose);
      const push = (hit) => {
        if (!ignoredKeys.has(issueKey(hit))) found.push(hit);
      };
      if (r.detect.type === "heuristic") {
        for (const h of heuristicHits(r, text, r.language)) {
          push({
            id: `${r.id}:${h.start}:${(h.text || "").length}`,
            rule: eff,
            start: h.document ? null : h.start,
            end: h.document ? null : h.end,
            text: h.text || "",
            document: !!h.document,
            layer: r.layer
          });
        }
        continue;
      }
      if (!r.re) continue;
      r.re.lastIndex = 0;
      let m;
      while (m = r.re.exec(text)) {
        if (!m[0]) {
          r.re.lastIndex++;
          continue;
        }
        push({
          id: `${r.id}:${m.index}:${m[0].length}`,
          rule: eff,
          start: m.index,
          end: m.index + m[0].length,
          text: m[0],
          match: [...m],
          document: false,
          layer: r.layer
        });
      }
    }
    const kept = found.filter((i) => i.document);
    found.filter((i) => !i.document).sort((a, b) => a.start - b.start || rank(a.layer) - rank(b.layer) || b.end - a.end).forEach((i) => {
      const clash = kept.find((k) => !k.document && !(i.end <= k.start || i.start >= k.end));
      if (!clash) {
        kept.push(i);
        return;
      }
      if (rank(i.layer) < rank(clash.layer)) kept[kept.indexOf(clash)] = i;
    });
    kept.sort((a, b) => {
      const la = rank(a.layer), lb = rank(b.layer);
      if (la !== lb) return la - lb;
      const sa = a.rule.severity === "strong" ? 0 : 1;
      const sb = b.rule.severity === "strong" ? 0 : 1;
      if (sa !== sb) return sa - sb;
      return (a.start ?? 1e15) - (b.start ?? 1e15);
    });
    return kept;
  }
  function analyze(text, opts = {}) {
    const detected = opts.language && opts.language !== "auto" ? opts.language : detectLanguage(text);
    const issues = scan(text, opts).concat(documentIssues(text, detected));
    return { language: detected, issues, score: score(text, issues, detected) };
  }
  function proposedFix(text, issue) {
    if (!issue || issue.document || issue.start == null) return null;
    if (!issue.rule.auto || !issue.rule.fixSpec) return null;
    const replacement = applyFixSpec(issue.rule.fixSpec, issue.text, issue.match);
    return normalizeAfterFix(text.slice(0, issue.start) + replacement + text.slice(issue.end));
  }
  function applyIssue(text, issue) {
    const after = proposedFix(text, issue);
    if (after == null) return { ok: false, text, reason: "not_auto" };
    if (!conservesInformation(text, after)) return { ok: false, text, reason: "conservation" };
    return { ok: true, text: after };
  }
  function autofix(text, issues) {
    const safe = issues.filter((i) => !i.document && i.rule.auto && i.rule.fixSpec && i.start != null).sort((a, b) => b.start - a.start);
    let out = text;
    let applied = 0;
    for (const i of safe) {
      const replacement = applyFixSpec(i.rule.fixSpec, i.text, i.match);
      const proposed = out.slice(0, i.start) + replacement + out.slice(i.end);
      if (!conservesInformation(out, proposed)) continue;
      out = proposed;
      applied++;
    }
    return { text: normalizeAfterFix(out), applied, skipped: safe.length - applied };
  }
  return { rules, scan, analyze, applyIssue, autofix, proposedFix, issueKey };
}

// src/diff.js
function tokens(text) {
  return text.match(/[㐀-鿿]|[A-Za-z0-9_]+|\s+|[^\s\w㐀-鿿]/g) || [];
}
function diff(a, b) {
  const A = tokens(a), B = tokens(b), n = A.length, m = B.length;
  if (n * m > 25e4) {
    return { ops: [{ type: "del", text: a }, { type: "add", text: b }], added: m, removed: n, changes: 1 };
  }
  const dp = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i2 = n - 1; i2 >= 0; i2--)
    for (let j2 = m - 1; j2 >= 0; j2--)
      dp[i2][j2] = A[i2] === B[j2] ? dp[i2 + 1][j2 + 1] + 1 : Math.max(dp[i2 + 1][j2], dp[i2][j2 + 1]);
  const ops = [];
  let i = 0, j = 0, added = 0, removed = 0, changes = 0, last = "same";
  const push = (type, text) => {
    const prev = ops[ops.length - 1];
    if (prev && prev.type === type) prev.text += text;
    else ops.push({ type, text });
  };
  while (i < n || j < m) {
    let type, val;
    if (i < n && j < m && A[i] === B[j]) {
      type = "same";
      val = A[i++];
      j++;
    } else if (j < m && (i === n || dp[i][j + 1] >= dp[i + 1][j])) {
      type = "add";
      val = B[j++];
      added++;
    } else {
      type = "del";
      val = A[i++];
      removed++;
    }
    if (type !== "same" && last !== type) changes++;
    push(type, val);
    last = type;
  }
  return { ops, added, removed, changes };
}

// src/index.js
var packs = { en: en_default, zh: zh_default };
var engine = createEngine({ packs });
export {
  ENGINE_VERSION,
  LAYER_ORDER,
  PURPOSES,
  applyFixSpec,
  burstiness,
  compileRule,
  conservesInformation,
  createEngine,
  detectLanguage,
  diff,
  documentIssues,
  engine,
  extractFacts,
  issueKey,
  normalizeAfterFix,
  packs,
  score,
  sentenceLengths,
  sentences,
  wordCount
};
