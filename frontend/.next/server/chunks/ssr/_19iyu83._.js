module.exports=[6487,a=>{"use strict";var b=a.i(87924),c=a.i(72131),d=a.i(38246),e=a.i(7963),f=a.i(62765),g=a.i(34048),h=a.i(34904),i=a.i(2626),j=a.i(53250),k=a.i(81926),l=a.i(8210),m=a.i(36676);a.s(["default",0,function({params:a}){let{id:n}=(0,c.use)(a),[o,p]=(0,c.useState)(null),[q,r]=(0,c.useState)(null),[s,t]=(0,c.useState)(!0),u=(0,c.useCallback)(async()=>{try{p(await j.api.get(`/coupons/${n}`)),r(null)}catch(a){r(a instanceof Error?a.message:"Could not load the coupon")}finally{t(!1)}},[n]);(0,c.useEffect)(()=>{u()},[u]);let v=[{data:"order_number",title:"Order",sortable:!0,render:a=>a.order_id?`<a href="/admin/orders/${a.order_id}" class="font-semibold text-clay-700 hover:underline dark:text-clay-400">${(0,l.text)(a.order_number??"—")}</a>`:`<span class="text-xs">${(0,l.text)(a.order_number??"Deleted order")}</span>`,exportValue:a=>a.order_number??""},{data:"customer_name",title:"Customer",sortable:!0,render:a=>a.user_id?`<a href="/admin/customers/${a.user_id}" class="text-xs font-medium text-sand-800 hover:text-clay-700 dark:text-sand-100 dark:hover:text-clay-400">${(0,l.text)(a.customer_name??"Unknown")}</a>`:`<span class="text-xs text-muted">${(0,l.text)(a.customer_name??"Guest")}</span>`,exportValue:a=>a.customer_name??""},{data:"customer_email",title:"Email",sortable:!0,render:a=>`<span class="text-xs text-muted">${(0,l.text)(a.customer_email)}</span>`,exportValue:a=>a.customer_email??""},{data:"discount_amount",title:"Discount",sortable:!0,className:"text-right",headerClassName:"text-right",render:a=>`<span class="font-semibold text-emerald-600 dark:text-emerald-400">− ${(0,l.money)(a.discount_amount)}</span>`,exportValue:a=>(0,k.num)(a.discount_amount)},{data:"created_at",title:"Redeemed",sortable:!0,render:a=>`<span class="text-xs text-muted">${(0,l.text)((0,k.formatDateTime)(a.created_at))}</span>`,exportValue:a=>a.created_at}];if(s)return(0,b.jsx)(i.PageSpinner,{label:"Loading coupon…"});if(q||!o)return(0,b.jsx)(h.Card,{children:(0,b.jsx)(h.CardBody,{children:(0,b.jsx)(i.ErrorState,{title:"The coupon could not load",description:q??void 0,onRetry:()=>void u()})})});let w=(0,k.num)(o.usage_percent);return(0,b.jsxs)("div",{className:"flex flex-col gap-6",children:[(0,b.jsxs)("div",{className:"flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",children:[(0,b.jsxs)("div",{children:[(0,b.jsxs)("div",{className:"flex flex-wrap items-center gap-2",children:[(0,b.jsx)("code",{className:"rounded-md bg-[var(--surface-sunken)] px-2 py-1 font-mono text-sm font-semibold tracking-wide text-clay-700 dark:text-clay-400",children:o.code}),(0,b.jsx)(g.Badge,{className:"active"===o.status?"bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300":"bg-sand-100 text-sand-600 dark:bg-walnut-800 dark:text-sand-400",children:"active"===o.status?"Active":"expired"===o.status?"Expired":"Inactive"})]}),(0,b.jsx)("h1",{className:"mt-2 font-display text-xl font-semibold text-sand-900 dark:text-sand-50",children:"Redemptions"}),(0,b.jsxs)("p",{className:"mt-1 text-sm text-muted",children:["percentage"===o.type?`${(0,k.num)(o.value)}% off`:`${(0,k.formatMoney)(o.value,"PHP")} off`,(0,k.num)(o.minimum_order)>0?` on orders over ${(0,k.formatMoney)(o.minimum_order,"PHP")}`:""," ","· ",(0,k.formatNumber)(o.used_count)," of"," ",o.usage_limit?(0,k.formatNumber)(o.usage_limit):"∞"," used (",w.toFixed(0),"%)"]})]}),(0,b.jsxs)(d.default,{href:"/admin/coupons",className:"inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-sand-600 transition-colors hover:text-clay-700 dark:text-sand-300",children:[(0,b.jsx)(e.ChevronLeft,{className:"size-4","aria-hidden":!0}),"Back to coupons"]})]}),(0,b.jsxs)(h.Card,{children:[(0,b.jsx)(h.CardHeader,{title:"Who used it",description:`Every order this discount was applied to at ${m.BRAND.name}.`}),(0,b.jsx)(h.CardBody,{className:"p-0",children:(0,b.jsx)(f.DataTable,{id:`coupon-usages-${n}`,endpoint:`/coupons/${n}/usages`,columns:v,exportName:`${o.code}-redemptions`,exportTitle:`Redemptions for ${o.code}`,searchPlaceholder:"Search order or customer…",emptyMessage:"This coupon has not been redeemed yet.",actions:()=>[]})})]})]})}])},34048,a=>{"use strict";var b=a.i(87924),c=a.i(69767);a.s(["Badge",0,function({children:a,className:d,variant:e="neutral"}){return(0,b.jsx)("span",{className:(0,c.cn)("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",{neutral:"bg-sand-100 text-sand-700 dark:bg-walnut-800 dark:text-sand-300",brand:"bg-clay-100 text-clay-800 dark:bg-clay-500/15 dark:text-clay-300",success:"bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",warning:"bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",danger:"bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300",info:"bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300"}[e],d),children:a})}])},34904,a=>{"use strict";var b=a.i(87924),c=a.i(69767);a.s(["Card",0,function({className:a,children:d,...e}){return(0,b.jsx)("div",{className:(0,c.cn)("surface-card",a),...e,children:d})},"CardBody",0,function({className:a,children:d,...e}){return(0,b.jsx)("div",{className:(0,c.cn)("p-5",a),...e,children:d})},"CardHeader",0,function({title:a,description:d,action:e,className:f,children:g}){return(0,b.jsxs)("div",{className:(0,c.cn)("flex flex-wrap items-start justify-between gap-3 border-b border-[var(--border-subtle)] px-5 py-4",f),children:[g??(0,b.jsxs)("div",{className:"flex flex-col gap-0.5",children:[a?(0,b.jsx)("h3",{className:"text-sm font-semibold text-sand-900 dark:text-sand-100",children:a}):null,d?(0,b.jsx)("p",{className:"text-xs text-muted",children:d}):null]}),e?(0,b.jsx)("div",{className:"flex shrink-0 items-center gap-2",children:e}):null]})},"DetailItem",0,function({label:a,value:d,className:e}){return(0,b.jsxs)("div",{className:(0,c.cn)("flex flex-col gap-0.5",e),children:[(0,b.jsx)("dt",{className:"text-[0.7rem] font-semibold uppercase tracking-wide text-muted",children:a}),(0,b.jsx)("dd",{className:"text-sm text-sand-900 dark:text-sand-100",children:d??"—"})]})},"PageHeader",0,function({title:a,description:d,actions:e,breadcrumbs:f,className:g}){return(0,b.jsxs)("div",{className:(0,c.cn)("flex flex-wrap items-end justify-between gap-4",g),children:[(0,b.jsxs)("div",{className:"flex min-w-0 flex-col gap-1",children:[f,(0,b.jsx)("h1",{className:"truncate font-display text-2xl font-semibold tracking-tight text-sand-900 dark:text-sand-50",children:a}),d?(0,b.jsx)("p",{className:"text-sm text-muted",children:d}):null]}),e?(0,b.jsx)("div",{className:"flex flex-wrap items-center gap-2",children:e}):null]})}])},7963,a=>{"use strict";var b=a.i(64831);let c={name:"chevron-left",size:24,node:[["path",{d:"m15 18-6-6 6-6",key:"1wnfg3"}]]};c.node;let d=(0,b.default)(c);a.s(["ChevronLeft",0,d],7963)},88444,74221,a=>{"use strict";var b=a.i(64831);let c={name:"printer",size:24,node:[["path",{d:"M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2",key:"143wyd"}],["path",{d:"M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6",key:"1itne7"}],["rect",{x:"6",y:"14",width:"12",height:"8",rx:"1",key:"1ue0tg"}]]};c.node;let d=(0,b.default)(c);function e(a,b){return[b.map(a=>a.header),...a.map(a=>b.map(b=>{let c;return null==(c=b.value?b.value(a):a[b.key])?"":"boolean"==typeof c?c?"Yes":"No":String(c)}))]}function f(a){return a.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function g(a,b){let c=URL.createObjectURL(a),d=document.createElement("a");d.href=c,d.download=b,document.body.appendChild(d),d.click(),d.remove(),setTimeout(()=>URL.revokeObjectURL(c),1e3)}function h(){return new Date().toISOString().slice(0,10)}function i(a){let b=document.createElement("iframe");b.setAttribute("aria-hidden","true"),b.style.cssText="position:fixed;right:0;bottom:0;width:0;height:0;border:0;",document.body.appendChild(b);let c=()=>{setTimeout(()=>b.remove(),500)};b.onload=()=>{let a=b.contentWindow;a&&(a.focus(),a.print()),c()};let d=b.contentDocument;d?(d.open(),d.write(a),d.close()):c()}a.s(["Printer",0,d],88444),a.s(["exportRows",0,function(a,b,c,d){let{filename:j,title:k,subtitle:l=`${a.length} records`}=d,m=j.replace(/[^a-z0-9_-]+/gi,"-").toLowerCase();switch(c){case"csv":let n;g(new Blob([`\uFEFF${(n=a=>{let b=/^[=+\-@]/.test(a)?`'${a}`:a;return/[",\n\r]/.test(b)?`"${b.replace(/"/g,'""')}"`:b},e(a,b).map(a=>a.map(n).join(",")).join("\r\n"))}`],{type:"text/csv;charset=utf-8;"}),`${m}-${h()}.csv`);break;case"excel":g(new Blob([function(a,b,c){let[d,...g]=e(a,b);return`<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:x="urn:schemas-microsoft-com:office:excel"
      xmlns="http://www.w3.org/TR/REC-html40">
  <head>
    <meta charset="utf-8" />
    <!--[if gte mso 9]><xml>
      <x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
        <x:Name>${f(c).slice(0,31)}</x:Name>
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
    <h3>${f(c)}</h3>
    <table>
      <thead><tr>${d.map(a=>`<th>${f(a)}</th>`).join("")}</tr></thead>
      <tbody>
        ${g.map(a=>`<tr>${a.map(a=>/^-?\d+(\.\d+)?$/.test(a.replace(/,/g,""))?`<td>${f(a.replace(/,/g,""))}</td>`:`<td>${f(a)}</td>`).join("")}</tr>`).join("")}
      </tbody>
    </table>
  </body>
</html>`}(a,b,k)],{type:"application/vnd.ms-excel;charset=utf-8;"}),`${m}-${h()}.xls`);break;case"json":g(new Blob([JSON.stringify(a,null,2)],{type:"application/json"}),`${m}-${h()}.json`);break;case"pdf":case"print":i(function(a,b,c,d){let[g,...h]=e(a,b);return`<!doctype html>
<html><head><meta charset="utf-8" /><title>${f(c)}</title>
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
      <h1>${f(c)}</h1>
      <div class="sub">${f(d)} \xb7 ${a.length} record${1===a.length?"":"s"}</div>
    </div>
    <div class="brand">LUMERA HOME</div>
  </header>
  <table>
    <thead><tr>${g.map(a=>`<th>${f(a)}</th>`).join("")}</tr></thead>
    <tbody>${h.map(a=>`<tr>${a.map(a=>`<td>${f(a)}</td>`).join("")}</tr>`).join("")}</tbody>
  </table>
  <footer>Generated ${new Date().toLocaleString("en-PH")}</footer>
</body></html>`}(a,b,k,l))}},"printElement",0,function(a){a&&i(`<!doctype html><html><head><meta charset="utf-8" />
    <style>
      @page { size: A4; margin: 14mm; }
      body { font-family: ui-sans-serif, system-ui, sans-serif; color: #211d19; margin: 0; }
      img { max-width: 100%; }
      table { width: 100%; border-collapse: collapse; font-size: 11px; }
      th, td { padding: 6px 8px; border-bottom: 1px solid #e6e2d9; text-align: left; }
      .print-hidden, button, .no-print { display: none !important; }
    </style></head><body>${a.outerHTML}</body></html>`)}],74221)}];

//# sourceMappingURL=_19iyu83._.js.map