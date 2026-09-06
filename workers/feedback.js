import { EmailMessage } from "cloudflare:email";

const FEEDBACK_KEYS = ["event","rule_id","feedback","language","purpose","severity","confidence","engine_version"];
const SORTED_KEYS = [...FEEDBACK_KEYS].sort();
const RULE_IDS = new Set(["en.artifact.chat","en.artifact.disclaimer","en.vocabulary.filler","en.vocabulary.cliche","en.sentence.negative_parallel","en.sentence.hedging","en.structure.signpost","en.evidence.vague_source","en.evidence.generic_conclusion","zh.artifact.chat","zh.artifact.disclaimer","zh.vocabulary.meta","zh.vocabulary.promo","zh.sentence.parallel","zh.structure.connectors","zh.evidence.vague_source","zh.evidence.generic_conclusion","en.rhythm.repeated_start","zh.rhythm.repeated_start"]);
const allowed = (value, values) => typeof value === "string" && values.includes(value);
export function validFeedback(body) {
  const keys = Object.keys(body || {}).sort();
  if (keys.length !== SORTED_KEYS.length || keys.some((key,index)=>key!==SORTED_KEYS[index])) return false;
  return body.event === "rule_feedback" && RULE_IDS.has(body.rule_id) && allowed(body.feedback,["helpful","false_positive","unclear"]) && allowed(body.language,["en","zh"]) && allowed(body.purpose,["general","email","blog","academic","marketing","social","technical"]) && allowed(body.severity,["strong","suggestion"]) && allowed(body.confidence,["high","medium","low"]) && body.engine_version === "2.1.0";
}
function reply(body,status){return Response.json(body,{status,headers:{"cache-control":"no-store","content-security-policy":"default-src 'none'","x-content-type-options":"nosniff"}});}
export default {
  async fetch(request,env) {
    if (!["POST","DELETE"].includes(request.method)) return new Response("Method not allowed",{status:405,headers:{Allow:"POST, DELETE"}});
    if (!(request.headers.get("content-type")||"").toLowerCase().startsWith("application/json")) return new Response("Unsupported media type",{status:415});
    const length=Number(request.headers.get("content-length")||0);
    if (length>1024) return new Response("Payload too large",{status:413});
    let body;
    try { body=await request.json(); } catch (_) { return new Response("Invalid JSON",{status:400}); }
    if (!validFeedback(body)) return new Response("Invalid feedback schema",{status:400});
    const direction=request.method==="DELETE"?-1:1;
    env.FEEDBACK_ANALYTICS.writeDataPoint({indexes:[body.rule_id],blobs:[body.rule_id,body.feedback,body.language,body.purpose,body.severity,body.confidence,body.engine_version],doubles:[direction]});
    const action=direction===1?"Rule feedback":"Rule feedback withdrawn";
    const raw=`From: Naturable Feedback <feedback@naturable.app>\r\nTo: support@naturable.app\r\nSubject: ${action}: ${body.rule_id} / ${body.feedback}\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\n${action}\r\n\r\n${JSON.stringify(body,null,2)}\r\n`;
    if (!env.FEEDBACK_DESTINATION) return new Response("Feedback destination is not configured",{status:503});
    await env.FEEDBACK_EMAIL.send(new EmailMessage("feedback@naturable.app",env.FEEDBACK_DESTINATION,raw));
    return reply({ok:true,action:direction===1?"recorded":"withdrawn"},202);
  }
};
