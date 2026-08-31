import fs from "fs";

function patchFile(filePath, { importFrom, importTo, exportFrom, exportTo }) {
  let content = fs.readFileSync(filePath, "utf8");
  let changed = false;

  if (!content.includes(importTo)) {
    if (!content.includes(importFrom)) {
      throw new Error(`Missing import anchor in ${filePath}`);
    }
    content = content.replace(importFrom, importTo);
    changed = true;
  }

  if (!content.includes(exportTo)) {
    if (!content.includes(exportFrom)) {
      throw new Error(`Missing export anchor in ${filePath}`);
    }
    content = content.replace(exportFrom, exportTo);
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content, "utf8");
  }
}

patchFile("api/email/send.js", {
  importFrom:
    "import{isOptionalEmailCategory,json,listAllUserEmails,listUsersForOptionalCategory,requireAdmin,sendSendPulseEmail}from'../_lib/core.js';",
  importTo:
    "import{isOptionalEmailCategory,json,listAllUserEmails,listUsersForOptionalCategory,requireAdmin,sendSendPulseEmail}from'../_lib/core.js';import{requireValidLukittuLicense}from'../_lib/_t9.js';",
  exportFrom: "export async function POST(h){return vma_b458cc(",
  exportTo:
    "export async function POST(h){try{await requireValidLukittuLicense({requestLike:{headers:h.headers}});}catch(e){return json({licensed:!1,valid:!1,success:!1,code:e?.code||'LICENSE_INVALID',message:e?.message||'License verification failed.'},{status:403});}return vma_b458cc(",
});

patchFile("api/email/unsubscribe.js", {
  importFrom:
    "import{createSignature,escapeHtml,getSupabaseConfig,htmlPage,isOptionalEmailCategory}from'../_lib/core.js';",
  importTo:
    "import{createSignature,escapeHtml,getSupabaseConfig,htmlPage,isOptionalEmailCategory}from'../_lib/core.js';import{requireValidLukittuLicense}from'../_lib/_t9.js';",
  exportFrom: "export async function GET(s){return vmg_bdaaf6(",
  exportTo:
    "export async function GET(s){try{await requireValidLukittuLicense({requestLike:{headers:s.headers}});}catch(e){return new Response('<!doctype html><html><body><h1>License required</h1><p>License verification failed.</p></body></html>',{status:403,headers:{'Content-Type':'text/html; charset=utf-8'}});}return vmg_bdaaf6(",
});

console.log("ok");
