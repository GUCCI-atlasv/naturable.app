import Link from "next/link";
import Checker from "@/components/Checker";
import type {Locale} from "@/lib/content";

type Faq = {q: string; a: string};

export function AppPage({locale: l}: {locale: Locale}) {
  const z = l === "zh-cn";
  const homeUrl = `https://naturable.app/${l}/`;
  const appUrl = `https://naturable.app/${l}/app/`;
  const homeName = z ? "首页" : "Home";
  const appName = z ? "编辑器" : "Editor";
  const faqs: Faq[] = z
    ? [
        {
          q: "正文会上传到服务器吗？",
          a: "不会。检查、草稿、修改对比和编辑记录都留在当前浏览器。你可以随时在编辑器里清除本地数据。"
        },
        {
          q: "这里的「去掉 AI 写作腔」具体做什么？",
          a: "用本地规则标出套话、模板结构和助手残留，并给出可核对的修改建议。你逐条决定改或不改——不是整篇黑盒重写，也不承诺任何检测结果。"
        },
        {
          q: "离线还能检查吗？",
          a: "可以。规则引擎在浏览器里运行；网络断开时本地检查仍可用。页面顶部的在线状态只作提示，不代表文本会上传。"
        },
        {
          q: "和首页有什么区别？",
          a: "本页是工具页：直接打开编辑器，围绕「去掉 AI 写作腔」做检查与修改。首页负责产品定位与人群说明；两者文案刻意分开，避免抢同一段定位。"
        }
      ]
    : [
        {
          q: "Does this editor upload my draft?",
          a: "No. Checks, drafts, diffs, and edit history stay in this browser. You can clear local data anytime from the editor."
        },
        {
          q: "What does “remove AI writing style” mean here?",
          a: "Local rules flag filler, template structure, and assistant artifacts, then offer suggestions you can verify. You apply or ignore each fix — this is not a black-box rewrite, and it does not promise detector outcomes."
        },
        {
          q: "Can I check offline?",
          a: "Yes. The rule engine runs in the browser, so local checks keep working when you are offline. The online status pill is a self-check only; it does not mean text is uploaded."
        },
        {
          q: "How is this different from the homepage?",
          a: "This page is the tool: open the editor and remove AI writing style in place. The homepage covers product positioning and audience. Copy here stays tool-focused so it does not compete with the homepage pitch."
        }
      ];

  const software = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: z ? "Naturable 本地编辑器" : "Naturable local editor",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: appUrl,
    description: z
      ? "在浏览器里去掉 AI 写作腔：本地规则清套话、破结构，草稿不上云。"
      : "Remove AI writing style in your browser. Local rules clear filler and stiff structure — draft never uploaded.",
    offers: {"@type": "Offer", price: "0", priceCurrency: "USD"},
    inLanguage: z ? "zh-CN" : "en"
  };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {"@type": "ListItem", position: 1, name: homeName, item: homeUrl},
      {"@type": "ListItem", position: 2, name: appName, item: appUrl}
    ]
  };
  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(f => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {"@type": "Answer", text: f.a}
    }))
  };
  const schemas = [software, breadcrumb, faqPage];

  const blocks = z
    ? [
        {
          h2: "工具怎么去掉 AI 写作腔",
          p: "粘贴草稿后点「检查」。规则会标出空话连接、整齐划一的段落骨架和助手口吻残留，并附上可核对的建议。你只接受说得通的修改，再对比、再检查。"
        },
        {
          h2: "为什么必须本地跑",
          p: "改稿往往含未公开内容。本页把规则引擎放在浏览器里，正文、基线和 Diff 都不上传。在线状态只是自检提示；离线时检查仍可用。"
        },
        {
          h2: "和「过检测」有什么边界",
          p: "自然度评分是改稿启发式，不是作者鉴定，也不保证任何第三方检测结果。目标是让表达更清楚、更具体、更像你自己写的。"
        }
      ]
    : [
        {
          h2: "How this tool removes AI writing style",
          p: "Paste a draft and hit Check. Rules highlight filler transitions, evenly templated structure, and assistant leftovers — each with a suggestion you can verify. Apply only the edits that keep your meaning, then compare and recheck."
        },
        {
          h2: "Why the pass stays local",
          p: "Drafts often include unpublished copy. This editor runs the rule pack in your browser so text, baselines, and diffs are never uploaded. The online pill is a self-check; offline checks still work."
        },
        {
          h2: "What this is not",
          p: "The naturalness score is heuristic writing guidance, not an authorship verdict, and it does not guarantee results from any detector. The job is clearer, more specific prose that still sounds like you."
        }
      ];

  return (
    <main className="wrap shell-main content-page app-tool-page">
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{__html: JSON.stringify(schema).replace(/</g, "\u003c")}}
        />
      ))}
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link href={`/${l}/`}>{homeName}</Link>
        <span>›</span>
        <span aria-current="page">{appName}</span>
      </nav>
      <section className="content-hero app-tool-hero">
        <span className="tag-note">{z ? "工具页 · 本地规则" : "Tool page · local rules"}</span>
        <h1>{z ? "本地去掉 AI 写作腔" : "Remove AI writing style — local editor"}</h1>
        <p>
          {z
            ? "打开编辑器，用浏览器内规则清套话、破结构。草稿不上云；每处修改由你确认。本页只讲工具用法，不重复首页的产品定位。"
            : "Open the editor to remove AI writing style with in-browser rules. Your draft never leaves this device; you confirm every fix. This page is tool intent only — it does not repeat the homepage pitch."}
        </p>
      </section>
      <Checker locale={l} demo={false} />
      <section className="app-explain" aria-labelledby="app-explain-title">
        <h2 id="app-explain-title">{z ? "编辑器里怎么改" : "Inside the editor"}</h2>
        <div className="cards home-p2-cards">
          {blocks.map(b => (
            <div className="feat" key={b.h2}>
              <h3>{b.h2}</h3>
              <p>{b.p}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="app-faq" aria-labelledby="app-faq-title">
        <h2 id="app-faq-title">{z ? "常见问题" : "FAQ"}</h2>
        <div className="faq-grid">
          {faqs.map(f => (
            <article key={f.q}>
              <h3>{f.q}</h3>
              <p>{f.a}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
