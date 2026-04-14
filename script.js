/* ── EMAIL — assembled to prevent Cloudflare obfuscation ── */
(function(){
var u=‘contact’;
var d=‘immersion-danse’+’.fr’;
var email=u+’@’+d;
var el=document.getElementById(‘contactEmailLink’);
if(el){el.href=‘mai’+‘lto:’+email;el.textContent=email;}
var ep=document.getElementById(‘email’);
if(ep){ep.placeholder=‘votre@email.com’;}
})();

/* ── MOBILE NAV ── */
document.getElementById(‘burger’).addEventListener(‘click’,function(){
var nav=document.getElementById(‘mobile-nav’);
if(nav.classList.contains(‘open’)){closeMob();}
else{nav.classList.add(‘open’);document.body.style.overflow=‘hidden’;}
});
document.getElementById(‘nav-close’).addEventListener(‘click’,closeMob);
document.querySelectorAll(’.mobile-link’).forEach(function(l){l.addEventListener(‘click’,closeMob);});
function closeMob(){document.getElementById(‘mobile-nav’).classList.remove(‘open’);document.body.style.overflow=’’;}

/* ── NAV SHRINK ── */
window.addEventListener(‘scroll’,function(){
document.getElementById(‘main-nav’).style.padding=window.scrollY>60?‘14px 48px’:‘22px 48px’;
});

/* ── SCROLL REVEAL ── */
var obsRev=new IntersectionObserver(function(entries){
entries.forEach(function(e,i){
if(e.isIntersecting){setTimeout(function(){e.target.classList.add(‘visible’);},i*65);obsRev.unobserve(e.target);}
});
},{threshold:0.07});
document.querySelectorAll(’.reveal’).forEach(function(el){obsRev.observe(el);});

/* ── SLIDER ── */
(function(){
var outer=document.getElementById(‘sliderOuter’);
var track=document.getElementById(‘sliderTrack’);
var currentX=0,startX=0,startTranslate=0,isDragging=false,isPointer=false;

function getSlideWidth(){var s=track.querySelector(’.slide’);return s?s.offsetWidth+14:0;}
function getMaxTranslate(){return Math.max(0,track.scrollWidth-outer.offsetWidth);}
function moveTo(x){currentX=Math.max(0,Math.min(x,getMaxTranslate()));track.style.transform=‘translateX(-’+currentX+‘px)’;}
function snapToNearest(){
var sw=getSlideWidth();if(!sw)return;
currentX=Math.max(0,Math.min(Math.round(currentX/sw)*sw,getMaxTranslate()));
track.classList.remove(‘dragging’);track.style.transform=‘translateX(-’+currentX+‘px)’;
}
function snapWithDelta(delta){
var sw=getSlideWidth();if(!sw)return;
var t=Math.min(60,sw*0.15);
if(delta>t)currentX=Math.min(getMaxTranslate(),currentX+sw);
else if(delta<-t)currentX=Math.max(0,currentX-sw);
else{currentX=Math.max(0,Math.min(Math.round(currentX/sw)*sw,getMaxTranslate()));}
track.classList.remove(‘dragging’);track.style.transform=‘translateX(-’+currentX+‘px)’;
}

document.getElementById(‘sliderPrev’).addEventListener(‘click’,function(){currentX=Math.max(0,currentX-getSlideWidth());track.classList.remove(‘dragging’);track.style.transform=‘translateX(-’+currentX+‘px)’;});
document.getElementById(‘sliderNext’).addEventListener(‘click’,function(){currentX=Math.min(getMaxTranslate(),currentX+getSlideWidth());track.classList.remove(‘dragging’);track.style.transform=‘translateX(-’+currentX+‘px)’;});

outer.addEventListener(‘pointerdown’,function(e){if(e.pointerType===‘touch’)return;isPointer=true;isDragging=true;startX=e.clientX;startTranslate=currentX;track.classList.add(‘dragging’);outer.setPointerCapture(e.pointerId);e.preventDefault();},{passive:false});
outer.addEventListener(‘pointermove’,function(e){if(!isDragging||!isPointer)return;moveTo(startTranslate+(startX-e.clientX));});
outer.addEventListener(‘pointerup’,function(e){if(!isPointer)return;var d=e.clientX-startX;isDragging=false;isPointer=false;snapWithDelta(-d);});
outer.addEventListener(‘pointercancel’,function(){isDragging=false;isPointer=false;snapToNearest();});

var touchStartX=0;
outer.addEventListener(‘touchstart’,function(e){touchStartX=e.touches[0].clientX;startTranslate=currentX;track.classList.add(‘dragging’);},{passive:true});
outer.addEventListener(‘touchmove’,function(e){moveTo(startTranslate+(touchStartX-e.touches[0].clientX));},{passive:true});
outer.addEventListener(‘touchend’,function(e){snapWithDelta(-(e.changedTouches[0].clientX-touchStartX));});

outer.addEventListener(‘wheel’,function(e){if(Math.abs(e.deltaX)>Math.abs(e.deltaY)){e.preventDefault();track.classList.add(‘dragging’);moveTo(currentX+e.deltaX);clearTimeout(outer._wt);outer._wt=setTimeout(snapToNearest,120);}},{passive:false});
window.addEventListener(‘resize’,function(){currentX=0;track.classList.remove(‘dragging’);track.style.transform=‘translateX(0)’;});
})();

