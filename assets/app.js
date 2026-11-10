(function(){
'use strict';
const P=window.PRODUCTS, S=window.STORE;
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const money=n=>'₹'+Number(n).toLocaleString('en-IN');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const bySlug=Object.fromEntries(P.map(p=>[p.slug,p]));
const CATS=['Torans','Pooja Jodi Sets','Jain & Religious Décor','Festive Hangings & Candles','Rangoli','Charan & Swastik Décor','Photo Frames','Fridge Magnets','Marble Wall Art','Marble Powder Idols','Home Décor','3D Art','Earrings','Stationery'];
P.forEach(p=>{p.ask=!p.price; p.save=(p.mrp&&p.price)?p.mrp-p.price:0; p.pct=p.save?Math.round(p.save/p.mrp*100):0;});
const store={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};

/* ---------- toast ---------- */
let tt;function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('on'),2400)}

/* ---------- whatsapp ---------- */
const wa=text=>`https://wa.me/${S.whatsapp}?text=${encodeURIComponent(text)}`;
const url=p=>`${S.domain}/p/${p.slug}/`;
function enquireLink(p){return wa(`Hello ${S.name}! I would like to enquire about:\n\n${p.name}\n${url(p)}\n\nPlease share the price and details${p.cat==='Marble Wall Art'?' (size / design / customization)':''}.`)}

/* ---------- product cards ---------- */
function priceHTML(p){
  if(p.ask)return `<div class="price ask">Contact us for price</div>`;
  return `<div class="price">${money(p.price)}${p.mrp?`<s>${money(p.mrp)}</s>`:''}${p.unit?`<small>${esc(p.unit)}</small>`:''}</div>`;
}
const MPC='Marble Powder Idols';
function cardHTML(p){
  const i2=p.imgs[1]?`<img src="${p.imgs[1]}" alt="" loading="lazy">`:'';
  return `<article class="card"><a class="cardImg" href="p/${p.slug}/" aria-label="${esc(p.name)}">
  ${p.pct?`<span class="off">SAVE ${p.pct}%</span>`:''}${p.tag&&!p.pct?`<span class="tag">${esc(p.tag)}</span>`:''}
  <img src="${p.imgs[0]}" alt="${esc(p.name)}" loading="lazy" width="400" height="400">${i2}</a>
  <div class="cardBody"><div class="meta">${esc(p.cat)}</div>${p.mp?'<div class="mpBadge">✓ Marble powder · Bone-meal free</div>':''}<h3><a href="p/${p.slug}/">${esc(p.name)}</a></h3>
  <div class="priceRow">${priceHTML(p)}${p.ask?`<a class="enq" href="${enquireLink(p)}" target="_blank" rel="noopener">Enquire</a>`:`<button class="add" data-add="${p.slug}" aria-label="Add ${esc(p.name)} to cart">+</button>`}</div></div></article>`;
}

/* ---------- shop ---------- */
const F={cat:'All',q:'',sort:'featured'};
const SALE=S.sale&&S.sale.on;
const MAXPCT=Math.max(...P.map(p=>p.pct));
function renderChips(){
  $('#chips').innerHTML=['All',...CATS].map(c=>`<button class="chip${F.cat===c?' on':''}" data-cat="${esc(c)}">${esc(c)}</button>`).join('');
}
function renderGrid(){
  let l=P.filter(p=>(F.cat==='All'||(F.cat==='On Sale'?p.save>0:p.cat===F.cat))&&(!F.q||(p.name+' '+p.cat+' '+p.desc).toLowerCase().includes(F.q.toLowerCase())));
  const key=p=>p.ask?1e9:p.price;
  if(F.sort==='low')l=[...l].sort((a,b)=>key(a)-key(b));
  if(F.sort==='high')l=[...l].sort((a,b)=>(a.ask?-1:0)-(b.ask?-1:0)||key(b)-key(a));
  if(F.sort==='name')l=[...l].sort((a,b)=>a.name.localeCompare(b.name));
  $('#grid').innerHTML=l.length?l.map(cardHTML).join(''):`<div class="empty">No products match your search. <a href="${wa('Hello! I am looking for: '+F.q)}" target="_blank" rel="noopener" style="text-decoration:underline;color:var(--green)">Ask us on WhatsApp</a>.</div>`;
  $('#mpBanner').hidden=F.cat!==MPC;
  $('#count').textContent=`Showing ${l.length} of ${P.length} products`;
  renderChips();
}
function setCat(c,scroll){F.cat=c;renderGrid();if(scroll)goHome('shop')}
function renderCatTiles(){
  $('#catTiles').innerHTML=CATS.map(c=>{const l=P.filter(p=>p.cat===c);return `<button class="cat" data-cat="${esc(c)}"><img src="${l[0].imgs[0]}" alt="${esc(c)}" loading="lazy"><div>${esc(c)}<small>${l.length} ${l.length>1?'products':'product'}</small></div></button>`}).join('');
}

