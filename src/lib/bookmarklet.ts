// "KA Emlak'a ekle" yer imi: ofis kendi hepsiemlak veya sahibinden ilan sayfasındayken tıklar, ilan bilgileri panele aktarılır.
// Portallar başka sitelere istek göndermeye izin vermediği için veri, panel adresinin # kısmında taşınır;
// # kısmı sunucuya gitmez, yalnız paneldeki sayfa okur.
const source = String.raw`(function(){
var d=document,host=location.hostname,data;
function t(e){return e?e.textContent.replace(/\s+/g,' ').trim():'';}
function lines(e){if(!e)return '';var c=e.cloneNode(true);c.querySelectorAll('br').forEach(function(b){b.replaceWith('\n');});c.querySelectorAll('p,div,li,h1,h2,h3').forEach(function(b){b.append('\n');});return c.textContent.replace(/ /g,' ').replace(/[ \t]+\n/g,'\n').replace(/\n{3,}/g,'\n\n').trim().slice(0,20000);}
function attrs(root,re){var out=[];if(!root)return out;root.querySelectorAll('img,source').forEach(function(i){['src','data-src','srcset','data-srcset'].forEach(function(a){(i.getAttribute(a)||'').split(/[\s,]+/).forEach(function(s){if(re.test(s)&&out.indexOf(s)<0)out.push(s);});});});return out.slice(0,60);}
if(/(^|\.)hepsiemlak\.com$/.test(host)){
var id=(location.pathname.match(/(\d+-\d+)\/?$/)||[])[1];
if(!id||!d.querySelector('tr.spec-item')){alert('Lütfen ilanın kendi sayfasını açın (ilan listesini değil).');return;}
var specs={};d.querySelectorAll('tr.spec-item').forEach(function(r){var k=t(r.querySelector('th'));if(k)specs[k]=t(r.querySelector('td'));});
data={source:'hepsiemlak',url:location.origin+location.pathname.replace(/\/$/,''),id:id,title:t(d.querySelector('h1')),price:t(d.querySelector('[class*=price]')).slice(0,80),breadcrumb:Array.prototype.map.call(d.querySelectorAll('[class*=breadcrumb] a'),t),specs:specs,description:lines(d.querySelector('.description-content')),photos:attrs(d,/\/mnresize\/\d+\/\d+\/ds01\//)};
}else if(/(^|\.)sahibinden\.com$/.test(host)){
var sid=(location.pathname.match(/-(\d{6,12})\/detay\/?$/)||[])[1];
if(!sid||!d.querySelector('.classifiedInfoList')){alert('Lütfen ilanın kendi sayfasını açın (ilan listesini değil).');return;}
var s={};d.querySelectorAll('.classifiedInfoList .classifiedInfoItem, .classifiedInfoList li').forEach(function(r){var k=t(r.querySelector('dt,strong'));if(k)s[k]=t(r.querySelector('dd,span'));});
var price=t(d.querySelector('.classifiedPriceValue, .classifiedInfo h3'));
data={source:'sahibinden',url:location.origin+location.pathname.replace(/\/$/,''),id:sid,title:t(d.querySelector('.classifiedDetailTitle h1')),price:(price.match(/[\d.,]+\s*(TL|EUR|USD|GBP|€|\$)/)||[price])[0].slice(0,80),breadcrumb:Array.prototype.map.call(d.querySelectorAll('.classifiedLocation a, .classifiedInfo h2 a'),t),specs:s,description:lines(d.querySelector('#classifiedDescription')),photos:attrs(d.querySelector('.classifiedDetailPhotos')||d,/shbdn\.com\/photos\//)};
}else{alert('Bu düğme hepsiemlak veya sahibinden ilan sayfasında çalışır. Önce ilanınızı açın.');return;}
var target='__ORIGIN__/yonetim#aktar='+encodeURIComponent(JSON.stringify(data));
var w=window.open(target,'_blank');if(!w)location.href=target;
})();`;

export function bookmarklet(origin: string) {
  return `javascript:${encodeURIComponent(source.replace('__ORIGIN__', origin))}`;
}
