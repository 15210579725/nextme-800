(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const atlas = window.ATLAS, grid = $('atlas-grid'), panel = $('moment');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let active = null, pinned = false, closeTimer, openTimer, sound = false, chinese = false, paused = reduced, started = 0, previousFocus;
  const monthNames = ['April','May','June','July','August'];
  const offset = 134, height = 2430;
  const tiles = new Map();
  const formatDate = d => new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'Asia/Hong_Kong'});
  const safePlay = video => video.play().catch(() => { $('announcement').textContent = 'Playback needs a click. Select this moment to play.'; });
  atlas.months.forEach(([month,top],i) => {
    const label = document.createElement('div'); label.className='month'; label.style.top=((top-offset)/height*100)+'%';
    const title = document.createElement('b');title.textContent=monthNames[i];const year=document.createElement('small');year.textContent='2026';label.append(title,year);grid.append(label);
  });
  atlas.items.forEach((item,i) => {
    const [x,y,w,h]=item.rect, tile=document.createElement('button');tile.className='tile';tile.dataset.id=item.id;
    Object.assign(tile.style,{left:x/40+'%',top:(y-offset)/height*100+'%',width:w/40+'%',height:h/height*100+'%','--delay':(-i*.37)+'s','--origin':`${25+i%60}% ${30+i%55}%`});
    tile.setAttribute('aria-label',`${item.title}, ${formatDate(item.timestamp)}. Open moment`);tile.setAttribute('aria-expanded','false');
    const img=document.createElement('img');img.src=paused?item.image:item.gif;img.alt='';img.decoding='async';img.draggable=false;tile.append(img);if(!item.video){const flag=document.createElement('span');flag.className='still-flag';flag.textContent='Photo';tile.append(flag);}
    if(item.thumbnailVideo){const v=document.createElement('video');v.src=item.thumbnailVideo;v.muted=true;v.loop=true;v.playsInline=true;v.autoplay=!paused;v.poster=item.image;img.replaceWith(v);}
    if(item.label){const label=document.createElement('span');label.className='tile-label';label.textContent=item.label;tile.append(label);}
    tile.addEventListener('pointerenter',e=>{if(e.pointerType==='touch'||pinned)return;clearTimeout(closeTimer);clearTimeout(openTimer);openTimer=setTimeout(()=>open(item,tile,false),100);});
    tile.addEventListener('pointerleave',()=>{clearTimeout(openTimer);scheduleClose();});
    tile.addEventListener('focus',()=>{if(!pinned)open(item,tile,false);});
    tile.addEventListener('click',()=>{clearTimeout(openTimer);open(item,tile,true);});
    tile.addEventListener('keydown',e=>{if(e.key==='Escape'){close();return;}const moves={ArrowRight:1,ArrowLeft:-1};if(moves[e.key]){e.preventDefault();const j=(i+moves[e.key]+atlas.items.length)%atlas.items.length;tiles.get(atlas.items[j].id).focus();}});
    tiles.set(item.id,tile);grid.append(tile);
  });
  function scheduleClose(){clearTimeout(closeTimer);closeTimer=setTimeout(()=>{if(!pinned)close();},180);}
  function updateText(){if(!active)return;$('moment-title').textContent=active.title;$('audio-state').dataset.pending=String(!active.video);$('caption').textContent='"'+(chinese?active.captionZh:active.caption)+'"';$('moment-date').textContent=formatDate(active.timestamp);$('category').textContent=active.category;$('moment-time').textContent=new Date(active.timestamp).toLocaleTimeString('en-GB',{hour12:false,timeZone:'Asia/Hong_Kong'})+' HKT';$('pin-state').textContent=pinned?'Pinned · Esc to close':'Click to keep open';$('audio-state').textContent=!active.video?'Still photograph':active.hasAudio?(sound?'Sound on':'Muted'):'Audio unavailable';}
  function position(tile){const r=tile.getBoundingClientRect(),p=panel.getBoundingClientRect(),vw=innerWidth,vh=innerHeight;const x=Math.max(12,Math.min(vw-p.width-12,r.left+r.width/2-p.width/2));const y=Math.max(12,Math.min(vh-p.height-12,r.top+r.height/2-p.height*.36));panel.style.left=x+'px';panel.style.top=y+'px';panel.style.setProperty('--anchor',`${r.left+r.width/2-x}px ${r.top+r.height/2-y}px`);}
  function open(item,tile,keep){clearTimeout(closeTimer);if(pinned&&active?.id!==item.id&&!keep)return;const changed=active?.id!==item.id;
    if(active)tiles.get(active.id).classList.remove('active');if(active)tiles.get(active.id).setAttribute('aria-expanded','false');
    active=item;pinned=keep;previousFocus=tile;tile.classList.add('active');tile.setAttribute('aria-expanded','true');panel.hidden=false;document.body.classList.add('inspecting');
    if(changed){started=performance.now();const img=$('moment-image'),video=$('moment-video');img.src=item.image;img.alt=item.title;video.pause();video.removeAttribute('src');img.hidden=!!item.video;video.hidden=!item.video;
      if(item.video){video.src=item.video;video.playbackRate=3;video.muted=!sound||!item.hasAudio;video.loop=true;if(!paused)safePlay(video);}
      panel.querySelector('.progress span').style.transform='scaleX(0)';
    }
    updateText();position(tile);if(keep)$('close').focus({preventScroll:true});
  }
  function close(restore=false){clearTimeout(openTimer);clearTimeout(closeTimer);if(active){tiles.get(active.id).classList.remove('active');tiles.get(active.id).setAttribute('aria-expanded','false');}panel.hidden=true;$('moment-video').pause();document.body.classList.remove('inspecting');active=null;pinned=false;if(restore&&previousFocus){const t=previousFocus;/* Suppress the focus-open handler while restoring keyboard location. */pinned=true;t.focus({preventScroll:true});pinned=false;}}
  panel.addEventListener('pointerenter',()=>clearTimeout(closeTimer));panel.addEventListener('pointerleave',scheduleClose);
  panel.addEventListener('click',e=>{if(e.target.closest('#close'))return;pinned=true;updateText();});
  $('close').addEventListener('click',()=>close(true));document.addEventListener('keydown',e=>{if(e.key==='Escape')close(true);});
  document.addEventListener('pointerdown',e=>{if(!panel.contains(e.target)&&!e.target.closest('.tile'))close();});
  document.addEventListener('focusin',e=>{if(active&&!panel.contains(e.target)&&!e.target.closest('.tile'))close();});
  addEventListener('resize',()=>{if(active)position(tiles.get(active.id));});addEventListener('scroll',()=>{if(active)position(tiles.get(active.id));},{passive:true});
  function setPaused(value){paused=value;document.body.classList.toggle('paused',paused);$('motion').textContent=paused?'Play motion':'Pause motion';$('motion').setAttribute('aria-pressed',String(!paused));atlas.items.forEach(item=>{const img=tiles.get(item.id).querySelector('img');if(img)img.src=paused?item.image:item.gif;});document.querySelectorAll('video').forEach(v=>{if(paused)v.pause();else if(v.getAttribute('src'))safePlay(v);});}
  $('motion').addEventListener('click',()=>setPaused(!paused));setPaused(paused);
  $('sound').addEventListener('click',()=>{sound=!sound;$('sound').textContent=sound?'Sound on':'Sound off';$('sound').setAttribute('aria-pressed',String(sound));$('moment-video').muted=!sound||!active?.hasAudio;if(active&&!paused)safePlay($('moment-video'));updateText();});
  $('language').addEventListener('click',()=>{chinese=!chinese;$('language').textContent=chinese?'English':'中文';updateText();});
  $('moment-video').addEventListener('timeupdate',()=>{const v=$('moment-video');panel.querySelector('.progress span').style.transform=`scaleX(${v.duration?v.currentTime/v.duration:0})`;});
  document.addEventListener('visibilitychange',()=>{document.body.classList.toggle('paused',paused||document.hidden);atlas.items.forEach(item=>{const img=tiles.get(item.id).querySelector('img');if(img)img.src=(paused||document.hidden)?item.image:item.gif;});if(document.hidden)$('moment-video').pause();else if(active?.video&&!paused)safePlay($('moment-video'));});
})();
