const filterButtons=[...document.querySelectorAll('[data-filter]')];
const records=[...document.querySelectorAll('[data-category]')];
function filterRecords(value){
 let count=0;
 for(const item of records){const visible=value==='all'||item.dataset.category===value;item.hidden=!visible;if(visible)count++;}
 for(const button of filterButtons){const active=button.dataset.filter===value;button.classList.toggle('is-active',active);button.setAttribute('aria-pressed',String(active));}
 const countText=document.querySelector('.filter-count');
 if(countText)countText.textContent=`${count} ${count===1?'record':'records'} shown`;
}
filterButtons.forEach(button=>button.addEventListener('click',()=>filterRecords(button.dataset.filter)));
if(filterButtons.length)filterRecords('all');

// Preview intent comes from a pointer or keyboard focus; links retain normal navigation.
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
const previewControllers=[];
let currentPreview;

const holographicCard=document.querySelector('a.card-visual[href="projects/holographic-animation.html"]');
let holographicPreview=holographicCard?.querySelector('.motion-preview');
if(holographicCard&&!holographicPreview){
 const holographicPoster=holographicCard.querySelector('.motion-poster');
 if(holographicPoster){
  holographicPreview=document.createElement('span');
  holographicPreview.className='motion-preview';
  holographicPoster.before(holographicPreview);
  holographicPreview.append(holographicPoster);
  holographicPreview.insertAdjacentHTML('beforeend','<span class="motion-badge" aria-hidden="true">Hover to dance</span>');
 }
}
if(holographicPreview){
 holographicPreview.classList.add('motion-hologram');
 holographicPreview.dataset.motionPreview='';
 holographicPreview.dataset.motionKind='dance';
 holographicPreview.title='Hover or focus to play the short holographic dance';
 const hologramStage=document.createElement('span');
 hologramStage.className='hologram-stage';
 hologramStage.setAttribute('aria-hidden','true');
 hologramStage.innerHTML='<img class="hologram-animation" src="assets/holographic-mmd-dance.webp" alt="">';
 const hologramBadge=holographicPreview.querySelector('.motion-badge');
 holographicPreview.insertBefore(hologramStage,hologramBadge);
 if(hologramBadge)hologramBadge.textContent='Hover to dance';
}

// Restore the three-model OpenGL course viewer as the graphics card poster.
// Hovering plays a 360-degree turntable rendered from the original meshes.
const rayTracerPreview=document.querySelector('a.card-visual[href="projects/ray-tracer.html"] [data-motion-preview]');
if(rayTracerPreview){
 rayTracerPreview.classList.remove('motion-reveal');
 rayTracerPreview.classList.add('motion-turntable');
 rayTracerPreview.dataset.motionKind='turntable';
 rayTracerPreview.title='Hover or focus to rotate the three OpenGL meshes';
 rayTracerPreview.querySelector('.motion-overlay')?.remove();
 const poster=rayTracerPreview.querySelector('.motion-poster');
 if(poster)poster.src='assets/graphics-mesh-viewer-front.png';
 const turntableStage=document.createElement('span');
 turntableStage.className='turntable-stage';
 turntableStage.setAttribute('aria-hidden','true');
 turntableStage.innerHTML='<img class="turntable-animation" src="assets/graphics-mesh-viewer-spin.webp" alt="">';
 const badge=rayTracerPreview.querySelector('.motion-badge');
 rayTracerPreview.insertBefore(turntableStage,badge);
 if(badge)badge.textContent='Hover to rotate';
}

const minigamesCard=document.querySelector('a.card-visual[href="projects/minigames.html"]');
if(minigamesCard&&!minigamesCard.querySelector('[data-motion-preview]')){
 const minigamesPoster=minigamesCard.querySelector('.motion-poster');
 if(minigamesPoster){
  const minigamesPreview=document.createElement('span');
  minigamesPreview.className='motion-preview motion-video';
  minigamesPreview.dataset.motionPreview='';
  minigamesPreview.dataset.motionKind='video';
  minigamesPreview.title='Hover or focus to play the original Physics Balls recording';
  minigamesPoster.before(minigamesPreview);
  minigamesPreview.append(minigamesPoster);
  minigamesPreview.insertAdjacentHTML('beforeend','<video class="motion-overlay" data-motion-video muted loop playsinline preload="none" aria-hidden="true" tabindex="-1"><source src="assets/minigames/physics-balls-hover.mp4" type="video/mp4"></video><span class="motion-badge" aria-hidden="true">Hover to play</span>');
 }
}

document.querySelectorAll('[data-motion-preview]').forEach(preview=>{
 const host=preview.closest('.publication, .portfolio-card')||preview.parentElement;
 const video=preview.querySelector('[data-motion-video]');
 let pointerInside=false;
 let focusInside=false;
 let intended=false;
 let requestId=0;
 const stop=()=>{
  requestId++;
  intended=false;
  preview.classList.remove('is-active','is-playing');
  if(video){video.pause();if(video.readyState)video.currentTime=0;}
  if(currentPreview===controller)currentPreview=null;
 };
 const start=()=>{
  if(reducedMotion.matches||document.hidden)return;
  if(currentPreview&&currentPreview!==controller)currentPreview.stop();
  currentPreview=controller;
  intended=true;
  const request=++requestId;
  preview.classList.add('is-active');
  if(video){
   video.muted=true;
   const play=video.play();
   if(play)play.then(()=>{
    if(intended&&request===requestId)preview.classList.add('is-playing');
    else if(!intended)video.pause();
   }).catch(()=>{if(intended&&request===requestId)stop();});
  }
 };
 const controller={host,stop};
 previewControllers.push(controller);
 host.addEventListener('pointerenter',event=>{
  if(event.pointerType==='touch')return;
  pointerInside=true;
  start();
 });
 host.addEventListener('pointerleave',()=>{
  pointerInside=false;
  if(!focusInside)stop();
 });
 host.addEventListener('focusin',()=>{focusInside=true;start();});
 host.addEventListener('focusout',event=>{
  focusInside=host.contains(event.relatedTarget);
  if(!focusInside&&!pointerInside)stop();
 });
 if(video)video.addEventListener('error',stop);
});
const stopPreviews=()=>previewControllers.forEach(controller=>controller.stop());
reducedMotion.addEventListener('change',stopPreviews);
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopPreviews();});
window.addEventListener('blur',stopPreviews);
if('IntersectionObserver' in window){
 const observer=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
   if(entry.isIntersecting)return;
   // A focus action can scroll between observation and delivery of this callback.
   const rect=entry.target.getBoundingClientRect();
   if(rect.bottom<=0||rect.top>=window.innerHeight)previewControllers.find(controller=>controller.host===entry.target)?.stop();
  });
 });
 previewControllers.forEach(controller=>observer.observe(controller.host));
}

const viewer=document.querySelector('.image-viewer');
if(viewer){
 let trigger;
 const close=()=>{viewer.close();trigger?.focus();};
 document.querySelectorAll('[data-zoom]').forEach(img=>{
  const open=()=>{trigger=img;viewer.querySelector('img').src=img.currentSrc||img.src;viewer.querySelector('img').alt=img.alt;viewer.querySelector('p').textContent=img.dataset.caption||'';viewer.showModal();};
  img.addEventListener('click',open);
  img.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();open();}});
 });
 viewer.querySelector('button').addEventListener('click',close);
 viewer.addEventListener('click',event=>{if(event.target===viewer)close();});
 viewer.addEventListener('close',()=>trigger?.focus());
}
