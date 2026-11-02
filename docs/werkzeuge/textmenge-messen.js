const { chromium } = require('playwright'); const fs=require('fs');
const hof=fs.readFileSync(process.argv[2] || 'testhof.json','utf8');  // node tools/ux/testhof.js > testhof.json; Server auf :8765 mit dist/
(async()=>{
 const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
 const p=await ctx.newPage(); await p.goto('http://localhost:8765/'); await p.waitForTimeout(1500);
 await p.evaluate(async h=>{await LAGStore.save(JSON.parse(h));},hof); await p.reload(); await p.waitForTimeout(2000);
 const tabs=await p.evaluate(()=>[...document.querySelectorAll('nav button, [role=tab]')].map(b=>b.textContent.trim()).slice(0,8));
 console.log('tabs',tabs);
 const out={};
 for(const t of ['Heute','Gewohnheiten','Logbuch','Fortschritt','Truhe']){
   await p.evaluate(t=>{const b=[...document.querySelectorAll('nav button,[role=tab]')].find(x=>x.textContent.trim().startsWith(t)); b&&b.click();},t);
   await p.waitForTimeout(600); await p.evaluate(()=>window.scrollTo(0,0));
   const m=await p.evaluate(()=>{
     const vis=e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none'};
     const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT); let words=0, fold=0, nodes=[];
     while(walker.nextNode()){const n=walker.currentNode; const el=n.parentElement; if(!el||!vis(el)||el.closest('nav'))continue; const w=n.textContent.trim().split(/\s+/).filter(Boolean).length; if(!w)continue; words+=w; const r=el.getBoundingClientRect(); if(r.top+scrollY<844)fold+=w; nodes.push(n.textContent.trim())}
     const H=document.documentElement.scrollHeight;
     const btn=[...document.querySelectorAll('button,a,input,select,textarea,summary')].filter(vis).length;
     const sentences=nodes.filter(s=>s.split(/\s+/).length>=8);
     return {words,fold,H,btn,longTexts:sentences.length,examples:sentences.slice(0,12)};
   });
   out[t]=m; await p.screenshot({path:`tab-${t}.png`,fullPage:true});
 }
 console.log(JSON.stringify(out,null,1)); await b.close();
})();
