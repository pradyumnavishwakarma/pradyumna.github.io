import { useState, useRef, useCallback, useMemo } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────
const USERS = [
  { id:"hod01",   username:"hod",      password:"hod123",     name:"Dr. Ramesh Kumar",  role:"hod",      dept:"IT Department",  avatar:"👨‍💼" },
  { id:"dir01",   username:"director", password:"dir123",     name:"Mrs. Priya Sharma", role:"director", dept:"Administration", avatar:"👩‍💼" },
  { id:"chair01", username:"chairman", password:"chair123",   name:"Mr. Anil Mehta",    role:"chairman", dept:"Board",          avatar:"🏛️" },
  { id:"pur01",   username:"purchase", password:"pur123",     name:"Mr. Suresh Patel",  role:"purchase", dept:"Purchase Dept",  avatar:"📋" },
  { id:"store01", username:"store",    password:"store123",   name:"Mr. Vijay Singh",   role:"store",    dept:"Store",          avatar:"📦" },
  { id:"fin01",   username:"finance",  password:"finance123", name:"Ms. Neha Gupta",    role:"finance",  dept:"Finance",        avatar:"💳" },
];

const ROLE_LABELS = { hod:"Head of Department", director:"Director", chairman:"Chairman", purchase:"Purchase Officer", store:"Store Keeper", finance:"Finance Officer" };
const ROLE_COLORS = { hod:"#6366f1", director:"#f59e0b", chairman:"#ec4899", purchase:"#3b82f6", store:"#10b981", finance:"#f97316" };

const STAGES = [
  { id:"hod",       label:"HOD Initiation",    icon:"📝", actor:"hod" },
  { id:"director",  label:"Director Approval", icon:"👔", actor:"director" },
  { id:"chairman",  label:"Chairman Approval", icon:"🏛️", actor:"chairman" },
  { id:"quotation", label:"Quotation Upload",  icon:"📊", actor:"purchase" },
  { id:"l1",        label:"L1 Approval",       icon:"🏆", actor:"purchase" },
  { id:"po",        label:"Purchase Order",    icon:"📋", actor:"purchase" },
  { id:"received",  label:"Order Received",    icon:"📦", actor:"store" },
  { id:"payment",   label:"Payment Approval",  icon:"💳", actor:"finance" },
  { id:"done",      label:"Payment Done",      icon:"✅", actor:"store" },
  { id:"closed",    label:"Closed & Stock",    icon:"🗄️", actor:"store" },
];

const STAGE_COLORS = { hod:"#6366f1",director:"#f59e0b",chairman:"#ec4899",quotation:"#14b8a6",l1:"#8b5cf6",po:"#3b82f6",received:"#10b981",payment:"#f97316",done:"#22c55e",closed:"#64748b" };

const uid = () => `NS-${new Date().getFullYear()}-${Math.floor(10000+Math.random()*90000)}`;
const today = () => new Date().toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"});
const stageIdx = id => STAGES.findIndex(s=>s.id===id);
const fmt = n => (n||0).toLocaleString("en-IN");

// ─── Seed demo data ───────────────────────────────────────────────────────────
const SEED_SHEETS = [
  { id:"NS-2026-11001", createdAt:"02 Jan 2026", stage:"closed", dept:"IT Department", item:"Desktop Computers", qty:"10", reason:"Replacement of obsolete machines", hodName:"Dr. Ramesh Kumar", directorNote:"Approved", chairmanNote:"Approved. Priority.", chairmanImage:null, quotations:[{vendor:"TechMart",amount:420000},{vendor:"DigiWorld",amount:398000},{vendor:"CompuZone",amount:415000}], l1Index:1, poNumber:"PO-2026-001", receivedNote:"Goods received in good condition on 15 Jan 2026", paymentNote:"Invoice #INV-8821 ₹3,98,000", paymentImage:null, stockEntry:"10 Desktop Computers added. Asset Tag IT-001 to IT-010. Location: Server Room B", history:[{date:"02 Jan 2026",action:"Note Sheet created",user:"Dr. Ramesh Kumar"},{date:"03 Jan 2026",action:"Submitted to Director",user:"Dr. Ramesh Kumar"},{date:"04 Jan 2026",action:"Director approved",user:"Mrs. Priya Sharma"},{date:"05 Jan 2026",action:"Chairman approved",user:"Mr. Anil Mehta"},{date:"06 Jan 2026",action:"L1 identified: DigiWorld ₹398000",user:"Mr. Suresh Patel"},{date:"07 Jan 2026",action:"PO-2026-001 generated",user:"Mr. Suresh Patel"},{date:"15 Jan 2026",action:"Order received",user:"Mr. Vijay Singh"},{date:"16 Jan 2026",action:"Payment approved",user:"Ms. Neha Gupta"},{date:"17 Jan 2026",action:"Stock registered",user:"Mr. Vijay Singh"}] },
  { id:"NS-2026-11002", createdAt:"10 Jan 2026", stage:"closed", dept:"IT Department", item:"Network Switch 24-Port", qty:"3", reason:"Expansion of LAN infrastructure", hodName:"Dr. Ramesh Kumar", directorNote:"Approved", chairmanNote:"Approved", chairmanImage:null, quotations:[{vendor:"NetGear Pro",amount:54000},{vendor:"CiscoReseller",amount:61000},{vendor:"LinkStar",amount:52500}], l1Index:2, poNumber:"PO-2026-002", receivedNote:"All 3 units received", paymentNote:"Invoice #INV-9031 ₹52,500", paymentImage:null, stockEntry:"3 Network Switches. Asset Tag NW-001 to NW-003. Server Room A", history:[{date:"10 Jan 2026",action:"Note Sheet created",user:"Dr. Ramesh Kumar"},{date:"25 Jan 2026",action:"Stock registered",user:"Mr. Vijay Singh"}] },
  { id:"NS-2026-11003", createdAt:"18 Jan 2026", stage:"closed", dept:"Administration", item:"Office Chairs", qty:"20", reason:"New staff joining Q1 2026", hodName:"Dr. Ramesh Kumar", directorNote:"Approved", chairmanNote:"Go ahead", chairmanImage:null, quotations:[{vendor:"FurniCo",amount:160000},{vendor:"OfficePro",amount:148000},{vendor:"ChairWorld",amount:155000}], l1Index:1, poNumber:"PO-2026-003", receivedNote:"20 chairs delivered and assembled", paymentNote:"Invoice #INV-9240 ₹1,48,000", paymentImage:null, stockEntry:"20 Office Chairs. Asset Tag FC-021 to FC-040. Admin Block", history:[{date:"18 Jan 2026",action:"Note Sheet created",user:"Dr. Ramesh Kumar"},{date:"10 Feb 2026",action:"Stock registered",user:"Mr. Vijay Singh"}] },
  { id:"NS-2026-11004", createdAt:"01 Feb 2026", stage:"payment", dept:"IT Department", item:"Laser Printers", qty:"5", reason:"Print load distribution across departments", hodName:"Dr. Ramesh Kumar", directorNote:"Approved", chairmanNote:"Approved", chairmanImage:null, quotations:[{vendor:"PrintMaster",amount:87500},{vendor:"InkJet Pro",amount:91000},{vendor:"OfficePrint",amount:85000}], l1Index:2, poNumber:"PO-2026-004", receivedNote:"5 printers received and installed", paymentNote:"", paymentImage:null, stockEntry:"", history:[{date:"01 Feb 2026",action:"Note Sheet created",user:"Dr. Ramesh Kumar"},{date:"20 Feb 2026",action:"Order received",user:"Mr. Vijay Singh"}] },
  { id:"NS-2026-11005", createdAt:"12 Feb 2026", stage:"received", dept:"Administration", item:"UPS Systems 2KVA", qty:"8", reason:"Power backup for critical systems", hodName:"Dr. Ramesh Kumar", directorNote:"Approved. Urgent.", chairmanNote:"Approved", chairmanImage:null, quotations:[{vendor:"PowerShield",amount:176000},{vendor:"APC Dealer",amount:168000},{vendor:"UPSMart",amount:172000}], l1Index:1, poNumber:"PO-2026-005", receivedNote:"", paymentNote:"", paymentImage:null, stockEntry:"", history:[{date:"12 Feb 2026",action:"Note Sheet created",user:"Dr. Ramesh Kumar"},{date:"05 Mar 2026",action:"PO-2026-005 generated",user:"Mr. Suresh Patel"}] },
  { id:"NS-2026-11006", createdAt:"01 Mar 2026", stage:"quotation", dept:"IT Department", item:"CCTV Camera System", qty:"12", reason:"Security upgrade as per audit recommendation", hodName:"Dr. Ramesh Kumar", directorNote:"Approved", chairmanNote:"Approved. Ensure quality.", chairmanImage:null, quotations:[{vendor:"SecureVision",amount:216000}], l1Index:null, poNumber:"", receivedNote:"", paymentNote:"", paymentImage:null, stockEntry:"", history:[{date:"01 Mar 2026",action:"Note Sheet created",user:"Dr. Ramesh Kumar"},{date:"10 Mar 2026",action:"Chairman approved",user:"Mr. Anil Mehta"}] },
  { id:"NS-2026-11007", createdAt:"10 Mar 2026", stage:"director", dept:"Administration", item:"Air Conditioners 1.5 Ton", qty:"6", reason:"New conference hall cooling system", hodName:"Dr. Ramesh Kumar", directorNote:"", chairmanNote:"", chairmanImage:null, quotations:[], l1Index:null, poNumber:"", receivedNote:"", paymentNote:"", paymentImage:null, stockEntry:"", history:[{date:"10 Mar 2026",action:"Note Sheet created",user:"Dr. Ramesh Kumar"},{date:"11 Mar 2026",action:"Submitted to Director",user:"Dr. Ramesh Kumar"}] },
  { id:"NS-2026-11008", createdAt:"20 Mar 2026", stage:"hod", dept:"IT Department", item:"Projector & Screen", qty:"2", reason:"Board room AV upgrade", hodName:"Dr. Ramesh Kumar", directorNote:"", chairmanNote:"", chairmanImage:null, quotations:[], l1Index:null, poNumber:"", receivedNote:"", paymentNote:"", paymentImage:null, stockEntry:"", history:[{date:"20 Mar 2026",action:"Note Sheet created",user:"Dr. Ramesh Kumar"}] },
];