/* ── MODAL ── */
function openModal(){document.getElementById(‘modalOverlay’).classList.add(‘open’);document.body.style.overflow=‘hidden’;}
function closeModal(){document.getElementById(‘modalOverlay’).classList.remove(‘open’);document.body.style.overflow=’’;}
document.getElementById(‘modalOverlay’).addEventListener(‘click’,function(e){if(e.target===this)closeModal();});
document.addEventListener(‘keydown’,function(e){if(e.key===‘Escape’)closeModal();});

/* ── LIGHTBOX ── */
(function(){
var images=[‘7.jpg’,‘8.jpg’,‘9.jpg’,‘10.jpg’,‘11.jpg’,‘12.jpg’,‘13.jpg’,‘14.jpg’,‘15.jpg’,‘16.jpg’];
var current=0;
var lb=document.getElementById(‘lightbox’);
var lbImg=document.getElementById(‘lbImg’);
var lbCounter=document.getElementById(‘lbCounter’);

function openLB(idx){current=idx;lbImg.src=images[current];lbCounter.textContent=(current+1)+’ / ‘+images.length;lb.classList.add(‘open’);document.body.style.overflow=‘hidden’;}
function closeLB(){lb.classList.remove(‘open’);document.body.style.overflow=’’;lbImg.src=’’;}
function prevLB(){current=(current-1+images.length)%images.length;lbImg.src=images[current];lbCounter.textContent=(current+1)+’ / ‘+images.length;}
function nextLB(){current=(current+1)%images.length;lbImg.src=images[current];lbCounter.textContent=(current+1)+’ / ’+images.length;}

document.querySelectorAll(’.slide’).forEach(function(slide,i){slide.addEventListener(‘click’,function(){openLB(i);});});
document.getElementById(‘lbClose’).addEventListener(‘click’,closeLB);
document.getElementById(‘lbPrev’).addEventListener(‘click’,prevLB);
document.getElementById(‘lbNext’).addEventListener(‘click’,nextLB);
lb.addEventListener(‘click’,function(e){if(e.target===lb)closeLB();});
document.addEventListener(‘keydown’,function(e){if(!lb.classList.contains(‘open’))return;if(e.key===‘Escape’)closeLB();if(e.key===‘ArrowLeft’)prevLB();if(e.key===‘ArrowRight’)nextLB();});

var lbTouchX=0,lbTouchY=0;
lb.addEventListener(‘touchstart’,function(e){lbTouchX=e.touches[0].clientX;lbTouchY=e.touches[0].clientY;},{passive:true});
lb.addEventListener(‘touchmove’,function(e){e.preventDefault();},{passive:false});
lb.addEventListener(‘touchend’,function(e){
var dx=lbTouchX-e.changedTouches[0].clientX;
var dy=Math.abs(lbTouchY-e.changedTouches[0].clientY);
if(Math.abs(dx)>30 && dy<60){dx>0?nextLB():prevLB();}
});
})();

/* ── FORM — EmailJS ── */
async function submitForm(e){
e.preventDefault();
var f=e.target;
var btn=document.getElementById(‘submitBtn’);
var errEl=document.getElementById(‘formError’);
var sendEl=document.getElementById(‘formSending’);
errEl.style.display=‘none’;
btn.style.display=‘none’;
sendEl.style.display=‘block’;

var SERVICE_ID=‘service_2ybzur7’;
var TEMPLATE_ID=‘template_ob0h4k5’;
var AUTO_TMPL_ID=‘template_4gtggg3’;
var PUBLIC_KEY=‘4mOrzuXYkaASqZVQW’;

var params={
prenom:f.prenom.value,
nom:f.nom.value,
email:f.email.value,
telephone:f.tel.value,
chambre:f.chambre.value,
message:f.message.value,
to_email:‘contact’+’@’+‘immersion-danse.fr’,
reply_to:f.email.value
};

try{
if(!window.emailjs){
await new Promise(function(res,rej){
var s=document.createElement(‘script’);
s.src=‘https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js’;
s.onload=res;s.onerror=rej;
document.head.appendChild(s);
});
window.emailjs.init({publicKey:PUBLIC_KEY});
}
await window.emailjs.send(SERVICE_ID,TEMPLATE_ID,params);
await window.emailjs.send(SERVICE_ID,AUTO_TMPL_ID,params);
sendEl.style.display=‘none’;
document.getElementById(‘formWrap’).style.display=‘none’;
document.getElementById(‘formSuccess’).style.display=‘block’;
setTimeout(function(){
closeModal();
setTimeout(function(){
document.getElementById(‘formWrap’).style.display=‘block’;
document.getElementById(‘formSuccess’).style.display=‘none’;
btn.style.display=‘block’;
f.reset();
},400);
},3000);
}catch(err){
sendEl.style.display=‘none’;
errEl.style.display=‘block’;
btn.style.display=‘block’;
}
}