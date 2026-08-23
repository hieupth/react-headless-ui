(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[5841],{828:(e,t,s)=>{"use strict";s.d(t,{X:()=>o});var n=s(25454);function o({props:e}){return 0===e.length?(0,n.jsx)("p",{className:"docs-desc",children:"No props."}):(0,n.jsx)("div",{className:"props-table-wrap",children:(0,n.jsxs)("table",{className:"props-table",children:[(0,n.jsx)("thead",{children:(0,n.jsxs)("tr",{children:[(0,n.jsx)("th",{scope:"col",children:"Name"}),(0,n.jsx)("th",{scope:"col",children:"Type"}),(0,n.jsx)("th",{scope:"col",children:"Default"}),(0,n.jsx)("th",{scope:"col",children:"Description"})]})}),(0,n.jsx)("tbody",{children:e.map(e=>(0,n.jsxs)("tr",{children:[(0,n.jsx)("td",{className:"props-name",children:e.name}),(0,n.jsx)("td",{className:"props-type",children:e.type}),(0,n.jsx)("td",{className:"props-default",children:e.default??"—"}),(0,n.jsx)("td",{children:e.description})]},e.name))})]})})}},4956:(e,t,s)=>{"use strict";s.d(t,{CodeBlock:()=>i});var n=s(25454),o=s(89918),a=s(17521);function i({code:e,language:t="tsx"}){let[s,r]=(0,o.useState)(""),[c,l]=(0,o.useState)(!1);async function d(){try{await navigator.clipboard.writeText(e),l(!0),setTimeout(()=>l(!1),1500)}catch{}}return(0,o.useEffect)(()=>{let s=!1;return(0,a.Yz)(e,{lang:t,theme:"github-dark"}).then(e=>{s||r(e)}).catch(()=>{s||r("")}),()=>{s=!0}},[e,t]),(0,n.jsxs)("div",{className:"code-block",children:[(0,n.jsx)("button",{type:"button",onClick:d,className:"code-copy","aria-label":"Copy code",children:c?"Copied!":"Copy"}),s?(0,n.jsx)("div",{className:"overflow-x-auto [&>pre]:!m-0 [&>pre]:!bg-transparent [&>pre]:p-4",dangerouslySetInnerHTML:{__html:s}}):(0,n.jsx)("pre",{className:"overflow-x-auto p-4",style:{background:"#0d1117",color:"#f3f4f6"},children:(0,n.jsx)("code",{children:e})})]})}},26268:(e,t,s)=>{"use strict";s.r(t),s.d(t,{default:()=>c});var n=s(25454),o=s(89918),a=s(29912),i=s(55782),r=s(828);function c(){let[e,t]=(0,o.useState)(!1),[s,c]=(0,o.useState)(!1);return(0,n.jsxs)("div",{className:"docs-page",children:[(0,n.jsxs)("header",{className:"docs-header",children:[(0,n.jsx)("h1",{className:"docs-h1",children:"AlertDialog"}),(0,n.jsxs)("p",{className:"docs-lead",children:["A confirmation dialog backed by the headless"," ",(0,n.jsx)("code",{className:"docs-code",children:"useAlertDialog"})," hook. Unlike a plain Dialog it is purpose-built for destructive or blocking decisions: it forces attention with three severity variants —"," ",(0,n.jsx)("code",{children:"default"}),", ",(0,n.jsx)("code",{children:"warning"}),","," ",(0,n.jsx)("code",{children:"destructive"})," — supports an async"," ",(0,n.jsx)("code",{children:"onConfirm"}),", and renders through a portal to"," ",(0,n.jsx)("code",{className:"docs-code",children:"document.body"}),". Theme the emitted class hooks or pass a ",(0,n.jsx)("code",{children:"children"})," render function for full control."]})]}),(0,n.jsxs)("section",{className:"docs-section",children:[(0,n.jsx)("h2",{className:"docs-h2",children:"Destructive confirmation"}),(0,n.jsxs)("p",{className:"docs-desc",children:[(0,n.jsx)("code",{children:'variant="destructive"'})," styles the confirm action as a danger button; ",(0,n.jsx)("code",{children:"showCancel"})," toggles the cancel affordance."]}),(0,n.jsxs)(i.Demo,{code:`const [open, setOpen] = useState(false);

<button
  type="button"
  onClick={() => setOpen(true)}
  className="inline-flex items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
>
  Delete account
</button>

{/* AlertDialog portals to document.body. Theme the emitted
    alertdialog-overlay / alertdialog-content class hooks:
      .alertdialog-overlay  { @apply fixed inset-0 z-50 bg-black/50; }
      .alertdialog-content  { @apply w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-900 dark:text-gray-100; } */}
<AlertDialog
  open={open}
  onOpenChange={setOpen}
  variant="destructive"
  title="Delete account"
  description="This permanently erases your data."
  confirmText="Delete account"
  cancelText="Keep account"
  onConfirm={async () => { await api.delete(); }}
/>`,children:[(0,n.jsx)("button",{type:"button",onClick:()=>t(!0),className:"inline-flex items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700",children:"Delete account"}),(0,n.jsx)(a.L,{open:e,onOpenChange:t,variant:"destructive",title:"Delete account",description:"This permanently erases your data.",confirmText:"Delete account",cancelText:"Keep account",onConfirm:()=>t(!1)})]})]}),(0,n.jsxs)("section",{className:"docs-section",children:[(0,n.jsx)("h2",{className:"docs-h2",children:"With trigger & async confirm"}),(0,n.jsxs)("p",{className:"docs-desc",children:[(0,n.jsx)("code",{children:"AlertDialogTrigger"})," wires a button to open the dialog.",(0,n.jsx)("code",{children:"onConfirm"})," may be async — the dialog stays open until the promise resolves."]}),(0,n.jsx)(i.Demo,{code:`const [publishOpen, setPublishOpen] = useState(false);

<AlertDialogTrigger
  onClick={() => setPublishOpen(true)}
  className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
>
  Publish release
</AlertDialogTrigger>

<AlertDialog
  open={publishOpen}
  onOpenChange={setPublishOpen}
  title="Publish release?"
  confirmText="Publish"
  onConfirm={async () => {
    await publishRelease(); // dialog stays open until the promise resolves
    setPublishOpen(false);
  }}
>
  {({ state, confirmButtonProps, cancelButtonProps }) => (
    <div className="dialog-card">
      <h3>Publish release?</h3>
      <button {...cancelButtonProps}>Cancel</button>
      <button {...confirmButtonProps}>
        {state.confirming ? 'Publishing…' : 'Publish'}
      </button>
    </div>
  )}
</AlertDialog>`,children:(0,n.jsxs)("div",{className:"flex flex-col items-center gap-3",children:[(0,n.jsx)(a.t,{onClick:()=>c(!0),className:"inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700",children:"Publish release"}),(0,n.jsx)(a.L,{open:s,onOpenChange:c,title:"Publish release?",description:"The changelog becomes visible to everyone immediately.",confirmText:"Publish",cancelText:"Cancel",onConfirm:async()=>{await new Promise(e=>setTimeout(e,800)),c(!1)},children:({state:e,confirmButtonProps:t,cancelButtonProps:s})=>(0,n.jsxs)("div",{className:"w-full max-w-sm rounded-lg border border-gray-200 bg-white p-5 text-left shadow-lg dark:border-gray-700 dark:bg-gray-900",children:[(0,n.jsx)("h3",{className:"docs-h3",children:"Publish release?"}),(0,n.jsx)("p",{className:"mt-1 text-sm text-gray-600 dark:text-gray-400",children:"The changelog becomes visible to everyone immediately."}),(0,n.jsxs)("div",{className:"mt-4 flex justify-end gap-2",children:[(0,n.jsx)("button",{...s,className:"rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800",children:"Cancel"}),(0,n.jsx)("button",{...t,className:"rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60",children:e.confirming?"Publishing…":"Publish"})]})]})}),(0,n.jsxs)("span",{className:"text-xs text-gray-500",children:["The render-prop ",(0,n.jsx)("code",{children:"children"})," receives"," ",(0,n.jsx)("code",{children:"confirmButtonProps"})," /"," ",(0,n.jsx)("code",{children:"cancelButtonProps"})," (aria + handlers) for custom layouts. ",(0,n.jsx)("code",{children:"onConfirm"}),"awaits an 800\xa0ms promise — the confirm button shows the busy state until it resolves."]})]})})]}),(0,n.jsxs)("section",{className:"docs-section",children:[(0,n.jsx)("h2",{className:"docs-h2",children:"Props"}),(0,n.jsx)(r.X,{props:[{name:"open",type:"boolean",default:"—",description:"Controlled visibility."},{name:"onOpenChange",type:"(open: boolean) => void",default:"—",description:"Visibility change callback."},{name:"title",type:"ReactNode",default:"—",description:"Required dialog heading (auto-announced)."},{name:"description",type:"ReactNode",default:"—",description:"Supporting body text."},{name:"variant",type:"'default' | 'destructive' | 'warning'",default:"'default'",description:"Severity; drives confirm button styling."},{name:"confirmText / cancelText",type:"string",default:"'Confirm' / 'Cancel'",description:"Action button labels."},{name:"onConfirm",type:"() => void | Promise<void>",default:"—",description:"Async confirm handler; dialog awaits resolution."},{name:"onCancel",type:"() => void",default:"—",description:"Cancel handler."},{name:"showCancel",type:"boolean",default:"true",description:"Whether to render the cancel button."},{name:"children",type:"(renderArgs) => ReactNode",default:"—",description:"Render-prop for fully custom content/buttons."}]})]})]})}},55782:(e,t,s)=>{"use strict";s.d(t,{Demo:()=>i});var n=s(25454),o=s(89918),a=s(4956);function i({code:e,children:t}){let[s,r]=(0,o.useState)(!1),[c,l]=(0,o.useState)(!1),d=(0,o.useId)();return(0,n.jsxs)("div",{className:"demo-frame",children:[(0,n.jsxs)("div",{className:"demo-toolbar",children:[(0,n.jsx)("span",{className:"demo-label",children:"Preview"}),(0,n.jsx)("button",{type:"button",onClick:()=>{r(e=>!e),l(!0)},className:"demo-toggle","aria-expanded":s,"aria-controls":d,children:s?"Hide Code":"Show Code"})]}),(0,n.jsx)("div",{className:"demo-canvas",children:t}),(0,n.jsx)("div",{id:d,className:"demo-code-panel",hidden:!s,children:c&&(0,n.jsx)(a.CodeBlock,{code:e})})]})}},73438:(e,t,s)=>{Promise.resolve().then(s.bind(s,26268))}},e=>{e.O(0,[7521,7531,6741,3948,7358],()=>e(e.s=73438)),_N_E=e.O()}]);