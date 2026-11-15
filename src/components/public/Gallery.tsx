import { useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import { ChevronLeft, ChevronRight, Images, Share2, X } from 'lucide-react';
import type { Locale, Photo } from '../../lib/types';
import type { Dictionary } from '../../i18n/tr';
import { direction, fill } from '../../i18n/config';
import { numberLabel } from '../../lib/format';
export default function Gallery({photos,title,id,locale,t}:{photos:Photo[];title:string;id:string;locale:Locale;t:Dictionary['gallery']}) {
 const [open,setOpen]=useState(false),[index,setIndex]=useState(0),[copied,setCopied]=useState(false);
 // Sağdan sola dilde "sonraki" solda durur: ok tuşları ve kaydırma yönü buna göre döner.
 const forward=direction(locale)==='rtl'?-1:1;
 const n=(value:number)=>numberLabel(value,locale);
 // Fotoğraf açıklamaları Türkçe girilir; öteki dillerde başlık ve sıra numarası okunur.
 const alt=(p:Photo|undefined,i:number)=>(locale==='tr'&&p?.alt)||fill(t.alt,{title,n:n(i+1)});
 async function share(){try{if(navigator.share){await navigator.share({title,url:location.href});}else{await navigator.clipboard.writeText(location.href);setCopied(true);setTimeout(()=>setCopied(false),2500);}}catch{setCopied(false);}}
 function move(amount:number){setIndex(i=>(i+amount+photos.length)%photos.length);}
 // Telefonda sağa/sola kaydırarak fotoğraf değiştirme.
 const touchX=useRef<number|null>(null);
 function swipeEnd(x:number){if(touchX.current===null||photos.length<2)return;const delta=x-touchX.current;touchX.current=null;if(Math.abs(delta)>45)move((delta<0?1:-1)*forward);}
 return <MotionConfig reducedMotion="user"><div className="detail-gallery" data-listing={id}>{photos.slice(0,3).map((p,i)=><button key={p.id} onClick={()=>{setIndex(i);setOpen(true);}} aria-label={fill(t.enlarge,{title,n:n(i+1)})}><img src={p.url} alt={alt(p,i)} width="1200" height="800" loading={i===0?'eager':'lazy'}/>{i===0&&<span className="gallery-open"><Images size={17} aria-hidden="true"/>{fill(t.all,{n:n(photos.length)})}</span>}</button>)}</div><div className="detail-actions"><button onClick={share}><Share2 size={17} aria-hidden="true"/>{copied?t.copied:t.share}</button></div><Dialog.Root open={open} onOpenChange={setOpen}><Dialog.Portal><Dialog.Overlay className="lightbox-overlay"/><Dialog.Content className="lightbox-overlay" onKeyDown={e=>{if(e.key==='ArrowLeft')move(-forward);if(e.key==='ArrowRight')move(forward);}} onTouchStart={e=>{touchX.current=e.touches[0]?.clientX??null;}} onTouchEnd={e=>swipeEnd(e.changedTouches[0]?.clientX??0)}><Dialog.Title className="sr-only">{fill(t.dialogTitle,{title})}</Dialog.Title><Dialog.Description className="sr-only">{t.dialogHelp}</Dialog.Description><AnimatePresence mode="wait" initial={false}><motion.img key={photos[index]?.id} src={photos[index]?.url} alt={alt(photos[index],index)} className="lightbox-image" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:.15}}/></AnimatePresence><Dialog.Close className="lightbox-close" aria-label={t.close}><X size={21}/></Dialog.Close>{photos.length>1&&<><button className="lightbox-prev" aria-label={t.prev} onClick={()=>move(-1)}><ChevronLeft/></button><button className="lightbox-next" aria-label={t.next} onClick={()=>move(1)}><ChevronRight/></button></>}<span className="lightbox-counter">{fill(t.counter,{current:n(index+1),total:n(photos.length)})}</span></Dialog.Content></Dialog.Portal></Dialog.Root></MotionConfig>;
}
