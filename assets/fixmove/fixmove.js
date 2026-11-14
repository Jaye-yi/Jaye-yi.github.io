// The survey uses aggregated counts only. No individual responses are loaded.
const surveyControls=[...document.querySelectorAll('[data-survey-mode]')];
surveyControls.forEach(button=>button.addEventListener('click',()=>{
  const all=button.dataset.surveyMode==='all';
  surveyControls.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  document.querySelectorAll('.fm-top-bar,.fm-top-count').forEach(e=>e.hidden=all);
  document.querySelectorAll('.fm-all-bar,.fm-all-count,.fm-rank-legend').forEach(e=>e.hidden=!all);
  const description=all?'Distribution of ranks 1–9 for each feature.':'Responses placing each feature in ranks 1–3.';
  document.querySelector('#survey-view-description').textContent=description;
  document.querySelector('[data-survey-announcement]').textContent=description;
}));

const tabs=[...document.querySelectorAll('.fm-prototype-tabs [role="tab"]')];
const activate=(tab,focus=false)=>{
  tabs.forEach(t=>{
    const selected=t===tab;
    t.setAttribute('aria-selected',String(selected));
    t.tabIndex=selected?0:-1;
    document.getElementById(t.getAttribute('aria-controls')).hidden=!selected;
  });
  if(focus)tab.focus();
};
tabs.forEach((tab,index)=>{
  tab.addEventListener('click',()=>activate(tab));
  tab.addEventListener('keydown',event=>{
    let next;
    if(event.key==='ArrowRight')next=(index+1)%tabs.length;
    if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;
    if(event.key==='Home')next=0;
    if(event.key==='End')next=tabs.length-1;
    if(next===undefined)return;
    event.preventDefault();activate(tabs[next],true);
  });
});
if(tabs.length)activate(tabs[0]);
