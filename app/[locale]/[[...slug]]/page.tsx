import type {Metadata} from "next";
import {notFound} from "next/navigation";
import Checker from "@/components/Checker";
import {Header,Footer} from "@/components/SiteShell";
import {copy,pages,type Locale} from "@/lib/content";
import {HowPage,PricingPage,LearnPage} from "@/components/ContentPages";
import {AppPage} from "@/components/AppPage";
import {BlogArticlePage,BlogIndexPage,getBlogArticle} from "@/components/Blog";
const locales:Locale[]=["en","zh-cn"];
const articleSlugs=["remove-ai-writing-style","how-to-remove-ai-tells","what-is-perplexity-and-burstiness","do-ai-humanizers-work","common-patterns-in-chinese-ai-copy","make-a-stiff-email-more-direct","replace-claims-with-evidence"];
const slugs=["", "app","how-it-works","pricing","about","privacy","terms","learn",...articleSlugs.map(slug=>`learn/${slug}`)];
const descriptions:Record<Locale,Record<string,string>>={
  en:{"":"Clear GPT-ish filler and template structure in your browser. Built for blog, email, and marketing drafts — no upload, no account. Local rules, English and Chinese.",app:"Remove AI writing style in your browser. Local rules flag filler and stiff structure — draft never uploaded.","how-it-works":"See how Naturable identifies writing patterns, explains suggestions, and helps you revise without hiding the editing process.",pricing:"Compare Naturable Free and Pro features for private, explainable writing revision.",learn:"Naturable Blog covers AI writing patterns, humanizers, perplexity and burstiness, Chinese AI copy, professional email, and evidence-based marketing."},
  "zh-cn":{"":"在浏览器里给博客、邮件、营销稿去 GPT 味：清套话、破结构。本地隐私，草稿不上云，无需注册。英中规则分轨。",app:"在浏览器里去掉 AI 写作腔：本地规则清套话、破结构，草稿不上云。","how-it-works":"了解 Naturable 如何发现表达问题、解释修改建议，并保留清晰可控的修改过程。",pricing:"比较 Naturable 免费版与专业版的自然表达检查功能。",learn:"Naturable 博客关注 AI 写作修改、中文 AI 文案、困惑度与句子节奏、商务邮件和证据型营销写作。"}
};
const routePath=(locale:string,key:string)=>`/${locale}/${key?`${key}/`:""}`;
export function generateStaticParams(){return locales.flatMap(locale=>slugs.map(slug=>({locale,slug:slug?slug.split("/"):undefined})))}
export async function generateMetadata({params}:{params:Promise<{locale:string;slug?:string[]}>}):Promise<Metadata>{
  const {locale,slug}=await params;
  const key=(slug||[]).join("/");
  const l=locale as Locale;
  const article=key.startsWith("learn/")?getBlogArticle(l,key.slice(6)):null;
  const item=key&&key!=="app"?(pages[l] as any)?.[key]:null;
  const isHome=!key;
  const titleBase=article?.title||(key==="learn"?(l==="zh-cn"?"自然写作与 AI 文本修改博客":"Natural Writing and AI Editing Blog"):item?.title)||(key==="app"?(l==="zh-cn"?"本地去掉 AI 写作腔 — 文本编辑器":"Remove AI Writing Style — Local Editor"):(isHome?(l==="zh-cn"?"给博客 / 邮件 / 营销稿去 GPT 味 — 草稿不上云":"Remove AI Writing Style Locally"):copy[l]?.footer))||"Naturable";
  // EN home uses absolute title so brand pipe form is exact (~55); ZH stays short via template.
  const title=isHome&&l==="en"?{absolute:"Remove AI Writing Style Locally | Naturable"}:titleBase;
  const ogTitle=isHome&&l==="en"?"Remove AI Writing Style Locally | Naturable":titleBase;
  const description=article?.description||descriptions[l]?.[key]||item?.description||descriptions[l]?.[""];
  const canonical=routePath(locale,key);
  // Temporary OG fallbacks: dedicated og-*.png assets are not in public/ yet.
  // Remap to existing live blog PNGs so og:image / twitter:image never 404.
  const ogImagePath=article?.slug==="remove-ai-writing-style"
    ?"/assets/blog/before-after-safe-fix.png"
    :"/assets/blog/highlight-patterns.png";
  const ogImageAlt=article?.slug==="remove-ai-writing-style"
    ?(l==="zh-cn"?"Naturable 去掉 AI 写作腔前后对比":"Naturable before/after after removing AI writing style")
    :(l==="zh-cn"?"Naturable：写得更自然，也更像你。":"Naturable: Make every draft naturally yours.");
  const ogImages=[{url:ogImagePath,width:1200,height:630,alt:ogImageAlt}];
  return {
    title,
    description,
    keywords:article?.keywords,
    alternates:{canonical,languages:{en:routePath("en",key),"zh-CN":routePath("zh-cn",key),"x-default":routePath("en",key)}},
    openGraph:{title:ogTitle,description,url:canonical,siteName:"Naturable",locale:l==="zh-cn"?"zh_CN":"en_US",type:article?"article":"website",publishedTime:article?(article.datePublished||"2026-07-12"):undefined,modifiedTime:article?(article.dateModified||article.datePublished||"2026-07-12"):undefined,images:ogImages},
    twitter:{card:"summary_large_image",title:ogTitle,description,images:[ogImagePath]},
    robots:{index:true,follow:true}
  };
}
function HomeJsonLd({locale}:{locale:Locale}){
  const z=locale==="zh-cn";
  const inLanguage=z?"zh-CN":"en";
  const description=z
    ?"在浏览器里给博客、邮件、营销稿去 GPT 味：清套话、破结构。本地隐私，草稿不上云，无需注册。英中规则分轨。"
    :"Clear GPT-ish filler and template structure in your browser. Built for blog, email, and marketing drafts — no upload, no account. Local rules, English and Chinese.";
  const graph=[
    {"@context":"https://schema.org","@type":"WebSite","name":"Naturable","url":"https://naturable.app/","inLanguage":inLanguage,"description":description,"publisher":{"@type":"Organization","name":"Naturable","url":"https://naturable.app/"}},
    {"@context":"https://schema.org","@type":"Organization","name":"Naturable","url":"https://naturable.app/","logo":"https://naturable.app/assets/logo.svg"},
    {"@context":"https://schema.org","@type":"SoftwareApplication","name":"Naturable","applicationCategory":"BusinessApplication","operatingSystem":"Web","url":"https://naturable.app/","description":description,"offers":{"@type":"Offer","price":"0","priceCurrency":"USD"}}
  ];
  return <>{graph.map((schema,i)=><script key={i} type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,"\\u003c")}}/>)}</>;
}
function HomeSections({locale:l,privacy}:{locale:Locale;privacy:string}){
  const z=l==="zh-cn";
  const blocks=z?[
    {h2:"Naturable 会检查什么",p:"标出 GPT 味套话、模板结构和助手残留，并给出可核对的修改建议。"},
    {h2:"专为博客、邮件与营销稿",p:"写作场景默认博客，其次邮件与营销，让日常发出的文案更自然。"},
    {h2:"草稿不离开浏览器",p:privacy},
    {h2:"一次本地检查怎么做",p:"标出套话、边改边对比、再检查一遍——草稿始终留在浏览器。"}
  ]:[
    {h2:"What Naturable checks",p:"Highlights GPT-ish filler, template structure, and assistant artifacts — with suggestions you can verify."},
    {h2:"Built for blog, email, and marketing",p:"Purpose defaults to Blog — then Email and Marketing — so everyday shipping copy stays natural."},
    {h2:"Draft never leaves the browser",p:privacy},
    {h2:"How a local pass works",p:"Spot robotic phrasing, fix in place, compare, and recheck — all in your browser."}
  ];
  return <section className="wrap center"><div className="cards home-p2-cards">{blocks.map(b=><div className="feat" key={b.h2}><h2>{b.h2}</h2><p>{b.p}</p></div>)}</div></section>;
}
export default async function LocalePage({params}:{params:Promise<{locale:string;slug?:string[]}>}){
  const {locale,slug}=await params;
  if(!locales.includes(locale as Locale))notFound();
  const l=locale as Locale,c=copy[l],key=(slug||[]).join("/");
  let content:React.ReactNode;
  if(!key){
    content=<>
      <HomeJsonLd locale={l}/>
      <section className="hero wrap"><span className="tag-note">{c.tag}</span><h1>{c.hero}</h1><p className="lead">{c.lead}</p><div className="cta"><a className="btn" href="#checker">{c.cta}</a><a className="btn sec" href={`/${l}/how-it-works/`}>{c.how}</a></div><p className="privacy-chip" role="status">{c.privacy}</p><div className="trust">{c.trust}</div></section>
      <section id="checker" className="wrap"><Checker locale={l} demo/></section>
      <HomeSections locale={l} privacy={c.privacy}/>
    </>;
  }else if(key==="app"){
    content=<AppPage locale={l}/>;
  }else if(key==="how-it-works"){content=<HowPage locale={l}/>;}
  else if(key==="pricing"){content=<PricingPage locale={l}/>;}
  else if(key==="learn"){content=<BlogIndexPage locale={l}/>;}
  else if(key.startsWith("learn/")){
    const article=getBlogArticle(l,key.slice(6));
    if(!article)notFound();
    content=<BlogArticlePage locale={l} article={article}/>;
  }else{
    const item=(pages[l] as any)[key];
    if(!item)notFound();
    content=<main className="wrap shell-main"><article className="prose"><h1>{item.title}</h1>{item.body}<div className="content-actions"><a className="btn" href={`/${l}/app/`}>{c.try}</a></div></article></main>;
  }
  return <><Header locale={l}/>{content}<Footer locale={l}/></>;
}