/* ---------- cart ---------- */
let cart=store.get('jk_cart2',[]).filter(x=>bySlug[x.slug]&&!bySlug[x.slug].ask);
const subtotal=()=>cart.reduce((s,x)=>s+bySlug[x.slug].price*x.qty,0);
const count=()=>cart.reduce((s,x)=>s+x.qty,0);
function saveCart(){store.set('jk_cart2',cart);renderCart()}
function addToCart(slug,q=1,open=true){const p=bySlug[slug];if(!p||p.ask)return;const x=cart.find(x=>x.slug===slug);x?x.qty=Math.min(99,x.qty+q):cart.push({slug,qty:q});saveCart();toast(`Added: ${p.name}`);if(open)openCart()}
function changeQty(slug,d){const x=cart.find(x=>x.slug===slug);if(!x)return;x.qty+=d;if(x.qty<=0)cart=cart.filter(y=>y!==x);saveCart()}
function removeItem(slug){cart=cart.filter(x=>x.slug!==slug);saveCart()}
function renderCart(){
  $('#cartCount').textContent=count();
  $('#cartTotal').textContent=money(subtotal());
  const b=$('#cartBody');
  if(!cart.length){b.innerHTML='<div class="empty">Your cart is empty.<br><br><a class="btn ghost" href="#/shop" data-closecart>Browse the collection</a></div>';$('#checkoutBtn').disabled=true;return}
  $('#checkoutBtn').disabled=false;
  b.innerHTML=cart.map(x=>{const p=bySlug[x.slug];return `<div class="cartItem"><img src="${p.imgs[0]}" alt="${esc(p.name)}"><div><b><a href="p/${p.slug}/" data-closecart>${esc(p.name)}</a></b><div class="meta">${money(p.price)}${p.unit?' '+esc(p.unit):''}</div><div class="qty"><button data-q="${p.slug}" data-d="-1" aria-label="Decrease">−</button><span>${x.qty}</span><button data-q="${p.slug}" data-d="1" aria-label="Increase">+</button><button class="rm" data-rm="${p.slug}">Remove</button></div></div><b>${money(p.price*x.qty)}</b></div>`}).join('');
}
function openCart(){$('#drawer').classList.add('open');$('#overlay').classList.add('on')}
function closeCart(){$('#drawer').classList.remove('open');$('#overlay').classList.remove('on')}

