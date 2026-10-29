(()=>{'use strict';
const seed=[{"name": "academic-website", "description": null, "has_pages": true, "html_url": "https://github.com/argatuflorin/academic-website", "homepage": null, "language": "HTML", "updated_at": "2026-10-29T08:09:40Z", "archived": false, "fork": false, "private": false}, {"name": "argatuflorin.github.io", "description": null, "has_pages": true, "html_url": "https://github.com/argatuflorin/argatuflorin.github.io", "homepage": null, "language": "HTML", "updated_at": "2026-10-28T23:20:17Z", "archived": false, "fork": false, "private": false}, {"name": "contor_modbus", "description": null, "has_pages": true, "html_url": "https://github.com/argatuflorin/contor_modbus", "homepage": null, "language": null, "updated_at": "2026-03-02T12:22:51Z", "archived": false, "fork": false, "private": false}, {"name": "MDoEE", "description": "Interactive simulations and virtual laboratory for Monitoring and Diagnosis of Electrical Equipment – (IEC)", "has_pages": true, "html_url": "https://github.com/argatuflorin/MDoEE", "homepage": null, "language": "HTML", "updated_at": "2026-10-28T09:03:26Z", "archived": false, "fork": false, "private": false}, {"name": "power_quality_monitoring", "description": null, "has_pages": false, "html_url": "https://github.com/argatuflorin/power_quality_monitoring", "homepage": null, "language": null, "updated_at": "2026-03-02T12:50:34Z", "archived": false, "fork": false, "private": false}],copy={"academic-website": ["Profil academic: cercetare, publicații, brevete, cursuri și parcurs profesional.", "Academic profile: research, publications, patents, teaching and professional background."], "MDoEE": ["Simulări interactive și laborator virtual pentru Monitoring and Diagnosis of Electrical Equipment.", "Interactive simulations and virtual laboratory for Monitoring and Diagnosis of Electrical Equipment."], "contor_modbus": ["Proiectul contor_modbus — cod și fișiere disponibile în depozitul GitHub.", "The contor_modbus project — code and files available in the GitHub repository."], "power_quality_monitoring": ["Proiectul power_quality_monitoring — cod și fișiere disponibile în depozitul GitHub.", "The power_quality_monitoring project — code and files available in the GitHub repository."]};
const list=document.getElementById('github-projects'),status=document.getElementById('github-status'),refresh=document.getElementById('github-refresh');
if(!list||!status||!refresh)return;
const key='florin-public-repos-v1',ttl=30*60*1000;
let current=seed,loading=false,statusKind='snapshot';
const isEn=()=>document.documentElement.lang==='en';
const strings={live:['Listă actualizată din GitHub','List updated from GitHub'],cached:['Proiecte publice · listă salvată recent','Public projects · recently saved list'],snapshot:['Proiecte publice · listă salvată','Public projects · saved list'],loading:['Se verifică proiectele din GitHub…','Checking projects on GitHub…'],fallback:['GitHub nu este disponibil momentan. Se afișează lista salvată.','GitHub is temporarily unavailable. Showing the saved list.']};
function text(el,ro,en){el.dataset.ro=ro;el.dataset.en=en;el.textContent=isEn()?en:ro;return el;}
function node(tag,cls,content){const el=document.createElement(tag);if(cls)el.className=cls;if(content)el.textContent=content;return el;}
function link(labelRo,labelEn,url,cls=''){const a=text(node('a',cls),labelRo,labelEn);a.href=url;return a;}
function valid(r){return r&&typeof r.name==='string'&&/^[A-Za-z0-9_.-]+$/.test(r.name)&&r.private!==true&&typeof r.has_pages==='boolean';}
function clean(rows){return rows.filter(valid).map(r=>({name:r.name,description:typeof r.description==='string'?r.description:null,has_pages:r.has_pages,language:typeof r.language==='string'?r.language:null,archived:!!r.archived,private:false}));}
function setStatus(kind){statusKind=kind;const c=strings[kind];text(status,c[0],c[1]);}
function render(rows){
 current=clean(rows);const order={'academic-website':0,'MDoEE':1};
 const shown=current.filter(r=>r.name!=='argatuflorin.github.io').sort((a,b)=>(order[a.name]??2)-(order[b.name]??2)||a.name.localeCompare(b.name));
 const frag=document.createDocumentFragment();
 for(const r of shown){
  const card=node('article','card repo-card'),kind=node('div','num',r.has_pages?'GITHUB PAGES':'GITHUB REPOSITORY'),title=node('h3','',r.name);
  const pair=copy[r.name]||[r.description||'Proiect public pe GitHub.',r.description||'Public project on GitHub.'];
  const p=text(node('p',''),r.description&& !copy[r.name]?r.description:pair[0],r.description&& !copy[r.name]?r.description:pair[1]);
  const foot=node('div','repo-foot'),tags=node('span','tags',(r.language||'Repository')+(r.archived?' · Archived':'')),actions=node('div','repo-actions');
  if(r.has_pages)actions.append(link('Deschide site-ul ↗','Open website ↗','https://argatuflorin.github.io/'+encodeURIComponent(r.name)+'/','repo-open'));
  actions.append(link('Vezi pe GitHub ↗','View on GitHub ↗','https://github.com/argatuflorin/'+encodeURIComponent(r.name)));
  foot.append(tags,actions);card.append(kind,title,p,foot);frag.append(card);
 }
 if(!shown.length){frag.append(text(node('p','intro'),'Nu sunt proiecte publice de afișat.','No public projects to display.'));}
 list.replaceChildren(frag);
}
function readCache(){try{const c=JSON.parse(localStorage.getItem(key));if(Array.isArray(c?.rows)&&Number.isFinite(c.time))return c;}catch{}return null;}
function cache(rows){try{localStorage.setItem(key,JSON.stringify({rows,time:Date.now()}));}catch{}}
async function update(force=false){
 if(loading)return;
 const cached=readCache();
 if(!force&&cached&&Date.now()-cached.time<ttl&&clean(cached.rows).length){render(cached.rows);setStatus('cached');return;}
 loading=true;refresh.disabled=true;setStatus('loading');const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);
 try{
  let all=[],page=1;
  while(page<=10){
   const response=await fetch('https://api.github.com/users/argatuflorin/repos?per_page=100&sort=updated&page='+page,{signal:controller.signal,headers:{'Accept':'application/vnd.github+json'}});
   if(!response.ok)throw new Error('GitHub unavailable');
   const rows=await response.json();if(!Array.isArray(rows)||rows.some(r=>!valid(r)))throw new Error('Invalid repository list');
   all.push(...rows);if(rows.length<100)break;page++;
  }
  const safe=clean(all);render(safe);cache(safe);setStatus('live');
 }catch{if(cached&&clean(cached.rows).length)render(cached.rows);setStatus('fallback');}
 finally{clearTimeout(timer);loading=false;refresh.disabled=false;}
}
refresh.addEventListener('click',()=>update(true));
document.getElementById('language')?.addEventListener('click',()=>{render(current);setStatus(statusKind);});
const initial=readCache();if(initial&&clean(initial.rows).length){render(initial.rows);setStatus('cached');}
update();
})();
