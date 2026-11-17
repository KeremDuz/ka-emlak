// "KA Emlak'a ekle" yer imi: ofis kendi hepsiemlak veya sahibinden ilan sayfasındayken tıklar, ilan bilgileri panele aktarılır.
// hepsiemlak ofis sayfasında ya da sahibinden mağaza listesinde (arama?storeId=…) tıklanırsa ofisin bütün ilanları,
// kullanıcının kendi tarayıcı oturumunda sırayla okunur ve panelde eşitleme özeti açılır. sahibinden ilan sayfaları
// bot denetimine takılmamak için aralıklarla okunur; okunamayanlar panelde "aç ve ekle" bağlantısı olarak listelenir.
// Portallar başka sitelere istek göndermeye izin vermediği için veri, panel adresinin # kısmında taşınır;
// # kısmı sunucuya gitmez, yalnız paneldeki sayfa okur. Panel hep aynı adlı sekmede açılır; her tıklamada yeni sekme açılmaz.
const source = String.raw`(function(){
var d=document,host=location.hostname,data;
function t(e){return e?e.textContent.replace(/\s+/g,' ').trim():'';}
function lines(e){if(!e)return '';var c=e.cloneNode(true);c.querySelectorAll('br').forEach(function(b){b.replaceWith('\n');});c.querySelectorAll('p,div,li,h1,h2,h3').forEach(function(b){b.append('\n');});return c.textContent.replace(/ /g,' ').replace(/[ \t]+\n/g,'\n').replace(/\n{3,}/g,'\n\n').trim().slice(0,20000);}
function attrs(root,re){var out=[];if(!root)return out;root.querySelectorAll('img,source').forEach(function(i){['src','data-src','srcset','data-srcset'].forEach(function(a){(i.getAttribute(a)||'').split(/[\s,]+/).forEach(function(s){if(re.test(s)&&out.indexOf(s)<0)out.push(s);});});});return out.slice(0,60);}
function he(doc,path){var id=(path.match(/(\d+-\d+)\/?$/)||[])[1];if(!id||!doc.querySelector('tr.spec-item'))return null;var specs={};doc.querySelectorAll('tr.spec-item').forEach(function(r){var k=t(r.querySelector('th'));if(k)specs[k]=t(r.querySelector('td'));});return {source:'hepsiemlak',url:location.origin+path.replace(/\/$/,''),id:id,title:t(doc.querySelector('h1')),price:t(doc.querySelector('[class*=price]')).slice(0,80),breadcrumb:Array.prototype.map.call(doc.querySelectorAll('[class*=breadcrumb] a'),t),specs:specs,description:lines(doc.querySelector('.description-content')),photos:attrs(doc,/\/mnresize\/\d+\/\d+\/ds01\//)};}
function plain(doc){if(!doc.body)return '';var c=doc.body.cloneNode(true);c.querySelectorAll('script,style,noscript,svg,iframe,template').forEach(function(e){e.remove();});return lines(c).slice(0,12000);}
// Bilgi listesi bulunamazsa (sahibinden tasarımı değişmiş olabilir) sayfa düz metni gönderilir; eksikleri sunucuda yapay zekâ tamamlar. Güvenlik doğrulaması sayfası ilan sayılmaz.
function sh(doc,path){var sid=(path.match(/-(\d{6,12})\/detay\/?$/)||[])[1];if(!sid)return null;var text=plain(doc);if(!doc.querySelector('.classifiedInfoList')&&(text.length<500||/just a moment|güvenlik doğrulama|robot olmadığ/i.test(text)||text.indexOf(sid)<0))return null;
var s={};doc.querySelectorAll('.classifiedInfoList .classifiedInfoItem, .classifiedInfoList li').forEach(function(r){var k=t(r.querySelector('dt,strong'));if(k)s[k]=t(r.querySelector('dd,span'));});
var price=t(doc.querySelector('.classifiedPriceValue, .classifiedInfo h3'));
var photos=attrs(doc.querySelector('.classifiedDetailPhotos')||doc,/shbdn\.com\/photos\//);
// Arka planda indirilen sayfada galeri resimleri henüz yerleşmemiş olabilir; sayfa kaynağındaki (betikler dahil) bu ilana ait bütün fotoğraf adresleri de toplanır.
((doc.documentElement?doc.documentElement.innerHTML:'').replace(/\\\//g,'/').match(/https:\/\/i\d*\.shbdn\.com\/photos\/[\d\/]+[a-z0-9]+_\d{6,12}[a-z0-9]*\.(?:jpg|jpeg|avif|webp)/g)||[]).forEach(function(u){if(u.indexOf('_'+sid)>0&&photos.indexOf(u)<0&&photos.length<120)photos.push(u);});
return {source:'sahibinden',url:'https://www.sahibinden.com'+path.replace(/\/$/,''),id:sid,title:(t(doc.querySelector('.classifiedDetailTitle h1'))||t(doc.querySelector('h1'))||doc.title||'').slice(0,300),price:(price.match(/[\d.,]+\s*(TL|EUR|USD|GBP|€|\$)/)||[price])[0].slice(0,80),breadcrumb:Array.prototype.map.call(doc.querySelectorAll('.classifiedLocation a, .classifiedInfo h2 a'),t),specs:s,description:lines(doc.querySelector('#classifiedDescription')),photos:photos,text:text,properties:props(doc)};}
// "Özellikler" sekmesi: başlık (Cephe, İç Özellikler, Muhit…) altında yalnız işaretli maddeler.
function props(doc){var o={};doc.querySelectorAll('#classifiedProperties h3').forEach(function(h){var k=t(h),list=h.nextElementSibling;if(!k||!list)return;var v=Array.prototype.map.call(list.querySelectorAll('li.selected'),t).filter(Boolean).slice(0,80);if(v.length)o[k.slice(0,80)]=v;});return o;}
function open(target){var w=window.open(target,'ka-emlak-panel');if(w)w.focus();else location.href=target;}
function wait(ms){return new Promise(function(r){setTimeout(r,ms);});}
function get(u){return fetch(u,{credentials:'include'}).then(function(r){if(!r.ok)throw new Error(r.status);return r.text();}).then(function(h){return new DOMParser().parseFromString(h,'text/html');});}
function panel(){var box=d.createElement('div');box.style.cssText='position:fixed;z-index:2147483647;top:16px;right:16px;max-width:340px;padding:16px 18px;background:#123d34;color:#fff;font:15px/1.45 system-ui,sans-serif;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.3)';d.body.appendChild(box);return box;}
async function send(box,text,payload){
var buf=new Uint8Array(await new Response(new Blob([JSON.stringify(payload)]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer()),bin='';
for(var j=0;j<buf.length;j+=8192)bin+=String.fromCharCode.apply(null,buf.subarray(j,j+8192));
var target='__ORIGIN__/yonetim#esitle='+btoa(bin).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
box.textContent='';var msg=d.createElement('div');msg.textContent=text;var b=d.createElement('button');b.textContent='KA Emlak panelinde aç';b.style.cssText='margin-top:10px;padding:9px 14px;border:0;border-radius:8px;background:#b89562;color:#fff;font:600 15px system-ui,sans-serif;cursor:pointer';b.onclick=function(){open(target);box.remove();window.__kaSync=0;};box.appendChild(msg);box.appendChild(b);
}
var office=/(^|\.)hepsiemlak\.com$/.test(host)&&(location.pathname.match(/^\/emlak-ofisi\/[^/]*-(\d+)\/?$/)||[])[1];
if(office){
if(window.__kaSync)return;window.__kaSync=1;
var box=panel();
function say(s){box.textContent=s;}
var own=new RegExp('/'+office+'-\\d+/?$'),seen=[];
function collect(doc){var added=0;doc.querySelectorAll('a[href]').forEach(function(a){var p;try{p=new URL(a.getAttribute('href'),location.origin);}catch(e){return;}if(p.origin===location.origin&&own.test(p.pathname)){var path=p.pathname.replace(/\/$/,'');if(!seen.some(function(s){return s.path===path;})){seen.push({path:path,id:path.match(/(\d+-\d+)$/)[1]});added++;}}});return added;}
function frame(path){return new Promise(function(ok){var f=d.createElement('iframe'),done=0,start=Date.now();f.style.cssText='position:fixed;left:-9999px;top:0;width:1024px;height:800px;opacity:0';function end(r){if(done)return;done=1;f.remove();ok(r);}function check(){var r=null;try{r=he(f.contentDocument,path);}catch(e){}if(r)end(r);else if(Date.now()-start>25000)end(null);else setTimeout(check,700);}f.src=path;d.body.appendChild(f);setTimeout(check,1500);});}
(async function(){
try{
say('Ofis sayfaları okunuyor…');collect(d);
for(var p=2;p<=10;p++){var doc=await get(location.pathname+'?page='+p);if(!collect(doc))break;say('Ofis sayfaları okunuyor… '+seen.length+' ilan');await wait(500);}
if(!seen.length){say('Bu sayfada ilan bulunamadı.');setTimeout(function(){box.remove();window.__kaSync=0;},5000);return;}
var out=[];
for(var i=0;i<seen.length;i++){say('İlanlar okunuyor '+(i+1)+'/'+seen.length);var r=null;try{r=he(await get(seen[i].path),seen[i].path);}catch(e){}if(!r)r=await frame(seen[i].path);if(r){r.photos=r.photos.filter(function(s){var m=s.match(/\/mnresize\/(\d+)\//);return m&&+m[1]>=400;}).slice(0,60);r.description=r.description.slice(0,8000);out.push(r);}await wait(600);}
await send(box,out.length+'/'+seen.length+' ilan okundu.',{source:'hepsiemlak',office:office,seen:seen.map(function(s){return s.id;}),listings:out});
}catch(e){say('Okuma yarıda kaldı: '+e.message+'. Sayfayı yenileyip tekrar deneyin.');window.__kaSync=0;}
})();
return;
}
if(/(^|\.)sahibinden\.com$/.test(host)&&d.querySelector('tr.searchResultsItem[data-id]')){
if(window.__kaSync)return;window.__kaSync=1;
var sbox=panel();
function ssay(s){sbox.textContent=s;}
var store=(location.search.match(/[?&]storeId=(\d{1,10})/)||[])[1]||'0',rows=[];
function collectRows(doc){var added=0;doc.querySelectorAll('tr.searchResultsItem[data-id]').forEach(function(r){var id=r.getAttribute('data-id'),a=r.querySelector('a[href*="/ilan/"]'),u;if(!/^\d{6,12}$/.test(id||'')||!a||rows.some(function(x){return x.id===id;}))return;try{u=new URL(a.getAttribute('href'),location.origin);}catch(e){return;}if(!/-\d{6,12}\/detay\/?$/.test(u.pathname))return;rows.push({id:id,url:'https://www.sahibinden.com'+u.pathname.replace(/\/$/,''),path:u.pathname,title:t(r.querySelector('.searchResultsTitleValue')).slice(0,200),price:t(r.querySelector('.searchResultsPriceValue')).slice(0,80)});added++;});return added;}
(async function(){
try{
ssay('Mağaza sayfaları okunuyor…');collectRows(d);
var next=d.querySelector('a.prevNextBut[title="Sonraki"]');
for(var p=0;next&&p<10;p++){var u=new URL(next.getAttribute('href'),location.href);if(u.origin!==location.origin)break;await wait(1500);var nd=await get(u.href);if(!collectRows(nd))break;ssay('Mağaza sayfaları okunuyor… '+rows.length+' ilan');next=nd.querySelector('a.prevNextBut[title="Sonraki"]');}
// İlan sayfaları yalnız www.sahibinden.com'dan okunabilir. Biri okunamazsa (ör. bot denetimi) sahibinden'e yüklenmemek için durulur.
var out=[],stop=location.hostname!=='www.sahibinden.com';
for(var i=0;i<rows.length&&!stop;i++){ssay('İlanlar okunuyor '+(i+1)+'/'+rows.length+'. sahibinden’e yük olmamak için yavaş ilerliyor.');var r=null;try{r=sh(await get(rows[i].path),rows[i].path);}catch(e){}if(r){r.photos=r.photos.slice(0,120);r.description=r.description.slice(0,8000);if(Object.keys(r.specs).length&&r.description.length>=30)delete r.text;out.push(r);}else stop=true;if(i<rows.length-1)await wait(2500+Math.random()*1500);}
await send(sbox,out.length+'/'+rows.length+' ilan okundu.'+(out.length<rows.length?' Okunamayanlar panelde bağlantı olarak listelenecek.':''),{source:'sahibinden',office:store,seen:rows.map(function(x){return x.id;}),rows:rows.map(function(x){return {id:x.id,url:x.url,title:x.title,price:x.price};}),listings:out});
}catch(e){ssay('Okuma yarıda kaldı: '+e.message+'. Sayfayı yenileyip tekrar deneyin.');window.__kaSync=0;}
})();
return;
}
if(/(^|\.)hepsiemlak\.com$/.test(host)){
data=he(d,location.pathname);
if(!data){alert('Lütfen ilanın kendi sayfasını ya da ofis sayfanızı açın.');return;}
}else if(/(^|\.)sahibinden\.com$/.test(host)){
data=sh(d,location.pathname);
if(!data){alert('Lütfen ilanın kendi sayfasını ya da mağazanızın ilan listesini açın.');return;}
if(Object.keys(data.specs).length&&data.description.length>=30)delete data.text;
}else{alert('Bu düğme hepsiemlak veya sahibinden ilan sayfasında çalışır. Önce ilanınızı açın.');return;}
open('__ORIGIN__/yonetim#aktar='+encodeURIComponent(JSON.stringify(data)));
})();`;

export function bookmarklet(origin: string) {
  return `javascript:${encodeURIComponent(source.replaceAll('__ORIGIN__', origin))}`;
}
