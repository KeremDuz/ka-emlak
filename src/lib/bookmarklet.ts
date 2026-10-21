// "KA Emlak'a ekle" yer imi: ofis kendi hepsiemlak veya sahibinden ilan sayfasındayken tıklar, ilan bilgileri panele aktarılır.
// hepsiemlak ofis sayfasında tıklanırsa ofisin bütün ilanları, kullanıcının kendi tarayıcı oturumunda sırayla okunur
// ve panelde eşitleme özeti açılır.
// Portallar başka sitelere istek göndermeye izin vermediği için veri, panel adresinin # kısmında taşınır;
// # kısmı sunucuya gitmez, yalnız paneldeki sayfa okur.
const source = String.raw`(function(){
var d=document,host=location.hostname,data;
function t(e){return e?e.textContent.replace(/\s+/g,' ').trim():'';}
function lines(e){if(!e)return '';var c=e.cloneNode(true);c.querySelectorAll('br').forEach(function(b){b.replaceWith('\n');});c.querySelectorAll('p,div,li,h1,h2,h3').forEach(function(b){b.append('\n');});return c.textContent.replace(/ /g,' ').replace(/[ \t]+\n/g,'\n').replace(/\n{3,}/g,'\n\n').trim().slice(0,20000);}
function attrs(root,re){var out=[];if(!root)return out;root.querySelectorAll('img,source').forEach(function(i){['src','data-src','srcset','data-srcset'].forEach(function(a){(i.getAttribute(a)||'').split(/[\s,]+/).forEach(function(s){if(re.test(s)&&out.indexOf(s)<0)out.push(s);});});});return out.slice(0,60);}
function he(doc,path){var id=(path.match(/(\d+-\d+)\/?$/)||[])[1];if(!id||!doc.querySelector('tr.spec-item'))return null;var specs={};doc.querySelectorAll('tr.spec-item').forEach(function(r){var k=t(r.querySelector('th'));if(k)specs[k]=t(r.querySelector('td'));});return {source:'hepsiemlak',url:location.origin+path.replace(/\/$/,''),id:id,title:t(doc.querySelector('h1')),price:t(doc.querySelector('[class*=price]')).slice(0,80),breadcrumb:Array.prototype.map.call(doc.querySelectorAll('[class*=breadcrumb] a'),t),specs:specs,description:lines(doc.querySelector('.description-content')),photos:attrs(doc,/\/mnresize\/\d+\/\d+\/ds01\//)};}
function open(target){var w=window.open(target,'_blank');if(!w)location.href=target;}
var office=/(^|\.)hepsiemlak\.com$/.test(host)&&(location.pathname.match(/^\/emlak-ofisi\/[^/]*-(\d+)\/?$/)||[])[1];
if(office){
if(window.__kaSync)return;window.__kaSync=1;
var box=d.createElement('div');box.style.cssText='position:fixed;z-index:2147483647;top:16px;right:16px;max-width:340px;padding:16px 18px;background:#123d34;color:#fff;font:15px/1.45 system-ui,sans-serif;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.3)';d.body.appendChild(box);
function say(s){box.textContent=s;}
function wait(ms){return new Promise(function(r){setTimeout(r,ms);});}
function get(u){return fetch(u,{credentials:'include'}).then(function(r){if(!r.ok)throw new Error(r.status);return r.text();}).then(function(h){return new DOMParser().parseFromString(h,'text/html');});}
var own=new RegExp('/'+office+'-\\d+/?$'),seen=[];
function collect(doc){var added=0;doc.querySelectorAll('a[href]').forEach(function(a){var p;try{p=new URL(a.getAttribute('href'),location.origin);}catch(e){return;}if(p.origin===location.origin&&own.test(p.pathname)){var path=p.pathname.replace(/\/$/,'');if(!seen.some(function(s){return s.path===path;})){seen.push({path:path,id:path.match(/(\d+-\d+)$/)[1]});added++;}}});return added;}
function frame(path){return new Promise(function(ok){var f=d.createElement('iframe'),done=0,start=Date.now();f.style.cssText='position:fixed;left:-9999px;top:0;width:1024px;height:800px;opacity:0';function end(r){if(done)return;done=1;f.remove();ok(r);}function check(){var r=null;try{r=he(f.contentDocument,path);}catch(e){}if(r)end(r);else if(Date.now()-start>25000)end(null);else setTimeout(check,700);}f.src=path;d.body.appendChild(f);setTimeout(check,1500);});}
(async function(){
try{
say('Ofis sayfaları okunuyor…');collect(d);
for(var p=2;p<=10;p++){var doc=await get(location.pathname+'?page='+p);if(!collect(doc))break;say('Ofis sayfaları okunuyor… '+seen.length+' ilan');await wait(500);}
if(!seen.length){say('Bu sayfada ilan bulunamadı.');setTimeout(function(){box.remove();window.__kaSync=0;},5000);return;}
var out=[];
for(var i=0;i<seen.length;i++){say('İlanlar okunuyor '+(i+1)+'/'+seen.length);var r=null;try{r=he(await get(seen[i].path),seen[i].path);}catch(e){}if(!r)r=await frame(seen[i].path);if(r){r.photos=r.photos.filter(function(s){var m=s.match(/\/mnresize\/(\d+)\//);return m&&+m[1]>=400;}).slice(0,12);r.description=r.description.slice(0,8000);out.push(r);}await wait(600);}
var json=JSON.stringify({source:'hepsiemlak',office:office,seen:seen.map(function(s){return s.id;}),listings:out});
var buf=new Uint8Array(await new Response(new Blob([json]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer()),bin='';
for(var j=0;j<buf.length;j+=8192)bin+=String.fromCharCode.apply(null,buf.subarray(j,j+8192));
var target='__ORIGIN__/yonetim#esitle='+btoa(bin).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
box.textContent='';var msg=d.createElement('div');msg.textContent=out.length+'/'+seen.length+' ilan okundu.';var b=d.createElement('button');b.textContent='KA Emlak panelinde aç';b.style.cssText='margin-top:10px;padding:9px 14px;border:0;border-radius:8px;background:#b89562;color:#fff;font:600 15px system-ui,sans-serif;cursor:pointer';b.onclick=function(){open(target);box.remove();window.__kaSync=0;};box.appendChild(msg);box.appendChild(b);
}catch(e){say('Okuma yarıda kaldı: '+e.message+'. Sayfayı yenileyip tekrar deneyin.');window.__kaSync=0;}
})();
return;
}
if(/(^|\.)hepsiemlak\.com$/.test(host)){
data=he(d,location.pathname);
if(!data){alert('Lütfen ilanın kendi sayfasını ya da ofis sayfanızı açın.');return;}
}else if(/(^|\.)sahibinden\.com$/.test(host)){
var sid=(location.pathname.match(/-(\d{6,12})\/detay\/?$/)||[])[1];
if(!sid||!d.querySelector('.classifiedInfoList')){alert('Lütfen ilanın kendi sayfasını açın (ilan listesini değil).');return;}
var s={};d.querySelectorAll('.classifiedInfoList .classifiedInfoItem, .classifiedInfoList li').forEach(function(r){var k=t(r.querySelector('dt,strong'));if(k)s[k]=t(r.querySelector('dd,span'));});
var price=t(d.querySelector('.classifiedPriceValue, .classifiedInfo h3'));
data={source:'sahibinden',url:location.origin+location.pathname.replace(/\/$/,''),id:sid,title:t(d.querySelector('.classifiedDetailTitle h1')),price:(price.match(/[\d.,]+\s*(TL|EUR|USD|GBP|€|\$)/)||[price])[0].slice(0,80),breadcrumb:Array.prototype.map.call(d.querySelectorAll('.classifiedLocation a, .classifiedInfo h2 a'),t),specs:s,description:lines(d.querySelector('#classifiedDescription')),photos:attrs(d.querySelector('.classifiedDetailPhotos')||d,/shbdn\.com\/photos\//)};
}else{alert('Bu düğme hepsiemlak veya sahibinden ilan sayfasında çalışır. Önce ilanınızı açın.');return;}
open('__ORIGIN__/yonetim#aktar='+encodeURIComponent(JSON.stringify(data)));
})();`;

export function bookmarklet(origin: string) {
  return `javascript:${encodeURIComponent(source.replaceAll('__ORIGIN__', origin))}`;
}
