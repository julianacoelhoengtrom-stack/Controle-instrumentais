import {jsPDF} from 'jspdf';
import {deliveryText} from './model.js';
const C={ink:[36,62,76],muted:[111,130,142],teal:[23,137,145],light:[239,247,247],line:[215,230,233],blue:[43,99,145]};
const clean=s=>String(s??'').replace(/[\u2010-\u2015\u2212]/g,'-').replace(/\u2022/g,' / ');
const date=s=>new Date(s).toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo',dateStyle:'short',timeStyle:'short'});
export function buildReport(b,{hospital,demo=false}={}){
 const doc=new jsPDF({unit:'mm',format:'a4'}),m=18,w=174,bottom=274;let y=0;
 const font=(size=10,bold=false,color=C.ink)=>{doc.setFont('helvetica',bold?'bold':'normal');doc.setFontSize(size);doc.setTextColor(...color);};
 const lines=(s,width,size=10,bold=false)=>{font(size,bold);return doc.splitTextToSize(clean(s),width);};
 const draw=(s,x,yy,size=10,bold=false,color=C.ink)=>{font(size,bold,color);doc.text(Array.isArray(s)?s.map(clean):clean(s),x,yy);};
 function header(first=false){
  doc.setFillColor(...C.teal);doc.rect(0,0,210,3,'F');
  if(hospital){const p=doc.getImageProperties(hospital),ih=42*p.height/p.width;doc.addImage(hospital,'PNG',m,11,42,Math.min(ih,24));}
  draw('ENGENHARIA CLÍNICA',104,15,8,true,C.teal);
  draw(first?'TERMO DE ENTREGA':'TERMO DE ENTREGA / CONTINUAÇÃO',104,22,first?13:10,true);
  if(first)draw('E CONFERÊNCIA DE INSTRUMENTAIS',104,28,8,true,C.muted);
  draw('Registro '+b.id.slice(0,8).toUpperCase(),104,35,8,false,C.muted);
  doc.setDrawColor(...C.line);doc.line(m,41,192,41);y=49;
  if(demo){doc.setFillColor(255,246,226);doc.roundedRect(m,y-3,w,8,2,2,'F');draw('MODELO DE DEMONSTRAÇÃO - DADOS FICTÍCIOS, SEM VALIDADE',m+4,y+2,8,true,[160,112,42]);y+=12;}
 }
 function page(){doc.addPage();header(false);}
 function room(h){if(y+h>bottom)page();}
 function paragraph(s,size=9.5,bold=false,color=C.ink){const ls=lines(s,w,size,bold),lh=size*.45+1;for(const line of ls){room(lh);draw(line,m,y,size,bold,color);y+=lh;}y+=4;}
 function section(n,title){room(15);draw(n,m,y,8,true,C.teal);draw(title,m+11,y,11,true);y+=8;}
 header(true);
 // Context is compact enough to leave room for the content and signatures on short terms.
 const tech=lines(b.technician,76,8.5),coord=lines(b.coordinator,76,8.5);const metaExtra=Math.max(0,tech.length-2,coord.length-4)*4.3;const metaHeight=29+metaExtra;doc.setFillColor(...C.light);doc.roundedRect(m,y-2,w,metaHeight,3,3,'F');
 draw('DATA DA CONFERÊNCIA',m+5,y+4,7,true,C.muted);draw(date(b.finishedAt),m+5,y+10,9,true);
 draw('TÉCNICO RESPONSÁVEL',m+5,y+17,7,true,C.muted);draw(tech,m+5,y+22,8.5);
 draw('COORDENADORA DO SETOR',m+92,y+4,7,true,C.muted);draw(coord,m+92,y+10,8.5);
 draw(b.pending?'Salvo no dispositivo / sincronização pendente':'Registro sincronizado com a planilha',m+92,y+22,7,false,b.pending?[160,112,42]:C.teal);y+=32+metaExtra;
 const approved=b.items.filter(i=>i.decision==='ok').length,refused=b.items.length-approved;
 [[b.items.length,'ITENS CONFERIDOS',C.blue],[approved,'APROVADOS E ENTREGUES',[46,128,98]],[refused,'RECUSADOS E RETORNADOS',[171,86,90]]].forEach(([count,label,color],n)=>{const x=m+n*59;doc.setFillColor(...color.map(c=>Math.round(c*.06+255*.94)));doc.roundedRect(x,y-2,56,17,2,2,'F');draw(String(count),x+4,y+8,17,true,color);draw(label,x+17,y+7,6.7,true,color);});y+=21;
 section('01','Registro da entrega');paragraph(deliveryText(b));
 section('02','Resultado da conferência');
 const widths=[77,37,60],xs=[m,m+77,m+114];
 function tableHead(){doc.setFillColor(...C.teal);doc.roundedRect(m,y-3,w,8,1,1,'F');['INSTRUMENTAL','RESULTADO','MOTIVO DA RECUSA'].forEach((t,i)=>draw(t,xs[i]+3,y+2,7,true,[255,255,255]));y+=10;}
 room(24);tableHead();
 b.items.forEach((i,index)=>{
  const cell=[lines(`${i.code}\n${i.name}${i.sector?'\nSetor: '+i.sector:''}`,widths[0]-6,8.5),lines(i.decision==='ok'?'Aprovado\nEntregue ao setor':'Não aprovado\nRetornou para tratativa',widths[1]-6,8.1,true),lines(i.decision==='not_ok'?i.reason:'Não se aplica.',widths[2]-6,8.3)];
  let offset=0,max=Math.max(...cell.map(x=>x.length));
  while(offset<max){if(y+12>bottom){page();tableHead();}const cap=Math.max(1,Math.floor((bottom-y-5)/4.5)),n=Math.min(max-offset,cap),height=n*4.5+5;
   doc.setFillColor(...(index%2?[245,249,250]:[255,255,255]));doc.rect(m,y-3,w,height,'F');
   for(let c=0;c<3;c++){const part=cell[c].slice(offset,offset+n);if(part.length){font(c===1?8.1:8.3,c===1,c===1?(i.decision==='ok'?[46,128,98]:[171,86,90]):C.ink);doc.text(part,xs[c]+3,y+2,{lineHeightFactor:1.5});}}
   y+=height;doc.setDrawColor(...C.line);doc.line(m,y-3,192,y-3);offset+=n;if(offset<max){page();tableHead();}
  }
 });
 const sigExtra=Math.max(0,...['technician','coordinator'].map(role=>lines(b[role],84,8.5,true).length-1))*4;
 y+=5;room(59+sigExtra);section('03','Assinaturas de entrega e conferência');

 const sigY=y;
 ['technician','coordinator'].forEach((role,n)=>{
  const x=m+n*90,sw=84,s=b.signatures?.[role];
  doc.setDrawColor(...C.line);doc.setFillColor(250,252,252);doc.roundedRect(x,sigY,sw,23,2,2,'FD');
  if(s?.strokes?.length){doc.setDrawColor(...C.ink);doc.setLineWidth(.38);for(const stroke of s.strokes){for(let j=1;j<stroke.length;j++){doc.line(x+3+stroke[j-1][0]/640*78,sigY+1+stroke[j-1][1]/220*21,x+3+stroke[j][0]/640*78,sigY+1+stroke[j][1]/220*21);}}}else draw('Assinatura pendente',x+24,sigY+14,8,false,C.muted);
  draw(role==='technician'?'TÉCNICO RESPONSÁVEL PELA ENTREGA':'COORDENADORA RESPONSÁVEL PELA CONFERÊNCIA',x,sigY+29,6.7,true,C.teal);
  const nameLines=lines(b[role],sw,8.5,true);font(8.5,true);doc.text(nameLines,x,sigY+35,{lineHeightFactor:1.25});
  if(s?.at)draw('Capturada em '+date(s.at),x,sigY+41+Math.max(0,nameLines.length-1)*4,6.8,false,C.muted);
 });
 draw('Assinaturas manuscritas capturadas no aplicativo e vinculadas aos resultados desta conferência.',m,sigY+50+sigExtra,7.1,false,C.muted);
 for(let p=1;p<=doc.getNumberOfPages();p++){doc.setPage(p);doc.setDrawColor(...C.line);doc.line(m,283,192,283);draw('HOSPITAL NAPOLEÃO LAUREANO  /  ENGENHARIA CLÍNICA',m,288,7,true,C.muted);font(7);doc.text(`${p} / ${doc.getNumberOfPages()}`,192,288,{align:'right'});}
 return doc;
}
