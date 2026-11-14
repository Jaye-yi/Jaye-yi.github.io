const miniTabs=[...document.querySelectorAll('.mt-module-tabs [role="tab"]')];
function activateMiniTab(tab,focus=false) {
 for(const item of miniTabs) {
  const selected=item===tab;
  item.setAttribute('aria-selected',String(selected));item.tabIndex=selected?0:-1;
  document.getElementById(item.getAttribute('aria-controls')).hidden=!selected;
 }
 if(focus)tab.focus();
}
miniTabs.forEach((tab,index)=>{
 tab.addEventListener('click',()=>activateMiniTab(tab));
 tab.addEventListener('keydown',event=>{
  let next;
  if(event.key==='ArrowRight')next=(index+1)%miniTabs.length;
  if(event.key==='ArrowLeft')next=(index+miniTabs.length-1)%miniTabs.length;
  if(event.key==='Home')next=0;
  if(event.key==='End')next=miniTabs.length-1;
  if(next===undefined)return;
  event.preventDefault();activateMiniTab(miniTabs[next],true);
 });
});
if(miniTabs.length)activateMiniTab(miniTabs[0]);
const tensorButtons=[...document.querySelectorAll('[data-mt-index]')];
function inspectElement(index) {
 const row=Math.floor(index/3),column=index%3,bias=[10,20,30][column];
 for(const button of tensorButtons)button.setAttribute('aria-pressed',String(Number(button.dataset.mtIndex)===index));
 document.querySelectorAll('[data-mt-bias]').forEach(cell=>cell.classList.toggle('is-selected',Number(cell.dataset.mtBias)===column));
 document.querySelector('[data-mt-position]').textContent=`A[${row}, ${column}] → storage[${index}] = ${index}`;
 document.querySelector('[data-mt-broadcast]').textContent=`b[0, ${column}] = ${bias} · selected sum = ${index+bias}`;
 document.querySelector('[data-mt-formula]').textContent=`position = ${row} × 3 + ${column} × 1 = ${index}`;
}
tensorButtons.forEach(button=>button.addEventListener('click',()=>inspectElement(Number(button.dataset.mtIndex))));
