const coffee=document.querySelector('[data-about-coffee]');
const player=document.querySelector('[data-jazz-player]');
// The muted coffee animation runs independently of every music control.
const video=coffee?.querySelector('video');
if(video){
 video.muted=true;video.autoplay=true;video.loop=true;
 const startAnimation=()=>{
  if(video.paused&&!video.error){const playback=video.play();if(playback)playback.catch(()=>{});}
 };
 video.addEventListener('canplay',startAnimation,{once:true});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)startAnimation();});
 document.addEventListener('pointerdown',startAnimation,{once:true});
 document.addEventListener('keydown',startAnimation,{once:true});
 startAnimation();
}
if(coffee&&player){
 const coffeeButton=coffee.querySelector('[data-coffee-toggle]');
 const audio=player.querySelector('[data-jazz-audio]'),play=player.querySelector('[data-jazz-play]');
 const label=player.querySelector('[data-jazz-label]'),menu=player.querySelector('[data-jazz-menu]');
 const panel=player.querySelector('.jazz-panel'),status=player.querySelector('[data-jazz-status]');
 const tracks=[...player.querySelectorAll('[data-track-src]')];
 const seek=player.querySelector('[data-jazz-seek]'),time=player.querySelector('[data-jazz-time]');
 let current=0,loaded=false,intended=false,request=0,switching=false;

 function paint(){
  const playing=intended&&!audio.paused&&!audio.ended;
  player.classList.toggle('is-playing',playing);
  label.textContent=playing?'Pause Jazz':'Play Jazz';
  play.setAttribute('aria-label',playing?'Pause Jazz':'Play Jazz');
  play.setAttribute('aria-pressed',String(playing));
  coffeeButton.classList.toggle('is-paused',!playing);
  coffeeButton.setAttribute('aria-label',playing?'Pause music':'Play music');
  coffeeButton.setAttribute('aria-pressed',String(playing));
  coffeeButton.title=playing?'Pause music':'Play music';
  coffeeButton.querySelector('path').setAttribute('d',playing?'M7 5v10M13 5v10':'m6 4 10 6-10 6Z');
  tracks.forEach((track,i)=>{if(i===current)track.setAttribute('aria-current','true');else track.removeAttribute('aria-current');});
 }
 function pauseMusic(announce=true){
  request++;intended=false;switching=false;
  audio.pause();paint();
  if(announce)status.textContent='Music paused.';
 }
 async function start(index=current){
  const token=++request;intended=true;switching=true;
  if(!loaded||index!==current){
   current=index;audio.src=tracks[current].dataset.trackSrc;audio.load();loaded=true;
  }
  try{
   await audio.play();
   if(token!==request)return;
   switching=false;paint();
   status.textContent=`Playing ${tracks[current].dataset.trackTitle}.`;
  }catch(error){
   if(token!==request)return;
   pauseMusic(false);
   if(error.name!=='AbortError')status.textContent='Playback could not start. Please try again.';
  }
 }
 const toggle=()=>{if(intended)pauseMusic();else start();};
 play.addEventListener('click',toggle);coffeeButton.addEventListener('click',toggle);
 audio.addEventListener('play',paint);
 audio.addEventListener('pause',()=>{if(intended&&!switching&&!audio.ended)pauseMusic(false);else paint();});
 audio.addEventListener('ended',()=>{if(intended)start((current+1)%tracks.length);else paint();});
 const fail=()=>{pauseMusic(false);status.textContent='Playback could not be loaded.';};
 audio.addEventListener('error',fail);
 audio.volume=.45;

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
 document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseMusic(false);});
 pauseMusic(false);
}