/* ---------- checkout ---------- */
let orderId='';
const upiOn=()=>/^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test((S.upiId||'').trim());
function newOrderId(){const d=new Date();return 'JK'+String(d.getFullYear()).slice(2)+String(d.getMonth()+1).padStart(2,'0')+String(d.getDate()).padStart(2,'0')+'-'+Math.random().toString(36).slice(2,6).toUpperCase()}
function upiLink(amount){return `upi://pay?pa=${encodeURIComponent(S.upiId.trim())}&pn=${encodeURIComponent(S.upiName)}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent('Order '+orderId)}`}
function openCheckout(){
  if(!cart.length){toast('Add a product to your cart first.');return}
  closeCart();orderId=newOrderId();
  $('#coForm').hidden=false;$('#coDone').hidden=true;$('#coSide').hidden=false;$('.checkoutBox').classList.remove('finished');
  const amt=subtotal();
  $('#sumLines').innerHTML=cart.map(x=>{const p=bySlug[x.slug];return `<div><span>${esc(p.name)} × ${x.qty}</span><span>${money(p.price*x.qty)}</span></div>`}).join('');
  $('#sumTotal').textContent=money(amt);$('#orderIdTxt').textContent=orderId;
  const qr=$('#qrBox');qr.innerHTML='';
  if(upiOn()){
    $('#payOn').hidden=false;$('#payOff').hidden=true;$('#utrField').hidden=false;
    $('#upiTxt').textContent=S.upiId;$('#payAmt').textContent=money(amt);
    const link=upiLink(amt);$('#upiApp').href=link;
    try{const q=qrcode(0,'M');q.addData(link);q.make();qr.innerHTML=q.createSvgTag({cellSize:4,margin:2,scalable:true});const sv=qr.querySelector('svg');sv.setAttribute('width',190);sv.setAttribute('height',190);sv.setAttribute('role','img');sv.setAttribute('aria-label','UPI payment QR code')}catch(err){qr.textContent='QR could not load. Use the "Pay with UPI app" button.'}
  }else{$('#payOn').hidden=true;$('#payOff').hidden=false;$('#utrField').hidden=true}
  $('#checkout').classList.add('open');document.body.style.overflow='hidden';
  setTimeout(()=>$('#fName').focus(),50);
}
function closeCheckout(){$('#checkout').classList.remove('open');document.body.style.overflow=''}
function validate(){
  const v={name:$('#fName').value.trim(),phone:$('#fPhone').value.replace(/[\s\-+]/g,'').replace(/^91(?=\d{10}$)/,''),addr:$('#fAddr').value.trim(),city:$('#fCity').value.trim(),state:$('#fState').value.trim(),pin:$('#fPin').value.trim(),utr:$('#fUtr').value.trim(),note:$('#fNote').value.trim()};
  const rules={fName:v.name.length>=2,fPhone:/^[6-9]\d{9}$/.test(v.phone),fAddr:v.addr.length>=10,fCity:v.city.length>=2,fState:v.state.length>=2,fPin:/^[1-9]\d{5}$/.test(v.pin),fUtr:!upiOn()||/^\d{12}$/.test(v.utr)};
  let first=null;
  for(const id in rules){const f=$('#'+id).closest('.field');const bad=!rules[id];f.classList.toggle('bad',bad);if(bad&&!first)first=id}
  if(first){$('#'+first).focus();return null}
  return v;
}
function placeOrder(){
  const v=validate();if(!v)return;
  const lines=cart.map((x,i)=>{const p=bySlug[x.slug];return `${i+1}. ${p.name} × ${x.qty} = ${money(p.price*x.qty)}`}).join('\n');
  const msg=`*New order — ${S.name}*\nOrder ID: ${orderId}\n\n*Items*\n${lines}\n\n*Items total: ${money(subtotal())}*\n(Delivery charges, if any, to be confirmed)\n\n*Customer*\nName: ${v.name}\nPhone: ${v.phone}\nAddress: ${v.addr}, ${v.city}, ${v.state} - ${v.pin}\n${upiOn()?`\n*Payment*\nPaid via UPI to ${S.upiId}\nUTR: ${v.utr}\n`:'\nPayment: please share payment details.\n'}${v.note?`\nNote: ${v.note}\n`:''}`;
  const link=wa(msg);
  window.open(link,'_blank','noopener');
  $('#coForm').hidden=true;$('#coSide').hidden=true;$('#coDone').hidden=false;$('.checkoutBox').classList.add('finished');
  $('#doneId').textContent=orderId;$('#doneLink').href=link;
  $('#doneTxt').textContent=upiOn()?'Please send the WhatsApp message that just opened. We will verify your payment (UTR) and confirm your order and delivery time.':'Please send the WhatsApp message that just opened. We will reply with the payment details and delivery time.';
  cart=[];saveCart();
}

