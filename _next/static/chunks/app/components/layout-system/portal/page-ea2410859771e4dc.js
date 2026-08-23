(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[8227],{828:(e,r,t)=>{"use strict";t.d(r,{X:()=>o});var a=t(25454);function o({props:e}){return 0===e.length?(0,a.jsx)("p",{className:"text-sm text-gray-500 dark:text-gray-400",children:"No props."}):(0,a.jsx)("div",{className:"overflow-x-auto my-6",children:(0,a.jsxs)("table",{className:"w-full text-sm border-collapse border border-gray-200 dark:border-gray-700",children:[(0,a.jsx)("thead",{children:(0,a.jsxs)("tr",{className:"bg-gray-50 dark:bg-gray-900/40 text-left",children:[(0,a.jsx)("th",{scope:"col",className:"border border-gray-200 dark:border-gray-700 px-3 py-2 font-semibold",children:"Name"}),(0,a.jsx)("th",{scope:"col",className:"border border-gray-200 dark:border-gray-700 px-3 py-2 font-semibold",children:"Type"}),(0,a.jsx)("th",{scope:"col",className:"border border-gray-200 dark:border-gray-700 px-3 py-2 font-semibold",children:"Default"}),(0,a.jsx)("th",{scope:"col",className:"border border-gray-200 dark:border-gray-700 px-3 py-2 font-semibold",children:"Description"})]})}),(0,a.jsx)("tbody",{children:e.map(e=>(0,a.jsxs)("tr",{className:"align-top",children:[(0,a.jsx)("td",{className:"border border-gray-200 dark:border-gray-700 px-3 py-2 font-mono text-purple-700 dark:text-purple-300",children:e.name}),(0,a.jsx)("td",{className:"border border-gray-200 dark:border-gray-700 px-3 py-2 font-mono text-blue-700 dark:text-blue-300",children:e.type}),(0,a.jsx)("td",{className:"border border-gray-200 dark:border-gray-700 px-3 py-2 font-mono text-gray-600 dark:text-gray-400",children:e.default??"—"}),(0,a.jsx)("td",{className:"border border-gray-200 dark:border-gray-700 px-3 py-2 text-gray-700 dark:text-gray-300",children:e.description})]},e.name))})]})})}},4956:(e,r,t)=>{"use strict";t.d(r,{CodeBlock:()=>n});var a=t(25454),o=t(89918),s=t(17521);function n({code:e,language:r="tsx"}){let[t,d]=(0,o.useState)(""),[l,i]=(0,o.useState)(!1);async function c(){try{await navigator.clipboard.writeText(e),i(!0),setTimeout(()=>i(!1),1500)}catch{}}return(0,o.useEffect)(()=>{let t=!1;return(0,s.Yz)(e,{lang:r,theme:"github-dark"}).then(e=>{t||d(e)}).catch(()=>{t||d("")}),()=>{t=!0}},[e,r]),(0,a.jsxs)("div",{className:"relative group rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700",children:[(0,a.jsx)("button",{type:"button",onClick:c,className:"absolute top-2 right-2 z-10 px-2 py-1 text-xs rounded bg-gray-800/80 text-gray-100 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 transition-opacity hover:bg-gray-700","aria-label":"Copy code",children:l?"Copied!":"Copy"}),t?(0,a.jsx)("div",{className:"overflow-x-auto text-sm [&>pre]:!m-0 [&>pre]:!bg-transparent [&>pre]:p-4",dangerouslySetInnerHTML:{__html:t}}):(0,a.jsx)("pre",{className:"overflow-x-auto text-sm p-4 bg-gray-900 text-gray-100",children:(0,a.jsx)("code",{children:e})})]})}},46430:(e,r,t)=>{Promise.resolve().then(t.bind(t,50204))},50204:(e,r,t)=>{"use strict";t.r(r),t.d(r,{default:()=>l});var a=t(25454),o=t(89918),s=t(47864),n=t(55782),d=t(828);function l(){let[e,r]=(0,o.useState)(!1),[t,l]=(0,o.useState)(!1);return(0,a.jsxs)("div",{className:"mx-auto max-w-3xl px-6 py-12 space-y-8",children:[(0,a.jsxs)("header",{className:"space-y-3",children:[(0,a.jsx)("h1",{className:"text-3xl font-bold",children:"Portal"}),(0,a.jsxs)("p",{className:"text-gray-600 dark:text-gray-400",children:["A portal renderer backed by the headless"," ",(0,a.jsx)("code",{className:"font-mono text-sm",children:"usePortal"})," hook. It lifts children out of the current React tree into"," ",(0,a.jsx)("code",{children:"document.body"})," (or a custom container) via React's"," ",(0,a.jsx)("code",{children:"createPortal"}),", then adds the overlay ergonomics you usually hand-roll: an optional backdrop, focus trapping, focus restoration on close, an Escape-to-close listener, and enter/leave animation timing. Dialogs, drawers, tooltips, and menus all build on this primitive."]})]}),(0,a.jsxs)("section",{className:"space-y-4",children:[(0,a.jsx)("h2",{className:"text-xl font-semibold",children:"Basic portal"}),(0,a.jsxs)("p",{className:"text-sm text-gray-600 dark:text-gray-400",children:["The simplest case: open controlled with"," ",(0,a.jsx)("code",{children:"open"})," and the content renders above everything else. Close with the button or press ",(0,a.jsx)("kbd",{className:"font-mono",children:"Escape"}),"."]}),(0,a.jsxs)(n.Demo,{code:`const [open, setOpen] = useState(false);

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
</button>`,children:[(0,a.jsx)("button",{type:"button",onClick:()=>r(!0),className:"inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700",children:"Open portal"}),(0,a.jsx)(s.ZL,{open:e,closeOnEscape:!0,onClose:()=>r(!1),children:(0,a.jsxs)("div",{className:"mx-auto mt-32 max-w-xs rounded-lg border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-900",children:[(0,a.jsxs)("p",{className:"text-sm text-gray-700 dark:text-gray-200",children:["I render in ",(0,a.jsx)("code",{children:"document.body"}),", not inside the preview box."]}),(0,a.jsx)("button",{type:"button",onClick:()=>r(!1),className:"mt-4 inline-flex items-center justify-center rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200",children:"Close"})]})})]})]}),(0,a.jsxs)("section",{className:"space-y-4",children:[(0,a.jsx)("h2",{className:"text-xl font-semibold",children:"Modal with backdrop"}),(0,a.jsxs)("p",{className:"text-sm text-gray-600 dark:text-gray-400",children:[(0,a.jsx)("code",{children:"showBackdrop"})," adds a dimmed/blurred layer behind the content; ",(0,a.jsx)("code",{children:"onBackdropClick"})," closes it."," ",(0,a.jsx)("code",{children:"trapFocus"})," keeps Tab cycling inside the portal."]}),(0,a.jsxs)(n.Demo,{code:`<Portal
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
</button>`,children:[(0,a.jsx)("button",{type:"button",onClick:()=>l(!0),className:"inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800",children:"Open modal"}),(0,a.jsx)(s.ZL,{open:t,showBackdrop:!0,trapFocus:!0,restoreFocus:!0,closeOnEscape:!0,onBackdropClick:()=>l(!1),onClose:()=>l(!1),children:(0,a.jsxs)("div",{role:"dialog","aria-modal":"true","aria-label":"Confirm",className:"mx-auto mt-32 max-w-sm rounded-lg border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-900",children:[(0,a.jsx)("h3",{className:"text-lg font-semibold text-gray-900 dark:text-gray-100",children:"Are you sure?"}),(0,a.jsx)("p",{className:"mt-1 text-sm text-gray-600 dark:text-gray-400",children:"Focus is trapped and restored when this closes."}),(0,a.jsxs)("div",{className:"mt-4 flex justify-end gap-2",children:[(0,a.jsx)("button",{type:"button",onClick:()=>l(!1),className:"inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800",children:"Cancel"}),(0,a.jsx)("button",{type:"button",onClick:()=>l(!1),className:"inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700",children:"Confirm"})]})]})})]})]}),(0,a.jsxs)("section",{className:"space-y-4",children:[(0,a.jsx)("h2",{className:"text-xl font-semibold",children:"Props"}),(0,a.jsx)(d.X,{props:[{name:"open",type:"boolean",default:"—",description:"Controlled visibility of the portal."},{name:"defaultOpen",type:"boolean",default:"false",description:"Uncontrolled initial open state."},{name:"container",type:"string | HTMLElement",default:"document.body",description:"Selector or node to portal into."},{name:"showBackdrop",type:"boolean",default:"false",description:"Render a dimmed/blurred backdrop behind the content."},{name:"onBackdropClick",type:"() => void",default:"—",description:"Fires when the backdrop is clicked."},{name:"closeOnEscape",type:"boolean",default:"true",description:"Close the portal when Escape is pressed."},{name:"trapFocus",type:"boolean",default:"false",description:"Keep Tab focus cycling inside the portal."},{name:"restoreFocus",type:"boolean",default:"true",description:"Return focus to the previously focused element on close."},{name:"animationDuration",type:"number",default:"200",description:"Enter/leave transition duration in ms (delayed unmount)."},{name:"wrapperTag",type:"ElementType",default:"'div'",description:"Element tag for the portal wrapper."}]})]})]})}},55782:(e,r,t)=>{"use strict";t.d(r,{Demo:()=>n});var a=t(25454),o=t(89918),s=t(4956);function n({code:e,children:r}){let[t,d]=(0,o.useState)(!1),[l,i]=(0,o.useState)(!1),c=(0,o.useId)();return(0,a.jsxs)("div",{className:"my-6 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden",children:[(0,a.jsxs)("div",{className:"flex items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 px-3 py-2",children:[(0,a.jsx)("span",{className:"text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400",children:"Preview"}),(0,a.jsx)("button",{type:"button",onClick:()=>{d(e=>!e),i(!0)},className:"px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors","aria-expanded":t,"aria-controls":c,children:t?"Hide Code":"Show Code"})]}),(0,a.jsx)("div",{className:"p-6 flex items-center justify-center min-h-[120px] bg-white dark:bg-gray-950",children:r}),(0,a.jsx)("div",{id:c,className:"border-t border-gray-200 dark:border-gray-700",hidden:!t,children:l&&(0,a.jsx)(s.CodeBlock,{code:e})})]})}}},e=>{e.O(0,[7521,7864,6741,3948,7358],()=>e(e.s=46430)),_N_E=e.O()}]);