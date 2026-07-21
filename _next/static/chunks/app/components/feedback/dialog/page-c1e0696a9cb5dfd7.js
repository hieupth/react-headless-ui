(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[3640],{79429:(e,t,n)=>{"use strict";n.r(t),n.d(t,{default:()=>c});var o=n(25454),a=n(89918),s=n(21887),l=n(55782),i=n(828);function c(){let[e,t]=(0,a.useState)(!1);return(0,o.jsxs)("div",{className:"mx-auto max-w-3xl px-6 py-12 space-y-8",children:[(0,o.jsxs)("header",{className:"space-y-3",children:[(0,o.jsx)("h1",{className:"text-3xl font-bold",children:"Dialog"}),(0,o.jsxs)("p",{className:"text-gray-600 dark:text-gray-400",children:["A modal dialog backed by the headless"," ",(0,o.jsx)("code",{className:"font-mono text-sm",children:"useDialog"})," hook. It traps focus, restores it on close, closes on Escape and overlay click, and wires ",(0,o.jsx)("code",{className:"font-mono text-sm",children:"aria-modal"})," plus labelled title/description. The overlay and content render through a portal to ",(0,o.jsx)("code",{className:"font-mono text-sm",children:"document.body"})," — theme the ",(0,o.jsx)("code",{className:"font-mono text-sm",children:"dialog-overlay"})," ","/ ",(0,o.jsx)("code",{className:"font-mono text-sm",children:"dialog-content"})," class hooks (or pass ",(0,o.jsx)("code",{children:"renderOverlay"})," /"," ",(0,o.jsx)("code",{children:"renderContent"}),")."]})]}),(0,o.jsxs)("section",{className:"space-y-4",children:[(0,o.jsx)("h2",{className:"text-xl font-semibold",children:"Basic modal"}),(0,o.jsxs)("p",{className:"text-sm text-gray-600 dark:text-gray-400",children:["Control visibility with ",(0,o.jsx)("code",{children:"open"})," /"," ",(0,o.jsx)("code",{children:"onOpenChange"}),". ",(0,o.jsx)("code",{children:"title"})," and"," ",(0,o.jsx)("code",{children:"description"})," are auto-announced."]}),(0,o.jsxs)(l.Demo,{code:`const [open, setOpen] = useState(false);

<button
  type="button"
  onClick={() => setOpen(true)}
  className="inline-flex items-center justify-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-gray-900"
>
  Open dialog
</button>

{/* Dialog portals to document.body. Theme the emitted
    dialog-overlay / dialog-content class hooks:
      .dialog-overlay  { @apply fixed inset-0 z-50 bg-black/50; }
      .dialog-content  { @apply w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-900 dark:text-gray-100; } */}
<Dialog
  open={open}
  onOpenChange={setOpen}
  title="Delete project"
  description="This action cannot be undone."
  confirmText="Delete"
  cancelText="Cancel"
  onConfirm={() => { /* … */ }}
  onCancel={() => setOpen(false)}
/>`,children:[(0,o.jsx)("button",{type:"button",onClick:()=>t(!0),className:"inline-flex items-center justify-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-gray-900",children:"Open dialog"}),(0,o.jsx)(s.lGe,{open:e,onOpenChange:t,title:"Delete project",description:"This action cannot be undone.",confirmText:"Delete",cancelText:"Cancel",onConfirm:()=>t(!1),onCancel:()=>t(!1)})]})]}),(0,o.jsxs)("section",{className:"space-y-4",children:[(0,o.jsx)("h2",{className:"text-xl font-semibold",children:"Non-modal & focus"}),(0,o.jsxs)("p",{className:"text-sm text-gray-600 dark:text-gray-400",children:["Set ",(0,o.jsxs)("code",{children:["modal=",!1]})," to skip the focus trap;"," ",(0,o.jsx)("code",{children:"initialFocus"})," accepts a selector or element to focus on open. Disable overlay/escape close with"," ",(0,o.jsx)("code",{children:"closeOnOverlayClick"})," / ",(0,o.jsx)("code",{children:"closeOnEscape"}),"."]}),(0,o.jsx)(l.Demo,{code:`<Dialog
  open={open}
  onOpenChange={setOpen}
  modal={false}
  initialFocus="#name"
  closeOnOverlayClick={false}
>
  <input id="name" />
</Dialog>`,children:(0,o.jsx)("p",{className:"text-sm text-gray-500",children:"Non-modal dialogs render the same portal without trapping focus — see the snippet."})})]}),(0,o.jsxs)("section",{className:"space-y-4",children:[(0,o.jsx)("h2",{className:"text-xl font-semibold",children:"Props"}),(0,o.jsx)(i.X,{props:[{name:"open",type:"boolean",default:"—",description:"Controlled visibility."},{name:"onOpenChange",type:"(open: boolean) => void",default:"—",description:"Visibility change callback (Escape / overlay click)."},{name:"modal",type:"boolean",default:"true",description:"Trap focus and mark aria-modal while open."},{name:"initialFocus",type:"string | HTMLElement",default:"—",description:"Element to focus when the dialog opens."},{name:"closeOnOverlayClick / closeOnEscape",type:"boolean",default:"true",description:"Whether overlay click / Escape closes the dialog."},{name:"title / description",type:"string",default:"—",description:"Heading and supporting text; auto-wired to aria."},{name:"confirmText / cancelText",type:"string",default:"'Confirm' / 'Cancel'",description:"Labels for the default action buttons."},{name:"onConfirm / onCancel",type:"() => void",default:"—",description:"Action button handlers."},{name:"renderOverlay / renderContent",type:"(props) => ReactElement",default:"—",description:"Custom renderers for overlay and content."}]})]})]})}},99885:(e,t,n)=>{Promise.resolve().then(n.bind(n,79429))}},e=>{e.O(0,[7521,8575,1289,6741,3948,7358],()=>e(e.s=99885)),_N_E=e.O()}]);