/* ---------- routing ---------- */
const views={home:$('#home'),product:$('#product'),page:$('#page')};
function show(v){for(const k in views)views[k].hidden=k!==v;$$('.links a').forEach(a=>a.classList.remove('on'))}
function goHome(id){location.hash='#/'+(id||'')}
function setMeta(title,desc,img){
  document.title=title;
  const set=(sel,attr,val)=>{const e=$(sel);if(e)e.setAttribute(attr,val)};
  set('meta[name=description]','content',desc);set('meta[property="og:title"]','content',title);set('meta[property="og:description"]','content',desc);
  if(img)set('meta[property="og:image"]','content',S.domain+'/'+img);
}
const HOME_TITLE='Jinendra Kalakriti | Jain Décor, Torans, Pooja Jodi & Thoughtful Gifting';
const HOME_DESC='Shop Jain & religious décor, torans, rangoli, pooja jodi sets, photo frames, marble wall art and gifts from Jinendra Kalakriti, Alwar. Pan-India delivery. Order on WhatsApp.';
function route(){
  const h=decodeURIComponent(location.hash.replace(/^#\/?/,''));
  const [a,b]=h.split('/');
  $('#ld')?.remove();
  const PS=document.body.dataset.product;
  if(PS&&bySlug[PS]&&!a){show('product');renderProduct(bySlug[PS]);return}
  if(a==='product'&&bySlug[b]){location.replace('/p/'+b+'/');return}
  if(a==='page'&&PAGES[b]){show('page');renderPage(b);window.scrollTo(0,0);return}
  show('home');setMeta(HOME_TITLE,HOME_DESC,'img/logo-full.jpg');
  if(a==='category'&&b){F.cat=(CATS.includes(b)||(SALE&&b==='On Sale'))?b:'All';renderGrid()}
  const id=(a==='category')?'shop':a;
  const el=id&&document.getElementById(id);
  if(el)setTimeout(()=>el.scrollIntoView(),30);else window.scrollTo(0,0);
}

/* ---------- product page ---------- */
let pvQty=1,curSlug='';
function renderProduct(p){
  pvQty=1;curSlug=p.slug;
  const rel=[...P.filter(x=>x.cat===p.cat&&x!==p),...P.filter(x=>x.cat!==p.cat)].slice(0,4);
  const thumbs=p.imgs.length>1?`<div class="thumbs">${p.imgs.map((s,i)=>`<button data-th="${i}" class="${i?'':'on'}" aria-label="Photo ${i+1}"><img src="${s}" alt=""></button>`).join('')}</div>`:'';
  const buy=p.ask?`<div class="buy"><a class="btn wa" target="_blank" rel="noopener" href="${enquireLink(p)}">Enquire on WhatsApp for price</a></div><p class="note">This piece is made to order. Tell us the size and design you want and we will share the price.</p>`:
  `<div class="buy"><div class="qtyBox"><button data-pq="-1" aria-label="Decrease quantity">−</button><span id="pvq">1</span><button data-pq="1" aria-label="Increase quantity">+</button></div><button class="btn" id="pvAdd">Add to cart</button><button class="btn gold" id="pvBuy">Buy now</button></div>
  <a class="btn ghost block" target="_blank" rel="noopener" href="${enquireLink(p)}">Ask a question on WhatsApp</a>`;
  $('#product').innerHTML=`<div class="container page" style="padding-top:36px"><nav class="crumbs"><a href="#/">Home</a> / <a href="#/category/${encodeURIComponent(p.cat)}">${esc(p.cat)}</a> / ${esc(p.name)}</nav>
  <div class="pv"><div class="gallery"><div class="mainImg" id="mainImg"><img id="mainPic" src="${p.imgs[0]}" alt="${esc(p.name)}"></div>${thumbs}</div>
  <div><div class="eyebrow">${esc(p.cat)}</div><h1>${esc(p.name)}</h1>
  <div class="pvPrice">${p.ask?`<span class="ask">Contact us for price</span>`:`<b>${money(p.price)}</b>${p.unit?`<span class="meta">${esc(p.unit)}</span>`:''}${p.mrp?`<s>${money(p.mrp)}</s><span class="save">SAVE ${money(p.save)}</span>`:''}`}</div>
  ${p.ask?'':'<div class="tax">Delivery charges, if any, are confirmed on WhatsApp before you pay.</div>'}
  ${p.mp?`<div class="mpBox"><b>Pure and Jain-friendly</b><span>✓ Made from marble powder</span><span>✓ 100% bone-meal free</span><span>✓ Natural colours used</span></div>`:''}
  <p class="desc">${esc(p.desc)}</p>
  <h4>Highlights</h4><ul>${p.details.map(d=>`<li>${esc(d)}</li>`).join('')}</ul>
  ${buy}
  <div class="perks"><div class="perk"><b>Real product photos</b>What you see is from our own collection.</div><div class="perk"><b>Pan-India delivery</b>We ship across India from Alwar.</div><div class="perk"><b>Gift-ready</b>Easy to choose for festive moments.</div><div class="perk"><b>Human support</b>Chat with us on WhatsApp any time.</div></div>
  <div class="share"><a href="${wa('Check this out: '+p.name+'\n'+url(p))}" target="_blank" rel="noopener">Share on WhatsApp</a><button id="copyLink">Copy link</button></div></div></div>
  <section class="related"><div class="sectionHead"><div><div class="eyebrow">You may also like</div><h2>More from the collection</h2></div></div><div class="grid">${rel.map(cardHTML).join('')}</div></section></div>`;
  setMeta(`${p.name} | ${S.name}`,`${p.desc}${p.price?` Price ${money(p.price)}.`:''} Order on WhatsApp. Pan-India delivery.`,p.imgs[0]);
  const ld={'@context':'https://schema.org','@type':'Product',name:p.name,image:p.imgs.map(i=>`${S.domain}/${i}`),description:p.desc,category:p.cat,brand:{'@type':'Brand',name:S.name},url:url(p)};
  if(p.price)ld.offers={'@type':'Offer',priceCurrency:'INR',price:String(p.price),availability:'https://schema.org/InStock',url:url(p)};
  const s=document.createElement('script');s.type='application/ld+json';s.id='ld';s.textContent=JSON.stringify(ld);document.head.appendChild(s);
}

/* ---------- info pages ---------- */
const WAL=`<a class="btn wa" target="_blank" rel="noopener" href="${wa('Hello Jinendra Kalakriti!')}">Message us on WhatsApp</a>`;
const PAGES={
 shipping:{t:'Shipping & delivery',s:'We ship handcrafted pieces across India from Alwar, Rajasthan.',h:`<h2>Where we deliver</h2><p>We deliver across India. Pincode availability and delivery time are confirmed with you on WhatsApp when we confirm your order.</p><h2>Dispatch and delivery time</h2><p>Every order is checked and packed by hand. Once your payment is verified, we share the expected dispatch and delivery time with you on WhatsApp. During festive seasons such as Diwali, timelines can be longer, so please order early.</p><h2>Delivery charges</h2><p>Delivery charges, if any, depend on your location and the size of the order. We tell you the exact amount before you pay anything extra.</p><h2>Large and custom pieces</h2><p>Marble wall art, torans and pooja jodi sets are packed with extra care. Custom pieces are made to order, so their timeline is shared when you confirm the design.</p>`},
 returns:{t:'Returns & care',s:'Handcrafted pieces are packed with care. If something is not right, we will make it right.',h:`<h2>Damaged or wrong item</h2><p>If your order arrives damaged or you receive the wrong item, message us on WhatsApp as soon as you receive the parcel with a few clear photos, ideally including a video of opening the parcel. We will arrange a replacement or a solution with you.</p><h2>Made-to-order pieces</h2><p>Marble wall art and other customised pieces are made specially for you, so they cannot be returned once production starts. Please confirm the size and design carefully before ordering.</p><h2>Colour and finish</h2><p>Our products are handmade and photographed in natural light. Small differences in shade or finish between the photo and the piece are part of handcrafted work.</p><h2>Care</h2><p>Keep décor pieces dry and away from direct heat. Dust gently with a soft dry cloth. Candles should never be left burning unattended.</p>`},
 faq:{t:'Frequently asked questions',s:'Quick answers about ordering, payment and delivery.',h:`<details class="faq"><summary>How do I place an order?</summary><p>Add products to your cart, go to checkout, fill in your delivery details and place the order. It opens a WhatsApp message with your order, which you send to us. We then confirm everything with you.</p></details><details class="faq"><summary>How do I pay?</summary><p>Pay by UPI using the QR code at checkout (any UPI app works), then enter the 12-digit UTR / transaction number so we can verify your payment.</p></details><details class="faq"><summary>What is the price of marble wall art?</summary><p>Marble wall art is customisable in size and design, so the price depends on what you choose. Tap "Enquire on WhatsApp" on the product and tell us what you need.</p></details><details class="faq"><summary>Can I order in bulk or for gifting / hampers?</summary><p>Yes. Message us on WhatsApp with the items and quantity and we will help you put together a gift hamper.</p></details><details class="faq"><summary>Do you deliver across India?</summary><p>Yes, we deliver pan-India. See the <a href="#/page/shipping" style="text-decoration:underline">shipping page</a> for details.</p></details><details class="faq"><summary>What if my item arrives damaged?</summary><p>Message us on WhatsApp with photos right away. See <a href="#/page/returns" style="text-decoration:underline">returns &amp; care</a>.</p></details>`},
 contact:{t:'Contact us',s:'We reply fastest on WhatsApp.',h:`<div class="contactGrid"><div class="contactCard"><h3>WhatsApp</h3><p>${S.whatsappDisplay}<br>Orders, questions and custom pieces.</p>${WAL}</div><div class="contactCard"><h3>Instagram</h3><p>@${S.instagram}<br>See new pieces and behind the scenes.</p><a class="btn ghost" target="_blank" rel="noopener" href="https://instagram.com/${S.instagram}">Open Instagram</a></div><div class="contactCard"><h3>Studio</h3><p>${S.city}<br>Online orders, shipped across India.</p><a class="btn ghost" href="#/page/shipping">Shipping details</a></div></div>`},
};
function renderPage(k){
  const p=PAGES[k];
  $('#page').innerHTML=`<div class="container page"><nav class="crumbs"><a href="#/">Home</a> / ${esc(p.t)}</nav><div class="eyebrow">${S.name}</div><h1>${esc(p.t)}</h1><p class="sub">${esc(p.s)}</p><div class="prose">${p.h}</div></div>`;
  setMeta(`${p.t} | ${S.name}`,p.s,'img/om-arham-toran-1.jpg');
}

/* ---------- hero slideshow ---------- */
function initHero(){
  const picks=['om-arham-toran','kalash-rangoli','laxmi-ganesh-saraswati-photo-frame','rainbow-ombre-pooja-jodi'].map(s=>bySlug[s]);
  $('#slides').innerHTML=picks.map((p,i)=>`<a href="p/${p.slug}/" class="${i?'':'on'}"><img src="${p.imgs[0]}" alt="${esc(p.name)}" ${i?'loading="lazy"':''}><figcaption><b>${esc(p.name)}</b>${p.price?'From '+money(p.price):'Made to order'}</figcaption></a>`).join('');
  let i=0;const els=$$('#slides a');
  if(!matchMedia('(prefers-reduced-motion:reduce)').matches)setInterval(()=>{els[i].classList.remove('on');i=(i+1)%els.length;els[i].classList.add('on')},4200);
}
function observe(){const els=$$('.reveal:not(.show)');if(!('IntersectionObserver'in window)){els.forEach(e=>e.classList.add('show'));return}const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('show');io.unobserve(e.target)}}),{threshold:.08});els.forEach(e=>io.observe(e))}

