(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[5841],{26268:(e,t,n)=>{"use strict";n.r(t),n.d(t,{default:()=>c});var o=n(25454),a=n(89918),s=n(21887),r=n(55782),i=n(828);function c(){let[e,t]=(0,a.useState)(!1);return(0,o.jsxs)("div",{className:"mx-auto max-w-3xl px-6 py-12 space-y-8",children:[(0,o.jsxs)("header",{className:"space-y-3",children:[(0,o.jsx)("h1",{className:"text-3xl font-bold",children:"AlertDialog"}),(0,o.jsxs)("p",{className:"text-gray-600 dark:text-gray-400",children:["A confirmation dialog backed by the headless"," ",(0,o.jsx)("code",{className:"font-mono text-sm",children:"useAlertDialog"})," hook. Unlike a plain Dialog it is purpose-built for destructive or blocking decisions: it forces attention with three severity variants —"," ",(0,o.jsx)("code",{children:"default"}),", ",(0,o.jsx)("code",{children:"warning"}),","," ",(0,o.jsx)("code",{children:"destructive"})," — supports an async"," ",(0,o.jsx)("code",{children:"onConfirm"}),", and renders through a portal to"," ",(0,o.jsx)("code",{className:"font-mono text-sm",children:"document.body"}),". Theme the emitted class hooks or pass a ",(0,o.jsx)("code",{children:"children"})," render function for full control."]})]}),(0,o.jsxs)("section",{className:"space-y-4",children:[(0,o.jsx)("h2",{className:"text-xl font-semibold",children:"Destructive confirmation"}),(0,o.jsxs)("p",{className:"text-sm text-gray-600 dark:text-gray-400",children:[(0,o.jsx)("code",{children:'variant="destructive"'})," styles the confirm action as a danger button; ",(0,o.jsx)("code",{children:"showCancel"})," toggles the cancel affordance."]}),(0,o.jsxs)(r.Demo,{code:`const [open, setOpen] = useState(false);

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
/>`,children:[(0,o.jsx)("button",{type:"button",onClick:()=>t(!0),className:"inline-flex items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700",children:"Delete account"}),(0,o.jsx)(s.LtD,{open:e,onOpenChange:t,variant:"destructive",title:"Delete account",description:"This permanently erases your data.",confirmText:"Delete account",cancelText:"Keep account",onConfirm:()=>t(!1)})]})]}),(0,o.jsxs)("section",{className:"space-y-4",children:[(0,o.jsx)("h2",{className:"text-xl font-semibold",children:"With trigger & async confirm"}),(0,o.jsxs)("p",{className:"text-sm text-gray-600 dark:text-gray-400",children:[(0,o.jsx)("code",{children:"AlertDialogTrigger"})," wires a button to open the dialog.",(0,o.jsx)("code",{children:"onConfirm"})," may be async — the dialog stays open until the promise resolves."]}),(0,o.jsx)(r.Demo,{code:`<AlertDialog title="Publish?" confirmText="Publish" onConfirm={publish}>
  {({ confirmButtonProps, cancelButtonProps }) => (
    <>
      <button {...cancelButtonProps}>Cancel</button>
      <button {...confirmButtonProps}>Publish</button>
    </>
  )}
</AlertDialog>`,children:(0,o.jsxs)("p",{className:"text-sm text-gray-500",children:["The render-prop ",(0,o.jsx)("code",{children:"children"})," receives"," ",(0,o.jsx)("code",{children:"confirmButtonProps"})," /"," ",(0,o.jsx)("code",{children:"cancelButtonProps"})," (aria + handlers) for custom layouts."]})})]}),(0,o.jsxs)("section",{className:"space-y-4",children:[(0,o.jsx)("h2",{className:"text-xl font-semibold",children:"Props"}),(0,o.jsx)(i.X,{props:[{name:"open",type:"boolean",default:"—",description:"Controlled visibility."},{name:"onOpenChange",type:"(open: boolean) => void",default:"—",description:"Visibility change callback."},{name:"title",type:"ReactNode",default:"—",description:"Required dialog heading (auto-announced)."},{name:"description",type:"ReactNode",default:"—",description:"Supporting body text."},{name:"variant",type:"'default' | 'destructive' | 'warning'",default:"'default'",description:"Severity; drives confirm button styling."},{name:"confirmText / cancelText",type:"string",default:"'Confirm' / 'Cancel'",description:"Action button labels."},{name:"onConfirm",type:"() => void | Promise<void>",default:"—",description:"Async confirm handler; dialog awaits resolution."},{name:"onCancel",type:"() => void",default:"—",description:"Cancel handler."},{name:"showCancel",type:"boolean",default:"true",description:"Whether to render the cancel button."},{name:"children",type:"(renderArgs) => ReactNode",default:"—",description:"Render-prop for fully custom content/buttons."}]})]})]})}},73438:(e,t,n)=>{Promise.resolve().then(n.bind(n,26268))}},e=>{e.O(0,[7521,8575,1289,6741,3948,7358],()=>e(e.s=73438)),_N_E=e.O()}]);