// ─── Reusable UI atoms ────────────────────────────────────────────────────────
const RolePill = ({role}) => (
  <span style={{background:ROLE_COLORS[role]+"22",color:ROLE_COLORS[role],border:`1px solid ${ROLE_COLORS[role]}55`,fontSize:10,fontWeight:700,padding:"2px 9px",borderRadius:20,letterSpacing:.8,textTransform:"uppercase"}}>{ROLE_LABELS[role]}</span>
);

const Badge = ({stage}) => (
  <span style={{background:STAGE_COLORS[stage]||"#64748b",color:"#fff",fontSize:10,fontWeight:700,padding:"2px 9px",borderRadius:20,letterSpacing:1,textTransform:"uppercase"}}>
    {STAGES.find(s=>s.id===stage)?.label||stage}
  </span>
);

const Panel = ({title,children,accent}) => (
  <div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:14,padding:"18px 20px",borderTop:accent?`2px solid ${accent}`:undefined}}>
    <div style={{color:"#c7d2fe",fontWeight:700,fontSize:15,marginBottom:14}}>{title}</div>
    {children}
  </div>
);

const Field = ({label,value,onChange,placeholder,type="text",textarea,disabled}) => {
  const base = {background:disabled?"#0a1628":"#0f172a",border:"1px solid #334155",borderRadius:8,color:disabled?"#64748b":"#f1f5f9",fontSize:14,padding:"9px 12px",width:"100%",outline:"none",fontFamily:"inherit",boxSizing:"border-box",resize:"vertical"};
  return (
    <div style={{marginBottom:14}}>
      <label style={{display:"block",color:"#94a3b8",fontSize:11,fontWeight:700,marginBottom:5,textTransform:"uppercase",letterSpacing:1}}>{label}</label>
      {textarea?<textarea value={value} onChange={onChange} placeholder={placeholder} rows={3} style={base} disabled={disabled}/>:<input type={type} value={value} onChange={onChange} placeholder={placeholder} style={base} disabled={disabled}/>}
    </div>
  );
};

const InfoBox = ({label,value,color="#6366f1"}) => {
  if(!value) return null;
  return (
    <div style={{background:"#0a1628",borderRadius:8,padding:"9px 13px",marginBottom:12,borderLeft:`3px solid ${color}`}}>
      <div style={{color:"#64748b",fontSize:10,textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>{label}</div>
      <div style={{color:"#e2e8f0",fontSize:13}}>{value}</div>
    </div>
  );
};

const ImageUploadBox = ({label,value,onChange,disabled}) => {
  const ref = useRef();
  const handleFile = f => { if(!f||disabled) return; const r=new FileReader(); r.onload=e=>onChange(e.target.result); r.readAsDataURL(f); };
  return (
    <div style={{marginTop:10,marginBottom:14}}>
      <div style={{fontSize:11,fontWeight:700,color:"#94a3b8",marginBottom:6,textTransform:"uppercase",letterSpacing:1}}>{label}</div>
      <div onClick={()=>!disabled&&ref.current.click()} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();handleFile(e.dataTransfer.files[0]);}}
        style={{border:`2px dashed ${disabled?"#1e293b":"#334155"}`,borderRadius:12,padding:"14px",textAlign:"center",cursor:disabled?"default":"pointer",background:"#0a1628",minHeight:70,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:5}}>
        {value?<img src={value} alt="doc" style={{maxHeight:140,maxWidth:"100%",borderRadius:8,objectFit:"contain"}}/>
          :<><span style={{fontSize:22}}>🖼️</span><span style={{color:disabled?"#1e293b":"#64748b",fontSize:12}}>{disabled?"No image attached":"Click or drop image"}</span></>}
      </div>
      {!disabled&&<input ref={ref} type="file" accept="image/*" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0])}/>}
    </div>
  );
};

const ProgressBar = ({currentStage}) => {
  const ci = stageIdx(currentStage);
  return (
    <div style={{display:"flex",alignItems:"center",marginBottom:28,overflowX:"auto",paddingBottom:6}}>
      {STAGES.map((s,i)=>{
        const done=i<ci,active=i===ci;
        return (
          <div key={s.id} style={{display:"flex",alignItems:"center",flex:i<STAGES.length-1?"1 1 auto":"0 0 auto"}}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,minWidth:46}}>
              <div style={{width:30,height:30,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",background:active?"#6366f1":done?"#10b981":"#1e293b",border:`2px solid ${active?"#818cf8":done?"#34d399":"#334155"}`,fontSize:12,boxShadow:active?"0 0 10px #6366f180":"none"}}>
                {done?"✓":s.icon}
              </div>
              <div style={{fontSize:8,color:active?"#c7d2fe":done?"#6ee7b7":"#475569",fontWeight:active?700:400,textAlign:"center",maxWidth:46,lineHeight:1.2}}>{s.label}</div>
            </div>
            {i<STAGES.length-1&&<div style={{flex:1,height:2,background:done?"#10b981":"#1e293b",minWidth:6}}/>}
          </div>
        );
      })}
    </div>
  );
};