/* ---------- events ---------- */
document.addEventListener('click',e=>{
  const t=e.target.closest('[data-add],[data-cat],[data-q],[data-rm],[data-th],[data-pq],[data-closecart],#pvAdd,#pvBuy,#copyLink,#mainImg,.menu,#mobileNav a');if(!t)return;
  if(t.dataset.add){addToCart(t.dataset.add)}
  else if(t.dataset.cat!==undefined){F.q='';$('#q').value='';F.cat=t.dataset.cat;renderGrid();if(location.hash==='#/shop')$('#shop').scrollIntoView();else location.hash='#/shop'}
  else if(t.dataset.q){changeQty(t.dataset.q,+t.dataset.d)}
  else if(t.dataset.rm){removeItem(t.dataset.rm)}
  else if(t.dataset.th!==undefined){$('#mainPic').src=t.querySelector('img').src;$$('.thumbs button').forEach(b=>b.classList.toggle('on',b===t))}
  else if(t.dataset.pq){pvQty=Math.max(1,Math.min(99,pvQty+ +t.dataset.pq));$('#pvq').textContent=pvQty}
  else if(t.dataset.closecart!==undefined){closeCart()}
  else if(t.id==='pvAdd'){addToCart(curSlug,pvQty)}
  else if(t.id==='pvBuy'){addToCart(curSlug,pvQty,false);openCheckout()}
  else if(t.id==='copyLink'){navigator.clipboard?.writeText(location.href).then(()=>toast('Link copied'),()=>toast('Copy the link from the address bar'))}
  else if(t.id==='mainImg'){$('#lbImg').src=$('#mainPic').src;$('#lightbox').classList.add('open')}
  else if(t.classList.contains('menu')){$('#mobileNav').classList.toggle('open')}
  else if(t.closest('#mobileNav')){$('#mobileNav').classList.remove('open')}
});
$('#q').addEventListener('input',e=>{F.q=e.target.value.trim();renderGrid()});
$('#sort').addEventListener('change',e=>{F.sort=e.target.value;renderGrid()});
$('#searchBtn').addEventListener('click',()=>{if(location.hash!=='#/shop')location.hash='#/shop';setTimeout(()=>$('#q').focus(),150)});
$('#cartBtn').addEventListener('click',openCart);
$('#overlay').addEventListener('click',closeCart);
$('#closeCartBtn').addEventListener('click',closeCart);
$('#checkoutBtn').addEventListener('click',openCheckout);
$('#closeCo').addEventListener('click',closeCheckout);
$('#closeCo2').addEventListener('click',closeCheckout);
$('#placeBtn').addEventListener('click',placeOrder);
$('#lightbox').addEventListener('click',()=>$('#lightbox').classList.remove('open'));
$$('#coForm input,#coForm textarea').forEach(i=>i.addEventListener('input',()=>i.closest('.field').classList.remove('bad')));
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeCart();closeCheckout();$('#lightbox').classList.remove('open')}});
window.addEventListener('hashchange',route);

/* ---------- init ---------- */
$('#heroCount').textContent=P.length;
$('#year').textContent=new Date().getFullYear();
$$('[data-wa]').forEach(a=>{a.href=wa('Hello Jinendra Kalakriti!');a.target='_blank';a.rel='noopener'});
$$('[data-ig]').forEach(a=>{a.href='https://instagram.com/'+S.instagram;a.target='_blank';a.rel='noopener'});
$$('[data-wadisp]').forEach(a=>a.textContent=S.whatsappDisplay);
if(SALE){const t=S.sale.name+(S.sale.endText?' · '+S.sale.endText:'');const a=$('#ann');a.textContent=`🪔 ${t} is on · Pan-India delivery`;a.classList.add('sale');const bd=$('#saleBadge');bd.hidden=false;bd.textContent=`🪔 ${S.sale.name} is on`}
renderChips();renderGrid();renderCatTiles();renderCart();initHero();observe();route();
})();
