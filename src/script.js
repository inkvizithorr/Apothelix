// Nastavení obchodu. Ceny, poštovné, účet a slevu předplatného doplňte sem; null = zatím neznámé.
var APX={
  iban:null, // např. 'CZ6508000000192000145399'
  prices:{'GenioLoci':null,'Jatroděj':null,'Očistelix':null}, // cena za 30 dní v Kč
  shipping:{zasilkovna:null,kuryr:null,osobne:0,cod:null},
  subDiscount:null, // sleva předplatného v %, např. 10
  // Recenze: jen skutečné, jen o Genioloku, balení a doručení. Nikdy o účincích na zdraví (zákaz zdravotních tvrzení).
  // Příklad: {name:'Jana K.', city:'Brno', stars:5, about:'Geniolok', text:'Konečně pouzdro, které nestydím vytáhnout.'}
  reviews:[]
};
var LANG=document.documentElement.lang==='en'?'en':'cs';
function tr(cs,en){return LANG==='en'?en:cs}
function kc(n){return LANG==='en'?'CZK '+n.toLocaleString('en-US'):n.toLocaleString('cs-CZ')+' Kč'}
(function(){
  // Cena za den na kartách a v tabulkách plánů, jen když je cena vyplněná
  document.querySelectorAll('[data-plan-price]').forEach(function(el){
    var p=APX.prices[el.dataset.planPrice]; if(p==null) return;
    var day=Math.round(p/30);
    el.textContent=el.hasAttribute('data-day-only')?tr('od '+kc(day)+' denně','from '+kc(day)+' a day'):kc(p)+' · '+tr(kc(day)+' denně',kc(day)+' a day');
    el.hidden=false;
  });
})();
(function(){
  // Formulář zájmu
  var f=document.getElementById('interestForm'),m=document.getElementById('formMsg');
  if(f) f.addEventListener('submit',function(e){
    e.preventDefault();
    if(!f.checkValidity()){m.hidden=false;m.textContent=tr('Vyplňte prosím platný e-mail a potvrďte souhlas.','Please enter a valid e-mail and confirm your consent.');return}
    m.hidden=false;m.innerHTML='';
    m.appendChild(document.createTextNode(tr('Děkujeme. Tady je váš průvodce: ','Thank you. Here is your guide: ')));
    var a=document.createElement('a');a.href=tr('denni-rytmus.pdf','../daily-rhythm.pdf');a.download='';a.textContent=tr('Stáhnout Denní rytmus (PDF)','Download Daily Rhythm (PDF)');m.appendChild(a);
    m.appendChild(document.createTextNode(tr(' Formulář zatím e-mail nikam neodesílá, napojíme ho při spuštění e-shopu.',' The form does not send your e-mail anywhere yet; we will connect it at launch.')));
    a.click();
  });
})();
// Zvuk „cvak“: krátký syntetizovaný klik, bez souboru. Vypínač si pamatuje volbu.
var Cvak=(function(){
  var ctx=null,on=true;
  try{on=localStorage.getItem('apx-sound')!=='off'}catch(e){}
  function play(){
    if(!on) return;
    var AC=window.AudioContext||window.webkitAudioContext; if(!AC) return;
    try{
      ctx=ctx||new AC(); if(ctx.state==='suspended') ctx.resume();
      var t=ctx.currentTime;
      // kovový „tik“: krátký šum přes pásmový filtr
      var len=Math.floor(ctx.sampleRate*.03),buf=ctx.createBuffer(1,len,ctx.sampleRate),d=buf.getChannelData(0);
      for(var i=0;i<len;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/len,6);
      var n=ctx.createBufferSource();n.buffer=buf;
      var bp=ctx.createBiquadFilter();bp.type='bandpass';bp.frequency.value=3200;bp.Q.value=2.5;
      var g=ctx.createGain();g.gain.value=.55;n.connect(bp);bp.connect(g);g.connect(ctx.destination);n.start(t);
      // tlumené „ťuk“ magnetu
      var o=ctx.createOscillator(),og=ctx.createGain();o.type='sine';o.frequency.setValueAtTime(190,t);o.frequency.exponentialRampToValueAtTime(70,t+.06);
      og.gain.setValueAtTime(.35,t);og.gain.exponentialRampToValueAtTime(.001,t+.08);o.connect(og);og.connect(ctx.destination);o.start(t);o.stop(t+.09);
      if(navigator.vibrate) navigator.vibrate(8);
    }catch(e){}
  }
  function set(v){on=v;try{localStorage.setItem('apx-sound',v?'on':'off')}catch(e){}
    document.querySelectorAll('.snd').forEach(function(b){b.setAttribute('aria-pressed',v?'true':'false');b.querySelector('span').textContent=v?tr('Zvuk zapnutý','Sound on'):tr('Zvuk vypnutý','Sound off')})}
  document.querySelectorAll('.snd').forEach(function(b){b.addEventListener('click',function(){set(!on);if(on)play()})});
  set(on);
  return {play:play};
})();
(function(){
  // Geniolok: Slide & Snap (2D ukázka a 3D model sdílejí krok víka i barvu)
  var devs=document.querySelectorAll('.device'); if(!devs.length) return;
  var r=document.getElementById('slide'), st=document.getElementById('devState'), g3=document.getElementById('g3d');
  var msgs=[tr('Zavřeno. Jeden skluz zpět a je hotovo.','Closed. One slide back and you are done.'),tr('Cvak. Otevřená přihrádka RÁNO.','Click. MORNING compartment open.'),tr('Cvak. Odkrytá i přihrádka ODPOLEDNE.','Click. AFTERNOON compartment open too.'),tr('Cvak. Odkrytý celý den, včetně přihrádky VEČER.','Click. The whole day open, EVENING included.')];
  var step=1;
  function set(v,sound){step=+v;devs.forEach(function(d){d.style.setProperty('--step',step)});if(r)r.value=step;if(st)st.textContent=msgs[step];if(sound)Cvak.play()}
  if(r) r.addEventListener('input',function(){if(+r.value!==step)set(r.value,true)});
  devs.forEach(function(d){
    if(d.closest('.g3d')) return; // 3D model řeší klik sám, kvůli tažení
    d.addEventListener('click',function(){set((step+1)%4,true)});
    d.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();set((step+1)%4,true)}});
  });
  window.apxStep=function(){set((step+1)%4,true)};
  var names={black:'Midnight Black',sage:'Sage Green',gold:'Champagne Gold'};
  document.querySelectorAll('.sw').forEach(function(b){b.addEventListener('click',function(){
    document.querySelectorAll('.sw').forEach(function(o){o.setAttribute('aria-pressed',o.dataset.color===b.dataset.color?'true':'false')});
    devs.forEach(function(d){d.setAttribute('data-color',b.dataset.color)});
    if(g3) g3.setAttribute('data-color',b.dataset.color);
    var main=document.getElementById('device');if(main)main.setAttribute('aria-label',tr('Geniolok, barva ','Geniolok, colour ')+names[b.dataset.color]+tr('. Klikněte pro posun víka.','. Click to slide the lid.'));
  })});
  set(1);
})();
(function(){
  // 3D Geniolok: táhnout = otočit, klepnout = posun víka
  var g=document.getElementById('g3d'); if(!g) return;
  var obj=g.querySelector('.g3d-obj'),rx=58,rz=-24,drag=null,moved=0,idle=true,last=0;
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  function apply(){obj.style.setProperty('--rx',rx+'deg');obj.style.setProperty('--rz',rz+'deg')}
  g.addEventListener('pointerdown',function(e){drag={x:e.clientX,y:e.clientY,rx:rx,rz:rz};moved=0;idle=false;g.setPointerCapture(e.pointerId);g.classList.add('grab')});
  g.addEventListener('pointermove',function(e){if(!drag)return;var dx=e.clientX-drag.x,dy=e.clientY-drag.y;moved=Math.max(moved,Math.abs(dx)+Math.abs(dy));
    rz=drag.rz-dx*.45;rx=Math.max(8,Math.min(85,drag.rx-dy*.35));apply()});
  function end(){if(!drag)return;drag=null;g.classList.remove('grab');if(moved<6&&window.apxStep)window.apxStep();setTimeout(function(){idle=true},2500)}
  g.addEventListener('pointerup',end);g.addEventListener('pointercancel',end);
  g.addEventListener('keydown',function(e){
    if(e.key==='ArrowLeft'){rz+=12;apply()}else if(e.key==='ArrowRight'){rz-=12;apply()}
    else if(e.key==='ArrowUp'){rx=Math.max(8,rx-8);apply()}else if(e.key==='ArrowDown'){rx=Math.min(85,rx+8);apply()}
    else if(e.key==='Enter'||e.key===' '){e.preventDefault();window.apxStep&&window.apxStep()}
    else return; idle=false;setTimeout(function(){idle=true},2500);
  });
  function tick(t){if(idle&&!reduce&&!document.hidden){rz-=(t-(last||t))*.008}last=t;apply();requestAnimationFrame(tick)}
  apply();requestAnimationFrame(tick);
})();
(function(){
  // Karty plánů: magnetický náklon za kurzorem, zhoupnutí po dotyku
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches; if(reduce) return;
  document.querySelectorAll('[data-tilt]').forEach(function(c){
    function reset(){c.classList.remove('active');['--rx','--ry'].forEach(function(k){c.style.setProperty(k,'0deg')});['--tx','--ty'].forEach(function(k){c.style.setProperty(k,'0px')})}
    c.addEventListener('pointermove',function(e){
      if(e.pointerType!=='mouse') return;
      var r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
      c.classList.add('active');
      c.style.setProperty('--ry',(x*12)+'deg');c.style.setProperty('--rx',(-y*10)+'deg');
      c.style.setProperty('--tx',(x*10)+'px');c.style.setProperty('--ty',(y*10)+'px');
      c.style.setProperty('--gx',((x+.5)*100)+'%');c.style.setProperty('--gy',((y+.5)*100)+'%');
    });
    c.addEventListener('pointerleave',reset);
    c.addEventListener('touchstart',function(){c.classList.remove('wobble');void c.offsetWidth;c.classList.add('wobble')},{passive:true});
    c.addEventListener('animationend',function(e){if(e.animationName==='wobble')c.classList.remove('wobble')});
  });
})();
(function(){
  // Hlavička: stín po scrollu a mobilní menu
  var h=document.getElementById('siteHeader'); if(!h) return;
  var onScroll=function(){h.classList.toggle('scrolled',window.scrollY>8)}; onScroll();
  window.addEventListener('scroll',onScroll,{passive:true});
  var b=h.querySelector('.menu-btn'), m=document.getElementById('mobileMenu');
  function set(open){b.setAttribute('aria-expanded',open?'true':'false');b.setAttribute('aria-label',open?tr('Zavřít menu','Close menu'):tr('Otevřít menu','Open menu'));m.hidden=!open}
  b.addEventListener('click',function(){set(m.hidden)});
  m.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){set(false)})});
})();
(function(){
  // Objednávka (ceny a účet jsou v APX nahoře v souboru)
  var f=document.getElementById('orderForm'); if(!f) return;
  var $=function(id){return document.getElementById(id)};
  var DEL={zasilkovna:tr('Zásilkovna','Packeta'),kuryr:tr('Kurýr na adresu','Courier to your door'),osobne:tr('Osobní odběr','Personal pick-up')};
  var PAY={qr:tr('QR platba','QR transfer'),cod:tr('Při převzetí','On delivery'),card:tr('Kartou online','Card online')};
  var need={zasilkovna:['o-point'],kuryr:['o-street','o-city','o-zip'],osobne:[]};
  function val(n){var c=f.querySelector('input[name="'+n+'"]:checked');return c?c.value:''}
  document.querySelectorAll('[data-price]').forEach(function(s){var p=APX.prices[s.dataset.price];s.textContent=p==null?'':kc(p)});
  document.querySelectorAll('[data-sub-off]').forEach(function(s){if(APX.subDiscount!=null){s.textContent='−'+APX.subDiscount+' %';s.hidden=false}});
  document.querySelectorAll('[data-ship]').forEach(function(s){var p=APX.shipping[s.dataset.ship];s.textContent=p==null?'':(p===0?'zdarma':'+ '+kc(p))});
  function total(){
    var p=APX.prices[val('plan')],s=APX.shipping[val('delivery')],c=val('pay')==='cod'?APX.shipping.cod:0;
    if(p!=null&&val('freq')==='sub'){if(APX.subDiscount==null)return null;p=Math.round(p*(1-APX.subDiscount/100))}
    return (p==null||s==null||c==null)?null:p+s+c;
  }
  function sync(){
    var d=val('delivery');
    f.querySelectorAll('.fields[data-for]').forEach(function(b){var on=b.dataset.for===d;b.hidden=!on});
    ['o-point','o-street','o-city','o-zip'].forEach(function(id){$(id).required=need[d].indexOf(id)>-1});
    // Dobírka nedává smysl u osobního odběru: tam se platí na místě
    var cod=document.querySelector('label[for="pay-cod"] small');
    cod.textContent=d==='osobne'?tr('Hotově nebo kartou při předání','Cash or card at hand-over'):tr('Hotově nebo kartou u kurýra či na výdejním místě','Cash or card to the courier or at the pick-up point');
    var sub=val('freq')==='sub';$('subHint').hidden=!sub;$('s-freq').textContent=sub?tr('Každých 30 dní','Every 30 days'):tr('Jednorázově','One-off');
    $('s-plan').textContent=val('plan');$('s-delivery').textContent=DEL[d];$('s-pay').textContent=PAY[val('pay')];
    var t=total();$('s-total').textContent=t==null?'Cena brzy':kc(t);
  }
  var h=decodeURIComponent(location.hash.slice(1)).toLowerCase(),pre=$('p-'+h);
  if(pre&&pre.name==='plan') pre.checked=true;
  f.addEventListener('change',sync);sync();
  function spayd(amount,vs,name){
    return 'SPD*1.0*ACC:'+APX.iban.replace(/\s/g,'')+'*AM:'+amount.toFixed(2)+'*CC:CZK*X-VS:'+vs+'*MSG:'+('APOTHELIX '+name).toUpperCase().normalize('NFD').replace(/[̀-ͯ*]/g,'').slice(0,60);
  }
  function drawQR(text){
    var box=$('qr');box.innerHTML='';box.classList.remove('empty');
    function go(){new QRCode(box,{text:text,width:300,height:300,correctLevel:QRCode.CorrectLevel.M})}
    if(window.QRCode) return go();
    var s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';s.onload=go;document.head.appendChild(s);
  }
  f.addEventListener('submit',function(e){
    e.preventDefault();var m=$('orderMsg');
    if(!f.checkValidity()){
      m.hidden=false;m.textContent=tr('Doplňte prosím zvýrazněné údaje a potvrďte souhlas s podmínkami.','Please fill in the highlighted fields and accept the terms.');
      var bad=f.querySelector(':invalid');if(bad){bad.focus();bad.reportValidity&&bad.reportValidity()}
      return;
    }
    m.hidden=true;
    var name=$('o-name').value.trim().split(/\s+/)[0],d=val('delivery'),p=val('pay'),vs=String(Date.now()).slice(-8);
    var where={zasilkovna:tr('na výdejní místo ','for the pick-up point ')+$('o-point').value.trim(),kuryr:tr('na adresu ','for delivery to ')+$('o-street').value.trim()+', '+$('o-city').value.trim(),osobne:tr('k osobnímu odběru, místo a čas domluvíme e-mailem','for personal pick-up; we will agree the place and time by e-mail')}[d];
    $('d-name').textContent=name;
    $('d-text').textContent=tr('Plán ','We will prepare the ')+val('plan')+tr(' připravíme ',' plan ')+where+tr('. Potvrzení pošleme na ','. We will send a confirmation to ')+$('o-email').value.trim()+'.'+(p==='cod'?tr(' Zaplatíte při převzetí.',' You pay on delivery.'):'')+(val('freq')==='sub'?tr(' Další balení pošleme za 30 dní.',' The next box ships in 30 days.'):'');
    var qb=$('qrBox');qb.hidden=p!=='qr';
    if(p==='qr'){
      var t=total();
      if(APX.iban&&t!=null){
        drawQR(spayd(t,vs,val('plan')));
        $('qrInfo').innerHTML='<span>'+tr('Naskenujte v bankovní aplikaci.','Scan it in your banking app.')+'</span><span>'+tr('Částka','Amount')+' <b>'+kc(t)+'</b></span><span>'+tr('Variabilní symbol','Payment reference')+' <b>'+vs+'</b></span><span>'+tr('Účet','Account')+' <b>'+APX.iban+'</b></span>';
      }else{
        var q=$('qr');q.innerHTML=tr('QR kód<br>po doplnění<br>účtu a ceny','QR code<br>once account<br>and price are set');q.classList.add('empty');
        $('qrInfo').innerHTML='<span>'+tr('Tady se zobrazí QR kód pro platbu převodem.','The QR code for a bank transfer will appear here.')+'</span><span>'+tr('Variabilní symbol','Payment reference')+' <b>'+vs+'</b></span>';
      }
    }
    f.hidden=true;document.querySelector('.summary').hidden=true;$('orderDone').hidden=false;
    $('orderDone').scrollIntoView({behavior:'smooth',block:'start'});
  });
})();
(function(){
  // Jiskry v pozadí: občas vylétne zlatá jiskra nebo záblesk
  if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var c=document.createElement('canvas');c.id='sparks';c.setAttribute('aria-hidden','true');document.body.prepend(c);
  var x=c.getContext('2d'),W,H,dpr,P=[],run=true,last=0,next=600;
  function rgb(){return getComputedStyle(document.documentElement).getPropertyValue('--spark').trim()||'212,170,90'}
  var col=rgb();
  function size(){dpr=Math.min(window.devicePixelRatio||1,2);W=innerWidth;H=innerHeight;c.width=W*dpr;c.height=H*dpr;x.setTransform(dpr,0,0,dpr,0,0)}
  size();addEventListener('resize',size);
  if(window.matchMedia) matchMedia('(prefers-color-scheme: dark)').addEventListener('change',function(){col=rgb()});
  function burst(){
    var ox=Math.random()*W,oy=H*(.25+Math.random()*.7),n=3+Math.random()*5|0;
    if(Math.random()<.35) P.push({k:'glint',x:ox,y:oy,t:0,life:1100,s:10+Math.random()*14});
    for(var i=0;i<n;i++){var a=-Math.PI/2+(Math.random()-.5)*1.6,v=.03+Math.random()*.08;
      P.push({k:'spark',x:ox,y:oy,vx:Math.cos(a)*v,vy:Math.sin(a)*v,t:0,life:1400+Math.random()*1600,r:.6+Math.random()*1.4})}
  }
  function frame(now){
    if(!run) return;
    var dt=Math.min(now-(last||now),50);last=now;
    next-=dt;if(next<=0){burst();next=1800+Math.random()*3800}
    x.clearRect(0,0,W,H);x.globalCompositeOperation='lighter';
    for(var i=P.length-1;i>=0;i--){var p=P[i];p.t+=dt;var k=p.t/p.life;if(k>=1){P.splice(i,1);continue}
      var a=Math.sin(Math.PI*k);
      if(p.k==='spark'){p.vy+=.00004*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;
        var g=x.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*5);g.addColorStop(0,'rgba('+col+','+(.9*a)+')');g.addColorStop(1,'rgba('+col+',0)');
        x.fillStyle=g;x.beginPath();x.arc(p.x,p.y,p.r*5,0,7);x.fill();
      }else{var s=p.s*a;x.strokeStyle='rgba('+col+','+(.55*a)+')';x.lineWidth=1;x.beginPath();
        x.moveTo(p.x-s,p.y);x.lineTo(p.x+s,p.y);x.moveTo(p.x,p.y-s);x.lineTo(p.x,p.y+s);x.stroke();
        var g2=x.createRadialGradient(p.x,p.y,0,p.x,p.y,s*.6);g2.addColorStop(0,'rgba('+col+','+(.5*a)+')');g2.addColorStop(1,'rgba('+col+',0)');x.fillStyle=g2;x.beginPath();x.arc(p.x,p.y,s*.6,0,7);x.fill()}
    }
    requestAnimationFrame(frame);
  }
  document.addEventListener('visibilitychange',function(){run=!document.hidden;if(run){last=0;requestAnimationFrame(frame)}});
  requestAnimationFrame(frame);
})();
(function(){
  // Hero: rozdělit nadpis na slova, ať naskakují postupně
  var h=document.querySelector('.hero2-text h1'); if(!h) return;
  var i=0;
  function wrap(node){
    var s=document.createElement('span');s.className='w';s.style.setProperty('--i',i++);return s;
  }
  Array.prototype.slice.call(h.childNodes).forEach(function(n){
    if(n.nodeType===3){
      var frag=document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach(function(part){
        if(!part) return;
        if(/^\s+$/.test(part)){frag.appendChild(document.createTextNode(part));return}
        var s=wrap();s.textContent=part;frag.appendChild(s);
      });
      h.replaceChild(frag,n);
    }else{var s=wrap();h.replaceChild(s,n);s.appendChild(n)}
  });
  h.setAttribute('aria-label',h.textContent.replace(/\s+/g,' ').trim());
})();
(function(){
  // Tečky pod karuselem plánů na mobilu
  var c=document.querySelector('.hero2 .pcards'),d=document.querySelectorAll('.pdots i'); if(!c||!d.length) return;
  c.addEventListener('scroll',function(){
    var cards=c.children,best=0,min=1e9,mid=c.scrollLeft+c.clientWidth/2;
    for(var k=0;k<cards.length;k++){var m=Math.abs(cards[k].offsetLeft+cards[k].offsetWidth/2-mid);if(m<min){min=m;best=k}}
    d.forEach(function(x,k){x.classList.toggle('on',k===best)});
  },{passive:true});
})();
(function(){
  // Spodní lišta Objednat: objeví se, když hlavní tlačítko zmizí z obrazovky
  var b=document.getElementById('buybar'),t=document.querySelector('.page-hero .ctas'); if(!b||!t||!window.IntersectionObserver) return;
  var link=b.querySelector('a');
  new IntersectionObserver(function(e){
    var show=!e[0].isIntersecting&&e[0].boundingClientRect.top<0;
    b.classList.toggle('show',show);b.setAttribute('aria-hidden',show?'false':'true');link.tabIndex=show?0:-1;
  }).observe(t);
})();
(function(){
  // Kvíz: tři otázky, výsledek podle převažující části dne
  var q=document.getElementById('quiz'); if(!q) return;
  var steps=q.querySelectorAll('.q'),bar=document.getElementById('qBar'),lab=document.getElementById('qStep'),back=document.getElementById('qBack'),res=document.getElementById('qResult');
  var answers=[],cur=0;
  var PLANS={
    all:{name:'GenioLoci',slug:'genioloci',orb:'<i class="o am"></i><i class="o pm"></i><i class="o ev"></i>',text:tr('Celý den v jednom plánu: ráno, odpoledne i večer. Pro ty, kdo nechtějí řešit, kterou část dne posílit, a chtějí mít rutinu hotovou.','The whole day in one plan: morning, afternoon and evening. For those who would rather not choose which part of the day to focus on and just want the routine sorted.')},
    am:{name:'Jatroděj',slug:'jatrodej',orb:'<i class="o am"></i>',text:tr('Těžiště leží ráno, se zesílenou dávkou ostropestřce a NAC. Pro období po náročném životním stylu, kdy toho bylo víc než dost.','The focus is on the morning, with a larger dose of milk thistle and NAC. For the stretch after a demanding lifestyle, when there has been more than enough.')},
    ev:{name:'Očistelix',slug:'ocistelix',orb:'<i class="o ev"></i>',text:tr('Těžiště leží večer: hořčík, L-theanin a ashwagandha. Pro ty, kdo večer leží v posteli a hlava pořád běží.','The focus is on the evening: magnesium, L-theanine and ashwagandha. For those who lie in bed at night while their mind keeps running.')}
  };
  function show(n){
    cur=n;steps.forEach(function(s,k){s.hidden=k!==n;s.classList.toggle('active',k===n)});
    bar.style.width=(n/steps.length*100)+'%';lab.textContent=tr('Otázka '+(n+1)+' ze '+steps.length,'Question '+(n+1)+' of '+steps.length);lab.hidden=false;
    back.hidden=n===0;res.hidden=true;
    steps[n].querySelectorAll('.q-opt').forEach(function(o){o.classList.toggle('picked',answers[n]===o.dataset.v)});
  }
  function result(){
    var score={all:0,am:0,ev:0};answers.forEach(function(a){score[a]++});
    var pick='all';if(score.am>score.all&&score.am>score.ev)pick='am';else if(score.ev>score.all&&score.ev>score.am)pick='ev';
    var p=PLANS[pick];
    steps.forEach(function(s){s.hidden=true});back.hidden=true;lab.hidden=true;bar.style.width='100%';
    var orb=document.getElementById('rOrb');orb.className='orb'+(pick==='all'?'':' solo');orb.innerHTML=p.orb;
    document.getElementById('rName').textContent=p.name;document.getElementById('rText').textContent=p.text;
    document.getElementById('rOrder').href='objednavka.html#'+p.slug;document.getElementById('rOrder').textContent=tr('Objednat ','Order ')+p.name;
    document.getElementById('rDetail').href=p.slug+'.html';
    res.hidden=false;var h=res.querySelector('h1');h.setAttribute('tabindex','-1');h.focus({preventScroll:true});window.scrollTo({top:0,behavior:'smooth'});
  }
  q.addEventListener('click',function(e){
    var o=e.target.closest('.q-opt'); if(!o) return;
    answers[cur]=o.dataset.v;o.classList.add('picked');
    setTimeout(function(){cur+1<steps.length?show(cur+1):result()},220);
  });
  back.addEventListener('click',function(){if(cur>0)show(cur-1)});
  document.getElementById('qAgain').addEventListener('click',function(){answers=[];show(0)});
  show(0);
})();
(function(){
  // Recenze se ukážou, až v APX.reviews nějaké budou
  var box=document.getElementById('reviews'); if(!box||!APX.reviews.length) return;
  var list=box.querySelector('.rev-list');
  APX.reviews.forEach(function(r){
    var c=document.createElement('figure');c.className='rev';
    var stars='★★★★★'.slice(0,r.stars||5)+'☆☆☆☆☆'.slice(0,5-(r.stars||5));
    c.innerHTML='<span class="rev-stars" aria-label="'+(r.stars||5)+' / 5">'+stars+'</span><blockquote></blockquote><figcaption><b></b><span></span></figcaption>';
    c.querySelector('blockquote').textContent=r.text;c.querySelector('b').textContent=r.name;
    c.querySelector('figcaption span').textContent=[r.city,r.about].filter(Boolean).join(' · ');
    list.appendChild(c);
  });
  box.hidden=false;
})();
