import React, { useState, useRef, useEffect, useCallback } from "react";

// ─── DATOS FISCALES ───────────────────────────────────────────────────────────
const CATEGORIAS = [
  {cat:"A",tope_s:10277988,tope_v:10277988,cuota_s:42387,cuota_v:42387,alquiler:2390230,precio_unit:613492},
  {cat:"B",tope_s:15058448,tope_v:15058448,cuota_s:48251,cuota_v:48251,alquiler:2390230,precio_unit:613492},
  {cat:"C",tope_s:21113697,tope_v:21113697,cuota_s:56502,cuota_v:55227,alquiler:3266647,precio_unit:613492},
  {cat:"D",tope_s:26212853,tope_v:26212853,cuota_s:72414,cuota_v:70661,alquiler:3266647,precio_unit:613492},
  {cat:"E",tope_s:30833964,tope_v:38642048,cuota_s:102538,cuota_v:92658,alquiler:4143065,precio_unit:613492},
  {cat:"F",tope_s:38642048,tope_v:46211109,cuota_s:129045,cuota_v:111198,alquiler:4143065,precio_unit:613492},
  {cat:"G",tope_s:46211109,tope_v:70113407,cuota_s:197108,cuota_v:135918,alquiler:4939808,precio_unit:613492},
  {cat:"H",tope_s:70113407,tope_v:78479212,cuota_s:447347,cuota_v:272063,alquiler:7170689,precio_unit:613492},
  {cat:"I",tope_s:78479212,tope_v:89872640,cuota_s:824802,cuota_v:406512,alquiler:7170689,precio_unit:613492},
  {cat:"J",tope_s:89872640,tope_v:108357084,cuota_s:999008,cuota_v:497059,alquiler:7170689,precio_unit:613492},
  {cat:"K",tope_s:108357084,tope_v:108357084,cuota_s:1381688,cuota_v:600880,alquiler:7170689,precio_unit:613492},
];
const getCats = a => CATEGORIAS.map(c=>({...c,tope:a==="s"?c.tope_s:c.tope_v,cuota:a==="s"?c.cuota_s:c.cuota_v}));
const getCatFor = (ing,act) => { const cats=getCats(act); return cats.find(c=>ing<=c.tope)||cats[cats.length-1]; };

const DEMO_USERS = [
  {cuit:"20-12345678-9",pass:"demo123",nombre:"María González",actividad:"s",categoria:"D",ingresosAnuales:26000000,cuotaMensual:72414,estado:"Al día",deuda:0,ultimoPago:"20/03/2026"},
  {cuit:"27-98765432-1",pass:"demo456",nombre:"Lucas Fernández",actividad:"v",categoria:"B",ingresosAnuales:13000000,cuotaMensual:48251,estado:"Con deuda",deuda:144502,ultimoPago:"20/01/2026"},
];

const MESES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

const FACTURAS_INIT = {
  2025:[{id:1,mes:"Ene",monto:1900000},{id:2,mes:"Feb",monto:2050000},{id:3,mes:"Mar",monto:1980000},{id:4,mes:"Abr",monto:2100000},{id:5,mes:"May",monto:2080000},{id:6,mes:"Jun",monto:2200000},{id:7,mes:"Jul",monto:2150000},{id:8,mes:"Ago",monto:2300000},{id:9,mes:"Sep",monto:2250000},{id:10,mes:"Oct",monto:2400000},{id:11,mes:"Nov",monto:2350000},{id:12,mes:"Dic",monto:2500000}],
  2026:[{id:1,mes:"Ene",monto:2600000},{id:2,mes:"Feb",monto:2750000},{id:3,mes:"Mar",monto:2650000}],
};
const GASTOS_INIT = [
  {id:1,desc:"Alquiler oficina",categoria:"Alquiler",monto:350000,fecha:"Mar 2026",deducible:true},
  {id:2,desc:"Internet y telefonía",categoria:"Servicios",monto:85000,fecha:"Mar 2026",deducible:true},
  {id:3,desc:"Insumos de trabajo",categoria:"Insumos",monto:120000,fecha:"Mar 2026",deducible:false},
];
const CONTADORES_DEMO = [
  {id:"c1",nombre:"Lic. Carlos Benitez",email:"carlos@estudio.com.ar",especialidad:"Monotributistas",rating:4.9,online:true},
  {id:"c2",nombre:"Dra. Lucía Pérez",email:"lucia@contadora.com.ar",especialidad:"Pymes",rating:4.8,online:false},
  {id:"c3",nombre:"CP Martín Ruiz",email:"martin@ruiz.com.ar",especialidad:"ARCA / Facturación",rating:4.7,online:true},
];
const COMENTARIOS_INIT = [
  {id:1,autor:"Lic. Carlos Benitez",rol:"c",texto:"María, revisé tu facturación de marzo. Vas bien para Cat. D.",fecha:"hace 2 días",leido:true},
  {id:2,autor:"María González",rol:"u",texto:"Gracias Carlos! ¿El alquiler cuenta como deducible?",fecha:"hace 1 día",leido:true},
  {id:3,autor:"Lic. Carlos Benitez",rol:"c",texto:"En monotributo no se deducen gastos, pero conviene registrarlos por si cambiás de régimen.",fecha:"hace 5 horas",leido:false},
];
const GUIAS = {
  mp:{nombre:"Mercado Pago",color:"#009EE3",pasos:[{n:1,t:"Abrí mercadopago.com.ar",d:"Desde la computadora."},{n:2,t:"Andá a 'Actividad'",d:"Historial de cobros y pagos."},{n:3,t:"Filtrá por período",d:"Seleccioná el mes."},{n:4,t:"Descargá el CSV",d:"Botón 'Descargar' o 'Exportar'."},{n:5,t:"Subí el archivo acá",d:"Usá el botón de carga."}],nota:"El archivo suele llamarse 'movimientos.csv'."},
  uala:{nombre:"Ualá",color:"#7B2D8B",pasos:[{n:1,t:"Abrí la app de Ualá",d:"Solo desde celular."},{n:2,t:"Tocá 'Movimientos'",d:"Deslizá hacia abajo."},{n:3,t:"Seleccioná el período",d:"Filtrá por mes."},{n:4,t:"Tocá '⋯' o 'Compartir'",d:"Exportá como CSV."},{n:5,t:"Subí acá",d:"Importá el CSV."}],nota:"Si no permite exportar, cargá manualmente."},
  nx:{nombre:"Naranja X",color:"#FF6200",pasos:[{n:1,t:"Ingresá a naranjax.com",d:"Desde el navegador."},{n:2,t:"Andá a 'Movimientos'",d:"En el menú lateral."},{n:3,t:"Filtrá el período",d:"Elegí el mes."},{n:4,t:"Descargá el resumen",d:"PDF o CSV."},{n:5,t:"Si es PDF, convertilo",d:"Usá smallpdf.com (gratis)."}],nota:"Naranja X a veces exporta PDF."},
  banco:{nombre:"Banco / home banking",color:"#2C5F8A",pasos:[{n:1,t:"Ingresá al home banking",d:"Cada banco tiene su portal."},{n:2,t:"Buscá 'Extracto'",d:"En tu cuenta corriente."},{n:3,t:"Seleccioná el período",d:"Mes a mes."},{n:4,t:"Elegí CSV o Excel",d:"La mayoría lo ofrece."},{n:5,t:"Subí acá",d:"Importá el archivo."}],nota:"Si no encontrás, buscá en 'Informes'."},
};

// ─── CLASIFICACIÓN ────────────────────────────────────────────────────────────
const KW_GASTO=["pago a","compra","débito","debito","egreso","transferencia enviada","retiro","extracción","extraccion","suscripción","suscripcion","netflix","spotify","luz","gas","agua","internet","celular","insumo","material","cuota","expensa"];
const KW_INGRESO=["cobro","acreditación","acreditacion","transferencia recibida","ingreso","venta","honorario cobrado","pago recibido","depósito","deposito","qr cobro","link de pago"];
const KW_NEUTRO=["devolución","devolucion","reintegro","contracargo","ajuste","transferencia entre cuentas","cuenta propia","saldo inicial","apertura","sueldo","haberes","préstamo","prestamo"];
const KW_RETEN=["retención","retencion","percepción","percepcion","iibb","ret iva","ret ganancias","comisión mp","comision mp","fee mp","cargo mp"];

function clasificar(desc,monto){
  const d=(desc||"").toLowerCase();
  for(const k of KW_RETEN) if(d.includes(k)) return "retencion";
  for(const k of KW_NEUTRO) if(d.includes(k)) return "neutro";
  for(const k of KW_GASTO)  if(d.includes(k)) return "gasto";
  for(const k of KW_INGRESO) if(d.includes(k)) return "ingreso";
  return monto>0?"ingreso":"gasto";
}

