(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[8227],{828:(e,t,s)=>{"use strict";s.d(t,{X:()=>r});var o=s(25454);function r({props:e}){return 0===e.length?(0,o.jsx)("p",{className:"docs-desc",children:"No props."}):(0,o.jsx)("div",{className:"props-table-wrap",children:(0,o.jsxs)("table",{className:"props-table",children:[(0,o.jsx)("thead",{children:(0,o.jsxs)("tr",{children:[(0,o.jsx)("th",{scope:"col",children:"Name"}),(0,o.jsx)("th",{scope:"col",children:"Type"}),(0,o.jsx)("th",{scope:"col",children:"Default"}),(0,o.jsx)("th",{scope:"col",children:"Description"})]})}),(0,o.jsx)("tbody",{children:e.map(e=>(0,o.jsxs)("tr",{children:[(0,o.jsx)("td",{className:"props-name",children:e.name}),(0,o.jsx)("td",{className:"props-type",children:e.type}),(0,o.jsx)("td",{className:"props-default",children:e.default??"—"}),(0,o.jsx)("td",{children:e.description})]},e.name))})]})})}},4956:(e,t,s)=>{"use strict";s.d(t,{CodeBlock:()=>n});var o=s(25454),r=s(89918),a=s(17521);function n({code:e,language:t="tsx"}){let[s,d]=(0,r.useState)(""),[i,l]=(0,r.useState)(!1);async function c(){try{await navigator.clipboard.writeText(e),l(!0),setTimeout(()=>l(!1),1500)}catch{}}return(0,r.useEffect)(()=>{let s=!1;return(0,a.Yz)(e,{lang:t,theme:"github-dark"}).then(e=>{s||d(e)}).catch(()=>{s||d("")}),()=>{s=!0}},[e,t]),(0,o.jsxs)("div",{className:"code-block",children:[(0,o.jsx)("button",{type:"button",onClick:c,className:"code-copy","aria-label":"Copy code",children:i?"Copied!":"Copy"}),s?(0,o.jsx)("div",{className:"overflow-x-auto [&>pre]:!m-0 [&>pre]:!bg-transparent [&>pre]:p-4",dangerouslySetInnerHTML:{__html:s}}):(0,o.jsx)("pre",{className:"overflow-x-auto p-4",style:{background:"#0d1117",color:"#f3f4f6"},children:(0,o.jsx)("code",{children:e})})]})}},46430:(e,t,s)=>{Promise.resolve().then(s.bind(s,50204))},50204:(e,t,s)=>{"use strict";s.r(t),s.d(t,{default:()=>i});var o=s(25454),r=s(89918),a=s(47864),n=s(55782),d=s(828);function i(){let[e,t]=(0,r.useState)(!1),[s,i]=(0,r.useState)(!1);return(0,o.jsxs)("div",{className:"docs-page",children:[(0,o.jsxs)("header",{className:"docs-header",children:[(0,o.jsx)("h1",{className:"docs-h1",children:"Portal"}),(0,o.jsxs)("p",{className:"docs-lead",children:["A portal renderer backed by the headless"," ",(0,o.jsx)("code",{className:"docs-code",children:"usePortal"})," hook. It lifts children out of the current React tree into"," ",(0,o.jsx)("code",{children:"document.body"})," (or a custom container) via React's"," ",(0,o.jsx)("code",{children:"createPortal"}),", then adds the overlay ergonomics you usually hand-roll: an optional backdrop, focus trapping, focus restoration on close, an Escape-to-close listener, and enter/leave animation timing. Dialogs, drawers, tooltips, and menus all build on this primitive."]})]}),(0,o.jsxs)("section",{className:"docs-section",children:[(0,o.jsx)("h2",{className:"docs-h2",children:"Basic portal"}),(0,o.jsxs)("p",{className:"docs-desc",children:["The simplest case: open controlled with"," ",(0,o.jsx)("code",{children:"open"})," and the content renders above everything else. Close with the button or press ",(0,o.jsx)("kbd",{className:"font-mono",children:"Escape"}),"."]}),(0,o.jsxs)(n.Demo,{code:`const [open, setOpen] = useState(false);

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
  className="inline-flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
>
  Open portal
</button>`,children:[(0,o.jsx)("button",{type:"button",onClick:()=>t(!0),className:"inline-flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700",children:"Open portal"}),(0,o.jsx)(a.ZL,{open:e,closeOnEscape:!0,onClose:()=>t(!1),children:(0,o.jsxs)("div",{className:"mx-auto mt-32 max-w-xs rounded-lg border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-900",children:[(0,o.jsxs)("p",{className:"text-sm text-gray-700 dark:text-gray-200",children:["I render in ",(0,o.jsx)("code",{children:"document.body"}),", not inside the preview box."]}),(0,o.jsx)("button",{type:"button",onClick:()=>t(!1),className:"mt-4 inline-flex items-center justify-center rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200",children:"Close"})]})})]})]}),(0,o.jsxs)("section",{className:"docs-section",children:[(0,o.jsx)("h2",{className:"docs-h2",children:"Modal with backdrop"}),(0,o.jsxs)("p",{className:"docs-desc",children:[(0,o.jsx)("code",{children:"showBackdrop"})," adds a dimmed/blurred layer behind the content; ",(0,o.jsx)("code",{children:"onBackdropClick"})," closes it."," ",(0,o.jsx)("code",{children:"trapFocus"})," keeps Tab cycling inside the portal."]}),(0,o.jsxs)(n.Demo,{code:`<Portal
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
    <h3 className="docs-h3">
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
        className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
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
</button>`,children:[(0,o.jsx)("button",{type:"button",onClick:()=>i(!0),className:"inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800",children:"Open modal"}),(0,o.jsx)(a.ZL,{open:s,showBackdrop:!0,trapFocus:!0,restoreFocus:!0,closeOnEscape:!0,onBackdropClick:()=>i(!1),onClose:()=>i(!1),children:(0,o.jsxs)("div",{role:"dialog","aria-modal":"true","aria-label":"Confirm",className:"mx-auto mt-32 max-w-sm rounded-lg border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-900",children:[(0,o.jsx)("h3",{className:"docs-h3",children:"Are you sure?"}),(0,o.jsx)("p",{className:"mt-1 text-sm text-gray-600 dark:text-gray-400",children:"Focus is trapped and restored when this closes."}),(0,o.jsxs)("div",{className:"mt-4 flex justify-end gap-2",children:[(0,o.jsx)("button",{type:"button",onClick:()=>i(!1),className:"inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800",children:"Cancel"}),(0,o.jsx)("button",{type:"button",onClick:()=>i(!1),className:"inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700",children:"Confirm"})]})]})})]})]}),(0,o.jsxs)("section",{className:"docs-section",children:[(0,o.jsx)("h2",{className:"docs-h2",children:"Props"}),(0,o.jsx)(d.X,{props:[{name:"open",type:"boolean",default:"—",description:"Controlled visibility of the portal."},{name:"defaultOpen",type:"boolean",default:"false",description:"Uncontrolled initial open state."},{name:"container",type:"string | HTMLElement",default:"document.body",description:"Selector or node to portal into."},{name:"showBackdrop",type:"boolean",default:"false",description:"Render a dimmed/blurred backdrop behind the content."},{name:"onBackdropClick",type:"() => void",default:"—",description:"Fires when the backdrop is clicked."},{name:"closeOnEscape",type:"boolean",default:"true",description:"Close the portal when Escape is pressed."},{name:"trapFocus",type:"boolean",default:"false",description:"Keep Tab focus cycling inside the portal."},{name:"restoreFocus",type:"boolean",default:"true",description:"Return focus to the previously focused element on close."},{name:"animationDuration",type:"number",default:"200",description:"Enter/leave transition duration in ms (delayed unmount)."},{name:"wrapperTag",type:"ElementType",default:"'div'",description:"Element tag for the portal wrapper."}]})]})]})}},55782:(e,t,s)=>{"use strict";s.d(t,{Demo:()=>n});var o=s(25454),r=s(89918),a=s(4956);function n({code:e,children:t}){let[s,d]=(0,r.useState)(!1),[i,l]=(0,r.useState)(!1),c=(0,r.useId)();return(0,o.jsxs)("div",{className:"demo-frame",children:[(0,o.jsxs)("div",{className:"demo-toolbar",children:[(0,o.jsx)("span",{className:"demo-label",children:"Preview"}),(0,o.jsx)("button",{type:"button",onClick:()=>{d(e=>!e),l(!0)},className:"demo-toggle","aria-expanded":s,"aria-controls":c,children:s?"Hide Code":"Show Code"})]}),(0,o.jsx)("div",{className:"demo-canvas",children:t}),(0,o.jsx)("div",{id:c,className:"demo-code-panel",hidden:!s,children:i&&(0,o.jsx)(a.CodeBlock,{code:e})})]})}}},e=>{e.O(0,[7521,7864,6741,3948,7358],()=>e(e.s=46430)),_N_E=e.O()}]);