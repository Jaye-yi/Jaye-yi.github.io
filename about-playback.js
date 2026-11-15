const coffee=document.querySelector('[data-about-coffee]');
const player=document.querySelector('[data-jazz-player]');
if(coffee&&player){
 const video=coffee.querySelector('video'),coffeeButton=coffee.querySelector('[data-coffee-toggle]');
 const audio=player.querySelector('[data-jazz-audio]'),play=player.querySelector('[data-jazz-play]');
 const label=player.querySelector('[data-jazz-label]'),menu=player.querySelector('[data-jazz-menu]');
 const panel=player.querySelector('.jazz-panel'),status=player.querySelector('[data-jazz-status]');
 const tracks=[...player.querySelectorAll('[data-track-src]')];
 const seek=player.querySelector('[data-jazz-seek]'),time=player.querySelector('[data-jazz-time]');
 let current=0,loaded=false,intended=false,request=0,switching=false;

 function paint(){
  const playing=intended&&!audio.paused&&!audio.ended&&!video.paused;
  player.classList.toggle('is-playing',playing);
  label.textContent=playing?'Pause Jazz':'Play Jazz';
  play.setAttribute('aria-label',playing?'Pause Jazz':'Play Jazz');
  play.setAttribute('aria-pressed',String(playing));
  coffeeButton.classList.toggle('is-paused',!playing);
  coffeeButton.setAttribute('aria-label',playing?'Pause music and animation':'Play music and animation');
  coffeeButton.setAttribute('aria-pressed',String(playing));
  coffeeButton.title=playing?'Pause music and animation':'Play music and animation';
  coffeeButton.querySelector('path').setAttribute('d',playing?'M7 5v10M13 5v10':'m6 4 10 6-10 6Z');
  tracks.forEach((track,i)=>{if(i===current)track.setAttribute('aria-current','true');else track.removeAttribute('aria-current');});
 }
 function pauseAll(announce=true){
  request++;intended=false;switching=false;
  audio.pause();video.pause();paint();
  if(announce)status.textContent='Music and animation paused.';
 }
 async function start(index=current){
  const token=++request;intended=true;switching=true;
  if(!loaded||index!==current){
   current=index;audio.src=tracks[current].dataset.trackSrc;audio.load();loaded=true;
  }
  try{
   await Promise.all([audio.play(),video.play()]);
   if(token!==request)return;
   switching=false;paint();
   status.textContent=`Playing ${tracks[current].dataset.trackTitle} with the coffee animation.`;
  }catch(error){
   if(token!==request)return;
   pauseAll(false);
   if(error.name!=='AbortError')status.textContent='Playback could not start. Please try again.';
  }
 }
 const toggle=()=>{if(intended)pauseAll();else start();};
 play.addEventListener('click',toggle);coffeeButton.addEventListener('click',toggle);
 audio.addEventListener('play',paint);video.addEventListener('play',paint);
 audio.addEventListener('pause',()=>{if(intended&&!switching&&!audio.ended)pauseAll(false);else paint();});
 video.addEventListener('pause',()=>{if(intended&&!switching)pauseAll(false);else paint();});
 audio.addEventListener('ended',()=>{if(intended)start((current+1)%tracks.length);else paint();});
 const fail=()=>{pauseAll(false);status.textContent='Playback could not be loaded.';};
 audio.addEventListener('error',fail);video.addEventListener('error',fail);
 audio.volume=.45;video.muted=true;

 const formatTime=value=>`${Math.floor(value/60)}:${String(Math.floor(value%60)).padStart(2,'0')}`;
 function progress(){
  const duration=audio.duration;
  seek.disabled=!Number.isFinite(duration);
  seek.value=Number.isFinite(duration)?Math.round(audio.currentTime/duration*1000):0;
  time.textContent=formatTime(audio.currentTime||0);
  seek.setAttribute('aria-valuetext',`${formatTime(audio.currentTime||0)} of ${Number.isFinite(duration)?formatTime(duration):'0:00'}`);
 }
 seek.addEventListener('input',()=>{if(Number.isFinite(audio.duration))audio.currentTime=Number(seek.value)/1000*audio.duration;});
 audio.addEventListener('timeupdate',progress);audio.addEventListener('loadedmetadata',progress);audio.addEventListener('emptied',progress);

 function closePlaylist(){panel.hidden=true;menu.setAttribute('aria-expanded','false');}
 menu.addEventListener('click',()=>{
  const opening=panel.hidden;panel.hidden=!opening;menu.setAttribute('aria-expanded',String(opening));
  if(opening)tracks[current].focus();
 });
 tracks.forEach((track,index)=>track.addEventListener('click',()=>{start(index);closePlaylist();}));
 document.addEventListener('click',event=>{if(!player.contains(event.target))closePlaylist();});
 player.addEventListener('keydown',event=>{if(event.key==='Escape'){closePlaylist();menu.focus();}});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseAll(false);});
 pauseAll(false);
}
