(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[8227],{46430:(e,t,r)=>{Promise.resolve().then(r.bind(r,50204))},50204:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>l});var o=r(25454),a=r(89918),s=r(21887),n=r(55782),d=r(828);function l(){let[e,t]=(0,a.useState)(!1),[r,l]=(0,a.useState)(!1);return(0,o.jsxs)("div",{className:"mx-auto max-w-3xl px-6 py-12 space-y-8",children:[(0,o.jsxs)("header",{className:"space-y-3",children:[(0,o.jsx)("h1",{className:"text-3xl font-bold",children:"Portal"}),(0,o.jsxs)("p",{className:"text-gray-600 dark:text-gray-400",children:["A portal renderer backed by the headless"," ",(0,o.jsx)("code",{className:"font-mono text-sm",children:"usePortal"})," hook. It lifts children out of the current React tree into"," ",(0,o.jsx)("code",{children:"document.body"})," (or a custom container) via React's"," ",(0,o.jsx)("code",{children:"createPortal"}),", then adds the overlay ergonomics you usually hand-roll: an optional backdrop, focus trapping, focus restoration on close, an Escape-to-close listener, and enter/leave animation timing. Dialogs, drawers, tooltips, and menus all build on this primitive."]})]}),(0,o.jsxs)("section",{className:"space-y-4",children:[(0,o.jsx)("h2",{className:"text-xl font-semibold",children:"Basic portal"}),(0,o.jsxs)("p",{className:"text-sm text-gray-600 dark:text-gray-400",children:["The simplest case: open controlled with"," ",(0,o.jsx)("code",{children:"open"})," and the content renders above everything else. Close with the button or press ",(0,o.jsx)("kbd",{className:"font-mono",children:"Escape"}),"."]}),(0,o.jsxs)(n.Demo,{code:`const [open, setOpen] = useState(false);

<Portal open={open} closeOnEscape onClose={() => setOpen(false)}>
  <div className="mx-auto mt-32 max-w-xs rounded-lg border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-900">
    <p className="text-sm text-gray-700 dark:text-gray-200">
      I render in <code>document.body</code>, not inside the preview box.
    </p>
    <button
      type="button"
      onClick={() => setOpen(false)}
      className="mt-4 inline-flex items-center justify-center rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
    >
      Close
    </button>
  </div>
</Portal>

<button
  type="button"
  onClick={() => setOpen(true)}
  className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
>
  Open portal
</button>`,children:[(0,o.jsx)("button",{type:"button",onClick:()=>t(!0),className:"inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700",children:"Open portal"}),(0,o.jsx)(s.ZLI,{open:e,closeOnEscape:!0,onClose:()=>t(!1),children:(0,o.jsxs)("div",{className:"mx-auto mt-32 max-w-xs rounded-lg border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-900",children:[(0,o.jsxs)("p",{className:"text-sm text-gray-700 dark:text-gray-200",children:["I render in ",(0,o.jsx)("code",{children:"document.body"}),", not inside the preview box."]}),(0,o.jsx)("button",{type:"button",onClick:()=>t(!1),className:"mt-4 inline-flex items-center justify-center rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200",children:"Close"})]})})]})]}),(0,o.jsxs)("section",{className:"space-y-4",children:[(0,o.jsx)("h2",{className:"text-xl font-semibold",children:"Modal with backdrop"}),(0,o.jsxs)("p",{className:"text-sm text-gray-600 dark:text-gray-400",children:[(0,o.jsx)("code",{children:"showBackdrop"})," adds a dimmed/blurred layer behind the content; ",(0,o.jsx)("code",{children:"onBackdropClick"})," closes it."," ",(0,o.jsx)("code",{children:"trapFocus"})," keeps Tab cycling inside the portal."]}),(0,o.jsxs)(n.Demo,{code:`<Portal
  open={open}
  showBackdrop
  trapFocus
  restoreFocus
  closeOnEscape
  onBackdropClick={() => setOpen(false)}
  onClose={() => setOpen(false)}
>
  <div
    role="dialog"
    aria-modal="true"
    aria-label="Confirm"
    className="mx-auto mt-32 max-w-sm rounded-lg border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-900"
  >
    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
      Are you sure?
    </h3>
    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
      Focus is trapped and restored when this closes.
    </p>
    <div className="mt-4 flex justify-end gap-2">
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
      >
        Confirm
      </button>
    </div>
  </div>
</Portal>

<button
  type="button"
  onClick={() => setOpen(true)}
  className="inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
>
  Open modal
</button>`,children:[(0,o.jsx)("button",{type:"button",onClick:()=>l(!0),className:"inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800",children:"Open modal"}),(0,o.jsx)(s.ZLI,{open:r,showBackdrop:!0,trapFocus:!0,restoreFocus:!0,closeOnEscape:!0,onBackdropClick:()=>l(!1),onClose:()=>l(!1),children:(0,o.jsxs)("div",{role:"dialog","aria-modal":"true","aria-label":"Confirm",className:"mx-auto mt-32 max-w-sm rounded-lg border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-900",children:[(0,o.jsx)("h3",{className:"text-lg font-semibold text-gray-900 dark:text-gray-100",children:"Are you sure?"}),(0,o.jsx)("p",{className:"mt-1 text-sm text-gray-600 dark:text-gray-400",children:"Focus is trapped and restored when this closes."}),(0,o.jsxs)("div",{className:"mt-4 flex justify-end gap-2",children:[(0,o.jsx)("button",{type:"button",onClick:()=>l(!1),className:"inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800",children:"Cancel"}),(0,o.jsx)("button",{type:"button",onClick:()=>l(!1),className:"inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700",children:"Confirm"})]})]})})]})]}),(0,o.jsxs)("section",{className:"space-y-4",children:[(0,o.jsx)("h2",{className:"text-xl font-semibold",children:"Props"}),(0,o.jsx)(d.X,{props:[{name:"open",type:"boolean",default:"—",description:"Controlled visibility of the portal."},{name:"defaultOpen",type:"boolean",default:"false",description:"Uncontrolled initial open state."},{name:"container",type:"string | HTMLElement",default:"document.body",description:"Selector or node to portal into."},{name:"showBackdrop",type:"boolean",default:"false",description:"Render a dimmed/blurred backdrop behind the content."},{name:"onBackdropClick",type:"() => void",default:"—",description:"Fires when the backdrop is clicked."},{name:"closeOnEscape",type:"boolean",default:"true",description:"Close the portal when Escape is pressed."},{name:"trapFocus",type:"boolean",default:"false",description:"Keep Tab focus cycling inside the portal."},{name:"restoreFocus",type:"boolean",default:"true",description:"Return focus to the previously focused element on close."},{name:"animationDuration",type:"number",default:"200",description:"Enter/leave transition duration in ms (delayed unmount)."},{name:"wrapperTag",type:"ElementType",default:"'div'",description:"Element tag for the portal wrapper."}]})]})]})}}},e=>{e.O(0,[7521,8575,1289,6741,3948,7358],()=>e(e.s=46430)),_N_E=e.O()}]);