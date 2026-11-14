const tabs = [...document.querySelectorAll('.pj-prototype-tabs [role="tab"]')];
function activate(tab, focus = false) {
  for (const item of tabs) {
    const selected = item === tab;
    item.setAttribute('aria-selected', String(selected));
    item.tabIndex = selected ? 0 : -1;
    document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
  }
  if (focus) tab.focus();
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activate(tab));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    activate(tabs[next], true);
  });
});
if (tabs.length) activate(tabs[0]);
document.querySelectorAll('[data-prototype-target]').forEach(link => {
  link.addEventListener('click', () => {
    const tab = document.getElementById(`pj-tab-${link.dataset.prototypeTarget}`);
    if (tab) activate(tab);
  });
});

// Keep the full walkthrough untouched. Chapter links seek within that recording.
const guide = document.getElementById('prototype-walkthrough');
const status = document.querySelector('.pj-video-status');
let pendingTime = null;
const applyChapter = () => {
  if (pendingTime === null || guide.readyState < 1) return;
  guide.currentTime = pendingTime;
  pendingTime = null;
};
guide.addEventListener('loadedmetadata', applyChapter);
document.querySelectorAll('[data-guide-seek]').forEach(link => {
  link.addEventListener('click', () => {
    pendingTime = Number(link.dataset.guideSeek);
    status.textContent = `Walkthrough set to ${Math.floor(pendingTime / 60)}:${String(pendingTime % 60).padStart(2, '0')}. Press play to watch.`;
    if (guide.readyState >= 1) applyChapter();
    else {
      guide.preload = 'metadata';
      guide.load();
    }
  });
});
document.querySelectorAll('.pian-case video').forEach(video => {
  video.addEventListener('play', () => {
    document.querySelectorAll('.pian-case video').forEach(other => {
      if (other !== video) other.pause();
    });
  });
});