const QuotationTable = ({quotations}) => {
  const sorted = [...quotations].map((q,i)=>({...q,origIdx:i})).sort((a,b)=>a.amount-b.amount);
  return (
    <div style={{overflowX:"auto",marginTop:10}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
        <thead><tr style={{borderBottom:"1px solid #334155"}}>
          {["Rank","Vendor","Amount (₹)"].map(h=><th key={h} style={{color:"#64748b",textAlign:"left",padding:"7px 12px",fontWeight:700,fontSize:11,textTransform:"uppercase"}}>{h}</th>)}
        </tr></thead>
        <tbody>
          {sorted.map((q,rank)=>(
            <tr key={q.origIdx} style={{background:rank===0?"#052e16":"transparent",borderBottom:"1px solid #1e293b"}}>
              <td style={{color:rank===0?"#4ade80":"#94a3b8",padding:"9px 12px"}}>{rank===0?"🏆 L1":`L${rank+1}`}</td>
              <td style={{color:"#e2e8f0",padding:"9px 12px"}}>{q.vendor}</td>
              <td style={{color:rank===0?"#4ade80":"#e2e8f0",fontWeight:rank===0?700:400,padding:"9px 12px"}}>₹{fmt(q.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ─── Sidebar Nav ──────────────────────────────────────────────────────────────
const NAV = [
  { id:"dashboard", label:"Dashboard",     icon:"📊" },
  { id:"sheets",    label:"Note Sheets",   icon:"📄" },
  { id:"stock",     label:"Stock Register",icon:"🗄️" },
  { id:"history",   label:"All History",   icon:"📜" },
];

function Sidebar({ active, onNav, user, onLogout }) {
  return (
    <div style={{width:220,minHeight:"100vh",background:"#060f1e",borderRight:"1px solid #1e293b",display:"flex",flexDirection:"column",flexShrink:0}}>
      {/* Logo */}
      <div style={{padding:"20px 18px 16px",borderBottom:"1px solid #1e293b"}}>
        <div style={{fontSize:28,marginBottom:6}}>🏢</div>
        <div style={{color:"#f1f5f9",fontWeight:800,fontSize:13,fontFamily:"'Georgia',serif",lineHeight:1.3}}>Procurement<br/>Management</div>
        <div style={{color:"#475569",fontSize:10,marginTop:2}}>Office Note Sheet System</div>
      </div>

      {/* Nav */}
      <nav style={{padding:"12px 10px",flex:1}}>
        {NAV.map(n=>(
          <button key={n.id} onClick={()=>onNav(n.id)}
            style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:10,border:"none",background:active===n.id?"#6366f122":"transparent",color:active===n.id?"#818cf8":"#64748b",fontWeight:active===n.id?700:500,fontSize:13,cursor:"pointer",marginBottom:2,textAlign:"left",transition:"all .15s"}}>
            <span style={{fontSize:16}}>{n.icon}</span>{n.label}
          </button>
        ))}
      </nav>

      {/* User */}
      <div style={{padding:"14px 16px",borderTop:"1px solid #1e293b"}}>
        <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:10}}>
          <span style={{fontSize:22}}>{user.avatar}</span>
          <div>
            <div style={{color:"#f1f5f9",fontSize:12,fontWeight:600,lineHeight:1.3}}>{user.name}</div>
            <RolePill role={user.role}/>
          </div>
        </div>
        <button onClick={onLogout} style={{width:"100%",background:"#1e293b",border:"1px solid #334155",color:"#94a3b8",borderRadius:8,padding:"7px",fontSize:12,cursor:"pointer",fontWeight:600}}>
          Logout
        </button>
      </div>
    </div>
  );
}

// ─── Dashboard View ───────────────────────────────────────────────────────────
function DashboardView({ sheets, onNav, onOpenSheet }) {
  const total   = sheets.length;
  const closed  = sheets.filter(s=>s.stage==="closed").length;
  const active  = sheets.filter(s=>s.stage!=="closed").length;
  const inPay   = sheets.filter(s=>["payment","done"].includes(s.stage)).length;

  const totalSpend = sheets.filter(s=>s.stage==="closed"&&s.l1Index!==null).reduce((sum,s)=>sum+(s.quotations[s.l1Index]?.amount||0),0);
  const totalItems = sheets.filter(s=>s.stage==="closed").reduce((sum,s)=>sum+parseInt(s.qty||0),0);

  // Stage distribution
  const stageCounts = STAGES.map(st=>({ ...st, count: sheets.filter(s=>s.stage===st.id).length })).filter(s=>s.count>0);

  // Recent activity (last 8 history entries across all sheets)
  const recentActivity = sheets.flatMap(s=>s.history.map(h=>({...h,nsId:s.id,item:s.item}))).sort((a,b)=>0).slice(-8).reverse();

  // Pending per role
  const pendingByRole = USERS.map(u=>({
    ...u,
    count: sheets.filter(s=>STAGES.find(st=>st.id===s.stage)?.actor===u.role).length
  })).filter(u=>u.count>0);

  const StatCard = ({label,value,icon,color,sub}) => (
    <div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:14,padding:"18px 20px",flex:"1 1 160px"}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
        <div>
          <div style={{color:"#64748b",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>{label}</div>
          <div style={{color:color||"#f1f5f9",fontSize:28,fontWeight:800}}>{value}</div>
          {sub&&<div style={{color:"#475569",fontSize:11,marginTop:3}}>{sub}</div>}
        </div>
        <div style={{fontSize:28,opacity:.6}}>{icon}</div>
      </div>
    </div>
  );

  return (
    <div style={{padding:"24px 28px",overflowY:"auto",flex:1}}>
      <div style={{marginBottom:24}}>
        <h2 style={{margin:0,color:"#f1f5f9",fontSize:22,fontWeight:800}}>Dashboard</h2>
        <div style={{color:"#475569",fontSize:13}}>Procurement overview & system summary</div>
      </div>

      {/* KPI cards */}
      <div style={{display:"flex",gap:14,flexWrap:"wrap",marginBottom:24}}>
        <StatCard label="Total Note Sheets" value={total} icon="📄" color="#818cf8"/>
        <StatCard label="Closed / Completed" value={closed} icon="✅" color="#4ade80" sub={`${total?Math.round(closed/total*100):0}% completion rate`}/>
        <StatCard label="In Progress" value={active} icon="⚡" color="#fbbf24"/>
        <StatCard label="Awaiting Payment" value={inPay} icon="💳" color="#f97316"/>
        <StatCard label="Total Spend (Closed)" value={`₹${fmt(totalSpend)}`} icon="💰" color="#34d399"/>
        <StatCard label="Items Procured" value={totalItems} icon="📦" color="#60a5fa" sub="units in stock register"/>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18,marginBottom:18}}>
        {/* Stage pipeline */}
        <div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:14,padding:"18px 20px"}}>
          <div style={{color:"#c7d2fe",fontWeight:700,fontSize:14,marginBottom:16}}>📊 Pipeline by Stage</div>
          {stageCounts.length===0?<div style={{color:"#475569",fontSize:13}}>No active note sheets.</div>:
            stageCounts.map(s=>(
              <div key={s.id} style={{marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{color:"#e2e8f0",fontSize:12}}>{s.icon} {s.label}</span>
                  <span style={{color:STAGE_COLORS[s.id],fontWeight:700,fontSize:12}}>{s.count}</span>
                </div>
                <div style={{height:6,background:"#1e293b",borderRadius:4}}>
                  <div style={{height:6,background:STAGE_COLORS[s.id],borderRadius:4,width:`${Math.min(100,s.count/Math.max(1,total)*100*3)}%`,transition:"width .5s"}}/>
                </div>
              </div>
            ))
          }
        </div>

        {/* Pending by role */}
        <div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:14,padding:"18px 20px"}}>
          <div style={{color:"#c7d2fe",fontWeight:700,fontSize:14,marginBottom:16}}>👤 Pending Actions by Role</div>
          {pendingByRole.length===0?<div style={{color:"#4ade80",fontSize:13}}>✅ No pending actions!</div>:
            pendingByRole.map(u=>(
              <div key={u.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 12px",background:"#0a1628",borderRadius:9,marginBottom:8}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span>{u.avatar}</span>
                  <div>
                    <div style={{color:"#e2e8f0",fontSize:12,fontWeight:600}}>{u.name}</div>
                    <div style={{color:ROLE_COLORS[u.role],fontSize:10,textTransform:"uppercase",fontWeight:700}}>{ROLE_LABELS[u.role]}</div>
                  </div>
                </div>
                <div style={{background:ROLE_COLORS[u.role]+"22",color:ROLE_COLORS[u.role],fontSize:13,fontWeight:800,padding:"3px 10px",borderRadius:20,border:`1px solid ${ROLE_COLORS[u.role]}44`}}>
                  {u.count}
                </div>
              </div>
            ))
          }
        </div>
      </div>

      {/* Recent activity */}
      <div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:14,padding:"18px 20px",marginBottom:18}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div style={{color:"#c7d2fe",fontWeight:700,fontSize:14}}>🕐 Recent Activity</div>
          <button onClick={()=>onNav("history")} style={{background:"none",border:"none",color:"#6366f1",fontSize:12,cursor:"pointer",fontWeight:600}}>View All →</button>
        </div>
        {recentActivity.length===0?<div style={{color:"#475569",fontSize:13}}>No activity yet.</div>:
          recentActivity.map((h,i)=>(
            <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",paddingBottom:10,marginBottom:10,borderBottom:i<recentActivity.length-1?"1px solid #1e293b":"none"}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:"#6366f1",marginTop:5,flexShrink:0}}/>
              <div style={{flex:1}}>
                <div style={{color:"#e2e8f0",fontSize:13}}>{h.action}</div>
                <div style={{display:"flex",gap:8,marginTop:2}}>
                  <span style={{color:"#475569",fontSize:11}}>{h.date}</span>
                  <span style={{color:"#64748b",fontSize:11}}>·</span>
                  <span style={{color:"#818cf8",fontSize:11,fontFamily:"monospace",cursor:"pointer"}} onClick={()=>onOpenSheet(h.nsId)}>{h.nsId}</span>
                  <span style={{color:"#64748b",fontSize:11}}>·</span>
                  <span style={{color:"#94a3b8",fontSize:11}}>{h.user}</span>
                </div>
              </div>
            </div>
          ))
        }
      </div>

      {/* Recent note sheets */}
      <div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:14,padding:"18px 20px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div style={{color:"#c7d2fe",fontWeight:700,fontSize:14}}>📄 Recent Note Sheets</div>
          <button onClick={()=>onNav("sheets")} style={{background:"none",border:"none",color:"#6366f1",fontSize:12,cursor:"pointer",fontWeight:600}}>View All →</button>
        </div>
        {sheets.slice(0,5).map(s=>(
          <div key={s.id} onClick={()=>onOpenSheet(s.id)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 12px",background:"#0a1628",borderRadius:9,marginBottom:8,cursor:"pointer"}}>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
                <span style={{fontFamily:"monospace",color:"#818cf8",fontSize:11,fontWeight:700}}>{s.id}</span>
                <Badge stage={s.stage}/>
              </div>
              <div style={{color:"#e2e8f0",fontSize:13,fontWeight:600}}>{s.item} × {s.qty}</div>
            </div>
            <div style={{color:"#64748b",fontSize:11}}>{s.createdAt}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Stock Register View ──────────────────────────────────────────────────────
function StockRegisterView({ sheets }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all | dept

  const stockItems = sheets.filter(s=>s.stage==="closed").map((s,i)=>{
    const l1 = s.l1Index!==null ? s.quotations[s.l1Index] : null;
    return {
      srNo: i+1,
      nsId: s.id,
      date: s.createdAt,
      item: s.item,
      qty: s.qty,
      dept: s.dept,
      vendor: l1?.vendor||"—",
      amount: l1?.amount||0,
      poNo: s.poNumber||"—",
      stockEntry: s.stockEntry||"—",
    };
  });

  const filtered = stockItems.filter(s=>
    s.item.toLowerCase().includes(search.toLowerCase())||
    s.nsId.toLowerCase().includes(search.toLowerCase())||
    s.dept.toLowerCase().includes(search.toLowerCase())||
    s.vendor.toLowerCase().includes(search.toLowerCase())
  );

  const totalVal = filtered.reduce((sum,s)=>sum+s.amount,0);
  const totalQty = filtered.reduce((sum,s)=>sum+parseInt(s.qty||0),0);

  return (
    <div style={{padding:"24px 28px",overflowY:"auto",flex:1}}>
      <div style={{marginBottom:22}}>
        <h2 style={{margin:0,color:"#f1f5f9",fontSize:22,fontWeight:800}}>🗄️ Stock Register</h2>
        <div style={{color:"#475569",fontSize:13}}>All procured and registered stock items</div>
      </div>

      {/* Summary strip */}
      <div style={{display:"flex",gap:14,marginBottom:20,flexWrap:"wrap"}}>
        {[
          {label:"Total Entries",val:stockItems.length,color:"#818cf8"},
          {label:"Total Items (Units)",val:totalQty,color:"#60a5fa"},
          {label:"Total Value",val:`₹${fmt(totalVal)}`,color:"#4ade80"},
        ].map(s=>(
          <div key={s.label} style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:12,padding:"14px 18px",flex:"1 1 160px"}}>
            <div style={{color:"#64748b",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>{s.label}</div>
            <div style={{color:s.color,fontSize:22,fontWeight:800}}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{marginBottom:16}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search item, NS ID, department, vendor..."
          style={{background:"#0f172a",border:"1px solid #334155",borderRadius:9,color:"#f1f5f9",fontSize:13,padding:"9px 14px",width:"100%",outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
      </div>

      {/* Table */}
      <div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:14,overflow:"hidden"}}>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13,minWidth:900}}>
            <thead>
              <tr style={{background:"#0a1628",borderBottom:"2px solid #1e293b"}}>
                {["Sr.","NS ID","Date","Item","Qty","Dept","Vendor (L1)","Amount (₹)","PO No.","Stock Entry"].map(h=>(
                  <th key={h} style={{color:"#64748b",textAlign:"left",padding:"11px 14px",fontWeight:700,fontSize:11,textTransform:"uppercase",whiteSpace:"nowrap"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length===0&&(
                <tr><td colSpan={10} style={{color:"#475569",textAlign:"center",padding:32}}>No stock entries found.</td></tr>
              )}
              {filtered.map((s,i)=>(
                <tr key={s.nsId} style={{borderBottom:"1px solid #1e293b",background:i%2===0?"transparent":"#0a162840"}}>
                  <td style={{color:"#64748b",padding:"11px 14px",fontWeight:700}}>{s.srNo}</td>
                  <td style={{padding:"11px 14px"}}><span style={{fontFamily:"monospace",color:"#818cf8",fontWeight:700,fontSize:12}}>{s.nsId}</span></td>
                  <td style={{color:"#94a3b8",padding:"11px 14px",whiteSpace:"nowrap"}}>{s.date}</td>
                  <td style={{color:"#f1f5f9",padding:"11px 14px",fontWeight:600}}>{s.item}</td>
                  <td style={{color:"#60a5fa",padding:"11px 14px",fontWeight:700,textAlign:"center"}}>{s.qty}</td>
                  <td style={{color:"#94a3b8",padding:"11px 14px",whiteSpace:"nowrap"}}>{s.dept}</td>
                  <td style={{color:"#e2e8f0",padding:"11px 14px"}}>{s.vendor}</td>
                  <td style={{color:"#4ade80",padding:"11px 14px",fontWeight:700,whiteSpace:"nowrap"}}>₹{fmt(s.amount)}</td>
                  <td style={{padding:"11px 14px"}}><span style={{fontFamily:"monospace",color:"#f59e0b",fontSize:12}}>{s.poNo}</span></td>
                  <td style={{color:"#94a3b8",padding:"11px 14px",maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}} title={s.stockEntry}>{s.stockEntry}</td>
                </tr>
              ))}
            </tbody>
            {filtered.length>0&&(
              <tfoot>
                <tr style={{background:"#0a1628",borderTop:"2px solid #334155"}}>
                  <td colSpan={4} style={{color:"#64748b",padding:"10px 14px",fontWeight:700,fontSize:12}}>TOTAL ({filtered.length} entries)</td>
                  <td style={{color:"#60a5fa",padding:"10px 14px",fontWeight:800}}>{totalQty}</td>
                  <td colSpan={2} style={{padding:"10px 14px"}}/>
                  <td style={{color:"#4ade80",padding:"10px 14px",fontWeight:800}}>₹{fmt(totalVal)}</td>
                  <td colSpan={2}/>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── All History View ─────────────────────────────────────────────────────────
function HistoryView({ sheets, onOpenSheet }) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const allEvents = useMemo(()=>
    sheets.flatMap(s=>s.history.map(h=>({...h,nsId:s.id,item:s.item,qty:s.qty,dept:s.dept,stage:s.stage,currentStage:s.stage})))
    .sort((a,b)=>0).reverse()
  ,[sheets]);

  const filtered = allEvents.filter(e=>{
    const matchSearch = e.action.toLowerCase().includes(search.toLowerCase())||e.user.toLowerCase().includes(search.toLowerCase())||e.nsId.toLowerCase().includes(search.toLowerCase())||e.item.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter==="all"||e.user===USERS.find(u=>u.role===roleFilter)?.name;
    return matchSearch&&matchRole;
  });

  // Group by NS ID for stacked display
  const grouped = useMemo(()=>{
    const map = {};
    filtered.forEach(e=>{ if(!map[e.nsId]) map[e.nsId]=[]; map[e.nsId].push(e); });
    return Object.entries(map);
  },[filtered]);

  return (
    <div style={{padding:"24px 28px",overflowY:"auto",flex:1}}>
      <div style={{marginBottom:22}}>
        <h2 style={{margin:0,color:"#f1f5f9",fontSize:22,fontWeight:800}}>📜 All History</h2>
        <div style={{color:"#475569",fontSize:13}}>Complete audit trail across all note sheets — stacked by NS ID</div>
      </div>

      {/* Filters */}
      <div style={{display:"flex",gap:10,marginBottom:18,flexWrap:"wrap"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search action, user, NS ID, item..."
          style={{background:"#0f172a",border:"1px solid #334155",borderRadius:9,color:"#f1f5f9",fontSize:13,padding:"8px 14px",flex:"1 1 200px",outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
        <select value={roleFilter} onChange={e=>setRoleFilter(e.target.value)}
          style={{background:"#0f172a",border:"1px solid #334155",borderRadius:9,color:"#f1f5f9",fontSize:13,padding:"8px 12px",outline:"none",fontFamily:"inherit"}}>
          <option value="all">All Roles</option>
          {USERS.map(u=><option key={u.id} value={u.role}>{ROLE_LABELS[u.role]}</option>)}
        </select>
      </div>

      <div style={{color:"#64748b",fontSize:12,marginBottom:16}}>{filtered.length} events across {grouped.length} note sheets</div>

      {grouped.length===0&&<div style={{color:"#475569",textAlign:"center",padding:"60px 20px"}}>No history entries found.</div>}

      {grouped.map(([nsId,events])=>{
        const first = events[0];
        return (
          <div key={nsId} style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:14,marginBottom:16,overflow:"hidden"}}>
            {/* NS header */}
            <div onClick={()=>onOpenSheet(nsId)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"13px 18px",background:"#0a1628",cursor:"pointer",borderBottom:"1px solid #1e293b"}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <span style={{fontFamily:"monospace",color:"#818cf8",fontWeight:800,fontSize:13}}>{nsId}</span>
                <Badge stage={first.currentStage}/>
                <span style={{color:"#f1f5f9",fontSize:13,fontWeight:600}}>{first.item} × {first.qty}</span>
                <span style={{color:"#64748b",fontSize:12}}>{first.dept}</span>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{color:"#64748b",fontSize:11}}>{events.length} events</span>
                <span style={{color:"#6366f1",fontSize:12,fontWeight:600}}>Open →</span>
              </div>
            </div>

            {/* Timeline */}
            <div style={{padding:"14px 18px"}}>
              {events.map((e,i)=>{
                const actorUser = USERS.find(u=>u.name===e.user);
                return (
                  <div key={i} style={{display:"flex",gap:14,alignItems:"flex-start",paddingBottom:i<events.length-1?12:0,marginBottom:i<events.length-1?12:0,borderBottom:i<events.length-1?"1px solid #1e293b40":"none"}}>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:0,flexShrink:0}}>
                      <div style={{width:28,height:28,borderRadius:"50%",background:actorUser?ROLE_COLORS[actorUser.role]+"22":"#1e293b",border:`2px solid ${actorUser?ROLE_COLORS[actorUser.role]+"55":"#334155"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>
                        {actorUser?.avatar||"🔧"}
                      </div>
                      {i<events.length-1&&<div style={{width:2,height:20,background:"#1e293b",margin:"3px 0"}}/>}
                    </div>
                    <div style={{flex:1,paddingTop:4}}>
                      <div style={{color:"#e2e8f0",fontSize:13}}>{e.action}</div>
                      <div style={{display:"flex",gap:8,marginTop:3,flexWrap:"wrap"}}>
                        <span style={{color:"#475569",fontSize:11}}>{e.date}</span>
                        {actorUser&&<><span style={{color:"#334155",fontSize:11}}>·</span><span style={{color:ROLE_COLORS[actorUser.role],fontSize:11,fontWeight:600}}>{e.user}</span><span style={{color:"#334155",fontSize:11}}>·</span><RolePill role={actorUser.role}/></>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Note Sheets List ─────────────────────────────────────────────────────────
function SheetsListView({ sheets, user, onOpen, onCreate }) {
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");

  const filtered = sheets.filter(s=>{
    const ms = s.item.toLowerCase().includes(search.toLowerCase())||s.id.toLowerCase().includes(search.toLowerCase())||s.dept.toLowerCase().includes(search.toLowerCase());
    const mf = stageFilter==="all"||s.stage===stageFilter;
    return ms&&mf;
  });

  const pending = sheets.filter(s=>STAGES.find(x=>x.id===s.stage)?.actor===user.role);

  return (
    <div style={{padding:"24px 28px",overflowY:"auto",flex:1}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div>
          <h2 style={{margin:0,color:"#f1f5f9",fontSize:22,fontWeight:800}}>📄 Note Sheets</h2>
          <div style={{color:"#475569",fontSize:13}}>{sheets.length} total note sheets</div>
        </div>
        {user.role==="hod"&&<button style={S.btnPrimary} onClick={onCreate}>+ New Note Sheet</button>}
      </div>

      {pending.length>0&&(
        <div style={{background:"#1c1400",border:"1px solid #854d0e",borderRadius:12,padding:"11px 16px",marginBottom:18,display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:18}}>⚡</span>
          <div>
            <div style={{color:"#fbbf24",fontWeight:700,fontSize:13}}>{pending.length} sheet{pending.length>1?"s":""} awaiting your action as {ROLE_LABELS[user.role]}</div>
          </div>
        </div>
      )}

      <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search item, NS ID, department..."
          style={{background:"#0f172a",border:"1px solid #334155",borderRadius:9,color:"#f1f5f9",fontSize:13,padding:"8px 14px",flex:"1 1 200px",outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
        <select value={stageFilter} onChange={e=>setStageFilter(e.target.value)}
          style={{background:"#0f172a",border:"1px solid #334155",borderRadius:9,color:"#f1f5f9",fontSize:13,padding:"8px 12px",outline:"none",fontFamily:"inherit"}}>
          <option value="all">All Stages</option>
          {STAGES.map(st=><option key={st.id} value={st.id}>{st.label}</option>)}
        </select>
      </div>

      {filtered.length===0&&<div style={{color:"#475569",textAlign:"center",padding:"60px 20px"}}>No note sheets found.</div>}

      <div style={{display:"flex",flexDirection:"column",gap:11}}>
        {filtered.map(s=>{
          const needsMe=STAGES.find(x=>x.id===s.stage)?.actor===user.role;
          const l1=s.l1Index!==null?s.quotations[s.l1Index]:null;
          return (
            <div key={s.id} onClick={()=>onOpen(s.id)}
              style={{background:"#0f172a",border:`1px solid ${needsMe?ROLE_COLORS[user.role]+"60":"#1e293b"}`,borderRadius:14,padding:"14px 18px",cursor:"pointer",boxShadow:needsMe?`0 0 0 1px ${ROLE_COLORS[user.role]}30`:"none"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8}}>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}>
                    <span style={{fontFamily:"monospace",color:"#818cf8",fontWeight:700,fontSize:12}}>{s.id}</span>
                    <Badge stage={s.stage}/>
                    {needsMe&&<span style={{background:"#fbbf2422",color:"#fbbf24",fontSize:10,fontWeight:700,padding:"1px 8px",borderRadius:20,border:"1px solid #92400e"}}>⚡ Your Turn</span>}
                  </div>
                  <div style={{color:"#f1f5f9",fontWeight:600,fontSize:15}}>{s.item} × {s.qty}</div>
                  <div style={{color:"#64748b",fontSize:12,marginTop:2}}>{s.dept} · {s.hodName} · {s.createdAt}</div>
                  {l1&&<div style={{color:"#6ee7b7",fontSize:12,marginTop:3}}>L1: {l1.vendor} — ₹{fmt(l1.amount)}</div>}
                </div>
                <div style={{textAlign:"right"}}>
                  {s.poNumber&&<div style={{fontFamily:"monospace",color:"#f59e0b",fontSize:11,marginBottom:3}}>{s.poNumber}</div>}
                  <div style={{color:"#6366f1",fontSize:12,fontWeight:600}}>View →</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Detail View ──────────────────────────────────────────────────────────────
function DetailView({ ns, user, update, onBack }) {
  const [qForm,setQForm] = useState({vendor:"",amount:""});
  const [note,setNote]   = useState("");
  const currentActor = STAGES.find(s=>s.id===ns.stage)?.actor;
  const canAct = user.role===currentActor;
  const advance = (nextStage,patch={},msg) => update(ns.id,{stage:nextStage,...patch},msg,user.name);

  return (
    <div style={{padding:"24px 28px",overflowY:"auto",flex:1}}>
      <button style={S.btnBack} onClick={onBack}>← Back</button>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12,marginBottom:22}}>
        <div>
          <div style={{fontFamily:"monospace",color:"#818cf8",fontSize:13,fontWeight:700}}>{ns.id}</div>
          <h2 style={{margin:"4px 0 2px",color:"#f1f5f9"}}>{ns.item} × {ns.qty}</h2>
          <div style={{color:"#64748b",fontSize:12}}>{ns.dept} · {ns.hodName} · {ns.createdAt}</div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
          <Badge stage={ns.stage}/>
          {canAct&&<span style={{background:"#fbbf2422",color:"#fbbf24",fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:20,border:"1px solid #92400e"}}>⚡ Action Required</span>}
          {!canAct&&ns.stage!=="closed"&&<span style={{background:"#0f172a",color:"#64748b",fontSize:11,padding:"3px 10px",borderRadius:20,border:"1px solid #334155"}}>Awaiting {ROLE_LABELS[currentActor]}</span>}
        </div>
      </div>

      <ProgressBar currentStage={ns.stage}/>
      {ns.reason&&<InfoBox label="Justification" value={ns.reason}/>}

      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        {ns.stage==="hod"&&(
          <Panel title="📝 HOD — Submit for Director Approval" accent={canAct?ROLE_COLORS.hod:undefined}>
            {canAct?<><p style={{color:"#94a3b8",fontSize:13,margin:"0 0 12px"}}>Review and submit for Director's approval.</p><button style={S.btnPrimary} onClick={()=>advance("director",{},"Submitted to Director for approval")}>Submit to Director →</button></>
              :<div style={{color:"#64748b",fontSize:13}}>Waiting for HOD to submit.</div>}
          </Panel>
        )}
        {ns.stage==="director"&&(
          <Panel title="👔 Director Approval" accent={canAct?ROLE_COLORS.director:undefined}>
            {canAct?<><Field label="Director's Remarks" value={note} onChange={e=>setNote(e.target.value)} textarea placeholder="Add remarks..."/>
              <div style={{display:"flex",gap:10}}><button style={S.btnPrimary} onClick={()=>{advance("chairman",{directorNote:note},`Director approved. Remarks: ${note||"—"}`);setNote("");}}>Approve → Chairman</button><button style={S.btnDanger} onClick={()=>{advance("hod",{directorNote:note},`Director rejected. Remarks: ${note||"—"}`);setNote("");}}>Reject</button></div></>
              :<div style={{color:"#64748b",fontSize:13}}>Pending Director's review.</div>}
            <InfoBox label="Director's Remarks" value={ns.directorNote} color={ROLE_COLORS.director}/>
          </Panel>
        )}
        {ns.stage==="chairman"&&(
          <Panel title="🏛️ Chairman Approval" accent={canAct?ROLE_COLORS.chairman:undefined}>
            <InfoBox label="Director's Remarks" value={ns.directorNote} color={ROLE_COLORS.director}/>
            <ImageUploadBox label="Attach Note Sheet Image (Chairman)" value={ns.chairmanImage} onChange={v=>update(ns.id,{chairmanImage:v})} disabled={!canAct}/>
            {canAct?<><Field label="Chairman's Remarks" value={note} onChange={e=>setNote(e.target.value)} textarea placeholder="Add remarks..."/>
              <div style={{display:"flex",gap:10}}><button style={S.btnPrimary} onClick={()=>{advance("quotation",{chairmanNote:note},`Chairman approved. Remarks: ${note||"—"}`);setNote("");}}>Approve → Quotation</button><button style={S.btnDanger} onClick={()=>{advance("director",{chairmanNote:note},"Chairman rejected.");setNote("");}}>Reject</button></div></>
              :<div style={{color:"#64748b",fontSize:13,marginTop:8}}>Pending Chairman's review.</div>}
            <InfoBox label="Chairman's Remarks" value={ns.chairmanNote} color={ROLE_COLORS.chairman}/>
          </Panel>
        )}
        {ns.stage==="quotation"&&(
          <Panel title="📊 Vendor Quotations" accent={canAct?ROLE_COLORS.purchase:undefined}>
            {canAct&&<><div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
              <div style={{flex:1,minWidth:150}}><Field label="Vendor Name" value={qForm.vendor} onChange={e=>setQForm(p=>({...p,vendor:e.target.value}))} placeholder="Vendor name"/></div>
              <div style={{flex:1,minWidth:120}}><Field label="Amount (₹)" value={qForm.amount} onChange={e=>setQForm(p=>({...p,amount:e.target.value}))} placeholder="0.00" type="number"/></div></div>
              <button style={S.btnSecondary} onClick={()=>{if(!qForm.vendor||!qForm.amount) return;const q=[...ns.quotations,{vendor:qForm.vendor,amount:parseFloat(qForm.amount)}];update(ns.id,{quotations:q},`Quotation: ${qForm.vendor} ₹${qForm.amount}`,user.name);setQForm({vendor:"",amount:""});}}>+ Add Quotation</button></>}
            {ns.quotations.length>0&&<QuotationTable quotations={ns.quotations}/>}
            {canAct&&ns.quotations.length>=1&&<button style={{...S.btnPrimary,marginTop:12}} onClick={()=>{const mi=ns.quotations.reduce((mi,q,i,a)=>q.amount<a[mi].amount?i:mi,0);advance("l1",{l1Index:mi},`L1 identified: ${ns.quotations[mi].vendor} ₹${ns.quotations[mi].amount}`);}}>Identify L1 & Proceed →</button>}
            {!canAct&&ns.quotations.length===0&&<div style={{color:"#64748b",fontSize:13}}>Quotations not yet uploaded.</div>}
          </Panel>
        )}
        {ns.stage==="l1"&&(
          <Panel title="🏆 L1 Identification & Approval" accent={canAct?ROLE_COLORS.purchase:undefined}>
            <QuotationTable quotations={ns.quotations}/>
            {ns.l1Index!==null&&<InfoBox label="L1 Vendor" value={`${ns.quotations[ns.l1Index]?.vendor} — ₹${fmt(ns.quotations[ns.l1Index]?.amount)}`} color="#10b981"/>}
            {canAct&&<button style={{...S.btnPrimary,marginTop:8}} onClick={()=>advance("po",{},`L1 approved. PO for ${ns.quotations[ns.l1Index]?.vendor}`)}>Approve L1 → Generate PO</button>}
          </Panel>
        )}
        {ns.stage==="po"&&(
          <Panel title="📋 Purchase Order" accent={canAct?ROLE_COLORS.purchase:undefined}>
            {ns.l1Index!==null&&<InfoBox label="L1 Vendor" value={`${ns.quotations[ns.l1Index]?.vendor} — ₹${fmt(ns.quotations[ns.l1Index]?.amount)}`} color="#10b981"/>}
            {canAct?<><Field label="PO Number" value={note} onChange={e=>setNote(e.target.value)} placeholder="e.g. PO-2026-006"/><button style={{...S.btnPrimary,marginTop:4}} onClick={()=>{advance("received",{poNumber:note},`Purchase Order ${note} generated.`);setNote("");}}>Generate PO & Mark Ordered →</button></>
              :<div style={{color:"#64748b",fontSize:13}}>Pending Purchase Officer.</div>}
            <InfoBox label="PO Number" value={ns.poNumber} color={ROLE_COLORS.purchase}/>
          </Panel>
        )}
        {ns.stage==="received"&&(
          <Panel title="📦 Order Received" accent={canAct?ROLE_COLORS.store:undefined}>
            <InfoBox label="PO Number" value={ns.poNumber}/>
            {canAct?<><Field label="Received Remarks" value={note} onChange={e=>setNote(e.target.value)} textarea placeholder="Condition, date received..."/><button style={{...S.btnPrimary,marginTop:4}} onClick={()=>{advance("payment",{receivedNote:note},`Order received. ${note||""}`);setNote("");}}>Confirm Receipt → Payment Approval</button></>
              :<div style={{color:"#64748b",fontSize:13}}>Waiting for Store Keeper.</div>}
            <InfoBox label="Received Remarks" value={ns.receivedNote} color={ROLE_COLORS.store}/>
          </Panel>
        )}
        {ns.stage==="payment"&&(
          <Panel title="💳 Payment Approval" accent={canAct?ROLE_COLORS.finance:undefined}>
            <ImageUploadBox label="Attach Invoice / Note Sheet Image" value={ns.paymentImage} onChange={v=>update(ns.id,{paymentImage:v})} disabled={!canAct}/>
            {canAct?<><Field label="Payment Details" value={note} onChange={e=>setNote(e.target.value)} textarea placeholder="Invoice no., amount..."/><button style={{...S.btnPrimary,marginTop:4}} onClick={()=>{advance("done",{paymentNote:note},`Payment approved. ${note||""}`);setNote("");}}>Approve Payment →</button></>
              :<div style={{color:"#64748b",fontSize:13}}>Pending Finance Officer.</div>}
            <InfoBox label="Payment Remarks" value={ns.paymentNote} color={ROLE_COLORS.finance}/>
          </Panel>
        )}
        {ns.stage==="done"&&(
          <Panel title="✅ Payment Done — Stock Entry" accent={canAct?ROLE_COLORS.store:undefined}>
            {canAct?<><Field label="Stock Register Entry" value={note} onChange={e=>setNote(e.target.value)} textarea placeholder="Asset tags, location, etc."/><button style={{...S.btnPrimary,marginTop:4}} onClick={()=>{advance("closed",{stockEntry:note},`Stock registered: ${note||"—"}`);setNote("");}}>Mark Closed & Register Stock →</button></>
              :<div style={{color:"#64748b",fontSize:13}}>Waiting for Store Keeper.</div>}
          </Panel>
        )}
        {ns.stage==="closed"&&(
          <Panel title="🗄️ Closed — Fully Processed">
            <div style={{background:"#052e16",border:"1px solid #166534",borderRadius:10,padding:16}}>
              <div style={{color:"#4ade80",fontWeight:700,marginBottom:4}}>✅ Fully processed and closed.</div>
              {ns.stockEntry&&<div style={{color:"#86efac",fontSize:13}}>Stock Entry: {ns.stockEntry}</div>}
            </div>
          </Panel>
        )}
        {(ns.chairmanImage||ns.paymentImage)&&(
          <Panel title="🖼️ Attached Documents">
            <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
              {ns.chairmanImage&&<div><div style={{color:"#ec4899",fontSize:11,fontWeight:700,marginBottom:6,textTransform:"uppercase"}}>Chairman Approval</div><img src={ns.chairmanImage} alt="c" style={{maxWidth:200,maxHeight:140,borderRadius:8,objectFit:"contain",background:"#0a1628"}}/></div>}
              {ns.paymentImage&&<div><div style={{color:"#f97316",fontSize:11,fontWeight:700,marginBottom:6,textTransform:"uppercase"}}>Payment Invoice</div><img src={ns.paymentImage} alt="p" style={{maxWidth:200,maxHeight:140,borderRadius:8,objectFit:"contain",background:"#0a1628"}}/></div>}
            </div>
          </Panel>
        )}
        <Panel title="📜 Audit Trail">
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {[...ns.history].reverse().map((h,i)=>(
              <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                <div style={{width:7,height:7,borderRadius:"50%",background:"#6366f1",marginTop:5,flexShrink:0}}/>
                <div><div style={{color:"#e2e8f0",fontSize:13}}>{h.action}</div><div style={{color:"#475569",fontSize:11}}>{h.date} · {h.user}</div></div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

// ─── Login ────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [username,setUsername]=useState("");
  const [password,setPassword]=useState("");
  const [error,setError]=useState("");
  const [showPw,setShowPw]=useState(false);
  const attempt = () => { const u=USERS.find(u=>u.username===username.trim().toLowerCase()&&u.password===password); if(u){setError("");onLogin(u);}else setError("Invalid username or password."); };
  const inp = {background:"#0f172a",border:"1px solid #334155",borderRadius:10,color:"#f1f5f9",fontSize:15,padding:"12px 16px",width:"100%",outline:"none",fontFamily:"inherit",boxSizing:"border-box"};
  return (
    <div style={{minHeight:"100vh",background:"#020817",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{textAlign:"center",marginBottom:32}}>
        <div style={{fontSize:50,marginBottom:8}}>🏢</div>
        <div style={{color:"#f1f5f9",fontWeight:800,fontSize:22,fontFamily:"'Georgia',serif"}}>Procurement Management System</div>
        <div style={{color:"#475569",fontSize:13,marginTop:4}}>Office Note Sheet Workflow · Secure Login</div>
      </div>
      <div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:18,padding:"30px 26px",width:"100%",maxWidth:420}}>
        <div style={{color:"#94a3b8",fontSize:12,fontWeight:700,textTransform:"uppercase",letterSpacing:1,textAlign:"center",marginBottom:22}}>Sign In to Your Account</div>
        <div style={{marginBottom:14}}>
          <label style={{display:"block",color:"#64748b",fontSize:11,fontWeight:700,marginBottom:5,textTransform:"uppercase",letterSpacing:1}}>Username</label>
          <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="e.g. hod" style={inp} onKeyDown={e=>e.key==="Enter"&&attempt()}/>
        </div>
        <div style={{marginBottom:10}}>
          <label style={{display:"block",color:"#64748b",fontSize:11,fontWeight:700,marginBottom:5,textTransform:"uppercase",letterSpacing:1}}>Password</label>
          <div style={{position:"relative"}}>
            <input type={showPw?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter password" style={{...inp,paddingRight:44}} onKeyDown={e=>e.key==="Enter"&&attempt()}/>
            <button onClick={()=>setShowPw(p=>!p)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"#64748b",cursor:"pointer",fontSize:16}}>{showPw?"🙈":"👁️"}</button>
          </div>
        </div>
        {error&&<div style={{color:"#f87171",fontSize:13,marginBottom:12,background:"#450a0a",padding:"8px 12px",borderRadius:8}}>{error}</div>}
        <button style={{...S.btnPrimary,width:"100%",padding:"13px",fontSize:15,marginBottom:24}} onClick={attempt}>Sign In →</button>
        <div style={{borderTop:"1px solid #1e293b",paddingTop:20}}>
          <div style={{color:"#475569",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>Demo Credentials — Click to Fill</div>
          <div style={{display:"flex",flexDirection:"column",gap:7}}>
            {USERS.map(u=>(
              <div key={u.id} onClick={()=>{setUsername(u.username);setPassword(u.password);setError("");}}
                style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"#0a1628",borderRadius:9,padding:"8px 12px",cursor:"pointer",border:"1px solid #1e293b"}}>
                <div style={{display:"flex",alignItems:"center",gap:9}}>
                  <span style={{fontSize:18}}>{u.avatar}</span>
                  <div><div style={{color:"#e2e8f0",fontSize:12,fontWeight:600}}>{u.name}</div><RolePill role={u.role}/></div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontFamily:"monospace",color:"#818cf8",fontSize:11}}>{u.username}</div>
                  <div style={{fontFamily:"monospace",color:"#64748b",fontSize:11}}>{u.password}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Create Sheet ─────────────────────────────────────────────────────────────
function CreateView({ user, onCreate, onBack }) {
  const [form,setForm]=useState({item:"",qty:"",reason:""});
  const submit = () => { if(!form.item||!form.qty) return; onCreate(form); };
  return (
    <div style={{padding:"24px 28px",overflowY:"auto",flex:1}}>
      <button style={S.btnBack} onClick={onBack}>← Back</button>
      <h2 style={{color:"#f1f5f9",marginBottom:4}}>Initiate Note Sheet</h2>
      <div style={{color:"#64748b",fontSize:13,marginBottom:22}}>{user.name} · {user.dept}</div>
      <div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:14,padding:24,maxWidth:540}}>
        <Field label="Item / Requirement" value={form.item} onChange={e=>setForm(p=>({...p,item:e.target.value}))} placeholder="e.g. Desktop Computers"/>
        <Field label="Quantity" value={form.qty} onChange={e=>setForm(p=>({...p,qty:e.target.value}))} placeholder="e.g. 10" type="number"/>
        <Field label="Justification / Reason" value={form.reason} onChange={e=>setForm(p=>({...p,reason:e.target.value}))} placeholder="Why is this needed?" textarea/>
        <button style={{...S.btnPrimary,width:"100%",marginTop:4}} onClick={submit}>Submit Note Sheet</button>
      </div>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [currentUser,setCurrentUser] = useState(null);
  const [sheets,setSheets]           = useState(SEED_SHEETS);
  const [nav,setNav]                 = useState("dashboard");
  const [detailId,setDetailId]       = useState(null);
  const [creating,setCreating]       = useState(false);

  const update = useCallback((id,patch,msg,who) => {
    setSheets(prev=>prev.map(s=>{
      if(s.id!==id) return s;
      const u={...s,...patch};
      if(msg) u.history=[...s.history,{date:today(),action:msg,user:who}];
      return u;
    }));
  },[]);

  const createSheet = (form) => {
    const ns = {
      id:uid(), createdAt:today(), stage:"hod",
      dept:currentUser.dept, item:form.item, qty:form.qty, reason:form.reason,
      hodName:currentUser.name, directorNote:"", chairmanNote:"",
      chairmanImage:null, quotations:[], l1Index:null,
      poNumber:"", receivedNote:"", paymentNote:"", paymentImage:null, stockEntry:"",
      history:[{date:today(),action:"Note Sheet created",user:currentUser.name}],
    };
    setSheets(p=>[ns,...p]);
    setCreating(false);
    setNav("sheets");
  };

  const openSheet = (id) => { setDetailId(id); setCreating(false); };
  const closeDetail = () => setDetailId(null);

  if(!currentUser) return <LoginScreen onLogin={setCurrentUser}/>;

  const activeNs = sheets.find(s=>s.id===detailId);

  return (
    <div style={{display:"flex",minHeight:"100vh",background:"#020817",fontFamily:"'Segoe UI',system-ui,sans-serif"}}>
      <Sidebar active={nav} onNav={id=>{setNav(id);setDetailId(null);setCreating(false);}} user={currentUser} onLogout={()=>{setCurrentUser(null);setNav("dashboard");setDetailId(null);setCreating(false);}}/>

      {/* Main content */}
      <div style={{flex:1,display:"flex",flexDirection:"column",minHeight:"100vh",overflowX:"hidden"}}>
        {detailId&&activeNs ? (
          <DetailView ns={activeNs} user={currentUser} update={update} onBack={closeDetail}/>
        ) : creating ? (
          <CreateView user={currentUser} onCreate={createSheet} onBack={()=>setCreating(false)}/>
        ) : nav==="dashboard" ? (
          <DashboardView sheets={sheets} onNav={setNav} onOpenSheet={openSheet}/>
        ) : nav==="sheets" ? (
          <SheetsListView sheets={sheets} user={currentUser} onOpen={openSheet} onCreate={()=>setCreating(true)}/>
        ) : nav==="stock" ? (
          <StockRegisterView sheets={sheets}/>
        ) : nav==="history" ? (
          <HistoryView sheets={sheets} onOpenSheet={openSheet}/>
        ) : null}
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = {
  btnPrimary:   {background:"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"#fff",border:"none",borderRadius:9,padding:"10px 20px",fontWeight:700,fontSize:14,cursor:"pointer"},
  btnSecondary: {background:"#1e293b",color:"#c7d2fe",border:"1px solid #334155",borderRadius:9,padding:"9px 16px",fontWeight:600,fontSize:13,cursor:"pointer"},
  btnDanger:    {background:"#450a0a",color:"#fca5a5",border:"1px solid #7f1d1d",borderRadius:9,padding:"10px 20px",fontWeight:700,fontSize:14,cursor:"pointer"},
  btnBack:      {background:"none",border:"none",color:"#6366f1",fontWeight:600,fontSize:14,cursor:"pointer",padding:"0 0 14px 0"},
};
