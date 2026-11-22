let places=[{"name": "Vice City", "x": 318, "y": 203}, {"name": "Leonida Keys", "x": 225, "y": 260}, {"name": "Grassrivers", "x": 112, "y": 209}, {"name": "Port Gellhorn", "x": 69, "y": 113}, {"name": "Ambrosia", "x": 207, "y": 119}, {"name": "Mount Kalaga National Park", "x": 276, "y": 48}];

const el=id=>document.getElementById(id), c=el("map"),cx=c.getContext("2d");let im=new Image();
function pos(e){const b=c.getBoundingClientRect();return [(e.clientX-b.left)*c.width/b.width,(e.clientY-b.top)*c.height/b.height];}
function dot(x,y,color){cx.beginPath();cx.arc(x,y,6,0,Math.PI*2);cx.fillStyle=color;cx.fill();cx.strokeStyle="#17232a";cx.stroke();}
function base(){cx.drawImage(im,0,0,c.width,c.height);}
function length(a,b){return Math.hypot(a.x-b.x,a.y-b.y);}

const list=el("place"),route=[];
for(const p of places)list.add(new Option(p.name));
function draw(){base();cx.beginPath();route.forEach((p,i)=>i?cx.lineTo(p.x,p.y):cx.moveTo(p.x,p.y));cx.strokeStyle="#ffb489";cx.lineWidth=3;cx.stroke();
 places.forEach((p,i)=>dot(p.x,p.y,i===list.selectedIndex?"#ffb489":"#a4dbcb"));
 const p=places[list.selectedIndex]; const near=places.filter(q=>q!==p).sort((a,b)=>length(p,a)-length(p,b))[0];
 const total=route.reduce((v,p,i)=>v+(i?length(p,route[i-1]):0),0);
 el("info").textContent=p.name+" · nearest pin: "+near.name+" · route: "+Math.round(total)+" atlas pixels";
 el("stops").replaceChildren(...route.map(p=>{const li=document.createElement("li");li.textContent=p.name;return li;}));}
im.onload=draw;im.src="map.png";list.onchange=draw;el("add").onclick=()=>{route.push(places[list.selectedIndex]);draw();};
el("undo").onclick=()=>{route.pop();draw();};
c.onclick=e=>{const [x,y]=pos(e);const p=places.slice().sort((a,b)=>length(a,{x,y})-length(b,{x,y}))[0];list.selectedIndex=places.indexOf(p);draw();};

el("import").onchange=async()=>{
 try{
  const files=[...el("import").files],j=files.find(f=>f.name.endsWith(".json")),photo=files.find(f=>f.type.startsWith("image/"));
  if(!j||!photo)throw Error("Select both an image and a JSON file.");
  const rows=JSON.parse(await j.text());
  if(!Array.isArray(rows)||rows.length<2||!rows.every(p=>typeof p.name==="string"&&p.name.trim()&&[p.x,p.y].every(v=>Number.isFinite(v)&&v>=0&&v<=1)))throw Error("Provide at least two named pins with coordinates in [0,1].");
  const bitmap=await createImageBitmap(photo);
  im=bitmap;c.width=im.width;c.height=im.height;places=rows.map(p=>({name:p.name,x:p.x*c.width,y:p.y*c.height}));
  route.length=0;list.replaceChildren();for(const p of places)list.add(new Option(p.name));draw();el("message").textContent="Loaded "+places.length+" pins.";
 }catch(e){el("message").textContent=e.message;}
};
