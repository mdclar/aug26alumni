import * as D from "docx"; import fs from "fs";
import { createCanvas, loadImage } from "canvas";
const {Document,Packer,Paragraph,TextRun,ImageRun,AlignmentType}=D;
const INK="233038",BRASS="8f6e37";
function wrap(ctx,t,mw){const ws=(t||"").split(/\s+/);const ls=[];let l="";for(const w of ws){const x=l?l+" "+w:w;if(ctx.measureText(x).width>mw&&l){ls.push(l);l=w;}else l=x;}if(l)ls.push(l);return ls;}
async function bake(path,cap){const img=await loadImage(path);const iw=img.width,ih=img.height;const s=Math.min(1,1000/Math.max(iw,ih));const w=Math.round(iw*s),h=Math.round(ih*s);const fpx=Math.max(14,Math.round(w*0.032)),pad=Math.round(fpx*0.7),lh=Math.round(fpx*1.28);let cv=createCanvas(10,10);let mctx=cv.getContext("2d");mctx.font=`italic ${fpx}px serif`;const lines=cap?wrap(mctx,cap,w-2*pad):[];const capH=cap?(pad+lines.length*lh+pad):0;cv=createCanvas(w,h+capH);const c=cv.getContext("2d");c.fillStyle="#fff";c.fillRect(0,0,cv.width,cv.height);c.drawImage(img,0,0,w,h);if(cap){c.font=`italic ${fpx}px serif`;c.fillStyle="#4a5a63";c.textAlign="center";let y=h+pad+fpx*0.82;for(const ln of lines){c.fillText(ln,w/2,y);y+=lh;}}return {dataUrl:cv.toDataURL("image/jpeg",0.85),w:cv.width,h:cv.height};}
const b=await bake("/tmp/docxcheck/word/media/390cb47848e6ca191b38535e06b7f4fa0f17f185.jpg","A long caption baked into the image so it always travels with the photo when wrapped in Google Docs");
const dispW=380,dispH=Math.round(dispW*(b.h/b.w));
const kids=[new Paragraph({children:[new TextRun({text:"City of David",bold:true,size:26,color:BRASS,font:"Georgia"})]}),
  new Paragraph({spacing:{after:160},children:[new TextRun({text:"Here we go on another spontaneous trip across the globe and down to the site.",size:23,color:INK,font:"Georgia"})]}),
  new Paragraph({alignment:AlignmentType.CENTER,spacing:{before:140,after:180},children:[new ImageRun({type:"jpg",data:Buffer.from(b.dataUrl.split(",")[1],"base64"),transformation:{width:dispW,height:dispH}})]}),
  new Paragraph({spacing:{after:160},children:[new TextRun({text:"More text after the figure continues the entry below the photo.",size:23,color:INK,font:"Georgia"})]})];
const doc=new Document({sections:[{properties:{page:{margin:{top:900,bottom:900,left:1000,right:1000}}},children:kids}]});
fs.writeFileSync("/tmp/baked.docx",await Packer.toBuffer(doc));console.log("built");
