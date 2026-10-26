(function(root){
var N="#0B1F3A",O="#EE3E1E",W="#FFFFFF",G="#F1F3F7";
var SB="Outfit SemiBold",MD="Outfit Medium",RG="Outfit";
var C={phone:"(16) 99634-1354",ig:"@aciona.portoes",site:"acionaportoes.com.br",tagline:"Portões automáticos"};
var TH={
dark:{bg:N,fg:W,mu:"#C5CEDD",logo:[W,O,W],acc:O,card:"#16305A",line:"#2A4670",pill:O,pillfg:N},
light:{bg:G,fg:N,mu:"#4A5A75",logo:[N,O,N],acc:O,card:W,line:"#D5DAE3",pill:O,pillfg:N},
white:{bg:W,fg:N,mu:"#4A5A75",logo:[N,O,N],acc:O,card:G,line:"#D5DAE3",pill:O,pillfg:N},
orange:{bg:O,fg:N,mu:N,logo:[W,N,W],acc:W,card:N,line:N,pill:N,pillfg:W}};
var FM={"4x5":{w:1080,h:1350,top:150,bot:120},"sq":{w:1080,h:1080,top:150,bot:120},"story":{w:1080,h:1920,top:340,bot:380}};
var M=90,E={measure:function(f,s,t){return t.length*s*0.55}};
function esc(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}
function tw(t,f,s,ls){return E.measure(f,s,t)+(ls||0)*t.length}
function wrap(t,f,s,mw){var o=[],c="";String(t||"").split(/\s+/).forEach(function(w){if(!w)return;var x=c?c+" "+w:w;if(tw(x,f,s)<=mw||!c)c=x;else{o.push(c);c=w}});if(c)o.push(c);return o}
function T(x,y,s,sz,fill,f,an,ls){return '<text x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" font-family="'+(f||RG)+'" font-size="'+(+sz).toFixed(1)+'" fill="'+fill+'"'+(an?' text-anchor="'+an+'"':"")+(ls?' letter-spacing="'+ls+'"':"")+'>'+esc(s)+'</text>'}
function fit(lines,sz,mw){var m=0;lines.forEach(function(l){m=Math.max(m,tw(l,SB,sz))});return m<=mw?sz:sz*mw/m}
function blk(x,y,t,f,sz,fill,mw,lh,an){var ls=wrap(t,f,sz,mw),o="";ls.forEach(function(l,i){o+=T(x,y+sz*0.8+i*sz*lh,l,sz,fill,f,an)});return {s:o,h:ls.length*sz*lh}}
function pill(x,y,t,th,sz){sz=sz||26;var w=tw(t,SB,sz,3)+64;return '<rect x="'+x+'" y="'+y+'" width="'+w.toFixed(1)+'" height="60" rx="30" fill="'+th.pill+'"/>'+T(x+32,y+40,t,sz,th.pillfg,SB,0,3)}
function logo(kind,v,x,y,w){
var B=root.BRAND_DATA,c=v,L=B.L,R=B.R,inner,bx;
if(kind==="sym"){inner='<path d="'+L+'" fill="'+c[0]+'"/><path d="'+R+'" fill="'+c[1]+'"/>';bx=[12,12,108,108]}
else if(kind==="hz"){inner='<path d="'+L+'" fill="'+c[0]+'"/><path d="'+R+'" fill="'+c[1]+'"/><path d="'+B.hz.d+'" fill="'+c[2]+'"/>';bx=B.hz.box}
else{inner='<g transform="translate('+B.vt.dx.toFixed(2)+',0)"><path d="'+L+'" fill="'+c[0]+'"/><path d="'+R+'" fill="'+c[1]+'"/></g><path d="'+B.vt.d+'" fill="'+c[2]+'"/>';bx=B.vt.box}
var bw=bx[2]-bx[0],bh=bx[3]-bx[1];
return {s:'<svg x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+w+'" height="'+(w*bh/bw).toFixed(1)+'" viewBox="'+bx[0]+" "+bx[1]+" "+bw+" "+bh+'">'+inner+'</svg>',h:w*bh/bw}}
function arrow(x,y,c){return '<path d="M'+x+" "+y+"H"+(x+80)+"M"+(x+62)+" "+(y-18)+"L"+(x+80)+" "+y+"L"+(x+62)+" "+(y+18)+'" fill="none" stroke="'+c+'" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>'}
function arr(a){return Array.isArray(a)?a:(a?String(a).split("\n").filter(function(x){return x!==""}):[])}
var LAY={};
function titleLines(s,th,sz){var a=arr(s.lines),b=arr(s.accent),z=fit(a.concat(b),sz,900),o="",y=0;
a.forEach(function(l){o+=T(M,y+z*0.82,l,z,th.fg,SB);y+=z*1.1});b.forEach(function(l){o+=T(M,y+z*0.82,l,z,th.acc,SB);y+=z*1.1});return {s:o,h:y}}
LAY.cover=function(s,f,th){var o="",y=0;if(s.tag){o+=pill(M,0,s.tag,th);y=100}
var t=titleLines(s,th,s.size||112);o+='<g transform="translate(0,'+y+')">'+t.s+'</g>';y+=t.h+30;
if(s.sub){var b=blk(M,y,s.sub,RG,42,th.mu,880,1.35);o+=b.s;y+=b.h}
if(s.cue!==false){y+=70;o+=T(M,y+20,"ARRASTE",26,th.mu,SB,0,4)+arrow(M+170,y+10,th.acc);y+=40}
return {s:o,h:y}};
LAY.step=function(s,f,th){var o="",y=0;if(s.num){o+=T(M,200,s.num,250,th.acc,SB);y=250}
var t=blk(M,y,s.title,SB,70,th.fg,900,1.15);o+=t.s;y+=t.h+26;
var b=blk(M,y,s.body,RG,42,th.fg,880,1.4);o+=b.s;y+=b.h;return {s:o,h:y}};
function bl(s,f,th,chk){var o="",y=0,t=blk(M,y,s.title,SB,76,th.fg,900,1.12);o+=t.s;y+=t.h+60;
arr(s.items).forEach(function(it){var ls=wrap(it,MD,44,800);
if(chk)o+='<rect x="'+(M+2)+'" y="'+(y+8)+'" width="40" height="40" rx="10" fill="none" stroke="'+th.acc+'" stroke-width="5"/><path d="M'+(M+12)+" "+(y+29)+"l9 9l16-18"+'" fill="none" stroke="'+th.acc+'" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>';
else o+='<rect x="'+M+'" y="'+(y+14)+'" width="26" height="26" rx="7" fill="'+th.acc+'"/>';
ls.forEach(function(l,i){o+=T(M+62,y+36+i*58,l,44,th.fg,MD)});y+=ls.length*58+50});
return {s:o,h:y}}
LAY.bullets=function(s,f,th){return bl(s,f,th,false)};
LAY.checklist=function(s,f,th){return bl(s,f,th,true)};
LAY.compare=function(s,f,th){var o="",y=0,t=blk(M,y,s.title,SB,72,th.fg,900,1.12);o+=t.s;y+=t.h+50;
var cs=[[s.aT,s.aB,th.card==="#16305A"?"#16305A":W,th.fg===W?W:N,th.mu],[s.bT,s.bB,N,W,"#C5CEDD"]];
var hs=cs.map(function(c){var a=blk(0,0,c[0],SB,52,c[3],380,1.12),b=blk(0,0,c[1],RG,36,c[3],375,1.4);return 130+a.h+30+b.h+40}),H=Math.max(hs[0],hs[1],420);
cs.forEach(function(c,k){var x=M+k*455;o+='<rect x="'+x+'" y="'+y+'" width="445" height="'+H+'" rx="28" fill="'+c[2]+'" stroke="'+th.line+'"/><rect x="'+(x+36)+'" y="'+(y+40)+'" width="64" height="10" rx="5" fill="'+O+'"/>';
var a=blk(x+36,y+90,c[0],SB,52,c[3],380,1.12);o+=a.s;o+=blk(x+36,y+90+a.h+24,c[1],RG,36,c[3],375,1.4).s});
return {s:o,h:y+H}};
LAY.cta=function(s,f,th){var o="",y=0,a=arr(s.lines),b=arr(s.accent),z=fit(a.concat(b),96,900);
a.forEach(function(l){o+=T(M,y+z*0.82,l,z,th.fg,SB);y+=z*1.1});b.forEach(function(l){o+=T(M,y+z*0.82,l,z,th.acc,SB);y+=z*1.1});y+=50;
o+=T(M,y+22,"CHAME NO WHATSAPP",24,th.mu,SB,0,4);y+=44;
var pw=tw(C.phone,SB,54)+90;o+='<rect x="'+M+'" y="'+y+'" width="'+pw.toFixed(0)+'" height="100" rx="50" fill="'+th.pill+'"/>'+T(M+45,y+70,C.phone,54,th.pillfg,SB);y+=100;
o+=T(M,y+80,C.ig,44,th.fg,MD)+T(M,y+138,C.site,40,th.fg,MD);y+=160;return {s:o,h:y}};
LAY.statement=function(s,f,th){var o="",y=0;if(s.tag){o+=pill(M,0,s.tag,th);y=110}
var t=titleLines(s,th,s.size||110);o+='<g transform="translate(0,'+y+')">'+t.s+'</g>';y+=t.h;
if(s.sub){y+=30;var b=blk(M,y,s.sub,RG,40,th.mu,880,1.4);o+=b.s;y+=b.h}
if(s.sym){y+=90;var l=logo("sym",th.logo,M,y,150);o+=l.s;y+=l.h}
return {s:o,h:y}};
LAY.quote=function(s,f,th){var o=T(M-6,260,"\u201C",380,th.acc,SB),y=170;
var b=blk(M,y,s.text,SB,62,th.fg,900,1.2);o+=b.s;y+=b.h+50;
o+=T(M,y+34,s.name||"",40,th.fg,SB)+T(M,y+84,s.place||"",34,th.mu,MD);return {s:o,h:y+100}};
LAY.myth=function(s,f,th){var l=s.label||"MITO",o='<rect x="'+M+'" y="0" width="'+(tw(l,SB,34,5)+80).toFixed(0)+'" height="76" rx="38" fill="'+N+'"/>'+T(M+40,52,l,34,W,SB,0,5),y=130;
var b=blk(M,y,s.title,SB,96,th.fg,900,1.1);o+=b.s;y+=b.h+30;o+='<rect x="'+M+'" y="'+y+'" width="900" height="3" fill="'+th.line+'"/>';y+=50;
o+=T(M,y+36,s.vlabel||"A verdade",44,th.acc,SB);y+=70;var c=blk(M,y,s.body,RG,46,th.fg,880,1.4);o+=c.s;y+=c.h;return {s:o,h:y}};
LAY.poll=function(s,f,th){var o="",y=0;if(s.tag){o+=pill(M,0,s.tag,th);y=110}
var b=blk(M,y,s.title,SB,92,th.fg,900,1.12);o+=b.s;y+=b.h+70;
[s.o1,s.o2].forEach(function(l,k){o+='<rect x="'+M+'" y="'+y+'" width="900" height="140" rx="70" fill="'+(k?th.card:N)+'" stroke="'+th.line+'" stroke-width="3"/>'+T(540,y+92,l,56,k?(th.card===N||th.card==="#16305A"?W:N):W,SB,"middle");y+=170});
return {s:o,h:y-30}};
LAY.services=function(s,f,th){var o="",y=0;if(s.tag){o+=pill(M,0,s.tag,th);y=110}
var t=titleLines(s,th,84);o+='<g transform="translate(0,'+y+')">'+t.s+'</g>';y+=t.h+50;
arr(s.items).forEach(function(it,k){o+=T(M,y+40,String(k+1).padStart(2,"0"),40,th.acc,SB)+T(M+90,y+40,it,48,th.fg,MD)+'<rect x="'+M+'" y="'+(y+68)+'" width="900" height="2" fill="'+th.line+'"/>';y+=108});
return {s:o,h:y}};
LAY.hours=function(s,f,th){var o="",y=0;if(s.tag){o+=pill(M,0,s.tag,th);y=110}
var t=titleLines(s,th,92);o+='<g transform="translate(0,'+y+')">'+t.s+'</g>';y+=t.h+50;
arr(s.rows).forEach(function(r){var p=r.split("|");o+=T(M,y+40,p[0],44,th.mu,MD)+T(1080-M,y+40,p[1]||"",44,th.fg,SB,"end")+'<rect x="'+M+'" y="'+(y+70)+'" width="900" height="2" fill="'+th.line+'"/>';y+=116});return {s:o,h:y}};
LAY.notice=function(s,f,th){var o="",y=0;if(s.tag){o+=pill(M,0,s.tag,th);y=110}
var b=blk(M,y,s.title,SB,100,th.fg,900,1.1);o+=b.s;y+=b.h+40;var c=blk(M,y,s.body,RG,46,th.fg,880,1.4);o+=c.s;y+=c.h;return {s:o,h:y}};
LAY.beforeafter=function(s,f,th){var o="",y=0,t=blk(M,y,s.title,SB,76,th.fg,900,1.12);o+=t.s;y+=t.h+50;
[["ANTES",s.img1],["DEPOIS",s.img2]].forEach(function(p,k){var x=M+k*455,id="cl"+k;
o+='<clipPath id="'+id+'"><rect x="'+x+'" y="'+y+'" width="445" height="620" rx="24"/></clipPath><rect x="'+x+'" y="'+y+'" width="445" height="620" rx="24" fill="#DDE3EE"/>';
if(p[1])o+='<image href="'+p[1]+'" x="'+x+'" y="'+y+'" width="445" height="620" preserveAspectRatio="xMidYMid slice" clip-path="url(#'+id+')"/>';else o+=T(x+222,y+320,"FOTO",34,"#4A5A75",MD,"middle",4);
var w=tw(p[0],SB,26,3)+50;o+='<rect x="'+(x+20)+'" y="'+(y+20)+'" width="'+w.toFixed(0)+'" height="52" rx="26" fill="'+(k?O:N)+'"/>'+T(x+45,y+57,p[0],26,k?N:W,SB,0,3)});
y+=650;var b=blk(M,y,s.body,RG,40,th.fg,900,1.35);o+=b.s;y+=b.h;return {s:o,h:y}};
LAY.highlight=function(s,f,th){var l=logo("sym",th.logo,540-150,0,300);return {s:l.s+T(540,l.h+170,s.title||"",92,th.fg,SB,"middle"),h:l.h+190}};
function cfg(th){return (th.card===N||th.card==="#16305A")?W:N}
LAY.bignum=function(s,f,th){var o="",y=0;if(s.tag){o+=pill(M,0,s.tag,th);y=120}
var z=Math.min(360,fit([s.big],360,900));o+=T(M,y+z*0.8,s.big,z,th.acc,SB);y+=z*1.0+10;
var t=blk(M,y,s.title,SB,66,th.fg,900,1.15);o+=t.s;y+=t.h;
if(s.sub){y+=26;var b=blk(M,y,s.sub,RG,40,th.mu,880,1.4);o+=b.s;y+=b.h}
return {s:o,h:y}};
LAY.quiz=function(s,f,th){var o=pill(M,0,s.tag||"QUIZ",th),y=110,cf=cfg(th);
var t=blk(M,y,s.title,SB,66,th.fg,900,1.15);o+=t.s;y+=t.h+46;
arr(s.options).forEach(function(op,k){var ls=wrap(op,MD,40,700),h=Math.max(120,ls.length*54+50),cy=y+h/2;
o+='<rect x="'+M+'" y="'+y+'" width="900" height="'+h+'" rx="30" fill="'+th.card+'" stroke="'+th.line+'" stroke-width="3"/><circle cx="'+(M+68)+'" cy="'+cy+'" r="34" fill="'+th.pill+'"/>'+T(M+68,cy+14,"ABC"[k],40,th.pillfg,SB,"middle");
ls.forEach(function(l,i){o+=T(M+130,cy+14-(ls.length-1)*27+i*54,l,40,cf,MD)});y+=h+22});
return {s:o,h:y-22}};
LAY.reveal=function(s,f,th){var o=pill(M,0,s.tag||"RESPOSTA",th),y=120;
o+='<circle cx="'+(M+110)+'" cy="'+(y+110)+'" r="110" fill="'+th.pill+'"/>'+T(M+110,y+170,s.letter,170,th.pillfg,SB,"middle");y+=270;
var t=blk(M,y,s.title,SB,62,th.fg,900,1.15);o+=t.s;y+=t.h+22;var b=blk(M,y,s.body,RG,42,th.fg,880,1.4);o+=b.s;y+=b.h;return {s:o,h:y}};
LAY.glossary=function(s,f,th){var o=pill(M,0,s.tag||"GLOSSÁRIO",th),y=120,z=fit([s.term],150,900);
o+=T(M,y+z*0.82,s.term,z,th.acc,SB);y+=z*1.1+30;var b=blk(M,y,s.def,RG,48,th.fg,880,1.4);o+=b.s;y+=b.h;
if(s.tip){y+=44;o+='<rect x="'+M+'" y="'+y+'" width="900" height="3" fill="'+th.line+'"/>';y+=44;o+=T(M,y+34,"Na prática",38,th.acc,SB);y+=64;var c=blk(M,y,s.tip,RG,42,th.fg,880,1.4);o+=c.s;y+=c.h}
return {s:o,h:y}};
LAY.flow=function(s,f,th){var o="",y=0,t=blk(M,y,s.title,SB,70,th.fg,900,1.12);o+=t.s;y+=t.h+56;var ns=arr(s.nodes);
ns.forEach(function(n,k){var p=n.split("|"),cy=y+46;
if(k<ns.length-1)o+='<rect x="'+(M+40)+'" y="'+(cy+46)+'" width="8" height="84" rx="4" fill="'+th.acc+'"/>';
o+='<circle cx="'+(M+44)+'" cy="'+cy+'" r="46" fill="'+th.pill+'"/>'+T(M+44,cy+17,String(k+1),48,th.pillfg,SB,"middle");
o+=T(M+130,cy-2,p[0],54,th.fg,SB)+T(M+130,cy+44,p[1]||"",38,th.mu,MD);y+=176});
return {s:o,h:y-86}};
LAY.chat=function(s,f,th){var o=pill(M,0,s.tag||"DÚVIDA COMUM",th),y=110,cf=cfg(th),dark=th.bg===N;
if(s.title){var t=blk(M,y,s.title,SB,64,th.fg,900,1.15);o+=t.s;y+=t.h+30}
var last="";arr(s.msgs).forEach(function(m){var us=m.w==="us",ls=wrap(m.t,MD,40,600),w=0;
ls.forEach(function(l){w=Math.max(w,tw(l,MD,40))});w+=70;var h=ls.length*54+46,x=us?M+900-w:M;
if(m.w!==last){o+=T(us?M+900:M,y+22,us?"aciona":"cliente",26,th.mu,SB,us?"end":0,2);y+=44;last=m.w}
var bf=us?(dark?O:N):th.card,tf=us?(dark?N:W):cf;
o+='<rect x="'+x.toFixed(0)+'" y="'+y+'" width="'+w.toFixed(0)+'" height="'+h+'" rx="36" fill="'+bf+'"'+(us?"":' stroke="'+th.line+'" stroke-width="3"')+'/>';
ls.forEach(function(l,i){o+=T(x+35,y+23+40*0.8+i*54+6,l,40,tf,MD)});y+=h+20});
return {s:o,h:y}};
LAY.anatomy=function(s,f,th){var o="",y=0,t=blk(M,y,s.title,SB,66,th.fg,900,1.12);o+=t.s;y+=t.h+36;var g="",fg=th.fg;
g+='<rect x="0" y="70" width="70" height="262" fill="'+th.card+'" stroke="'+th.line+'" stroke-width="3"/><rect x="830" y="70" width="70" height="262" fill="'+th.card+'" stroke="'+th.line+'" stroke-width="3"/>';
g+='<rect x="110" y="170" width="680" height="152" rx="8" fill="none" stroke="'+fg+'" stroke-width="6"/>';
for(var i=1;i<12;i++)g+='<rect x="'+(110+i*680/12-2)+'" y="170" width="4" height="152" fill="'+fg+'"/>';
g+='<rect x="110" y="236" width="680" height="4" fill="'+fg+'"/>';
g+='<line x1="124" y1="306" x2="776" y2="306" stroke="'+fg+'" stroke-width="14" stroke-dasharray="8 6"/>';
g+='<rect x="0" y="330" width="900" height="10" rx="3" fill="'+fg+'"/>';
g+='<rect x="340" y="258" width="150" height="70" rx="12" fill="'+O+'" stroke="'+th.bg+'" stroke-width="6"/>';
g+='<rect x="70" y="236" width="22" height="46" rx="5" fill="'+fg+'"/><rect x="808" y="236" width="22" height="46" rx="5" fill="'+fg+'"/><circle cx="81" cy="252" r="5" fill="'+O+'"/><circle cx="819" cy="252" r="5" fill="'+O+'"/>';
g+='<rect x="853" y="44" width="24" height="26" fill="'+fg+'"/><circle cx="865" cy="34" r="22" fill="'+O+'"/>';
function mk(n,cx,cy,x2,y2){return '<line x1="'+cx+'" y1="'+cy+'" x2="'+x2+'" y2="'+y2+'" stroke="'+O+'" stroke-width="4"/><circle cx="'+cx+'" cy="'+cy+'" r="28" fill="'+O+'"/>'+T(cx,cy+14,String(n),38,N,SB,"middle")}
g+=mk(1,415,100,415,262)+mk(2,250,400,250,310)+mk(3,80,130,80,236)+mk(4,720,34,840,34)+mk(5,650,400,650,336);
o+='<g transform="translate('+M+','+y+')">'+g+'</g>';y+=440;
arr(s.parts).forEach(function(p,k){o+='<circle cx="'+(M+28)+'" cy="'+(y+24)+'" r="28" fill="'+th.pill+'"/>'+T(M+28,y+38,String(k+1),38,th.pillfg,SB,"middle")+T(M+86,y+38,p,44,th.fg,MD);y+=64});
return {s:o,h:y}};
LAY.fact=function(s,f,th){var o=pill(M,0,s.tag||"VOCÊ SABIA?",th),y=120;
var z=Math.min(s.bigSize||300,fit([s.big],s.bigSize||300,900));o+=T(M,y+z*0.8,s.big,z,th.acc,SB);y+=z*1.0+16;
var t=blk(M,y,s.title,SB,62,th.fg,900,1.15);o+=t.s;y+=t.h;
if(s.body){y+=24;var b=blk(M,y,s.body,RG,40,th.fg,880,1.4);o+=b.s;y+=b.h}
if(s.fonte){y+=36;o+=T(M,y+26,"Fonte: "+s.fonte,26,th.mu,MD);y+=40}
return {s:o,h:y}};
LAY.timeline=function(s,f,th){var o="",y=0,t=blk(M,y,s.title,SB,70,th.fg,900,1.12);o+=t.s;y+=t.h+56;var it=arr(s.items),x=M+240;
it.forEach(function(r,k){var p=r.split("|"),ls=wrap(p[1]||"",MD,38,600),h=Math.max(90,ls.length*52+40);
if(k<it.length-1)o+='<rect x="'+(x-3)+'" y="'+(y+30)+'" width="6" height="'+h+'" fill="'+th.line+'"/>';
o+='<circle cx="'+x+'" cy="'+(y+22)+'" r="16" fill="'+th.acc+'"/>'+T(M,y+36,p[0],40,th.acc,SB);
ls.forEach(function(l,i){o+=T(x+44,y+34+i*52,l,38,th.fg,MD)});y+=h+20});return {s:o,h:y-20}};
LAY.dodont=function(s,f,th){var o="",y=0,t=blk(M,y,s.title,SB,70,th.fg,900,1.12);o+=t.s;y+=t.h+44;
[["FAÇA",arr(s.faca),1],["EVITE",arr(s.evite),0]].forEach(function(g){o+=T(M,y+26,g[0],30,th.mu,SB,0,5);y+=58;
g[1].forEach(function(it){var ls=wrap(it,MD,40,780),cy=y+26;
if(g[2])o+='<circle cx="'+(M+24)+'" cy="'+cy+'" r="24" fill="'+th.acc+'"/><path d="M'+(M+13)+" "+cy+"l8 8l15-16"+'" fill="none" stroke="'+(th.bg===O?W:N)+'" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>';
else o+='<circle cx="'+(M+24)+'" cy="'+cy+'" r="22" fill="none" stroke="'+th.fg+'" stroke-width="4"/><path d="M'+(M+16)+" "+(cy-8)+"l16 16M"+(M+32)+" "+(cy-8)+"l-16 16"+'" stroke="'+th.fg+'" stroke-width="4" stroke-linecap="round"/>';
ls.forEach(function(l,i){o+=T(M+72,y+40+i*54,l,40,th.fg,MD)});y+=ls.length*54+30});y+=30});return {s:o,h:y-30}};
LAY.save=function(s,f,th){var o='<path d="M'+M+' 0h120v170l-60-44l-60 44z" fill="'+th.acc+'"/>',y=230;
var t=titleLines({lines:s.lines||["Salve este post"],accent:s.accent||["para consultar depois."]},th,92);o+='<g transform="translate(0,'+y+')">'+t.s+'</g>';y+=t.h+30;
var b=blk(M,y,s.sub||"E mande para quem precisa ver isso.",RG,42,th.mu,880,1.4);o+=b.s;y+=b.h+60;
o+=T(M,y+30,C.ig,40,th.fg,MD);y+=50;return {s:o,h:y}};
function icoShield(x,y,c,b){return '<path d="M'+x+' '+(y+8)+'l40-16l40 16v36c0 30-18 50-40 60c-22-10-40-30-40-60z" fill="'+c+'"/><path d="M'+(x+46)+' '+(y+14)+'l-18 34h14l-8 30l22-38h-14l8-26z" fill="'+b+'"/>'}
function icoRemote(x,y,c,b){return '<rect x="'+(x+18)+'" y="'+(y-6)+'" width="44" height="100" rx="18" fill="'+c+'"/><circle cx="'+(x+40)+'" cy="'+(y+22)+'" r="9" fill="'+b+'"/><circle cx="'+(x+40)+'" cy="'+(y+50)+'" r="9" fill="'+b+'"/><rect x="'+(x+32)+'" y="'+(y+70)+'" width="16" height="6" rx="3" fill="'+b+'"/>'}
function icoMotor(x,y,c,b){return '<rect x="'+x+'" y="'+(y+40)+'" width="190" height="110" rx="18" fill="'+c+'"/><rect x="'+(x+16)+'" y="'+y+'" width="158" height="60" rx="20" fill="'+c+'"/><circle cx="'+(x+190)+'" cy="'+(y+95)+'" r="48" fill="'+b+'"/><circle cx="'+(x+190)+'" cy="'+(y+95)+'" r="30" fill="none" stroke="'+c+'" stroke-width="8"/><circle cx="'+(x+190)+'" cy="'+(y+95)+'" r="10" fill="'+c+'"/><rect x="'+(x-10)+'" y="'+(y+160)+'" width="260" height="14" rx="4" fill="'+b+'"/>'}
LAY.promo=function(s,f,th){var o=pill(M,0,s.tag||"PROMOÇÃO",th),y=110;
var a=arr(s.lines),b=arr(s.accent),z=fit(a.concat(b),s.size||100,900),yy=y;
a.forEach(function(l){o+=T(M,yy+z*0.82,l,z,th.fg,SB);yy+=z*1.08});b.forEach(function(l){o+=T(M,yy+z*0.82,l,z,th.acc,SB);yy+=z*1.08});y=yy+20;
if(s.local){o+='<path d="M'+(M+16)+' '+(y+44)+'c-14-16-16-22-16-28a16 16 0 0 1 32 0c0 6-2 12-16 28z" fill="'+O+'"/><circle cx="'+(M+16)+'" cy="'+(y+16)+'" r="6" fill="'+th.bg+'"/>';var lb=blk(M+50,y-4,s.local,MD,38,th.fg,850,1.3);o+=lb.s;y+=Math.max(lb.h,52)+40}
o+='<rect x="'+M+'" y="'+y+'" width="900" height="180" rx="32" fill="'+O+'"/>'+T(M+44,y+142,s.big,150,N,SB);
var bw=tw(s.big,SB,150);arr(s.offer).forEach(function(l,i){o+=T(M+44+bw+36,y+80+i*52,l,42,N,i?MD:SB)});y+=216;
o+=T(M,y+24,s.giftLabel||"E GANHE DE BRINDE",28,th.mu,SB,0,5);y+=56;
arr(s.gifts).forEach(function(g,k){var x=M+k*460;o+='<rect x="'+x+'" y="'+y+'" width="440" height="170" rx="28" fill="#16305A"/>'+(k?icoRemote(x+28,y+40,W,O):icoShield(x+28,y+36,W,O));
var p=g.split("|");o+=T(x+140,y+76,p[0],40,W,SB)+blk(x+140,y+94,p[1]||"",MD,34,"#C5CEDD",270,1.3).s});y+=196;
if(s.fine){o+=T(M,y+28,s.fine,26,th.mu,MD);y+=40}
return {s:o,h:y}};
LAY.bars=function(s,f,th){var o="",y=0;if(s.tag){o+=pill(M,0,s.tag,th);y=110}
var t=blk(M,y,s.title,SB,64,th.fg,900,1.12);o+=t.s;y+=t.h+50;var it=arr(s.items).map(function(r){return r.split("|")}),mx=0;it.forEach(function(r){mx=Math.max(mx,+r[1])});
it.forEach(function(r,k){var w=Math.max(70,640*(+r[1])/mx),hl=s.hl===k;o+=T(M,y+34,r[0],36,th.fg,MD);y+=56;
o+='<rect x="'+M+'" y="'+y+'" width="'+w.toFixed(0)+'" height="60" rx="16" fill="'+(hl?O:(th.bg===N?"#2A4670":"#C9D1DE"))+'"/>'+T(M+w+24,y+45,r[2]||r[1],40,hl?th.acc:th.fg,SB);y+=96});
if(s.note){y+=6;var b=blk(M,y,s.note,RG,38,th.mu,880,1.35);o+=b.s;y+=b.h}
if(s.fonte){y+=28;o+=T(M,y+26,"Fonte: "+s.fonte,26,th.mu,MD);y+=40}return {s:o,h:y}};
function render(s){
var f=FM[s.format||"4x5"],th=TH[s.theme||"dark"],o="",W_=f.w,H=f.h,foot=s.footer&&s.format!=="story";
var hd=s.format==="story"?250:70;
if(s.layout==="photo"){return photo(s,f,th)}
if(s.layout!=="highlight"){o+=logo("hz",th.logo,M,hd,190).s;if(s.i)o+=T(W_-M,hd+36,String(s.i).padStart(2,"0")+"/"+String(s.n).padStart(2,"0"),26,th.mu,MD,"end",2)}
var r=LAY[s.layout](s,f,th),top=f.top,bot=H-(s.bot||f.bot)-(foot?20:0),y=Math.max(top,top+(bot-top-r.h)/2);
if(s.layout==="highlight")y=(H-r.h)/2;
o+='<g transform="translate(0,'+y.toFixed(1)+')">'+r.s+'</g>';
if(s.fonte&&s.layout!=="fact"&&s.layout!=="bars")o+=T(M,s.format==="story"?H-(s.bot||f.bot)+60:H-(foot?100:70),"Fonte: "+s.fonte,24,th.mu,MD);
if(foot)o+=T(M,H-52,C.ig,28,th.mu,MD)+T(W_-M,H-52,C.phone,28,th.mu,MD,"end");
o+='<rect y="'+(H-14)+'" width="'+W_+'" height="14" fill="'+(s.theme==="orange"?N:O)+'"/>';
return wrapSvg(W_,H,o,th.bg)}
function photo(s,f,th){var W_=f.w,H=f.h,ph=Math.round(H*(s.ph||0.56)),o="";
o+='<clipPath id="cp"><rect width="'+W_+'" height="'+ph+'"/></clipPath>'+(s.img?'<image href="'+s.img+'" width="'+W_+'" height="'+ph+'" preserveAspectRatio="xMidYMid slice" clip-path="url(#cp)"/>':'<rect width="'+W_+'" height="'+ph+'" fill="#DDE3EE"/>'+T(540,ph/2,"SUA FOTO AQUI",40,"#4A5A75",MD,"middle",4));
o+='<rect y="'+ph+'" width="'+W_+'" height="'+(H-ph)+'" fill="'+N+'"/>'+logo("hz",[W,O,W],M,ph+50,190).s;
var y=ph+140,t=blk(M,y,s.title,SB,66,W,900,1.12);o+=t.s;y+=t.h+14;if(s.sub)o+=blk(M,y,s.sub,RG,34,"#C5CEDD",900,1.35).s;
o+='<rect y="'+(H-14)+'" width="'+W_+'" height="14" fill="'+O+'"/>';return wrapSvg(W_,H,o,N)}
function wrapSvg(w,h,b,bg){return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+w+" "+h+'" width="'+w+'" height="'+h+'"><rect width="'+w+'" height="'+h+'" fill="'+bg+'"/>'+b+'</svg>'}
root.Aciona={render:render,E:E,C:C,TH:TH,FM:FM,LAY:LAY,wrap:wrap};
})(typeof window!=="undefined"?window:globalThis);