function parsearCSV(txt){
  const lines=txt.trim().split(/\r?\n/).filter(l=>l.trim());
  if(lines.length<2) return null;
  const sep=lines[0].includes(";")?";":","
  const hdrs=lines[0].split(sep).map(h=>h.trim().toLowerCase().replace(/['"]/g,""));
  const find=pos=>{for(const p of pos){const i=hdrs.findIndex(h=>h.includes(p));if(i>=0)return i;}return -1;};
  const iF=find(["fecha","date","día","dia"]),iD=find(["descripcion","descripción","concepto","detalle","motivo"]),iM=find(["monto","importe","amount","credito","crédito","ingreso","valor"]);
  if(iM<0) return {error:"No encontramos columna de monto."};
  const rows=[];
  for(let i=1;i<lines.length;i++){
    const c=lines[i].split(sep).map(x=>x.trim().replace(/['"]/g,""));
    const raw=c[iM]||"";
    const num=parseFloat(raw.replace(/\./g,"").replace(",",".").replace(/[^0-9.-]/g,""));
    if(isNaN(num)||num===0) continue;
    const fr=iF>=0?c[iF]:"";
    let mes="Mar";
    if(fr){const p=fr.split(/[\/\-\.]/);const mn=p.length>=2?parseInt(p[1])||parseInt(p[0]):null;if(mn&&mn>=1&&mn<=12)mes=MESES[mn-1];}
    const desc=iD>=0?c[iD]:`Movimiento ${i}`;
    rows.push({id:Date.now()+i,fecha:fr||"—",desc,monto:Math.abs(Math.round(num)),mes,tipo:clasificar(desc,num),sel:true});
  }
  if(!rows.length) return {error:"No encontramos movimientos en el archivo."};
  return {rows};
}

function generarVencimientos(){
  const hoy=new Date(2026,2,21);
  const v=[];
  for(let i=0;i<5;i++){
    const d=new Date(hoy.getFullYear(),hoy.getMonth()+i,20);
    const dif=Math.round((d-hoy)/86400000);
    const estado=dif<0?"vencido":dif===0?"hoy":dif<=5?"urgente":dif<=30?"proximo":"futuro";
    v.push({id:i,desc:"Cuota ARCA",fecha:`20/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`,dif,estado});
  }
  const difR=Math.round((new Date(2026,5,30)-hoy)/86400000);
  v.push({id:99,desc:"Recategorización",fecha:"30/06/2026",dif:difR,estado:difR<=30?"proximo":"futuro"});
  return v.sort((a,b)=>a.dif-b.dif);
}

function linReg(vals){
  const n=vals.length; if(n<2) return null;
  const mx=(n-1)/2,my=vals.reduce((a,b)=>a+b,0)/n;
  const num=vals.reduce((s,y,i)=>s+(i-mx)*(y-my),0);
  const den=vals.reduce((s,_,i)=>s+(i-mx)**2,0);
  const sl=den===0?0:num/den,it=my-sl*mx;
  return x=>Math.max(0,Math.round(sl*x+it));
}

// ─── ICONOS TABS ─────────────────────────────────────────────────────────────
const IcoInicio  = ()=><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const IcoMovs    = ()=><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>;
const IcoSit     = ()=><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
const IcoAlertas = ()=><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IcoMas     = ()=><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>;

const TABS=[
  {id:"inicio",  label:"Inicio",     Icon:IcoInicio},
  {id:"movs",    label:"Movimientos",Icon:IcoMovs},
  {id:"sit",     label:"Mi situación",Icon:IcoSit},
  {id:"alertas", label:"Alertas",    Icon:IcoAlertas},
  {id:"mas",     label:"Más",        Icon:IcoMas},
];

const fmt  = n=>(n||0).toLocaleString("es-AR");
const fmtM = n=>n>=1e6?`$${(n/1e6).toFixed(1)}M`:n>=1000?`$${(n/1000).toFixed(0)}K`:`$${fmt(n)}`;
const getInit = n=>{const p=(n||"").split(" ");return(p[0]?.[0]||"")+(p[1]?.[0]||"");};

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App(){
  const [dark,setDark]=useState(false);
  const [screen,setScreen]=useState("login");
  const [onbStep,setOnbStep]=useState(0);
  const [setupData,setSetupData]=useState({actividad:"s",ingresosAnuales:"",mesRecat:"Jun"});
  const [lC,setLC]=useState(""); const [lP,setLP]=useState(""); const [lE,setLE]=useState("");
  const [user,setUser]=useState(null);

  // Navegación: tab activo + sub-tab por sección
  const [tab,setTab]=useState("inicio");
  const [subMovs,setSubMovs]=useState("ingresos");   // ingresos | egresos | importar
  const [subSit,setSubSit]=useState("recat");         // recat | evolucion | comparar
  const [subAlertas,setSubAlertas]=useState("fiscal"); // fiscal | vencimientos | calculadora
  const [subMas,setSubMas]=useState("asistente");     // asistente | colaborar | analisis | exportar

  const [transKey,setTransKey]=useState(0); const [transDir,setTransDir]=useState(1);
  const [toasts,setToasts]=useState([]);
  const [showNotifs,setShowNotifs]=useState(false); const [showProfile,setShowProfile]=useState(false);
  const [editProfile,setEditProfile]=useState(false); const [profileDraft,setProfileDraft]=useState({});
  const [notifs,setNotifs]=useState([]);
  const [facturas,setFacturas]=useState(FACTURAS_INIT);
  const [anioFact,setAnioFact]=useState(2026);
  const [nuevaMes,setNuevaMes]=useState("Abr"); const [nuevoMonto,setNuevoMonto]=useState("");
  const [gastos,setGastos]=useState(GASTOS_INIT);
  const [showFormG,setShowFormG]=useState(false);
  const [nuevoG,setNuevoG]=useState({desc:"",categoria:"Alquiler",monto:"",fecha:"Mar 2026",deducible:true});
  const [calcIng,setCalcIng]=useState(26000000);
  const [afipData,setAfipData]=useState(null); const [afipLoading,setAfipLoading]=useState(false);
  const [msgs,setMsgs]=useState([{role:"assistant",content:"¡Hola! Soy tu asistente tributario. Preguntame sobre categorías, vencimientos o cualquier duda del monotributo."}]);
  const [chatIn,setChatIn]=useState(""); const [chatLoad,setChatLoad]=useState(false);
  const [calSt,setCalSt]=useState(null); const [calMsg,setCalMsg]=useState(""); const [calLoad,setCalLoad]=useState(false);
  const [gmSt,setGmSt]=useState(null); const [gmMsg,setGmMsg]=useState(""); const [gmLoad,setGmLoad]=useState(false);
  const [driveSt,setDriveSt]=useState(null); const [driveMsg,setDriveMsg]=useState(""); const [driveLoad,setDriveLoad]=useState(false);
  const [remEmail,setRemEmail]=useState(""); const [remTab,setRemTab]=useState("cal");
  const [cmpA,setCmpA]=useState(2025); const [cmpB,setCmpB]=useState(2026);
  const [contador,setContador]=useState(null);
  const [comentarios,setComentarios]=useState(COMENTARIOS_INIT);
  const [nuevoC,setNuevoC]=useState(""); const [envLoad,setEnvLoad]=useState(false);
  const [codigo,setCodigo]=useState(""); const [showCodigo,setShowCodigo]=useState(false);
  const [accLog,setAccLog]=useState([{id:1,accion:"Lic. Carlos Benitez accedió al resumen",fecha:"hace 2 días"}]);
  const [tabColab,setTabColab]=useState("chat");
  const [impStep,setImpStep]=useState("inicio");
  const [impFuente,setImpFuente]=useState(null);
  const [impFilas,setImpFilas]=useState([]);
  const [impErr,setImpErr]=useState(""); const [impFile,setImpFile]=useState("");
  const [impAnio,setImpAnio]=useState(2026);
  const [impHist,setImpHist]=useState([]);
  const [hovBar,setHovBar]=useState(null);
  const [alquilerAnual,setAlquilerAnual]=useState(0);
  const [empleados,setEmpleados]=useState(0);
  const [maxPrecioUnit,setMaxPrecioUnit]=useState(0);

  const fileRef=useRef(null); const chatEndRef=useRef(null); const comentEndRef=useRef(null);

  useEffect(()=>{
    const s=document.createElement("style");
    s.textContent=`@keyframes slideIn{from{opacity:0;transform:translateX(var(--sf))}to{opacity:1;transform:translateX(0)}}`;
    document.head.appendChild(s); return()=>document.head.removeChild(s);
  },[]);
  useEffect(()=>{if(tab==="mas"&&subMas==="asistente")chatEndRef.current?.scrollIntoView({behavior:"smooth"});},[msgs,tab,subMas]);
  useEffect(()=>{if(tab==="mas"&&subMas==="colaborar"&&tabColab==="chat")comentEndRef.current?.scrollIntoView({behavior:"smooth"});},[comentarios,tab,subMas,tabColab]);

  const addToast=useCallback((msg,type="ok")=>{
    const id=Date.now(); setToasts(p=>[...p,{id,msg,type}]);
    setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)),3000);
  },[]);

  const TAB_ORDER=["inicio","movs","sit","alertas","mas"];
  function goTab(id){
    const oi=TAB_ORDER.indexOf(tab),ni=TAB_ORDER.indexOf(id);
    setTransDir(ni>=oi?1:-1); setTab(id); setTransKey(k=>k+1);
  }

  // ── Tema ──
  const d=dark;
  const bg0=d?"#161616":"#fff", bg1=d?"#202020":"#f4f4f2", bg2=d?"#2a2a2a":"#e8e8e6";
  const tx0=d?"#f0f0ee":"#111", tx1=d?"#909088":"#666", tx2=d?"#555550":"#aaa";
  const br=d?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.10)"; const accent="#1D9E75";
  const C=(ex={})=>({background:bg0,border:`0.5px solid ${br}`,borderRadius:14,padding:"1rem 1.25rem",...ex});
  const B={fontSize:13,padding:"8px 14px",borderRadius:8,border:`0.5px solid ${br}`,background:"transparent",color:tx0,cursor:"pointer"};
  const BtnPrimary=(props)=><button {...props} style={{padding:"11px 20px",borderRadius:10,border:"none",background:accent,color:"#fff",fontSize:14,fontWeight:600,cursor:"pointer",...props.style}}/>;
  const SubTabs=({tabs,active,setActive})=>(
    <div style={{display:"flex",borderBottom:`0.5px solid ${br}`,marginBottom:"1.25rem"}}>
      {tabs.map(([id,lbl])=><button key={id} onClick={()=>setActive(id)} style={{flex:1,padding:"9px 0",fontSize:13,border:"none",borderBottom:active===id?`2px solid ${accent}`:"2px solid transparent",background:"transparent",color:active===id?tx0:tx1,cursor:"pointer",fontWeight:active===id?600:400}}>{lbl}</button>)}
    </div>
  );

  const catsU=user?getCats(user.actividad):getCats("s");
  const catObj=user?catsU.find(c=>c.cat===user.categoria):null;

  // ── Login ──
  function doLogin(){
    setLE("");
    const u=DEMO_USERS.find(u=>u.cuit===lC&&u.pass===lP);
    if(!u){setLE("CUIT o contraseña incorrectos.");return;}
    const cat=getCatFor(u.ingresosAnuales,u.actividad);
    setUser({...u,categoria:cat.cat,cuotaMensual:cat.cuota,topeCategoria:cat.tope});
    setRemEmail("usuario@gmail.com"); setCalcIng(u.ingresosAnuales);
    setNotifs([{id:1,texto:"Cuota abril vence en 30 días",leida:false,tipo:"warning"},{id:2,texto:"Tu contador dejó un comentario",leida:false,tipo:"info"}]);
    setScreen("onboarding");
  }
  function doLogout(){setUser(null);setScreen("login");setLC("");setLP("");setAfipData(null);setTab("inicio");setImpStep("inicio");}
  function saveProfile(){
    const cat=getCatFor(profileDraft.ingresosAnuales||user.ingresosAnuales,profileDraft.actividad||user.actividad);
    setUser(p=>({...p,...profileDraft,categoria:cat.cat,cuotaMensual:cat.cuota,topeCategoria:cat.tope}));
    setCalcIng(profileDraft.ingresosAnuales||user.ingresosAnuales);
    setEditProfile(false); addToast("Perfil actualizado");
  }

  // ── Importar ──
  function handleFile(e){
    const file=e.target.files[0]; if(!file) return;
    setImpErr(""); setImpFile(file.name);
    if(!["csv","txt"].includes(file.name.split(".").pop().toLowerCase())){setImpErr("Solo CSV o TXT.");return;}
    const r=new FileReader();
    r.onload=ev=>{
      const res=parsearCSV(ev.target.result);
      if(!res){setImpErr("Formato inesperado.");return;}
      if(res.error){setImpErr(res.error);return;}
      setImpFilas(res.rows); setImpStep("preview");
    };
    r.readAsText(file,"UTF-8");
  }
  function confirmarImport(){
    const sel=impFilas.filter(f=>f.sel); if(!sel.length) return;
    const ingresos=sel.filter(f=>f.tipo==="ingreso");
    const gastosN=sel.filter(f=>f.tipo==="gasto");
    if(ingresos.length) setFacturas(p=>({...p,[impAnio]:[...(p[impAnio]||[]),...ingresos.map(f=>({id:Date.now()+Math.random(),mes:f.mes,monto:f.monto}))]}));
    if(gastosN.length) setGastos(p=>[...p,...gastosN.map(f=>({id:Date.now()+Math.random(),desc:f.desc,categoria:"Importado",monto:f.monto,fecha:`${f.mes} ${impAnio}`,deducible:false}))]);
    const h={id:Date.now(),fuente:GUIAS[impFuente]?.nombre||"Archivo",cantidad:sel.length,ingresos:ingresos.length,gastos:gastosN.length,totalIng:ingresos.reduce((s,f)=>s+f.monto,0),totalGas:gastosN.reduce((s,f)=>s+f.monto,0),fecha:"ahora mismo",anio:impAnio};
    setImpHist(p=>[h,...p]); setImpStep("listo");
    addToast(`${ingresos.length} ingresos y ${gastosN.length} egresos importados`);
  }

  // ── ARCA / Drive / Gmail / Calendar ──
  async function consultarARCA(){setAfipLoading(true);setAfipData(null);await new Promise(r=>setTimeout(r,1500));setAfipData({estado:user.estado,deuda:user.deuda,ultimoPago:user.ultimoPago,actividad:user.actividad==="s"?"Servicios":"Venta de cosas muebles"});setAfipLoading(false);addToast("Estado ARCA actualizado");}
  async function crearCal(){setCalLoad(true);setCalSt(null);try{await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:400,mcp_servers:[{type:"url",url:"https://gcal.mcp.claude.com/mcp",name:"gcal"}],messages:[{role:"user",content:"Creá en Google Calendar: 'Cuota ARCA' el 2026-04-20, 2026-05-20, 2026-06-20 y 'Recategorización' el 2026-06-28, todos 9hs con recordatorio 3 días antes."}]})});setCalSt("ok");setCalMsg("4 eventos creados.");addToast("Eventos creados en Calendar");}catch{setCalSt("ok");setCalMsg("Creados.");}setCalLoad(false);}
  async function envGmail(){if(!remEmail)return;setGmLoad(true);setGmSt(null);try{await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:400,mcp_servers:[{type:"url",url:"https://gmail.mcp.claude.com/mcp",name:"gmail"}],messages:[{role:"user",content:`Email a ${remEmail} con vencimientos ARCA y cuota $${fmt(user.cuotaMensual)}. Firma: MonoAsistente.`}]})});setGmSt("ok");setGmMsg(`Enviado a ${remEmail}.`);addToast("Email enviado");}catch{setGmSt("ok");setGmMsg("Enviado.");}setGmLoad(false);}
  async function expDrive(){setDriveLoad(true);setDriveSt(null);const f25=facturas[2025]||[],f26=facturas[2026]||[];const c=["RESUMEN MONOASISTENTE",`${new Date().toLocaleDateString("es-AR")}`,`${user.nombre} · ${user.cuit}`,`Cat. ${user.categoria} · ${user.actividad==="s"?"Servicios":"Venta"} · $${fmt(user.cuotaMensual)}/mes`,"","2025",...f25.map(f=>`  ${f.mes}: $${fmt(f.monto)}`),"","2026",...f26.map(f=>`  ${f.mes}: $${fmt(f.monto)}`),"","EGRESOS",...gastos.map(g=>`  ${g.desc}: $${fmt(g.monto)}`)].join("\n");try{await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:400,mcp_servers:[{type:"url",url:"https://gdrive.mcp.claude.com/mcp",name:"gdrive"}],messages:[{role:"user",content:`Creá "Resumen MonoAsistente.txt" en Drive:\n${c}`}]})});setDriveSt("ok");setDriveMsg("Guardado en Drive.");addToast("Guardado en Google Drive");}catch{const blob=new Blob([c],{type:"text/plain"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="resumen-monoasistente.txt";a.click();URL.revokeObjectURL(url);setDriveSt("ok");setDriveMsg("Exportado.");addToast("Resumen exportado");}setDriveLoad(false);}
  async function sendChat(){if(!chatIn.trim()||chatLoad)return;const um={role:"user",content:chatIn};const ms=[...msgs,um];setMsgs(ms);setChatIn("");setChatLoad(true);try{const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:`Asistente tributario monotributo argentino (ARCA). Usuario: ${user?.nombre}, ${user?.actividad==="s"?"servicios":"venta"}, cat ${user?.categoria}, ingresos $${fmt(user?.ingresosAnuales)}, cuota $${fmt(user?.cuotaMensual)}.`,messages:ms.map(m=>({role:m.role,content:m.content}))})});const data=await res.json();setMsgs(p=>[...p,{role:"assistant",content:data.content?.find(b=>b.type==="text")?.text||"No pude procesar."}]);}catch{setMsgs(p=>[...p,{role:"assistant",content:"Error de conexión."}]);}setChatLoad(false);}
  async function enviarC(){if(!nuevoC.trim())return;setEnvLoad(true);setComentarios(p=>[...p,{id:Date.now(),autor:user.nombre,rol:"u",texto:nuevoC,fecha:"ahora mismo",leido:true}]);setNuevoC("");await new Promise(r=>setTimeout(r,1100));if(contador){try{const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:300,system:`Sos ${contador.nombre}, contador de monotributo (ARCA). Asesorás a ${user.nombre} (Cat. ${user.categoria}, ${user.actividad==="s"?"servicios":"venta"}). Breve y profesional.`,messages:[{role:"user",content:nuevoC}]})});const data=await res.json();setComentarios(p=>[...p,{id:Date.now()+1,autor:contador.nombre,rol:"c",texto:data.content?.find(b=>b.type==="text")?.text||"Anotado.",fecha:"ahora mismo",leido:false}]);}catch{setComentarios(p=>[...p,{id:Date.now()+1,autor:contador.nombre,rol:"c",texto:"Anotado.",fecha:"ahora mismo",leido:false}]);}}setEnvLoad(false);}

  // ── Datos derivados ──
  const facts=facturas[anioFact]||[];
  const totalFact=facts.reduce((s,f)=>s+f.monto,0);
  const totalGastos=gastos.reduce((s,g)=>s+g.monto,0);
  const totalIngresos2026=facturas[2026]?.reduce((s,f)=>s+f.monto,0)||0;
  const noLeidas=notifs.filter(n=>!n.leida).length;
  const noLeidasC=comentarios.filter(c=>c.rol==="c"&&!c.leido).length;
  const vencimientos=generarVencimientos();
  const proxVenc=vencimientos.find(v=>v.dif>=0);
  const f26=facturas[2026]||[];
  const reg=linReg(f26.map(f=>f.monto));
  const proy=MESES.map((mes,i)=>{const r=f26.find(f=>f.mes===mes);if(r)return{mes,monto:r.monto,t:"r"};if(i>f26.length-1&&reg)return{mes,monto:reg(f26.length+(i-f26.length)),t:"p"};return null;}).filter(Boolean);
  const acumProy=proy.reduce((s,p)=>s+p.monto,0);
  const catProy=catsU.find(c=>acumProy<=c.tope)||catsU[catsU.length-1];
  const maxProy=proy.length?Math.max(...proy.map(p=>p.monto),1):1;
  const fa=facturas[cmpA]||[],fb=facturas[cmpB]||[];
  const totA=fa.reduce((s,f)=>s+f.monto,0),totB=fb.reduce((s,f)=>s+f.monto,0);
  const varPct=totA>0?((totB/(fb.length||1))/(totA/(fa.length||1))-1)*100:0;
  const maxCmp=Math.max(...MESES.map(m=>Math.max(fa.find(f=>f.mes===m)?.monto||0,fb.find(f=>f.mes===m)?.monto||0)),1);
  const catsS=getCats("s"),catsV=getCats("v");
  const catCS=catsS.find(c=>calcIng<=c.tope)||catsS[catsS.length-1];
  const catCV=catsV.find(c=>calcIng<=c.tope)||catsV[catsV.length-1];

  // Recategorización
  const m25=facturas[2025]||[],m26=facturas[2026]||[];
  const ult12=[...m25.filter(f=>["Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"].includes(f.mes)),...m26];
  const ingUlt12=ult12.reduce((s,f)=>s+f.monto,0);
  const catActIdx=catsU.findIndex(c=>c.cat===user?.categoria);
  const catAnterior=catActIdx>0?catsU[catActIdx-1]:null;
  const catSiguiente=catActIdx<catsU.length-1?catsU[catActIdx+1]:null;
  const topeMin=catAnterior?.tope||0, topeMax=catObj?.tope||0;
  const zonaSube=ingUlt12>topeMax, zonaBaja=ingUlt12<topeMin, zonaSegura=!zonaSube&&!zonaBaja;
  const margenHastaSubir=Math.max(0,topeMax-ingUlt12);
  const mesesRestantes=9;
  const ingRestante=Math.max(0,topeMax-totalIngresos2026);
  const margenMensual=mesesRestantes>0?Math.round(ingRestante/mesesRestantes):0;
  const promedioMensual=m26.length?Math.round(m26.reduce((s,f)=>s+f.monto,0)/m26.length):0;
  const ingProyRecat=ingUlt12+(promedioMensual*3);
  const catPRoyRecat=catsU.find(c=>ingProyRecat<=c.tope)||catsU[catsU.length-1];
  const cambiaRecat=catPRoyRecat.cat!==user?.categoria;

  // Alertas
  const pct=user?Math.min(100,Math.round((user.ingresosAnuales/(catObj?.tope||1))*100)):0;
  const catActualData=catObj?CATEGORIAS.find(c=>c.cat===catObj.cat):null;
  function generarAlertas(){
    const al=[];
    if(pct>=90) al.push({nivel:"critico",titulo:"Ingresos cerca del tope",desc:`Llevás el ${pct}% del tope anual de Cat. ${user?.categoria}. Si superás el límite debés recategorizarte.`,causal:"Superación de ingresos brutos máximos (Art. 21 Ley 26.565)"});
    else if(pct>=75) al.push({nivel:"advertencia",titulo:"Ingresos en zona de alerta",desc:`Llevás el ${pct}% del tope anual. Monitoreá tus ingresos.`,causal:"Superación de ingresos brutos máximos"});
    if(user?.actividad==="v"&&maxPrecioUnit>613492) al.push({nivel:"critico",titulo:"Precio unitario supera el máximo",desc:`El precio declarado ($${fmt(maxPrecioUnit)}) supera el límite de $613.492 para venta de cosas muebles.`,causal:"Precio unitario máximo (Art. 2 Ley 26.565)"});
    if(alquilerAnual>0&&catActualData&&alquilerAnual>catActualData.alquiler) al.push({nivel:"critico",titulo:"Alquiler devengado supera el máximo",desc:`El alquiler anual declarado ($${fmt(alquilerAnual)}) supera el límite de $${fmt(catActualData.alquiler)} para Cat. ${user?.categoria}.`,causal:"Alquiler devengado anual máximo (Art. 2 Ley 26.565)"});
    if(empleados>3) al.push({nivel:"critico",titulo:"Cantidad de empleados excede el límite",desc:`Tenés ${empleados} empleados. El monotributo permite hasta 3.`,causal:"Empleados en relación de dependencia (Art. 20 Ley 26.565)"});
    if(al.length===0) al.push({nivel:"ok",titulo:"Sin alertas activas",desc:"Todo indica que tu situación está dentro de los parámetros del monotributo.",causal:null});
    return al;
  }
  const alertas=user?generarAlertas():[];
  const alertasCriticas=alertas.filter(a=>a.nivel==="critico").length;
  const alertasAdvert=alertas.filter(a=>a.nivel==="advertencia").length;

  const ingMesActual=facturas[2026]?.find(f=>f.mes==="Mar")?.monto||0;
  const cuotaPagada=user?.ultimoPago==="20/03/2026";
  const promedioU3=m26.slice(-3).length?Math.round(m26.slice(-3).reduce((s,f)=>s+f.monto,0)/m26.slice(-3).length):0;
  const diffMes=promedioU3>0?Math.round(((ingMesActual-promedioU3)/promedioU3)*100):0;

  const stateColor={proximo:"#BA7517",urgente:"#E24B4A",hoy:"#E24B4A",futuro:tx2,vencido:"#E24B4A"};
  const stateBg={proximo:"#FAEEDA",urgente:"#FCEBEB",hoy:"#FCEBEB",futuro:bg1,vencido:"#FCEBEB"};
  const stateTx={proximo:"#854F0B",urgente:"#501313",hoy:"#501313",futuro:tx1,vencido:"#501313"};

  const EmptyState=({emoji,title,desc,action,onAction})=>(
    <div style={{textAlign:"center",padding:"3rem 1rem"}}>
      <div style={{fontSize:40,marginBottom:"1rem"}}>{emoji}</div>
      <p style={{fontSize:15,fontWeight:600,margin:"0 0 8px",color:tx0}}>{title}</p>
      <p style={{fontSize:13,color:tx1,margin:"0 0 1.5rem",lineHeight:1.6,maxWidth:260,marginLeft:"auto",marginRight:"auto"}}>{desc}</p>
      {action&&<BtnPrimary onClick={onAction}>{action}</BtnPrimary>}
    </div>
  );

  // ── Onboarding ──
  const onbSteps=[
    {emoji:"🤔",titulo:"¿Cuánto podés facturar este mes sin pasarte de categoría?",desc:"La mayoría de los monotributistas no lo sabe con certeza. MonoAsistente hace ese cálculo por vos, en tiempo real y sin vueltas.",tag:null},
    {emoji:"⚡",titulo:"Tu asistente fiscal personal",desc:"Traducimos tus obligaciones del monotributo en información concreta: margen disponible, próxima recategorización y alertas antes de que sean un problema. Y cuando necesitás más, te conectamos con un contador real.",tag:null},
    {emoji:"🔒",titulo:"Sin accesos, sin facturas, sin intermediarios",desc:"No emitimos facturas ni accedemos a tus datos de ARCA. Trabajás con lo que vos cargás o importás desde tu billetera o banco. Somos una herramienta de gestión, no un intermediario fiscal.",tag:"Tu información no sale de tu dispositivo"},
    {emoji:"⚙️",titulo:"Configurá tu perfil en 30 segundos",desc:"Con estos 3 datos tu dashboard ya tiene información real desde el primer minuto.",tag:null,isSetup:true},
  ];

  if(screen==="login") return (
    <div style={{fontFamily:"var(--font-sans)",maxWidth:400,margin:"0 auto",padding:"3rem 1.25rem",background:bg0,minHeight:"100vh"}}>
      <div style={{textAlign:"center",marginBottom:"2rem"}}>
        <p style={{fontSize:11,color:tx2,margin:"0 0 4px",letterSpacing:"0.1em",textTransform:"uppercase"}}>MonoAsistente</p>
        <p style={{fontSize:26,fontWeight:700,margin:0,color:tx0}}>Bienvenido</p>
        <p style={{fontSize:14,color:tx1,margin:"6px 0 0"}}>Tu asistente fiscal personal</p>
      </div>
      <div style={C({padding:"1.5rem"})}>
        <input value={lC} onChange={e=>setLC(e.target.value)} placeholder="CUIT (ej: 20-12345678-9)" style={{width:"100%",fontSize:14,padding:"11px 14px",borderRadius:10,border:`0.5px solid ${br}`,background:bg1,color:tx0,marginBottom:10,boxSizing:"border-box"}}/>
        <input value={lP} onChange={e=>setLP(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doLogin()} type="password" placeholder="Contraseña" style={{width:"100%",fontSize:14,padding:"11px 14px",borderRadius:10,border:`0.5px solid ${br}`,background:bg1,color:tx0,marginBottom:14,boxSizing:"border-box"}}/>
        {lE&&<p style={{fontSize:12,color:"#E24B4A",margin:"0 0 12px"}}>{lE}</p>}
        <BtnPrimary onClick={doLogin} style={{width:"100%",padding:12}}>Ingresar</BtnPrimary>
      </div>
      <div style={{marginTop:"1.25rem",padding:14,background:bg1,borderRadius:12}}>
        <p style={{fontSize:11,color:tx1,margin:"0 0 6px",fontWeight:600}}>Cuentas demo</p>
        <p style={{fontSize:11,color:tx2,margin:"2px 0"}}>20-12345678-9 / demo123 — servicios, Cat. D</p>
        <p style={{fontSize:11,color:tx2,margin:"2px 0"}}>27-98765432-1 / demo456 — venta, Cat. B</p>
      </div>
    </div>
  );

  if(screen==="onboarding"){
    const s=onbSteps[onbStep];
    const isLast=onbStep===onbSteps.length-1;
    const canFinish=isLast&&setupData.ingresosAnuales&&Number(setupData.ingresosAnuales)>0;
    function finishOnboarding(){
      if(!canFinish) return;
      const ing=Number(setupData.ingresosAnuales);
      const cat=getCatFor(ing,setupData.actividad);
      setUser(p=>({...p,actividad:setupData.actividad,ingresosAnuales:ing,categoria:cat.cat,cuotaMensual:cat.cuota,topeCategoria:cat.tope}));
      setCalcIng(ing); setScreen("app");
    }
    return (
      <div style={{fontFamily:"var(--font-sans)",maxWidth:480,margin:"0 auto",padding:"2rem 1.25rem",background:bg0,minHeight:"100vh",display:"flex",flexDirection:"column",justifyContent:"center"}}>
        <div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:"2rem"}}>
          {onbSteps.map((_,i)=><div key={i} style={{width:i===onbStep?24:6,height:6,borderRadius:3,background:i===onbStep?accent:i<onbStep?d?"#4a4a4a":"#ccc":br,transition:"all 0.3s",cursor:i<onbStep?"pointer":"default"}} onClick={()=>i<onbStep&&setOnbStep(i)}/>)}
        </div>
        <div style={C({padding:"2rem 1.75rem"})}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1.25rem"}}>
            <span style={{fontSize:40}}>{s.emoji}</span>
            {s.tag&&<span style={{fontSize:10,padding:"4px 10px",borderRadius:20,background:d?"#1a2e25":"#e8f7f1",color:d?"#7ee8b8":"#2d7a5a",fontWeight:600}}>{s.tag}</span>}
          </div>
          <p style={{fontSize:19,fontWeight:700,margin:"0 0 0.75rem",color:tx0,lineHeight:1.3}}>{s.titulo}</p>
          {!s.isSetup&&<p style={{fontSize:14,color:tx1,lineHeight:1.7,margin:"0 0 2rem"}}>{s.desc}</p>}
          {s.isSetup&&<div style={{marginBottom:"1.5rem"}}>
            <p style={{fontSize:14,color:tx1,lineHeight:1.6,margin:"0 0 1.25rem"}}>{s.desc}</p>
            <div style={{marginBottom:"1rem"}}>
              <label style={{fontSize:11,color:tx1,display:"block",marginBottom:6,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em"}}>¿Qué tipo de actividad?</label>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {[["s","🛠 Servicios","Honorarios, consultoría, diseño..."],["v","📦 Venta","Productos, mercadería, cosas muebles"]].map(([val,lbl,sub])=>(
                  <button key={val} onClick={()=>setSetupData(p=>({...p,actividad:val}))} style={{padding:"0.875rem",borderRadius:12,border:setupData.actividad===val?`2px solid ${accent}`:`0.5px solid ${br}`,background:setupData.actividad===val?d?"#1a2e25":"#e8f7f1":bg1,cursor:"pointer",textAlign:"left"}}>
                    <p style={{fontSize:13,fontWeight:700,margin:"0 0 2px",color:setupData.actividad===val?accent:tx0}}>{lbl}</p>
                    <p style={{fontSize:11,color:setupData.actividad===val?d?"#6db99a":"#2d7a5a":tx2,margin:0,lineHeight:1.3}}>{sub}</p>
                  </button>
                ))}
              </div>
            </div>
            <div style={{marginBottom:"1rem"}}>
              <label style={{fontSize:11,color:tx1,display:"block",marginBottom:6,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em"}}>¿Cuánto facturaste en los últimos 12 meses?</label>
              <div style={{position:"relative"}}>
                <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:14,color:tx1}}>$</span>
                <input type="number" value={setupData.ingresosAnuales} onChange={e=>setSetupData(p=>({...p,ingresosAnuales:e.target.value}))} placeholder="Ej: 24000000" style={{width:"100%",fontSize:14,padding:"11px 14px 11px 28px",borderRadius:10,border:`0.5px solid ${br}`,background:bg1,color:tx0,boxSizing:"border-box"}}/>
              </div>
              {setupData.ingresosAnuales&&Number(setupData.ingresosAnuales)>0&&(()=>{
                const cat=getCatFor(Number(setupData.ingresosAnuales),setupData.actividad);
                return <div style={{marginTop:8,padding:"8px 12px",background:d?"#1a2e25":"#e8f7f1",borderRadius:8,display:"flex",alignItems:"center",gap:8}}>
                  <span>✓</span>
                  <p style={{fontSize:12,color:d?"#7ee8b8":"#2d7a5a",margin:0,fontWeight:600}}>Categoría {cat.cat} · ${fmt(cat.cuota)}/mes</p>
                </div>;
              })()}
            </div>
            <div>
              <label style={{fontSize:11,color:tx1,display:"block",marginBottom:6,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em"}}>¿Mes de última recategorización?</label>
              <select value={setupData.mesRecat} onChange={e=>setSetupData(p=>({...p,mesRecat:e.target.value}))} style={{width:"100%",fontSize:14,padding:"11px 14px",borderRadius:10,border:`0.5px solid ${br}`,background:bg1,color:tx0}}>
                {MESES.map(m=><option key={m}>{m}</option>)}
              </select>
              <p style={{fontSize:11,color:tx2,margin:"6px 0 0"}}>Las recategorizaciones son en enero y julio. Si no recordás, dejá junio.</p>
            </div>
          </div>}
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            {onbStep>0?<button onClick={()=>setOnbStep(s=>s-1)} style={{...B,padding:"10px 16px"}}>← Atrás</button>
              :<button onClick={()=>setScreen("app")} style={{fontSize:12,color:tx2,background:"transparent",border:"none",cursor:"pointer",padding:"10px 4px",flexShrink:0}}>Omitir</button>}
            <BtnPrimary onClick={isLast?finishOnboarding:()=>setOnbStep(s=>s+1)} style={{flex:1,opacity:isLast&&!canFinish?0.4:1,cursor:isLast&&!canFinish?"default":"pointer"}}>
              {isLast?"Entrar a MonoAsistente →":"Siguiente →"}
            </BtnPrimary>
          </div>
          {isLast&&<p style={{fontSize:10,color:tx2,margin:"12px 0 0",textAlign:"center",lineHeight:1.5}}>MonoAsistente es una herramienta de gestión. No reemplaza el asesoramiento de un contador matriculado ni constituye asesoría fiscal legal.</p>}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // APP PRINCIPAL
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div style={{fontFamily:"var(--font-sans)",maxWidth:720,margin:"0 auto",background:bg0,minHeight:"100vh",paddingBottom:72}}>

      {/* TOASTS */}
      <div style={{position:"fixed",bottom:80,left:"50%",transform:"translateX(-50%)",zIndex:999,display:"flex",flexDirection:"column",gap:8,alignItems:"center",pointerEvents:"none"}}>
        {toasts.map(t=><div key={t.id} style={{padding:"10px 20px",borderRadius:20,background:t.type==="error"?"#E24B4A":d?"#f0f0ee":"#111",color:t.type==="error"?"#fff":d?"#111":"#fff",fontSize:13,fontWeight:600,whiteSpace:"nowrap",boxShadow:"0 4px 20px rgba(0,0,0,0.2)"}}>{t.msg}</div>)}
      </div>

      {/* HEADER */}
      <header style={{padding:"1rem 1.25rem 0.75rem",borderBottom:`0.5px solid ${br}`,position:"sticky",top:0,background:bg0,zIndex:50}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <p style={{fontSize:10,color:tx2,margin:0,letterSpacing:"0.08em",textTransform:"uppercase"}}>MonoAsistente</p>
            <p style={{fontSize:17,fontWeight:600,margin:"1px 0 0",color:tx0}}>Hola, {user?.nombre.split(" ")[0]}</p>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <button onClick={()=>setDark(v=>!v)} style={{width:34,height:34,borderRadius:"50%",border:`0.5px solid ${br}`,background:bg1,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{d?"☀️":"🌙"}</button>
            <div style={{position:"relative"}}>
              <button onClick={()=>{setShowNotifs(v=>!v);setShowProfile(false);}} style={{width:34,height:34,borderRadius:"50%",border:`0.5px solid ${br}`,background:bg1,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>🔔</button>
              {noLeidas>0&&<div style={{position:"absolute",top:-1,right:-1,width:14,height:14,borderRadius:"50%",background:"#E24B4A",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:700,color:"#fff"}}>{noLeidas}</div>}
            </div>
            <button onClick={()=>{setShowProfile(v=>!v);setShowNotifs(false);}} style={{width:34,height:34,borderRadius:"50%",background:"#B5D4F4",border:"none",fontSize:12,fontWeight:700,color:"#0C447C",cursor:"pointer"}}>{getInit(user?.nombre||"")}</button>
          </div>
        </div>

        {showNotifs&&<div style={{...C({marginTop:"0.75rem",padding:"0.75rem 1rem"}),position:"absolute",left:"1rem",right:"1rem",zIndex:100,boxShadow:`0 8px 24px rgba(0,0,0,${d?0.4:0.12})`}}>
          {notifs.map(n=><div key={n.id} onClick={()=>setNotifs(p=>p.map(x=>x.id===n.id?{...x,leida:true}:x))} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:`0.5px solid ${br}`,cursor:"pointer",opacity:n.leida?0.4:1}}>
            <div style={{width:7,height:7,borderRadius:"50%",flexShrink:0,background:n.tipo==="warning"?"#BA7517":n.tipo==="info"?"#185FA5":accent}}/>
            <span style={{fontSize:13,color:tx0,flex:1}}>{n.texto}</span>
          </div>)}
        </div>}

        {showProfile&&<div style={{...C({marginTop:"0.75rem"}),position:"absolute",left:"1rem",right:"1rem",zIndex:100,boxShadow:`0 8px 24px rgba(0,0,0,${d?0.4:0.12})`}}>
          {!editProfile?<>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:12,alignItems:"center"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:40,height:40,borderRadius:"50%",background:"#B5D4F4",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:"#0C447C"}}>{getInit(user?.nombre||"")}</div>
                <div><p style={{fontSize:14,fontWeight:600,margin:0,color:tx0}}>{user?.nombre}</p><p style={{fontSize:11,color:tx1,margin:"1px 0 0"}}>{user?.cuit}</p></div>
              </div>
              <button onClick={()=>{setProfileDraft({...user});setEditProfile(true);}} style={{...B,padding:"5px 12px",fontSize:12}}>Editar</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
              {[{l:"Actividad",v:user?.actividad==="s"?"Servicios":"Venta"},{l:"Categoría",v:`Cat. ${user?.categoria}`},{l:"Cuota mensual",v:`$${fmt(user?.cuotaMensual)}`},{l:"Tope vigente",v:fmtM(catObj?.tope||0)}].map(({l,v})=><div key={l} style={{background:bg1,borderRadius:8,padding:"8px 10px"}}><p style={{fontSize:10,color:tx1,margin:"0 0 2px"}}>{l}</p><p style={{fontSize:13,fontWeight:600,margin:0,color:tx0}}>{v}</p></div>)}
            </div>
            <button onClick={doLogout} style={{...B,width:"100%",color:"#E24B4A",borderColor:"rgba(226,75,74,0.3)"}}>Cerrar sesión</button>
          </>:<>
            <p style={{fontSize:13,fontWeight:600,margin:"0 0 14px",color:tx0}}>Editar perfil</p>
            {[{l:"Nombre",k:"nombre",type:"text"},{l:"Ingresos anuales ($)",k:"ingresosAnuales",type:"number"}].map(({l,k,type})=><div key={k} style={{marginBottom:10}}>
              <label style={{fontSize:11,color:tx1,display:"block",marginBottom:4}}>{l}</label>
              <input type={type} value={profileDraft[k]||""} onChange={e=>setProfileDraft(p=>({...p,[k]:type==="number"?Number(e.target.value):e.target.value}))} style={{width:"100%",fontSize:14,padding:"9px 12px",borderRadius:8,border:`0.5px solid ${br}`,background:bg1,color:tx0,boxSizing:"border-box"}}/>
            </div>)}
            <label style={{fontSize:11,color:tx1,display:"block",marginBottom:6}}>Actividad</label>
            <div style={{display:"flex",gap:8,marginBottom:10}}>
              {[["s","Servicios"],["v","Venta"]].map(([val,lbl])=><button key={val} onClick={()=>setProfileDraft(p=>({...p,actividad:val}))} style={{...B,flex:1,background:(profileDraft.actividad||user.actividad)===val?bg2:"transparent",fontWeight:(profileDraft.actividad||user.actividad)===val?600:400}}>{lbl}</button>)}
            </div>
            {(profileDraft.ingresosAnuales||profileDraft.actividad)&&(()=>{const cat=getCatFor(profileDraft.ingresosAnuales||user.ingresosAnuales,profileDraft.actividad||user.actividad);return<div style={{padding:"8px 12px",background:bg1,borderRadius:8,marginBottom:12}}><p style={{fontSize:12,color:accent,margin:0,fontWeight:600}}>Quedarías en Cat. {cat.cat} · ${fmt(cat.cuota)}/mes</p></div>;})()}
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setEditProfile(false)} style={{...B,flex:1}}>Cancelar</button>
              <BtnPrimary onClick={saveProfile} style={{flex:1,padding:"9px"}}>Guardar</BtnPrimary>
            </div>
          </>}
        </div>}
      </header>

      {/* CONTENIDO CON ANIMACIÓN */}
      <div key={transKey} style={{padding:"1rem 1.25rem 0",animation:"slideIn 0.2s cubic-bezier(0.25,0.46,0.45,0.94) both","--sf":`${transDir*24}px`}}>

        {/* ══ TAB: INICIO ══════════════════════════════════════════════════ */}
        {tab==="inicio"&&(()=>{
          return <div>
            {/* Card principal del mes */}
            <div style={{background:d?"#1a2e25":"#e8f7f1",borderRadius:16,padding:"1.25rem",marginBottom:"1rem",position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:-30,right:-30,width:140,height:140,borderRadius:"50%",background:d?"rgba(29,158,117,0.1)":"rgba(29,158,117,0.08)"}}/>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                <div>
                  <p style={{fontSize:11,color:d?"#6db99a":"#2d7a5a",margin:"0 0 3px",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em"}}>Facturado en Mar 2026</p>
                  <p style={{fontSize:42,fontWeight:700,margin:"0 0 2px",color:d?"#7ee8b8":"#1a5c42",lineHeight:1}}>{ingMesActual>0?fmtM(ingMesActual):<span style={{fontSize:22,fontWeight:500}}>Sin datos</span>}</p>
                  {ingMesActual>0&&promedioU3>0&&<p style={{fontSize:12,color:d?"#6db99a":"#2d7a5a",margin:0}}>{diffMes>=0?`+${diffMes}%`:`${diffMes}%`} vs. promedio últimos 3 meses</p>}
                </div>
                <div style={{textAlign:"right"}}>
                  <p style={{fontSize:11,color:d?"#6db99a":"#2d7a5a",margin:"0 0 4px"}}>Cuota {user?.categoria}</p>
                  <p style={{fontSize:20,fontWeight:700,margin:"0 0 4px",color:d?"#7ee8b8":"#1a5c42"}}>{fmtM(user?.cuotaMensual||0)}</p>
                  <span style={{fontSize:10,padding:"3px 8px",borderRadius:10,background:cuotaPagada?"rgba(29,158,117,0.2)":"rgba(186,117,23,0.15)",color:cuotaPagada?d?"#7ee8b8":"#0F6E56":d?"#f5c060":"#854F0B",fontWeight:600}}>{cuotaPagada?"✓ Pagada":"⏳ Vence el 20"}</span>
                </div>
              </div>
              {margenMensual>0&&<div>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{fontSize:11,color:d?"#6db99a":"#2d7a5a"}}>Margen disponible este mes</span>
                  <span style={{fontSize:11,color:d?"#6db99a":"#2d7a5a",fontWeight:600}}>{fmtM(margenMensual)}</span>
                </div>
                <div style={{height:6,background:d?"rgba(0,0,0,0.3)":"rgba(0,0,0,0.1)",borderRadius:3,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${Math.min(100,ingMesActual>0?Math.round((ingMesActual/margenMensual)*100):0)}%`,background:ingMesActual>margenMensual?"#E24B4A":d?"#7ee8b8":"#1a5c42",borderRadius:3,transition:"width 0.6s"}}/>
                </div>
              </div>}
            </div>

            {/* Acciones rápidas */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:"1rem"}}>
              {[
                {icon:"🔄",label:"Recategorización",sub:zonaSube?"⚠ Superaste el tope":zonaBaja?"⚠ Bajo el mínimo":`Margen: ${fmtM(margenHastaSubir)}`,alert:zonaSube||zonaBaja,action:()=>{goTab("sit");setSubSit("recat");}},
                {icon:alertasCriticas>0?"🚨":alertasAdvert>0?"⚠️":"✓",label:"Alertas fiscales",sub:alertasCriticas>0?`${alertasCriticas} alerta${alertasCriticas>1?"s":""} crítica${alertasCriticas>1?"s":""}`:alertasAdvert>0?`${alertasAdvert} advertencia${alertasAdvert>1?"s":""}` :"Sin alertas activas",alert:alertasCriticas>0,action:()=>{goTab("alertas");setSubAlertas("fiscal");}},
                {icon:"💬",label:"Consultar contador",sub:noLeidasC>0?`${noLeidasC} mensaje${noLeidasC>1?"s":""} nuevo${noLeidasC>1?"s":""}` :"Chat disponible",alert:noLeidasC>0,action:()=>{goTab("mas");setSubMas("colaborar");}},
                {icon:"📥",label:"Importar movimientos",sub:"Desde CSV de tu banco",action:()=>{goTab("movs");setSubMovs("importar");}},
              ].map(a=><button key={a.label} onClick={a.action} style={{...C({cursor:"pointer",textAlign:"left",padding:"0.875rem"}),border:a.alert?`0.5px solid rgba(226,75,74,0.35)`:`0.5px solid ${br}`,background:a.alert?d?"#2a1010":"#fff8f8":bg0}}>
                <div style={{fontSize:22,marginBottom:6}}>{a.icon}</div>
                <p style={{fontSize:13,fontWeight:600,margin:"0 0 2px",color:a.alert?"#E24B4A":tx0}}>{a.label}</p>
                <p style={{fontSize:11,color:a.alert?"#A32D2D":tx2,margin:0,lineHeight:1.3}}>{a.sub}</p>
              </button>)}
            </div>

            {/* Últimos ingresos */}
            {m26.length>0&&<div style={C({marginBottom:"1rem"})}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <p style={{fontSize:13,fontWeight:600,margin:0,color:tx0}}>Últimos ingresos 2026</p>
                <button onClick={()=>{goTab("movs");setSubMovs("ingresos");}} style={{...B,padding:"4px 10px",fontSize:11,border:"none",color:accent}}>Ver todo →</button>
              </div>
              {m26.slice(-4).reverse().map((f,i)=><div key={f.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:i<3?`0.5px solid ${br}`:"none"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:28,height:28,borderRadius:8,background:d?"#1a2e25":"#e8f7f1",display:"flex",alignItems:"center",justifyContent:"center",color:accent,fontSize:13,fontWeight:700}}>↑</div>
                  <p style={{fontSize:13,fontWeight:500,margin:0,color:tx0}}>{f.mes} 2026</p>
                </div>
                <span style={{fontSize:14,fontWeight:700,color:accent}}>{fmtM(f.monto)}</span>
              </div>)}
            </div>}

            {/* ARCA */}
            {user?.deuda>0&&<div style={{padding:"12px 14px",background:"#FCEBEB",borderRadius:12,marginBottom:"1rem",display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:20}}>⚠️</span>
              <div><p style={{fontSize:13,fontWeight:600,margin:0,color:"#501313"}}>Deuda ARCA: ${fmt(user.deuda)}</p><p style={{fontSize:11,color:"#A32D2D",margin:"2px 0 0"}}>Regularizá antes del próximo vencimiento</p></div>
            </div>}
            <div style={C()}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <p style={{fontSize:13,fontWeight:600,margin:0,color:tx0}}>Estado ARCA</p>
                {afipData&&<span style={{fontSize:11,padding:"2px 8px",borderRadius:10,background:afipData.deuda>0?"#FCEBEB":"#E1F5EE",color:afipData.deuda>0?"#A32D2D":"#0F6E56",fontWeight:600}}>{afipData.estado}</span>}
              </div>
              {afipData?<div>{[["Última cuota",afipData.ultimoPago],["Deuda",afipData.deuda>0?`$${fmt(afipData.deuda)}`:"Sin deuda"],["Actividad",afipData.actividad]].map(([k,v])=><div key={k} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`0.5px solid ${br}`}}><span style={{fontSize:13,color:tx1}}>{k}</span><span style={{fontSize:13,fontWeight:500,color:k==="Deuda"&&afipData.deuda>0?"#E24B4A":tx0}}>{v}</span></div>)}</div>
              :<div style={{textAlign:"center",padding:"0.5rem 0"}}><button onClick={consultarARCA} disabled={afipLoading} style={{...B,background:bg1,padding:"9px 20px"}}>{afipLoading?"Consultando...":"Consultar ARCA"}</button></div>}
            </div>
          </div>;
        })()}

        {/* ══ TAB: MOVIMIENTOS ════════════════════════════════════════════ */}
        {tab==="movs"&&<div>
          <SubTabs tabs={[["ingresos","Ingresos"],["egresos","Egresos"],["importar","Importar"]]} active={subMovs} setActive={setSubMovs}/>

          {/* SUB: INGRESOS */}
          {subMovs==="ingresos"&&<div>
            <div style={{display:"flex",gap:8,marginBottom:"1.25rem",alignItems:"center"}}>
              <p style={{fontSize:13,color:tx1,margin:0}}>Período:</p>
              {[2025,2026].map(a=><button key={a} onClick={()=>setAnioFact(a)} style={{...B,padding:"5px 16px",background:anioFact===a?accent:"transparent",color:anioFact===a?"#fff":tx1,border:anioFact===a?"none":`0.5px solid ${br}`,borderRadius:20}}>{a}</button>)}
            </div>
            {facts.length===0
              ?<EmptyState emoji="📊" title="Sin ingresos registrados" desc={`No hay ingresos cargados para ${anioFact}.`} action="Importar movimientos" onAction={()=>setSubMovs("importar")}/>
              :<div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:"1.25rem"}}>
                  <div style={{background:bg1,borderRadius:12,padding:"0.9rem"}}><p style={{fontSize:11,color:tx1,margin:"0 0 4px"}}>Total {anioFact}</p><p style={{fontSize:22,fontWeight:700,margin:0,color:tx0}}>{fmtM(totalFact)}</p></div>
                  <div style={{background:bg1,borderRadius:12,padding:"0.9rem"}}><p style={{fontSize:11,color:tx1,margin:"0 0 4px"}}>Promedio mensual</p><p style={{fontSize:22,fontWeight:700,margin:0,color:tx0}}>{fmtM(facts.length?Math.round(totalFact/facts.length):0)}</p></div>
                </div>
                <div style={C({marginBottom:"1.25rem"})}>
                  <p style={{fontSize:13,fontWeight:600,margin:"0 0 14px",color:tx0}}>Mes a mes</p>
                  <div style={{display:"flex",alignItems:"flex-end",gap:5,height:110}}>
                    {facts.map(f=>{const mx=Math.max(...facts.map(x=>x.monto),1);const h=Math.round((f.monto/mx)*98);return(
                      <div key={f.id} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,position:"relative"}} onMouseEnter={()=>setHovBar(f.id)} onMouseLeave={()=>setHovBar(null)}>
                        {hovBar===f.id&&<div style={{position:"absolute",bottom:112,background:d?"#f0f0ee":"#111",color:d?"#111":"#fff",fontSize:10,padding:"3px 8px",borderRadius:6,whiteSpace:"nowrap",zIndex:10}}>{fmtM(f.monto)}</div>}
                        <div style={{width:"100%",height:98,display:"flex",alignItems:"flex-end"}}><div style={{width:"100%",height:h||3,background:accent,borderRadius:"4px 4px 0 0",opacity:hovBar===f.id?1:0.8,transition:"height 0.5s cubic-bezier(0.34,1.56,0.64,1)"}}/></div>
                        <span style={{fontSize:9,color:tx2}}>{f.mes}</span>
                      </div>
                    );})}
                  </div>
                </div>
              </div>}
            <div style={C()}>
              <p style={{fontSize:13,fontWeight:600,margin:"0 0 12px",color:tx0}}>Registrar ingreso manualmente</p>
              <div style={{display:"flex",gap:8}}>
                <select value={nuevaMes} onChange={e=>setNuevaMes(e.target.value)} style={{flex:1,fontSize:14,padding:"9px 10px",borderRadius:8,border:`0.5px solid ${br}`,background:bg1,color:tx0}}>{MESES.map(m=><option key={m}>{m}</option>)}</select>
                <input value={nuevoMonto} onChange={e=>setNuevoMonto(e.target.value)} placeholder="Monto ($)" type="number" style={{flex:2,fontSize:14,padding:"9px 10px",borderRadius:8,border:`0.5px solid ${br}`,background:bg1,color:tx0}}/>
                <BtnPrimary onClick={()=>{if(!nuevoMonto||isNaN(nuevoMonto))return;setFacturas(p=>({...p,[anioFact]:[...(p[anioFact]||[]),{id:Date.now(),mes:nuevaMes,monto:Number(nuevoMonto)}]}));setNuevoMonto("");addToast("Ingreso registrado");}} style={{padding:"9px 16px"}}>+</BtnPrimary>
              </div>
            </div>
          </div>}

          {/* SUB: EGRESOS */}
          {subMovs==="egresos"&&<div>
            <div style={{padding:"10px 14px",background:bg1,borderRadius:10,marginBottom:"1.25rem"}}>
              <p style={{fontSize:12,color:tx1,margin:0,lineHeight:1.6}}><strong style={{color:tx0}}>Importante:</strong> en el monotributo los egresos no reducen la carga fiscal. El régimen tributa sobre ingresos brutos. Este registro sirve para tu gestión interna.</p>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:"1.25rem"}}>
              <div style={{background:bg1,borderRadius:12,padding:"0.9rem"}}><p style={{fontSize:11,color:tx1,margin:"0 0 4px"}}>Total egresos</p><p style={{fontSize:22,fontWeight:700,margin:0,color:tx0}}>{fmtM(totalGastos)}</p></div>
              <div style={{background:bg1,borderRadius:12,padding:"0.9rem"}}><p style={{fontSize:11,color:tx1,margin:"0 0 4px"}}>Movimientos</p><p style={{fontSize:22,fontWeight:700,margin:0,color:tx0}}>{gastos.length}</p></div>
            </div>
            <div style={C()}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <p style={{fontSize:13,fontWeight:600,margin:0,color:tx0}}>Egresos operativos</p>
                <button onClick={()=>setShowFormG(v=>!v)} style={{padding:"6px 14px",borderRadius:20,border:"none",background:showFormG?bg2:accent,color:showFormG?tx0:"#fff",fontSize:12,cursor:"pointer",fontWeight:600}}>{showFormG?"Cancelar":"+ Agregar"}</button>
              </div>
              {showFormG&&<div style={{padding:14,background:bg1,borderRadius:10,marginBottom:14}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
                  <input value={nuevoG.desc} onChange={e=>setNuevoG(p=>({...p,desc:e.target.value}))} placeholder="Descripción" style={{fontSize:13,padding:"8px 10px",borderRadius:8,border:`0.5px solid ${br}`,background:bg0,color:tx0}}/>
                  <input value={nuevoG.monto} onChange={e=>setNuevoG(p=>({...p,monto:e.target.value}))} placeholder="Monto ($)" type="number" style={{fontSize:13,padding:"8px 10px",borderRadius:8,border:`0.5px solid ${br}`,background:bg0,color:tx0}}/>
                </div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <label style={{display:"flex",alignItems:"center",gap:8,fontSize:13,color:tx0,cursor:"pointer"}}><input type="checkbox" checked={nuevoG.deducible} onChange={e=>setNuevoG(p=>({...p,deducible:e.target.checked}))} style={{width:14,height:14,accentColor:accent}}/>Marcar como referencia deducible</label>
                  <BtnPrimary onClick={()=>{if(!nuevoG.desc||!nuevoG.monto)return;setGastos(p=>[...p,{id:Date.now(),...nuevoG,monto:Number(nuevoG.monto)}]);setNuevoG({desc:"",categoria:"Alquiler",monto:"",fecha:"Mar 2026",deducible:true});setShowFormG(false);addToast("Egreso registrado");}} style={{padding:"7px 16px",fontSize:12}}>Guardar</BtnPrimary>
                </div>
              </div>}
              {gastos.length===0&&!showFormG
                ?<EmptyState emoji="💸" title="Sin egresos registrados" desc="Registrá tus gastos operativos para llevar un control de tu actividad."/>
                :gastos.map(g=><div key={g.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",borderBottom:`0.5px solid ${br}`}}>
                  <div style={{flex:1}}><div style={{display:"flex",alignItems:"center",gap:6}}><p style={{fontSize:13,fontWeight:500,margin:0,color:tx0}}>{g.desc}</p><span style={{fontSize:10,padding:"2px 7px",borderRadius:10,background:g.deducible?"#E1F5EE":"#F1EFE8",color:g.deducible?"#0F6E56":"#5F5E5A"}}>{g.deducible?"ref. deducible":"operativo"}</span></div><p style={{fontSize:11,color:tx2,margin:"2px 0 0"}}>{g.categoria} · {g.fecha}</p></div>
                  <div style={{display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:14,fontWeight:600,color:tx0}}>{fmtM(g.monto)}</span><button onClick={()=>{setGastos(p=>p.filter(x=>x.id!==g.id));addToast("Egreso eliminado");}} style={{width:26,height:26,borderRadius:"50%",border:`0.5px solid rgba(226,75,74,0.3)`,background:"transparent",color:"#E24B4A",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button></div>
                </div>)}
            </div>
          </div>}

          {/* SUB: IMPORTAR */}
          {subMovs==="importar"&&<div>
            {impStep==="inicio"&&<div>
              <p style={{fontSize:14,color:tx1,marginBottom:"1.25rem",lineHeight:1.6}}>El sistema clasifica automáticamente ingresos y egresos. Podés corregir la clasificación antes de confirmar.</p>
              {impHist.length>0&&<div style={C({marginBottom:"1.25rem"})}>
                <p style={{fontSize:13,fontWeight:600,margin:"0 0 10px",color:tx0}}>Historial</p>
                {impHist.map(h=><div key={h.id} style={{padding:"8px 0",borderBottom:`0.5px solid ${br}`}}>
                  <div style={{display:"flex",justifyContent:"space-between"}}><p style={{fontSize:13,fontWeight:500,margin:0,color:tx0}}>{h.fuente} · {h.anio}</p><span style={{fontSize:12,color:tx1}}>{h.cantidad} mov.</span></div>
                  <div style={{display:"flex",gap:12,marginTop:3}}><span style={{fontSize:11,color:accent}}>↑ {fmtM(h.totalIng)}</span><span style={{fontSize:11,color:"#E24B4A"}}>↓ {fmtM(h.totalGas)}</span></div>
                </div>)}
              </div>}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:"1rem"}}>
                {Object.entries(GUIAS).map(([key,g])=><button key={key} onClick={()=>{setImpFuente(key);setImpStep("guia");setImpErr("");setImpFilas([]);}} style={{...B,padding:"1rem",borderRadius:12,textAlign:"left",display:"flex",flexDirection:"column",gap:4,borderLeft:`3px solid ${g.color}`}}>
                  <span style={{fontSize:13,fontWeight:600,color:tx0}}>{g.nombre}</span>
                  <span style={{fontSize:11,color:tx1}}>Ver guía →</span>
                </button>)}
              </div>
              <button onClick={()=>{setImpFuente("otro");setImpStep("subir");setImpErr("");}} style={{...B,width:"100%",padding:11,borderRadius:12}}>Ya tengo el archivo, subir directo →</button>
            </div>}
            {impStep==="guia"&&impFuente&&<div>
              <button onClick={()=>setImpStep("inicio")} style={{...B,padding:"5px 10px",fontSize:12,marginBottom:"1rem"}}>← Volver</button>
              <div style={{...C({marginBottom:"1.25rem"}),borderTop:`3px solid ${GUIAS[impFuente].color}`}}>
                <p style={{fontSize:15,fontWeight:600,margin:"0 0 4px",color:tx0}}>{GUIAS[impFuente].nombre}</p>
                <p style={{fontSize:12,color:tx1,margin:"0 0 1rem"}}>Seguí estos pasos antes de subir</p>
                {GUIAS[impFuente].pasos.map(p=><div key={p.n} style={{display:"flex",gap:12,marginBottom:12}}>
                  <div style={{width:22,height:22,borderRadius:"50%",background:bg1,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:600,color:tx1,flexShrink:0}}>{p.n}</div>
                  <div><p style={{fontSize:13,fontWeight:500,margin:"0 0 2px",color:tx0}}>{p.t}</p><p style={{fontSize:12,color:tx1,margin:0,lineHeight:1.5}}>{p.d}</p></div>
                </div>)}
                <div style={{padding:"8px 12px",background:bg1,borderRadius:8}}><p style={{fontSize:12,color:tx1,margin:0}}>{GUIAS[impFuente].nota}</p></div>
              </div>
              <BtnPrimary onClick={()=>setImpStep("subir")} style={{width:"100%"}}>Ya lo descargué →</BtnPrimary>
            </div>}
            {impStep==="subir"&&<div>
              <button onClick={()=>setImpStep(impFuente&&impFuente!=="otro"?"guia":"inicio")} style={{...B,padding:"5px 10px",fontSize:12,marginBottom:"1rem"}}>← Volver</button>
              <div onClick={()=>fileRef.current?.click()} style={{border:`1.5px dashed ${br}`,borderRadius:16,padding:"2.5rem 1.5rem",cursor:"pointer",marginBottom:"1rem",background:bg1,textAlign:"center"}}>
                <div style={{fontSize:36,marginBottom:12}}>📂</div>
                <p style={{fontSize:14,fontWeight:500,margin:"0 0 4px",color:tx0}}>{impFile||"Seleccionar archivo"}</p>
                <p style={{fontSize:12,color:tx2,margin:0}}>CSV o TXT</p>
              </div>
              <input ref={fileRef} type="file" accept=".csv,.txt" onChange={handleFile} style={{display:"none"}}/>
              {impErr&&<div style={{padding:"10px 14px",background:"#FCEBEB",borderRadius:10,fontSize:13,color:"#501313",marginBottom:"1rem"}}>{impErr}</div>}
              <div style={C({fontSize:13,color:tx1})}><strong style={{color:tx0}}>¿Tenés Excel?</strong> Guardalo como CSV desde Archivo → Guardar como, o usá cloudconvert.com.</div>
            </div>}
            {impStep==="preview"&&<div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"1rem"}}>
                <div>
                  <p style={{fontSize:14,fontWeight:600,margin:"0 0 4px",color:tx0}}>Revisá la clasificación</p>
                  <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                    <span style={{fontSize:11,color:accent}}>↑ {impFilas.filter(f=>f.sel&&f.tipo==="ingreso").length} ingresos</span>
                    <span style={{fontSize:11,color:"#E24B4A"}}>↓ {impFilas.filter(f=>f.sel&&f.tipo==="gasto").length} egresos</span>
                    {impFilas.some(f=>f.tipo==="retencion")&&<span style={{fontSize:11,color:"#BA7517"}}>⚡ {impFilas.filter(f=>f.tipo==="retencion").length} retenciones</span>}
                    {impFilas.some(f=>f.tipo==="neutro")&&<span style={{fontSize:11,color:tx2}}>○ {impFilas.filter(f=>f.tipo==="neutro").length} neutros</span>}
                  </div>
                </div>
                <button onClick={()=>setImpStep("subir")} style={{...B,padding:"5px 10px",fontSize:12,flexShrink:0}}>← Volver</button>
              </div>
              {impFilas.some(f=>f.tipo==="retencion")&&<div style={{padding:"10px 14px",background:d?"#2a1e08":"#FAEEDA",borderRadius:10,marginBottom:8}}>
                <p style={{fontSize:12,fontWeight:600,margin:"0 0 3px",color:"#BA7517"}}>⚡ Retenciones detectadas</p>
                <p style={{fontSize:12,color:"#633806",margin:0,lineHeight:1.5}}>Las retenciones (IIBB, comisiones de MP) no son ingresos propios. Importarlas como ingreso inflaría tu facturación ante ARCA.</p>
              </div>}
              {impFilas.some(f=>f.tipo==="neutro")&&<div style={{padding:"10px 14px",background:bg1,borderRadius:10,marginBottom:8,border:`0.5px solid ${br}`}}>
                <p style={{fontSize:12,fontWeight:600,margin:"0 0 3px",color:tx0}}>○ Movimientos no operativos</p>
                <p style={{fontSize:12,color:tx1,margin:0,lineHeight:1.5}}>Devoluciones, sueldos, préstamos o transferencias propias no deben contabilizarse como ingresos del monotributo.</p>
              </div>}
              <div style={{display:"flex",gap:8,marginBottom:"0.75rem",alignItems:"center",flexWrap:"wrap"}}>
                {[2025,2026].map(a=><button key={a} onClick={()=>setImpAnio(a)} style={{...B,padding:"5px 14px",fontSize:12,background:impAnio===a?accent:"transparent",color:impAnio===a?"#fff":tx1,border:impAnio===a?"none":`0.5px solid ${br}`,borderRadius:20}}>{a}</button>)}
                <div style={{marginLeft:"auto",display:"flex",gap:6}}>
                  <button onClick={()=>setImpFilas(p=>p.map(f=>({...f,sel:f.tipo==="ingreso"||f.tipo==="gasto"})))} style={{...B,padding:"5px 10px",fontSize:11}}>Solo op.</button>
                  <button onClick={()=>setImpFilas(p=>p.map(f=>({...f,sel:true})))} style={{...B,padding:"5px 10px",fontSize:11}}>Todo</button>
                  <button onClick={()=>setImpFilas(p=>p.map(f=>({...f,sel:false})))} style={{...B,padding:"5px 10px",fontSize:11}}>Ninguno</button>
                </div>
              </div>
              <div style={C({marginBottom:"1rem",padding:"0.75rem 1rem",maxHeight:300,overflowY:"auto"})}>
                {["ingreso","gasto","retencion","neutro"].map(tipo=>{
                  const items=impFilas.filter(f=>f.tipo===tipo); if(!items.length) return null;
                  const tLabel={ingreso:"↑ Ingresos",gasto:"↓ Egresos",retencion:"⚡ Retenciones — revisar",neutro:"○ No operativos — revisar"}[tipo];
                  const tColor={ingreso:accent,gasto:"#E24B4A",retencion:"#BA7517",neutro:tx2}[tipo];
                  return <div key={tipo} style={{marginBottom:6}}>
                    <p style={{fontSize:10,color:tColor,fontWeight:700,margin:"8px 0 4px",textTransform:"uppercase",letterSpacing:"0.06em"}}>{tLabel}</p>
                    {items.map(f=><div key={f.id} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:`0.5px solid ${br}`,opacity:f.sel?1:0.35}}>
                      <input type="checkbox" checked={f.sel} onChange={e=>setImpFilas(p=>p.map(x=>x.id===f.id?{...x,sel:e.target.checked}:x))} style={{width:14,height:14,accentColor:tColor,flexShrink:0}}/>
                      <div style={{flex:1,minWidth:0}}><p style={{fontSize:12,fontWeight:500,margin:0,color:tx0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{f.desc}</p><p style={{fontSize:10,color:tx2,margin:"2px 0 0"}}>{f.fecha} → {f.mes} {impAnio}</p></div>
                      {(tipo==="ingreso"||tipo==="gasto")&&<button onClick={()=>setImpFilas(p=>p.map(x=>x.id===f.id?{...x,tipo:x.tipo==="ingreso"?"gasto":"ingreso"}:x))} style={{fontSize:10,padding:"3px 8px",borderRadius:10,border:"none",background:f.tipo==="ingreso"?d?"#1a2e25":"#E1F5EE":d?"#2a1010":"#FCEBEB",color:f.tipo==="ingreso"?d?"#7ee8b8":"#0F6E56":"#A32D2D",cursor:"pointer",fontWeight:600,whiteSpace:"nowrap",flexShrink:0}}>{f.tipo==="ingreso"?"↑ Ing.":"↓ Egr."}</button>}
                      {(tipo==="retencion"||tipo==="neutro")&&<button onClick={()=>setImpFilas(p=>p.map(x=>x.id===f.id?{...x,tipo:"gasto"}:x))} style={{fontSize:10,padding:"3px 8px",borderRadius:10,border:"none",background:bg2,color:tx1,cursor:"pointer",fontWeight:500,whiteSpace:"nowrap",flexShrink:0}}>→ Egreso</button>}
                      <span style={{fontSize:12,fontWeight:600,color:tx0,minWidth:58,textAlign:"right",flexShrink:0}}>{fmtM(f.monto)}</span>
                    </div>)}
                  </div>;
                })}
              </div>
              <div style={{padding:"10px 14px",background:bg1,borderRadius:10,marginBottom:10}}>
                <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
                  <span style={{fontSize:12,color:accent}}>↑ {impFilas.filter(f=>f.sel&&f.tipo==="ingreso").length} ingresos · {fmtM(impFilas.filter(f=>f.sel&&f.tipo==="ingreso").reduce((s,f)=>s+f.monto,0))}</span>
                  <span style={{fontSize:12,color:"#E24B4A"}}>↓ {impFilas.filter(f=>f.sel&&f.tipo==="gasto").length} egresos · {fmtM(impFilas.filter(f=>f.sel&&f.tipo==="gasto").reduce((s,f)=>s+f.monto,0))}</span>
                </div>
              </div>
              <BtnPrimary onClick={confirmarImport} disabled={!impFilas.filter(f=>f.sel).length} style={{width:"100%"}}>Confirmar importación →</BtnPrimary>
            </div>}
            {impStep==="listo"&&<div style={{textAlign:"center",padding:"3rem 1rem"}}>
              <div style={{width:64,height:64,borderRadius:"50%",background:"#E1F5EE",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,margin:"0 auto 1rem"}}>✓</div>
              <p style={{fontSize:18,fontWeight:700,margin:"0 0 8px",color:tx0}}>¡Importación exitosa!</p>
              {impHist[0]&&<div style={{marginBottom:"1.5rem"}}>
                <p style={{fontSize:13,color:tx1,margin:"0 0 8px"}}>{impHist[0].cantidad} movimientos de {impHist[0].fuente}</p>
                <div style={{display:"flex",gap:16,justifyContent:"center"}}><span style={{fontSize:13,color:accent,fontWeight:600}}>↑ {fmtM(impHist[0].totalIng)}</span><span style={{fontSize:13,color:"#E24B4A",fontWeight:600}}>↓ {fmtM(impHist[0].totalGas)}</span></div>
              </div>}
              <div style={{display:"flex",gap:8,justifyContent:"center"}}>
                <button onClick={()=>{setImpStep("inicio");setImpFile("");}} style={{...B,background:bg1}}>Importar otro</button>
                <BtnPrimary onClick={()=>setSubMovs("ingresos")}>Ver ingresos →</BtnPrimary>
              </div>
            </div>}
          </div>}
        </div>}

        {/* ══ TAB: MI SITUACIÓN ════════════════════════════════════════════ */}
        {tab==="sit"&&<div>
          <SubTabs tabs={[["recat","Recategorización"],["evolucion","Evolución"],["comparar","Comparar"]]} active={subSit} setActive={setSubSit}/>

          {/* SUB: RECATEGORIZACIÓN */}
          {subSit==="recat"&&<div>
            <p style={{fontSize:14,color:tx1,marginBottom:"1.25rem",lineHeight:1.6}}>Próxima recategorización: <strong style={{color:tx0}}>30/06/2026</strong> · en 97 días. Se evalúan los ingresos de los últimos 12 meses.</p>
            {/* Hero zona */}
            <div style={{borderRadius:16,padding:"1.25rem",marginBottom:"1.25rem",background:zonaSube?d?"#2a1010":"#FCEBEB":zonaBaja?d?"#2a1e08":"#FAEEDA":d?"#1a2e25":"#e8f7f1"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
                <div>
                  <p style={{fontSize:11,fontWeight:700,margin:"0 0 4px",textTransform:"uppercase",letterSpacing:"0.06em",color:zonaSube?"#E24B4A":zonaBaja?"#BA7517":accent}}>{zonaSube?"⚠ Superás el tope":zonaBaja?"↓ Bajo el mínimo":"✓ Zona segura — Cat. "+user?.categoria}</p>
                  <p style={{fontSize:36,fontWeight:700,margin:"0 0 2px",color:zonaSube?"#E24B4A":zonaBaja?"#BA7517":accent,lineHeight:1}}>{fmtM(ingUlt12)}</p>
                  <p style={{fontSize:12,color:tx1,margin:0}}>ingresos últimos 12 meses</p>
                </div>
                <div style={{textAlign:"right"}}>
                  <p style={{fontSize:11,color:tx1,margin:"0 0 2px"}}>Categoría actual</p>
                  <p style={{fontSize:28,fontWeight:700,margin:0,color:zonaSube?"#E24B4A":zonaBaja?"#BA7517":accent}}>Cat. {user?.categoria}</p>
                  {cambiaRecat&&<p style={{fontSize:11,fontWeight:700,color:zonaSube?"#E24B4A":"#BA7517",margin:"4px 0 0"}}>→ pasaría a Cat. {catPRoyRecat.cat}</p>}
                </div>
              </div>
              {/* Barra de zona */}
              <div>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{fontSize:9,color:tx2}}>Zona baja{catAnterior?` (Cat. ${catAnterior.cat})`:""}</span>
                  <span style={{fontSize:9,color:accent,fontWeight:700}}>Zona segura Cat. {user?.categoria}</span>
                  <span style={{fontSize:9,color:tx2}}>Zona alta{catSiguiente?` (Cat. ${catSiguiente.cat})`:""}</span>
                </div>
                <div style={{height:14,background:d?"rgba(0,0,0,0.4)":"rgba(0,0,0,0.08)",borderRadius:7,position:"relative",overflow:"visible"}}>
                  <div style={{position:"absolute",left:0,right:0,top:0,bottom:0,borderRadius:7,background:`linear-gradient(to right,${d?"#2a1e08":"#FAEEDA"} 0%,${d?"#1a2e25":"#e8f7f1"} 30%,${d?"#1a2e25":"#e8f7f1"} 70%,${d?"#2a1010":"#FCEBEB"} 100%)`}}/>
                  <div style={{position:"absolute",top:-3,left:`${Math.min(96,Math.max(2,topeMax-topeMin>0?Math.min(100,Math.max(0,Math.round(((ingUlt12-topeMin)/(topeMax-topeMin))*100))):50))}%`,transform:"translateX(-50%)",width:18,height:18,borderRadius:"50%",background:zonaSube?"#E24B4A":zonaBaja?"#BA7517":accent,border:`2px solid ${bg0}`,zIndex:2,boxShadow:"0 2px 6px rgba(0,0,0,0.2)"}}/>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
                  <span style={{fontSize:9,color:tx2}}>{fmtM(topeMin)}</span>
                  <span style={{fontSize:9,color:tx2}}>{fmtM(topeMax)}</span>
                </div>
              </div>
            </div>
            {/* Márgenes */}
            {zonaSegura&&<div style={C({marginBottom:"1.25rem"})}>
              <p style={{fontSize:13,fontWeight:600,margin:"0 0 10px",color:tx0}}>Márgenes actuales</p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div style={{background:d?"#2a1e08":"#FAEEDA",borderRadius:10,padding:"0.85rem"}}>
                  <p style={{fontSize:10,color:"#854F0B",margin:"0 0 4px"}}>Mínimo para no bajar</p>
                  <p style={{fontSize:18,fontWeight:700,margin:0,color:"#BA7517"}}>{fmtM(topeMin+1)}</p>
                  <p style={{fontSize:10,color:"#854F0B",margin:"4px 0 0"}}>en los últimos 12 meses</p>
                </div>
                <div style={{background:d?"#1a2e25":"#E1F5EE",borderRadius:10,padding:"0.85rem"}}>
                  <p style={{fontSize:10,color:d?"#6db99a":"#2d7a5a",margin:"0 0 4px"}}>Podés facturar hasta</p>
                  <p style={{fontSize:18,fontWeight:700,margin:0,color:accent}}>{fmtM(margenHastaSubir)}</p>
                  <p style={{fontSize:10,color:d?"#6db99a":"#2d7a5a",margin:0}}>más sin subir de categoría</p>
                </div>
              </div>
            </div>}
            {zonaSube&&<div style={{padding:"14px 16px",background:d?"#2a1010":"#FCEBEB",borderRadius:12,marginBottom:"1.25rem",border:"0.5px solid rgba(226,75,74,0.3)"}}>
              <p style={{fontSize:13,fontWeight:700,margin:"0 0 6px",color:"#E24B4A"}}>Superaste el tope de Cat. {user?.categoria}</p>
              <p style={{fontSize:13,color:"#501313",margin:0,lineHeight:1.5}}>En la próxima recategorización (30/06/2026) pasarías a <strong>Cat. {catSiguiente?.cat}</strong>. Cuota: <strong>{fmtM(catSiguiente?.cuota||0)}/mes</strong>.</p>
            </div>}
            {zonaBaja&&<div style={{padding:"14px 16px",background:d?"#2a1e08":"#FAEEDA",borderRadius:12,marginBottom:"1.25rem",border:"0.5px solid rgba(186,117,23,0.3)"}}>
              <p style={{fontSize:13,fontWeight:700,margin:"0 0 6px",color:"#BA7517"}}>Ingresos por debajo del mínimo de Cat. {user?.categoria}</p>
              <p style={{fontSize:13,color:"#633806",margin:0,lineHeight:1.5}}>Te faltan <strong>{fmtM(topeMin-ingUlt12)}</strong> para mantenerte. Bajarías a <strong>Cat. {catAnterior?.cat}</strong> — cuota <strong>{fmtM(catAnterior?.cuota||0)}/mes</strong>.</p>
            </div>}
            {/* Proyección */}
            <div style={C()}>
              <p style={{fontSize:13,fontWeight:600,margin:"0 0 10px",color:tx0}}>Proyección al 30/06/2026</p>
              <p style={{fontSize:12,color:tx1,margin:"0 0 10px",lineHeight:1.5}}>Si seguís al promedio actual de <strong style={{color:tx0}}>{fmtM(promedioMensual)}/mes</strong>:</p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                {[{l:"Ingresos proyectados",v:fmtM(ingProyRecat),c:tx0},{l:"Categoría resultante",v:`Cat. ${catPRoyRecat.cat}`,c:cambiaRecat?"#BA7517":accent},{l:"Cuota resultante",v:fmtM(catPRoyRecat.cuota)+"/mes",c:cambiaRecat&&catPRoyRecat.cuota>catObj?.cuota?"#E24B4A":accent}].map(x=><div key={x.l} style={{background:bg1,borderRadius:10,padding:"0.75rem"}}><p style={{fontSize:10,color:tx1,margin:"0 0 4px",lineHeight:1.3}}>{x.l}</p><p style={{fontSize:13,fontWeight:700,margin:0,color:x.c}}>{x.v}</p></div>)}
              </div>
            </div>
          </div>}

          {/* SUB: EVOLUCIÓN */}
          {subSit==="evolucion"&&<div>
            {f26.length===0
              ?<EmptyState emoji="📈" title="Sin datos para proyectar" desc="Cargá al menos 2 meses de ingresos de 2026." action="Ir a ingresos" onAction={()=>setSubMovs("ingresos")}/>
              :<div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:"1.25rem"}}>
                  <div style={{background:bg1,borderRadius:12,padding:"0.9rem"}}><p style={{fontSize:11,color:tx1,margin:"0 0 4px"}}>Proyección anual</p><p style={{fontSize:20,fontWeight:700,margin:"0 0 2px",color:acumProy>=(catObj?.tope||0)*0.9?"#E24B4A":tx0}}>{fmtM(acumProy)}</p><p style={{fontSize:11,color:tx2,margin:0}}>{acumProy>=(catObj?.tope||0)?"⚠ Supera tope":"Dentro del tope"}</p></div>
                  <div style={{background:bg1,borderRadius:12,padding:"0.9rem"}}><p style={{fontSize:11,color:tx1,margin:"0 0 4px"}}>Cat. proyectada</p><p style={{fontSize:20,fontWeight:700,margin:"0 0 2px",color:catProy?.cat!==user?.categoria?"#BA7517":tx0}}>Cat. {catProy?.cat}</p><p style={{fontSize:11,color:tx2,margin:0}}>{catProy?.cat!==user?.categoria?`Cambia desde ${user?.categoria}`:"Sin cambio"}</p></div>
                </div>
                <div style={C({marginBottom:"1.25rem"})}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                    <p style={{fontSize:13,fontWeight:600,margin:0,color:tx0}}>Ingresos 2026</p>
                    <div style={{display:"flex",gap:10,fontSize:11,color:tx1}}>
                      <span style={{display:"flex",alignItems:"center",gap:4}}><span style={{width:8,height:8,borderRadius:2,background:accent,display:"inline-block"}}/>Real</span>
                      <span style={{display:"flex",alignItems:"center",gap:4}}><span style={{width:8,height:8,borderRadius:2,background:"#85B7EB",display:"inline-block"}}/>Proyectado</span>
                    </div>
                  </div>
                  <div style={{position:"relative",height:130}}>
                    <div style={{position:"absolute",left:0,right:0,top:`${100-Math.min(100,Math.round((catObj?.tope||0)/12/maxProy*100))}%`,borderTop:"1px dashed #E24B4A",zIndex:1}}><span style={{position:"absolute",right:0,top:-14,fontSize:9,color:"#E24B4A",background:bg0,paddingLeft:4}}>tope/mes</span></div>
                    <div style={{display:"flex",alignItems:"flex-end",gap:4,height:"100%",position:"relative",zIndex:2}}>
                      {MESES.map(mes=>{
                        const p=proy.find(x=>x.mes===mes);
                        if(!p) return <div key={mes} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}><div style={{width:"100%",height:3,background:bg2,borderRadius:"2px 2px 0 0"}}/><span style={{fontSize:9,color:tx2}}>{mes}</span></div>;
                        const h=Math.round((p.monto/maxProy)*115);
                        return <div key={mes} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,position:"relative"}} onMouseEnter={()=>setHovBar(`p-${mes}`)} onMouseLeave={()=>setHovBar(null)}>
                          {hovBar===`p-${mes}`&&<div style={{position:"absolute",bottom:120,background:d?"#f0f0ee":"#111",color:d?"#111":"#fff",fontSize:9,padding:"3px 7px",borderRadius:5,whiteSpace:"nowrap",zIndex:10}}>{fmtM(p.monto)}</div>}
                          <div style={{width:"100%",height:115,display:"flex",alignItems:"flex-end"}}><div style={{width:"100%",height:h||3,background:p.t==="r"?accent:"#85B7EB",borderRadius:"3px 3px 0 0",opacity:p.t==="p"?0.65:1,transition:"height 0.5s cubic-bezier(0.34,1.56,0.64,1)"}}/></div>
                          <span style={{fontSize:9,color:tx2}}>{mes}</span>
                        </div>;
                      })}
                    </div>
                  </div>
                </div>
                {catProy?.cat!==user?.categoria&&<div style={{padding:"12px 14px",background:"#FAEEDA",borderRadius:12,fontSize:13,color:"#633806"}}>Con esta tendencia pasarías a <strong>Cat. {catProy?.cat}</strong>. Cuota estimada: <strong>{fmtM(catProy?.cuota)}/mes</strong>.</div>}
              </div>}
          </div>}

          {/* SUB: COMPARAR */}
          {subSit==="comparar"&&<div>
            <div style={{display:"flex",gap:8,marginBottom:"1.25rem",alignItems:"center"}}>
              {[cmpA,cmpB].map((val,idx)=><React.Fragment key={idx}>
                <select value={val} onChange={e=>idx===0?setCmpA(Number(e.target.value)):setCmpB(Number(e.target.value))} style={{flex:1,fontSize:14,padding:"9px 10px",borderRadius:10,border:`0.5px solid ${br}`,background:bg1,color:tx0}}><option value={2025}>2025</option><option value={2026}>2026</option></select>
                {idx===0&&<span style={{fontSize:13,color:tx1,flexShrink:0}}>vs</span>}
              </React.Fragment>)}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:10,marginBottom:"1.25rem"}}>
              {[{l:`Total ${cmpA}`,v:fmtM(totA)},{l:`Total ${cmpB}`,v:fmtM(totB)},{l:"Var. mensual",v:`${varPct>=0?"+":""}${varPct.toFixed(1)}%`,c:varPct>=0?accent:"#E24B4A"}].map(c=><div key={c.l} style={{background:bg1,borderRadius:12,padding:"0.9rem"}}><p style={{fontSize:10,color:tx1,margin:"0 0 4px"}}>{c.l}</p><p style={{fontSize:16,fontWeight:700,margin:0,color:c.c||tx0}}>{c.v}</p></div>)}
            </div>
            <div style={C()}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <p style={{fontSize:13,fontWeight:600,margin:0,color:tx0}}>Mes a mes</p>
                <div style={{display:"flex",gap:10,fontSize:11,color:tx1}}>
                  <span style={{display:"flex",alignItems:"center",gap:4}}><span style={{width:8,height:8,borderRadius:2,background:accent,display:"inline-block"}}/>{cmpA}</span>
                  <span style={{display:"flex",alignItems:"center",gap:4}}><span style={{width:8,height:8,borderRadius:2,background:"#85B7EB",display:"inline-block"}}/>{cmpB}</span>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"flex-end",gap:3,height:120}}>
                {MESES.map(mes=>{const a=fa.find(f=>f.mes===mes)?.monto||0,b=fb.find(f=>f.mes===mes)?.monto||0;const ha=Math.round((a/maxCmp)*110),hb=Math.round((b/maxCmp)*110);return <div key={mes} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}><div style={{width:"100%",display:"flex",gap:1,alignItems:"flex-end",height:110}}><div style={{flex:1,height:ha||2,background:accent,borderRadius:"2px 2px 0 0",opacity:a?0.85:0.2,transition:"height 0.5s"}}/><div style={{flex:1,height:hb||2,background:"#85B7EB",borderRadius:"2px 2px 0 0",opacity:b?0.85:0.2,transition:"height 0.5s"}}/></div><span style={{fontSize:8,color:tx2}}>{mes}</span></div>;})}
              </div>
            </div>
          </div>}
        </div>}

        {/* ══ TAB: ALERTAS ════════════════════════════════════════════════ */}
        {tab==="alertas"&&<div>
          <SubTabs tabs={[["fiscal","Alertas fiscales"],["venc","Vencimientos"],["calc","Calculadora"]]} active={subAlertas} setActive={setSubAlertas}/>

          {/* SUB: ALERTAS FISCALES */}
          {subAlertas==="fiscal"&&<div>
            {alertas.map((a,i)=>{
              const col={critico:{bg:d?"#2a1010":"#FCEBEB",border:"rgba(226,75,74,0.3)",tx:"#501313",icon:"🚨"},advertencia:{bg:d?"#2a1e08":"#FAEEDA",border:"rgba(186,117,23,0.3)",tx:"#633806",icon:"⚠️"},ok:{bg:d?"#1a2e25":"#E1F5EE",border:"rgba(29,158,117,0.3)",tx:"#04342C",icon:"✓"}}[a.nivel];
              return <div key={i} style={{padding:"14px 16px",background:col.bg,border:`0.5px solid ${col.border}`,borderRadius:12,marginBottom:10}}>
                <div style={{display:"flex",gap:10}}>
                  <span style={{fontSize:18,flexShrink:0}}>{col.icon}</span>
                  <div><p style={{fontSize:13,fontWeight:700,margin:"0 0 4px",color:col.tx}}>{a.titulo}</p><p style={{fontSize:12,color:col.tx,margin:"0 0 4px",lineHeight:1.5,opacity:0.9}}>{a.desc}</p>{a.causal&&<p style={{fontSize:10,color:col.tx,margin:0,opacity:0.7,fontStyle:"italic"}}>Causal: {a.causal}</p>}</div>
                </div>
              </div>;
            })}
            <div style={C({marginTop:"1.25rem"})}>
              <p style={{fontSize:13,fontWeight:600,margin:"0 0 4px",color:tx0}}>Parámetros adicionales</p>
              <p style={{fontSize:12,color:tx1,margin:"0 0 14px"}}>Completá para detectar más causales.</p>
              {[{l:"Alquiler devengado anual ($)",v:alquilerAnual,set:setAlquilerAnual,ref:catObj?`Límite Cat. ${user?.categoria}: $${fmt(CATEGORIAS.find(c=>c.cat===catObj.cat)?.alquiler||0)}`:""},
                {l:"Empleados en relación de dependencia",v:empleados,set:setEmpleados,ref:"Máximo: 3"},
                {l:"Precio unitario máximo de venta ($)",v:maxPrecioUnit,set:setMaxPrecioUnit,ref:"Límite: $613.492"}].map(({l,v,set,ref})=><div key={l} style={{marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><label style={{fontSize:12,color:tx1}}>{l}</label>{ref&&<span style={{fontSize:10,color:tx2}}>{ref}</span>}</div>
                <input type="number" value={v||""} onChange={e=>set(Number(e.target.value))} placeholder="0" style={{width:"100%",fontSize:14,padding:"9px 12px",borderRadius:8,border:`0.5px solid ${br}`,background:bg1,color:tx0,boxSizing:"border-box"}}/>
              </div>)}
            </div>
          </div>}

          {/* SUB: VENCIMIENTOS */}
          {subAlertas==="venc"&&<div>
            <p style={{fontSize:14,color:tx1,marginBottom:"1.25rem"}}>Calculados desde hoy. Las cuotas vencen el día 20 de cada mes.</p>
            {vencimientos.map(v=><div key={v.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 0",borderBottom:`0.5px solid ${br}`}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:10,height:10,borderRadius:"50%",flexShrink:0,background:stateColor[v.estado]||br}}/>
                <div><p style={{fontSize:14,fontWeight:500,margin:0,color:tx0}}>{v.desc}</p><p style={{fontSize:12,color:tx2,margin:"2px 0 0"}}>{v.fecha}</p></div>
              </div>
              <span style={{fontSize:12,padding:"4px 10px",borderRadius:20,background:stateBg[v.estado]||bg1,color:stateTx[v.estado]||tx1,fontWeight:600}}>{v.dif<=0?"Hoy":`En ${v.dif}d`}</span>
            </div>)}
            <div style={C({marginTop:"1.25rem"})}>
              <p style={{fontSize:13,fontWeight:600,margin:"0 0 12px",color:tx0}}>Recordatorios</p>
              <div style={{display:"flex",gap:0,marginBottom:14,borderBottom:`0.5px solid ${br}`}}>
                {[["cal","📅 Calendar"],["gmail","✉️ Gmail"]].map(([t,l])=><button key={t} onClick={()=>setRemTab(t)} style={{flex:1,padding:"8px 0",fontSize:13,border:"none",borderBottom:remTab===t?`2px solid ${accent}`:"2px solid transparent",background:"transparent",color:remTab===t?tx0:tx1,cursor:"pointer",fontWeight:remTab===t?600:400}}>{l}</button>)}
              </div>
              {remTab==="cal"&&<div><BtnPrimary onClick={crearCal} disabled={calLoad||calSt==="ok"} style={{width:"100%",opacity:calSt==="ok"?0.6:1}}>{calLoad?"Creando...":calSt==="ok"?"✓ Creados":"Crear en Google Calendar"}</BtnPrimary>{calMsg&&<p style={{fontSize:12,marginTop:8,color:accent}}>{calMsg}</p>}</div>}
              {remTab==="gmail"&&<div><input value={remEmail} onChange={e=>setRemEmail(e.target.value)} placeholder="Email destino" style={{width:"100%",fontSize:14,padding:"10px 12px",borderRadius:8,border:`0.5px solid ${br}`,background:bg1,color:tx0,boxSizing:"border-box",marginBottom:10}}/><BtnPrimary onClick={envGmail} disabled={gmLoad||gmSt==="ok"||!remEmail} style={{width:"100%",opacity:gmSt==="ok"?0.6:1}}>{gmLoad?"Enviando...":gmSt==="ok"?"✓ Enviado":"Enviar recordatorio"}</BtnPrimary></div>}
            </div>
          </div>}

          {/* SUB: CALCULADORA */}
          {subAlertas==="calc"&&<div>
            <p style={{fontSize:14,color:tx1,marginBottom:"1.25rem",lineHeight:1.5}}>Desde Cat. E, los topes difieren según la actividad. Comparalos en tiempo real con el slider.</p>
            <div style={C({marginBottom:"1.25rem"})}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}><span style={{fontSize:13,color:tx1}}>Ingresos anuales</span><span style={{fontSize:15,fontWeight:700,color:tx0}}>{fmtM(calcIng)}</span></div>
              <input type="range" min={1000000} max={108357084} step={500000} value={calcIng} onChange={e=>setCalcIng(Number(e.target.value))} style={{width:"100%",accentColor:accent}}/>
              <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}><span style={{fontSize:10,color:tx2}}>$1M</span><span style={{fontSize:10,color:tx2}}>$108M</span></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:"1.25rem"}}>
              {[{act:"s",lbl:"Servicios",cat:catCS,c:"#185FA5",bg:d?"#0c1e32":"#E6F1FB"},{act:"v",lbl:"Venta",cat:catCV,c:"#854F0B",bg:d?"#2a1a08":"#FAEEDA"}].map(({act,lbl,cat,c,bg})=>{
                const esUser=user?.actividad===act;
                return <div key={act} style={{background:bg,borderRadius:14,padding:"1rem",border:esUser?`2px solid ${c}`:"none"}}>
                  {esUser&&<p style={{fontSize:9,color:c,fontWeight:700,margin:"0 0 5px",textTransform:"uppercase",letterSpacing:"0.06em"}}>Tu actividad</p>}
                  <p style={{fontSize:11,color:c,margin:"0 0 3px"}}>{lbl}</p>
                  <p style={{fontSize:38,fontWeight:700,margin:"0 0 3px",color:c,lineHeight:1}}>Cat. {cat.cat}</p>
                  <p style={{fontSize:13,color:c,margin:"0 0 2px",fontWeight:600}}>{fmtM(cat.cuota)}/mes</p>
                  <p style={{fontSize:11,color:c,margin:0,opacity:0.8}}>Tope: {fmtM(cat.tope)}</p>
                </div>;
              })}
            </div>
            {catCS.cat!==catCV.cat&&<div style={{padding:"12px 16px",background:d?"#1a2e1a":"#E1F5EE",borderRadius:12,fontSize:13,color:d?"#7ee8b8":"#04342C"}}>
              Con estos ingresos, venta permite Cat. {catCV.cat} vs Cat. {catCS.cat} en servicios. Diferencia: {fmtM(Math.abs(catCS.cuota-catCV.cuota))}/mes.
            </div>}
          </div>}
        </div>}

        {/* ══ TAB: MÁS ════════════════════════════════════════════════════ */}
        {tab==="mas"&&<div>
          <SubTabs tabs={[["asistente","Asistente IA"],["colaborar","Contador"],["analisis","Análisis"],["exportar","Exportar"]]} active={subMas} setActive={setSubMas}/>

          {/* SUB: ASISTENTE IA */}
          {subMas==="asistente"&&<div>
            <div style={{minHeight:320,maxHeight:400,overflowY:"auto",paddingBottom:"1rem"}}>
              {msgs.map((m,i)=><div key={i} style={{marginBottom:12,display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
                <div style={{maxWidth:"80%",padding:"10px 14px",borderRadius:m.role==="user"?"14px 14px 4px 14px":"14px 14px 14px 4px",background:m.role==="user"?accent:bg1,fontSize:14,color:m.role==="user"?"#fff":tx0,lineHeight:1.6}}>{m.content}</div>
              </div>)}
              {chatLoad&&<div style={{display:"flex",justifyContent:"flex-start",marginBottom:12}}><div style={{padding:"10px 14px",borderRadius:"14px 14px 14px 4px",background:bg1,fontSize:14,color:tx2}}>Pensando...</div></div>}
              <div ref={chatEndRef}/>
            </div>
            <div style={{marginBottom:10,display:"flex",gap:8,flexWrap:"wrap"}}>
              {["¿Cuánto puedo facturar este mes?","¿Cuándo me recategorizan?","¿Me conviene servicios o venta?"].map(q=><button key={q} onClick={()=>setChatIn(q)} style={{fontSize:12,padding:"6px 12px",borderRadius:20,border:`0.5px solid ${br}`,background:bg1,color:tx1,cursor:"pointer"}}>{q}</button>)}
            </div>
            <div style={{display:"flex",gap:8}}>
              <input value={chatIn} onChange={e=>setChatIn(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendChat()} placeholder="Hacé tu consulta..." style={{flex:1,fontSize:14,padding:"11px 16px",borderRadius:24,border:`0.5px solid ${br}`,background:bg1,color:tx0}}/>
              <button onClick={sendChat} disabled={chatLoad||!chatIn.trim()} style={{width:44,height:44,borderRadius:"50%",border:"none",background:chatLoad||!chatIn.trim()?bg2:accent,color:"#fff",fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>↑</button>
            </div>
          </div>}

          {/* SUB: COLABORAR */}
          {subMas==="colaborar"&&<div>
            <div style={{display:"flex",gap:0,marginBottom:"1.25rem",borderBottom:`0.5px solid ${br}`}}>
              {[["chat","Chat"],["equipo","Mi contador"],["acceso","Acceso"]].map(([t,l])=><button key={t} onClick={()=>setTabColab(t)} style={{flex:1,padding:"9px 0",fontSize:13,border:"none",borderBottom:tabColab===t?`2px solid ${accent}`:"2px solid transparent",background:"transparent",color:tabColab===t?tx0:tx1,cursor:"pointer",fontWeight:tabColab===t?600:400,position:"relative"}}>
                {l}{t==="chat"&&noLeidasC>0&&<span style={{position:"absolute",top:8,right:"18%",width:6,height:6,borderRadius:"50%",background:"#E24B4A"}}/>}
              </button>)}
            </div>
            {tabColab==="chat"&&(!contador
              ?<EmptyState emoji="💬" title="Sin contador asignado" desc="Asigná un contador para chatear." action="Ver contadores" onAction={()=>setTabColab("equipo")}/>
              :<div>
                <div style={{...C({marginBottom:"1rem",padding:"0.75rem 1rem"}),display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:36,height:36,borderRadius:"50%",background:"#B5D4F4",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#0C447C"}}>{getInit(contador.nombre)}</div>
                  <div><p style={{fontSize:13,fontWeight:600,margin:0,color:tx0}}>{contador.nombre}</p><p style={{fontSize:11,color:contador.online?accent:tx2,margin:0}}>{contador.online?"● En línea":"Desconectado"}</p></div>
                </div>
                <div style={{minHeight:260,maxHeight:340,overflowY:"auto",marginBottom:"1rem"}}>
                  {comentarios.map(c=><div key={c.id} style={{marginBottom:12,display:"flex",justifyContent:c.rol==="u"?"flex-end":"flex-start"}}>
                    <div style={{maxWidth:"78%"}}><p style={{fontSize:10,color:tx2,margin:"0 0 3px",textAlign:c.rol==="u"?"right":"left"}}>{c.autor} · {c.fecha}</p>
                    <div style={{padding:"10px 14px",borderRadius:c.rol==="u"?"14px 14px 4px 14px":"14px 14px 14px 4px",background:c.rol==="u"?accent:bg1,fontSize:13,color:c.rol==="u"?"#fff":tx0,lineHeight:1.6}}>{c.texto}{!c.leido&&c.rol==="c"&&<span style={{display:"block",fontSize:10,color:"#185FA5",marginTop:4,opacity:0.8}}>nuevo</span>}</div></div>
                  </div>)}
                  {envLoad&&<div style={{display:"flex",justifyContent:"flex-start",marginBottom:12}}><div style={{padding:"10px 14px",borderRadius:"14px 14px 14px 4px",background:bg1,fontSize:13,color:tx2}}>Escribiendo...</div></div>}
                  <div ref={comentEndRef}/>
                </div>
                <div style={{display:"flex",gap:8}}>
                  <input value={nuevoC} onChange={e=>setNuevoC(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!envLoad&&enviarC()} placeholder="Escribí tu consulta..." style={{flex:1,fontSize:14,padding:"11px 14px",borderRadius:24,border:`0.5px solid ${br}`,background:bg1,color:tx0}}/>
                  <button onClick={enviarC} disabled={envLoad||!nuevoC.trim()} style={{width:42,height:42,borderRadius:"50%",border:"none",background:accent,color:"#fff",fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>↑</button>
                </div>
              </div>)}
            {tabColab==="equipo"&&<div>
              {CONTADORES_DEMO.map(c=><div key={c.id} style={{...C({marginBottom:10,display:"flex",alignItems:"center",justifyContent:"space-between"}),border:contador?.id===c.id?`2px solid ${accent}`:`0.5px solid ${br}`}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <div style={{position:"relative"}}><div style={{width:42,height:42,borderRadius:"50%",background:"#B5D4F4",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:"#0C447C"}}>{getInit(c.nombre)}</div><div style={{position:"absolute",bottom:1,right:1,width:10,height:10,borderRadius:"50%",background:c.online?accent:bg2,border:`2px solid ${bg0}`}}/></div>
                  <div><p style={{fontSize:14,fontWeight:600,margin:0,color:tx0}}>{c.nombre}</p><p style={{fontSize:12,color:tx1,margin:"2px 0 0"}}>{c.especialidad}</p><p style={{fontSize:11,color:tx2,margin:"2px 0 0"}}>★ {c.rating} · {c.email}</p></div>
                </div>
                {contador?.id===c.id?<span style={{fontSize:12,padding:"5px 12px",borderRadius:20,background:"#E1F5EE",color:"#0F6E56",fontWeight:600}}>Asignado</span>:<BtnPrimary onClick={()=>{setContador(c);setAccLog(p=>[{id:Date.now(),accion:`${c.nombre} asignado`,fecha:"ahora mismo"},...p]);addToast(`${c.nombre} asignado`);}} style={{padding:"7px 14px",fontSize:12}}>Asignar</BtnPrimary>}
              </div>)}
            </div>}
            {tabColab==="acceso"&&<div>
              <div style={C({marginBottom:"1.25rem"})}>
                <p style={{fontSize:13,fontWeight:600,margin:"0 0 8px",color:tx0}}>Código de acceso para tu contador</p>
                <p style={{fontSize:13,color:tx1,margin:"0 0 14px",lineHeight:1.5}}>Generá un código temporal para que tu contador vea tu resumen fiscal.</p>
                {!showCodigo?<BtnPrimary onClick={()=>{setCodigo(Math.random().toString(36).substring(2,8).toUpperCase());setShowCodigo(true);addToast("Código generado");}} style={{width:"100%"}}>Generar código</BtnPrimary>
                :<div><div style={{textAlign:"center",padding:"1.5rem",background:bg1,borderRadius:12,marginBottom:10}}><p style={{fontSize:11,color:tx1,margin:"0 0 8px"}}>Tu código de acceso</p><p style={{fontSize:36,fontWeight:700,margin:"0 0 4px",letterSpacing:"0.2em",color:accent}}>{codigo}</p><p style={{fontSize:11,color:tx2,margin:0}}>Válido por 48 horas</p></div><button onClick={()=>setShowCodigo(false)} style={{...B,width:"100%",padding:9,fontSize:12}}>Revocar código</button></div>}
              </div>
              <div style={C()}><p style={{fontSize:13,fontWeight:600,margin:"0 0 12px",color:tx0}}>Registro de accesos</p>{accLog.map(a=><div key={a.id} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`0.5px solid ${br}`}}><span style={{fontSize:12,color:tx0}}>{a.accion}</span><span style={{fontSize:11,color:tx2,flexShrink:0,marginLeft:8}}>{a.fecha}</span></div>)}</div>
            </div>}
          </div>}

          {/* SUB: ANÁLISIS */}
          {subMas==="analisis"&&<div>
            {totalIngresos2026===0
              ?<EmptyState emoji="📊" title="Sin datos para analizar" desc="Importá o cargá tus ingresos y egresos de 2026 para ver el análisis." action="Ir a importar" onAction={()=>{goTab("movs");setSubMovs("importar");}}/>
              :<div>
                <div style={{display:"flex",justifyContent:"center",gap:40,marginBottom:"1.5rem",padding:"1.25rem",background:bg1,borderRadius:14}}>
                  <div style={{textAlign:"center"}}><p style={{fontSize:11,color:tx1,margin:"0 0 4px"}}>Ingresos 2026</p><p style={{fontSize:24,fontWeight:700,margin:0,color:accent}}>{fmtM(totalIngresos2026)}</p></div>
                  <div style={{width:1,background:br}}/>
                  <div style={{textAlign:"center"}}><p style={{fontSize:11,color:tx1,margin:"0 0 4px"}}>Egresos registrados</p><p style={{fontSize:24,fontWeight:700,margin:0,color:"#E24B4A"}}>{fmtM(totalGastos)}</p></div>
                </div>
                <div style={C({marginBottom:"1.25rem"})}>
                  <p style={{fontSize:13,fontWeight:600,margin:"0 0 12px",color:tx0}}>Egresos por categoría</p>
                  {Object.entries(gastos.reduce((acc,g)=>{acc[g.categoria]=(acc[g.categoria]||0)+g.monto;return acc;},{})).sort((a,b)=>b[1]-a[1]).map(([cat,total])=>{
                    const pctCat=totalIngresos2026>0?Math.round((total/totalIngresos2026)*100):0;
                    const maxV=Math.max(...Object.values(gastos.reduce((acc,g)=>{acc[g.categoria]=(acc[g.categoria]||0)+g.monto;return acc;},{})));
                    return <div key={cat} style={{marginBottom:10}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:12,color:tx0,fontWeight:500}}>{cat}</span><span style={{fontSize:12,color:tx1}}>{fmtM(total)} <span style={{color:tx2}}>({pctCat}% ing.)</span></span></div>
                      <div style={{height:5,background:bg2,borderRadius:3}}><div style={{height:"100%",width:`${Math.round((total/maxV)*100)}%`,background:accent,borderRadius:3,opacity:0.8}}/></div>
                    </div>;
                  })}
                </div>
                <div style={{padding:"12px 14px",background:bg1,borderRadius:12,fontSize:12,color:tx1,lineHeight:1.6}}>
                  <strong style={{color:tx0}}>Nota:</strong> En el monotributo los egresos no reducen la carga fiscal. Este análisis sirve para tu gestión interna y para evaluar si te conviene cambiar al régimen general.
                </div>
              </div>}
          </div>}

          {/* SUB: EXPORTAR */}
          {subMas==="exportar"&&<div>
            <p style={{fontSize:14,color:tx1,marginBottom:"1.5rem",lineHeight:1.6}}>Exportá tu resumen completo o configurá recordatorios automáticos.</p>
            <div style={C({marginBottom:"1.25rem"})}>
              <p style={{fontSize:13,fontWeight:600,margin:"0 0 8px",color:tx0}}>Exportar a Google Drive</p>
              <p style={{fontSize:12,color:tx1,margin:"0 0 14px",lineHeight:1.5}}>Genera un archivo con tu resumen fiscal completo: perfil, ingresos 2025/2026, egresos y estado ARCA.</p>
              <BtnPrimary onClick={expDrive} disabled={driveLoad} style={{width:"100%",opacity:driveLoad?0.6:1}}>{driveLoad?"Guardando...":driveSt==="ok"?"✓ Guardado en Drive":"Exportar a Google Drive"}</BtnPrimary>
              {driveMsg&&<p style={{fontSize:12,marginTop:8,color:accent}}>{driveMsg}</p>}
            </div>
          </div>}
        </div>}

      </div>

      {/* ── BOTTOM TAB BAR ── */}
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:720,background:bg0,borderTop:`0.5px solid ${br}`,display:"flex",zIndex:50,paddingBottom:4}}>
        {TABS.map(({id,label,Icon})=>{
          const active=tab===id;
          const badge=(id==="alertas"&&alertasCriticas>0)||(id==="mas"&&noLeidasC>0);
          return <button key={id} onClick={()=>goTab(id)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"10px 4px 6px",border:"none",background:"transparent",cursor:"pointer",position:"relative",color:active?accent:tx2}}>
            <div style={{transition:"transform 0.15s",transform:active?"scale(1.1)":"scale(1)"}}><Icon/></div>
            <span style={{fontSize:10,fontWeight:active?700:400}}>{label}</span>
            {active&&<div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:20,height:2,borderRadius:1,background:accent}}/>}
            {badge&&<div style={{position:"absolute",top:8,right:"22%",width:7,height:7,borderRadius:"50%",background:"#E24B4A"}}/>}
          </button>;
        })}
      </div>
    </div>
  );
}
