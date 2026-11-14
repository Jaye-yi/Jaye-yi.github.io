const oracleTabs=[...document.querySelectorAll('.or-system-tabs [role="tab"]')];
function activateOracleSystem(tab,focus=false) {
 for(const item of oracleTabs) {
  const selected=item===tab;
  item.setAttribute('aria-selected',String(selected));
  item.tabIndex=selected?0:-1;
  document.getElementById(item.getAttribute('aria-controls')).hidden=!selected;
 }
 if(focus)tab.focus();
}
oracleTabs.forEach((tab,index)=>{
 tab.addEventListener('click',()=>activateOracleSystem(tab));
 tab.addEventListener('keydown',event=>{
  let next;
  if(event.key==='ArrowRight')next=(index+1)%oracleTabs.length;
  if(event.key==='ArrowLeft')next=(index+oracleTabs.length-1)%oracleTabs.length;
  if(event.key==='Home')next=0;
  if(event.key==='End')next=oracleTabs.length-1;
  if(next===undefined)return;
  event.preventDefault();activateOracleSystem(oracleTabs[next],true);
 });
});
if(oracleTabs.length)activateOracleSystem(oracleTabs[0]);
