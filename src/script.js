(function(){
  // Formulář zájmu
  var f=document.getElementById('interestForm'),m=document.getElementById('formMsg');
  if(f) f.addEventListener('submit',function(e){
    e.preventDefault();
    if(!f.checkValidity()){m.hidden=false;m.textContent='Vyplňte prosím platný e-mail a potvrďte souhlas.';return}
    m.hidden=false;m.textContent='Děkujeme. Formulář zatím nikam neodesílá, napojíme ho při spuštění e-shopu.';
  });
})();
(function(){
  // Geniolok: Slide & Snap
  var d=document.getElementById('device'); if(!d) return;
  var r=document.getElementById('slide'), st=document.getElementById('devState');
  var msgs=['Zavřeno. Jeden skluz zpět a je hotovo.','Cvak. Otevřená přihrádka RÁNO.','Cvak. Odkrytá i přihrádka ODPOLEDNE.','Cvak. Odkrytý celý den, včetně přihrádky VEČER.'];
  function set(v){v=+v;d.style.setProperty('--step',v);r.value=v;st.textContent=msgs[v]}
  r.addEventListener('input',function(){set(r.value)});
  d.addEventListener('click',function(){set((+r.value+1)%4)});
  d.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();set((+r.value+1)%4)}});
  var names={black:'Midnight Black',sage:'Sage Green',gold:'Champagne Gold'};
  document.querySelectorAll('.sw').forEach(function(b){b.addEventListener('click',function(){
    document.querySelectorAll('.sw').forEach(function(o){o.setAttribute('aria-pressed',o===b?'true':'false')});
    d.setAttribute('data-color',b.dataset.color);d.setAttribute('aria-label','Geniolok, barva '+names[b.dataset.color]+'. Klikněte pro posun víka.');
  })});
  set(1);
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
  function set(open){b.setAttribute('aria-expanded',open?'true':'false');b.setAttribute('aria-label',open?'Zavřít menu':'Otevřít menu');m.hidden=!open}
  b.addEventListener('click',function(){set(m.hidden)});
  m.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){set(false)})});
})();
(function(){
  // Objednávka. Ceny, poštovné a účet doplňte sem; null = zatím neznámé.
  var APX={
    iban:null, // např. 'CZ6508000000192000145399'
    prices:{'GenioLoci':null,'Jatroděj':null,'Očistelix':null},
    shipping:{zasilkovna:null,kuryr:null,osobne:0,cod:null}
  };
  var f=document.getElementById('orderForm'); if(!f) return;
  var $=function(id){return document.getElementById(id)};
  var DEL={zasilkovna:'Zásilkovna',kuryr:'Kurýr na adresu',osobne:'Osobní odběr'};
  var PAY={qr:'QR platba',cod:'Při převzetí',card:'Kartou online'};
  var need={zasilkovna:['o-point'],kuryr:['o-street','o-city','o-zip'],osobne:[]};
  function kc(n){return n.toLocaleString('cs-CZ')+' Kč'}
  function val(n){var c=f.querySelector('input[name="'+n+'"]:checked');return c?c.value:''}
  document.querySelectorAll('[data-price]').forEach(function(s){var p=APX.prices[s.dataset.price];s.textContent=p==null?'':kc(p)});
  document.querySelectorAll('[data-ship]').forEach(function(s){var p=APX.shipping[s.dataset.ship];s.textContent=p==null?'':(p===0?'zdarma':'+ '+kc(p))});
  function total(){
    var p=APX.prices[val('plan')],s=APX.shipping[val('delivery')],c=val('pay')==='cod'?APX.shipping.cod:0;
    return (p==null||s==null||c==null)?null:p+s+c;
  }
  function sync(){
    var d=val('delivery');
    f.querySelectorAll('.fields[data-for]').forEach(function(b){var on=b.dataset.for===d;b.hidden=!on});
    ['o-point','o-street','o-city','o-zip'].forEach(function(id){$(id).required=need[d].indexOf(id)>-1});
    // Dobírka nedává smysl u osobního odběru: tam se platí na místě
    var cod=document.querySelector('label[for="pay-cod"] small');
    cod.textContent=d==='osobne'?'Hotově nebo kartou při předání':'Hotově nebo kartou u kurýra či na výdejním místě';
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
      m.hidden=false;m.textContent='Doplňte prosím zvýrazněné údaje a potvrďte souhlas s podmínkami.';
      var bad=f.querySelector(':invalid');if(bad){bad.focus();bad.reportValidity&&bad.reportValidity()}
      return;
    }
    m.hidden=true;
    var name=$('o-name').value.trim().split(/\s+/)[0],d=val('delivery'),p=val('pay'),vs=String(Date.now()).slice(-8);
    var where={zasilkovna:'na výdejní místo '+$('o-point').value.trim(),kuryr:'na adresu '+$('o-street').value.trim()+', '+$('o-city').value.trim(),osobne:'k osobnímu odběru, místo a čas domluvíme e-mailem'}[d];
    $('d-name').textContent=name;
    $('d-text').textContent='Plán '+val('plan')+' připravíme '+where+'. Potvrzení pošleme na '+$('o-email').value.trim()+'.'+(p==='cod'?' Zaplatíte při převzetí.':'');
    var qb=$('qrBox');qb.hidden=p!=='qr';
    if(p==='qr'){
      var t=total();
      if(APX.iban&&t!=null){
        drawQR(spayd(t,vs,val('plan')));
        $('qrInfo').innerHTML='<span>Naskenujte v bankovní aplikaci.</span><span>Částka <b>'+kc(t)+'</b></span><span>Variabilní symbol <b>'+vs+'</b></span><span>Účet <b>'+APX.iban+'</b></span>';
      }else{
        var q=$('qr');q.innerHTML='QR kód<br>po doplnění<br>účtu a ceny';q.classList.add('empty');
        $('qrInfo').innerHTML='<span>Tady se zobrazí QR kód pro platbu převodem.</span><span>Variabilní symbol <b>'+vs+'</b></span>';
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
    all:{name:'GenioLoci',slug:'genioloci',orb:'<i class="o am"></i><i class="o pm"></i><i class="o ev"></i>',text:'Celý den v jednom plánu: ráno, odpoledne i večer. Pro ty, kdo nechtějí řešit, kterou část dne posílit, a chtějí mít rutinu hotovou.'},
    am:{name:'Jatroděj',slug:'jatrodej',orb:'<i class="o am"></i>',text:'Těžiště leží ráno, se zesílenou dávkou ostropestřce a NAC. Pro období po náročném životním stylu, kdy toho bylo víc než dost.'},
    ev:{name:'Očistelix',slug:'ocistelix',orb:'<i class="o ev"></i>',text:'Těžiště leží večer: hořčík, L-theanin a ashwagandha. Pro ty, kdo večer leží v posteli a hlava pořád běží.'}
  };
  function show(n){
    cur=n;steps.forEach(function(s,k){s.hidden=k!==n;s.classList.toggle('active',k===n)});
    bar.style.width=(n/steps.length*100)+'%';lab.textContent='Otázka '+(n+1)+' ze '+steps.length;lab.hidden=false;
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
    document.getElementById('rOrder').href='objednavka.html#'+p.slug;document.getElementById('rOrder').textContent='Objednat '+p.name;
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
