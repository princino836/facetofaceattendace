// Frontend prototype. Cross-device sync requires Firebase configuration (see README).
const ADMIN_PASSWORD = "ChangeThisAdminPassword"; // CHANGE THIS
const SESSION_MS = 5 * 60 * 1000;
const RADIUS_METRES = 100;
let adminCoords=null, closesAt=null, timerId=null;
let records=JSON.parse(localStorage.getItem("csGroupBRecords")||"[]");
const $=id=>document.getElementById(id);
function distanceMeters(a,b){
 const rad=x=>x*Math.PI/180, R=6371000;
 const dLat=rad(b.lat-a.lat),dLon=rad(b.lon-a.lon);
 const x=Math.sin(dLat/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dLon/2)**2;
 return 2*R*Math.asin(Math.sqrt(Math.min(1,x)));
}
function getPosition(){return new Promise((resolve,reject)=>{
 if(!navigator.geolocation)return reject(Error("Geolocation is not supported."));
 navigator.geolocation.getCurrentPosition(p=>resolve({lat:p.coords.latitude,lon:p.coords.longitude,accuracy:p.coords.accuracy}),
 e=>reject(Error(e.message)),{enableHighAccuracy:true,timeout:15000,maximumAge:0});
});}
$("login").onclick=()=>{
 if($("password").value!==ADMIN_PASSWORD)return alert("Incorrect admin password.");
 $("adminTools").hidden=false; $("adminStatus").textContent="Admin unlocked (on this device)";
};
$("start").onclick=async()=>{
 try{
  $("start").disabled=true;
  $("adminStatus").textContent="Requesting admin GPS permission…";
  adminCoords=await getPosition();
  closesAt=Date.now()+SESSION_MS;
  $("sessionStatus").textContent="Attendance OPEN — 5 minutes. Check your location.";
  $("adminStatus").textContent=`Attendance open. Admin GPS accuracy: ±${Math.round(adminCoords.accuracy||0)} m`;
  $("submit").disabled=false;
  clearInterval(timerId);tick();timerId=setInterval(tick,250);
 }catch(e){$("adminStatus").textContent="Could not get admin location: "+e.message;}
 finally{$("start").disabled=false;}
};
$("stop").onclick=closeSession;
function tick(){let left=Math.max(0,closesAt-Date.now());$("timer").textContent=`${String(Math.floor(left/60000)).padStart(2,"0")}:${String(Math.floor(left/1000)%60).padStart(2,"0")}`;if(left<=0)closeSession();}
function closeSession(){closesAt=null;clearInterval(timerId);$("submit").disabled=true;$("sessionStatus").textContent="Attendance closed.";if($("adminStatus"))$("adminStatus").textContent="Attendance closed.";}
$("form").onsubmit=async e=>{
 e.preventDefault();$("submit").disabled=true;$("feedback").textContent="Checking GPS…";
 try{
  if(!closesAt||Date.now()>closesAt)throw Error("Attendance is closed.");
  if(!adminCoords)throw Error("Admin location is not available. Ask admin to start attendance.");
  const pos=await getPosition(),student={lat:pos.lat,lon:pos.lon};
  const dist=distanceMeters(adminCoords,student);
  if(dist>RADIUS_METRES)throw Error(`You are ${Math.round(dist)} m away. Maximum allowed distance is 100 m.`);
  const name=$("name").value.trim(),index=$("index").value.trim().toUpperCase();
  if(!name||!index)throw Error("Enter your full name and index number.");
  if(records.some(r=>r.index===index))throw Error("This index number has already been recorded on this device.");
  records.push({name,index,time:new Date().toLocaleString(),distance:Math.round(dist)});
  localStorage.setItem("csGroupBRecords",JSON.stringify(records));render();
  $("feedback").textContent=`Attendance recorded. Distance: ${Math.round(dist)} m.`;
  e.target.reset();
 }catch(err){$("feedback").textContent=err.message;}
 finally{$("submit").disabled=!closesAt||Date.now()>closesAt;}
};
function render(){ $("rows").replaceChildren();records.forEach((r,i)=>{let tr=document.createElement("tr");[i+1,r.name,r.index,r.time,r.distance+" m"].forEach(v=>{let td=document.createElement("td");td.textContent=v;tr.appendChild(td)});$("rows").appendChild(tr)});$("count").textContent=`${records.length} students`; }
$("export").onclick=()=>{
 if(!records.length)return alert("No attendance records yet.");
 const csv=[["No","Name","Index number","Time","Distance (m)"],...records.map((r,i)=>[i+1,r.name,r.index,r.time,r.distance])].map(row=>row.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(",")).join("\n");
 const blob=new Blob([csv],{type:"text/csv;charset=utf-8"}),url=URL.createObjectURL(blob),a=document.createElement("a");
 a.href=url;a.download="CS_Group_B_Attendance.csv";a.click();URL.revokeObjectURL(url);
};
render();
