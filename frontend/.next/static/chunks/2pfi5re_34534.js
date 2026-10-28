(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,19994,e=>{"use strict";var t=e.i(43476),a=e.i(71645),r=e.i(22016),s=e.i(24071),n=e.i(94996),o=e.i(89890),d=e.i(5050),l=e.i(13589),i=e.i(54858),c=e.i(91392),m=e.i(18542),x=e.i(6356);e.s(["default",0,function({params:e}){let{id:u}=(0,a.use)(e),[p,f]=(0,a.useState)(null),[h,b]=(0,a.useState)(null),[g,y]=(0,a.useState)(!0),k=(0,a.useCallback)(async()=>{try{f(await i.api.get(`/coupons/${u}`)),b(null)}catch(e){b(e instanceof Error?e.message:"Could not load the coupon")}finally{y(!1)}},[u]);(0,a.useEffect)(()=>{k()},[k]);let v=[{data:"order_number",title:"Order",sortable:!0,render:e=>e.order_id?`<a href="/admin/orders/${e.order_id}" class="font-semibold text-clay-700 hover:underline dark:text-clay-400">${(0,m.text)(e.order_number??"—")}</a>`:`<span class="text-xs">${(0,m.text)(e.order_number??"Deleted order")}</span>`,exportValue:e=>e.order_number??""},{data:"customer_name",title:"Customer",sortable:!0,render:e=>e.user_id?`<a href="/admin/customers/${e.user_id}" class="text-xs font-medium text-sand-800 hover:text-clay-700 dark:text-sand-100 dark:hover:text-clay-400">${(0,m.text)(e.customer_name??"Unknown")}</a>`:`<span class="text-xs text-muted">${(0,m.text)(e.customer_name??"Guest")}</span>`,exportValue:e=>e.customer_name??""},{data:"customer_email",title:"Email",sortable:!0,render:e=>`<span class="text-xs text-muted">${(0,m.text)(e.customer_email)}</span>`,exportValue:e=>e.customer_email??""},{data:"discount_amount",title:"Discount",sortable:!0,className:"text-right",headerClassName:"text-right",render:e=>`<span class="font-semibold text-emerald-600 dark:text-emerald-400">− ${(0,m.money)(e.discount_amount)}</span>`,exportValue:e=>(0,c.num)(e.discount_amount)},{data:"created_at",title:"Redeemed",sortable:!0,render:e=>`<span class="text-xs text-muted">${(0,m.text)((0,c.formatDateTime)(e.created_at))}</span>`,exportValue:e=>e.created_at}];if(g)return(0,t.jsx)(l.PageSpinner,{label:"Loading coupon…"});if(h||!p)return(0,t.jsx)(d.Card,{children:(0,t.jsx)(d.CardBody,{children:(0,t.jsx)(l.ErrorState,{title:"The coupon could not load",description:h??void 0,onRetry:()=>void k()})})});let j=(0,c.num)(p.usage_percent);return(0,t.jsxs)("div",{className:"flex flex-col gap-6",children:[(0,t.jsxs)("div",{className:"flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",children:[(0,t.jsxs)("div",{children:[(0,t.jsxs)("div",{className:"flex flex-wrap items-center gap-2",children:[(0,t.jsx)("code",{className:"rounded-md bg-[var(--surface-sunken)] px-2 py-1 font-mono text-sm font-semibold tracking-wide text-clay-700 dark:text-clay-400",children:p.code}),(0,t.jsx)(o.Badge,{className:"active"===p.status?"bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300":"bg-sand-100 text-sand-600 dark:bg-walnut-800 dark:text-sand-400",children:"active"===p.status?"Active":"expired"===p.status?"Expired":"Inactive"})]}),(0,t.jsx)("h1",{className:"mt-2 font-display text-xl font-semibold text-sand-900 dark:text-sand-50",children:"Redemptions"}),(0,t.jsxs)("p",{className:"mt-1 text-sm text-muted",children:["percentage"===p.type?`${(0,c.num)(p.value)}% off`:`${(0,c.formatMoney)(p.value,"PHP")} off`,(0,c.num)(p.minimum_order)>0?` on orders over ${(0,c.formatMoney)(p.minimum_order,"PHP")}`:""," ","· ",(0,c.formatNumber)(p.used_count)," of"," ",p.usage_limit?(0,c.formatNumber)(p.usage_limit):"∞"," used (",j.toFixed(0),"%)"]})]}),(0,t.jsxs)(r.default,{href:"/admin/coupons",className:"inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-sand-600 transition-colors hover:text-clay-700 dark:text-sand-300",children:[(0,t.jsx)(s.ChevronLeft,{className:"size-4","aria-hidden":!0}),"Back to coupons"]})]}),(0,t.jsxs)(d.Card,{children:[(0,t.jsx)(d.CardHeader,{title:"Who used it",description:`Every order this discount was applied to at ${x.BRAND.name}.`}),(0,t.jsx)(d.CardBody,{className:"p-0",children:(0,t.jsx)(n.DataTable,{id:`coupon-usages-${u}`,endpoint:`/coupons/${u}/usages`,columns:v,exportName:`${p.code}-redemptions`,exportTitle:`Redemptions for ${p.code}`,searchPlaceholder:"Search order or customer…",emptyMessage:"This coupon has not been redeemed yet.",actions:()=>[]})})]})]})}])},89890,e=>{"use strict";var t=e.i(43476),a=e.i(33209);e.s(["Badge",0,function({children:e,className:r,variant:s="neutral"}){return(0,t.jsx)("span",{className:(0,a.cn)("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",{neutral:"bg-sand-100 text-sand-700 dark:bg-walnut-800 dark:text-sand-300",brand:"bg-clay-100 text-clay-800 dark:bg-clay-500/15 dark:text-clay-300",success:"bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",warning:"bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",danger:"bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300",info:"bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300"}[s],r),children:e})}])},5050,e=>{"use strict";var t=e.i(43476),a=e.i(33209);e.s(["Card",0,function({className:e,children:r,...s}){return(0,t.jsx)("div",{className:(0,a.cn)("surface-card",e),...s,children:r})},"CardBody",0,function({className:e,children:r,...s}){return(0,t.jsx)("div",{className:(0,a.cn)("p-5",e),...s,children:r})},"CardHeader",0,function({title:e,description:r,action:s,className:n,children:o}){return(0,t.jsxs)("div",{className:(0,a.cn)("flex flex-wrap items-start justify-between gap-3 border-b border-[var(--border-subtle)] px-5 py-4",n),children:[o??(0,t.jsxs)("div",{className:"flex flex-col gap-0.5",children:[e?(0,t.jsx)("h3",{className:"text-sm font-semibold text-sand-900 dark:text-sand-100",children:e}):null,r?(0,t.jsx)("p",{className:"text-xs text-muted",children:r}):null]}),s?(0,t.jsx)("div",{className:"flex shrink-0 items-center gap-2",children:s}):null]})},"DetailItem",0,function({label:e,value:r,className:s}){return(0,t.jsxs)("div",{className:(0,a.cn)("flex flex-col gap-0.5",s),children:[(0,t.jsx)("dt",{className:"text-[0.7rem] font-semibold uppercase tracking-wide text-muted",children:e}),(0,t.jsx)("dd",{className:"text-sm text-sand-900 dark:text-sand-100",children:r??"—"})]})},"PageHeader",0,function({title:e,description:r,actions:s,breadcrumbs:n,className:o}){return(0,t.jsxs)("div",{className:(0,a.cn)("flex flex-wrap items-end justify-between gap-4",o),children:[(0,t.jsxs)("div",{className:"flex min-w-0 flex-col gap-1",children:[n,(0,t.jsx)("h1",{className:"truncate font-display text-2xl font-semibold tracking-tight text-sand-900 dark:text-sand-50",children:e}),r?(0,t.jsx)("p",{className:"text-sm text-muted",children:r}):null]}),s?(0,t.jsx)("div",{className:"flex flex-wrap items-center gap-2",children:s}):null]})}])},24071,e=>{"use strict";var t=e.i(56420);let a={name:"chevron-left",size:24,node:[["path",{d:"m15 18-6-6 6-6",key:"1wnfg3"}]]};a.node;let r=(0,t.default)(a);e.s(["ChevronLeft",0,r],24071)},77043,56114,e=>{"use strict";var t=e.i(56420);let a={name:"printer",size:24,node:[["path",{d:"M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2",key:"143wyd"}],["path",{d:"M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6",key:"1itne7"}],["rect",{x:"6",y:"14",width:"12",height:"8",rx:"1",key:"1ue0tg"}]]};a.node;let r=(0,t.default)(a);function s(e,t){return[t.map(e=>e.header),...e.map(e=>t.map(t=>{let a;return null==(a=t.value?t.value(e):e[t.key])?"":"boolean"==typeof a?a?"Yes":"No":String(a)}))]}function n(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function o(e,t){let a=URL.createObjectURL(e),r=document.createElement("a");r.href=a,r.download=t,document.body.appendChild(r),r.click(),r.remove(),setTimeout(()=>URL.revokeObjectURL(a),1e3)}function d(){return new Date().toISOString().slice(0,10)}function l(e){let t=document.createElement("iframe");t.setAttribute("aria-hidden","true"),t.style.cssText="position:fixed;right:0;bottom:0;width:0;height:0;border:0;",document.body.appendChild(t);let a=()=>{setTimeout(()=>t.remove(),500)};t.onload=()=>{let e=t.contentWindow;e&&(e.focus(),e.print()),a()};let r=t.contentDocument;r?(r.open(),r.write(e),r.close()):a()}e.s(["Printer",0,r],77043),e.s(["exportRows",0,function(e,t,a,r){let{filename:i,title:c,subtitle:m=`${e.length} records`}=r,x=i.replace(/[^a-z0-9_-]+/gi,"-").toLowerCase();switch(a){case"csv":let u;o(new Blob([`\uFEFF${(u=e=>{let t=/^[=+\-@]/.test(e)?`'${e}`:e;return/[",\n\r]/.test(t)?`"${t.replace(/"/g,'""')}"`:t},s(e,t).map(e=>e.map(u).join(",")).join("\r\n"))}`],{type:"text/csv;charset=utf-8;"}),`${x}-${d()}.csv`);break;case"excel":o(new Blob([function(e,t,a){let[r,...o]=s(e,t);return`<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:x="urn:schemas-microsoft-com:office:excel"
      xmlns="http://www.w3.org/TR/REC-html40">
  <head>
    <meta charset="utf-8" />
    <!--[if gte mso 9]><xml>
      <x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
        <x:Name>${n(a).slice(0,31)}</x:Name>
        <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
      </x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook>
    </xml><![endif]-->
    <style>
      table { border-collapse: collapse; font-family: Calibri, Arial, sans-serif; font-size: 11pt; }
      th { background: #c2542b; color: #fff; font-weight: bold; }
      th, td { border: 1px solid #d3ccbd; padding: 6px 10px; vertical-align: top; }
      tr:nth-child(even) td { background: #faf9f7; }
    </style>
  </head>
  <body>
    <h3>${n(a)}</h3>
    <table>
      <thead><tr>${r.map(e=>`<th>${n(e)}</th>`).join("")}</tr></thead>
      <tbody>
        ${o.map(e=>`<tr>${e.map(e=>/^-?\d+(\.\d+)?$/.test(e.replace(/,/g,""))?`<td>${n(e.replace(/,/g,""))}</td>`:`<td>${n(e)}</td>`).join("")}</tr>`).join("")}
      </tbody>
    </table>
  </body>
</html>`}(e,t,c)],{type:"application/vnd.ms-excel;charset=utf-8;"}),`${x}-${d()}.xls`);break;case"json":o(new Blob([JSON.stringify(e,null,2)],{type:"application/json"}),`${x}-${d()}.json`);break;case"pdf":case"print":l(function(e,t,a,r){let[o,...d]=s(e,t);return`<!doctype html>
<html><head><meta charset="utf-8" /><title>${n(a)}</title>
<style>
  @page { size: A4 landscape; margin: 14mm; }
  * { box-sizing: border-box; }
  body { font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;
         color: #211d19; margin: 0; }
  header { display: flex; align-items: flex-end; justify-content: space-between;
           border-bottom: 2px solid #c2542b; padding-bottom: 10px; margin-bottom: 16px; }
  h1 { font-size: 17px; margin: 0; }
  .sub { font-size: 11px; color: #7d6f5c; margin-top: 4px; }
  .brand { font-size: 13px; font-weight: 700; color: #c2542b; letter-spacing: .04em; }
  table { width: 100%; border-collapse: collapse; font-size: 10px; }
  th { background: #f3f1ec; text-align: left; text-transform: uppercase;
       letter-spacing: .05em; font-size: 9px; color: #665a4b;
       padding: 7px 8px; border-bottom: 1px solid #d3ccbd; }
  td { padding: 7px 8px; border-bottom: 1px solid #e6e2d9; vertical-align: top; }
  tr:nth-child(even) td { background: #faf9f7; }
  footer { margin-top: 14px; font-size: 9px; color: #968873; }
</style></head>
<body>
  <header>
    <div>
      <h1>${n(a)}</h1>
      <div class="sub">${n(r)} \xb7 ${e.length} record${1===e.length?"":"s"}</div>
    </div>
    <div class="brand">LUMERA HOME</div>
  </header>
  <table>
    <thead><tr>${o.map(e=>`<th>${n(e)}</th>`).join("")}</tr></thead>
    <tbody>${d.map(e=>`<tr>${e.map(e=>`<td>${n(e)}</td>`).join("")}</tr>`).join("")}</tbody>
  </table>
  <footer>Generated ${new Date().toLocaleString("en-PH")}</footer>
</body></html>`}(e,t,c,m))}},"printElement",0,function(e){e&&l(`<!doctype html><html><head><meta charset="utf-8" />
    <style>
      @page { size: A4; margin: 14mm; }
      body { font-family: ui-sans-serif, system-ui, sans-serif; color: #211d19; margin: 0; }
      img { max-width: 100%; }
      table { width: 100%; border-collapse: collapse; font-size: 11px; }
      th, td { padding: 6px 8px; border-bottom: 1px solid #e6e2d9; text-align: left; }
      .print-hidden, button, .no-print { display: none !important; }
    </style></head><body>${e.outerHTML}</body></html>`)}],56114)}]);