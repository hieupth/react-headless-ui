(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[7137],{9314:(e,t,r)=>{Promise.resolve().then(r.bind(r,12744))},12744:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>l});var s=r(25454),a=r(89918),o=r(21887),n=r(55782),d=r(828);function l(){let[e,t]=(0,a.useState)(!1);return(0,s.jsxs)("div",{className:"mx-auto max-w-3xl px-6 py-12 space-y-8",children:[(0,s.jsxs)("header",{className:"space-y-3",children:[(0,s.jsx)("h1",{className:"text-3xl font-bold",children:"Drawer"}),(0,s.jsxs)("p",{className:"text-gray-600 dark:text-gray-400",children:["A side panel backed by the headless"," ",(0,s.jsx)("code",{className:"font-mono text-sm",children:"useDrawer"})," hook. It slides in from ",(0,s.jsx)("code",{children:"left"})," / ",(0,s.jsx)("code",{children:"right"})," / ",(0,s.jsx)("code",{children:"top"})," /"," ",(0,s.jsx)("code",{children:"bottom"}),", supports modal (backdrop + focus trap) and persistent variants, and exposes a compound API —"," ",(0,s.jsx)("code",{children:"Drawer"}),", ",(0,s.jsx)("code",{children:"DrawerTrigger"}),","," ",(0,s.jsx)("code",{children:"DrawerContent"}),", ",(0,s.jsx)("code",{children:"DrawerHeader"}),","," ",(0,s.jsx)("code",{children:"DrawerFooter"}),". Modal drawers portal a backdrop to"," ",(0,s.jsx)("code",{className:"font-mono text-sm",children:"document.body"}),"."]})]}),(0,s.jsxs)("section",{className:"space-y-4",children:[(0,s.jsx)("h2",{className:"text-xl font-semibold",children:"Right side, modal"}),(0,s.jsxs)("p",{className:"text-sm text-gray-600 dark:text-gray-400",children:["Default ",(0,s.jsx)("code",{children:'side="right"'})," with a backdrop and focus trap. Use"," ",(0,s.jsx)("code",{children:"size"})," (",(0,s.jsx)("code",{children:"sm"}),"–",(0,s.jsx)("code",{children:"full"}),") to set panel width."]}),(0,s.jsxs)(n.Demo,{code:`const [open, setOpen] = useState(false);

<button
  type="button"
  onClick={() => setOpen(true)}
  className="inline-flex items-center justify-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-gray-900"
>
  Open drawer
</button>

{/* Drawer portals a backdrop to document.body. Theme the emitted class hooks:
      .drawer-overlay  { @apply fixed inset-0 z-50 bg-black/50; }
      .drawer-content  { @apply fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-white shadow-xl dark:bg-gray-900 dark:text-gray-100; }
      .drawer-header   { @apply border-b border-gray-200 px-4 py-3 text-lg font-semibold dark:border-gray-700; }
      .drawer-footer   { @apply border-t border-gray-200 p-4 dark:border-gray-700; } */}
<Drawer open={open} onOpenChange={setOpen} side="right" size="md" modal title="Filters">
  <DrawerContent>
    <DrawerHeader>Filters</DrawerHeader>
    <div className="flex-1 overflow-y-auto p-4 text-sm text-gray-500 dark:text-gray-400">
      {/* …filter controls… */}
    </div>
    <DrawerFooter>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
      >
        Apply
      </button>
    </DrawerFooter>
  </DrawerContent>
</Drawer>`,children:[(0,s.jsx)("button",{type:"button",onClick:()=>t(!0),className:"inline-flex items-center justify-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-gray-900",children:"Open drawer"}),(0,s.jsx)(o._s,{open:e,onOpenChange:t,side:"right",size:"md",modal:!0,title:"Filters",children:(0,s.jsxs)(o.zj7,{children:[(0,s.jsx)(o.BE9,{children:"Filters"}),(0,s.jsx)("p",{className:"px-4 text-sm text-gray-500",children:"Panel contents go here — theme the emitted class hooks."}),(0,s.jsx)(o.tbu,{children:(0,s.jsx)("button",{type:"button",onClick:()=>t(!1),className:"inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700",children:"Apply"})})]})})]})]}),(0,s.jsxs)("section",{className:"space-y-4",children:[(0,s.jsx)("h2",{className:"text-xl font-semibold",children:"Persistent & sides"}),(0,s.jsxs)("p",{className:"text-sm text-gray-600 dark:text-gray-400",children:[(0,s.jsx)("code",{children:'variant="persistent"'})," omits the backdrop (useful for app-shell navigation). ",(0,s.jsx)("code",{children:"side"})," picks the slide direction;",(0,s.jsx)("code",{children:"trapFocus"})," / ",(0,s.jsx)("code",{children:"restoreFocus"})," tune focus behavior."]}),(0,s.jsx)(n.Demo,{code:`<Drawer side="left" variant="persistent" showCloseButton={false}>
  <DrawerContent>
    <DrawerHeader>Navigation</DrawerHeader>
  </DrawerContent>
</Drawer>`,children:(0,s.jsx)("p",{className:"text-sm text-gray-500",children:"Persistent drawers stay open alongside content — see the snippet."})})]}),(0,s.jsxs)("section",{className:"space-y-4",children:[(0,s.jsx)("h2",{className:"text-xl font-semibold",children:"Props"}),(0,s.jsx)(d.X,{props:[{name:"open / defaultOpen",type:"boolean",default:"—",description:"Controlled / uncontrolled open state."},{name:"onOpenChange",type:"(open: boolean) => void",default:"—",description:"Open change callback."},{name:"side",type:"'left' | 'right' | 'top' | 'bottom'",default:"'right'",description:"Edge the panel slides in from."},{name:"size",type:"'sm' | 'md' | 'lg' | 'xl' | 'full'",default:"'md'",description:"Panel dimension along the slide axis."},{name:"variant",type:"'default' | 'persistent' | 'temporary'",default:"'default'",description:"Persistent omits the backdrop; temporary auto-closes."},{name:"modal",type:"boolean",default:"true",description:"Render a backdrop and trap focus."},{name:"closeOnOutsideClick / closeOnEscape",type:"boolean",default:"true",description:"Close triggers."},{name:"trapFocus / restoreFocus",type:"boolean",default:"true",description:"Focus management behavior."},{name:"onBeforeOpen / onBeforeClose",type:"() => boolean | Promise<boolean>",default:"—",description:"Guards that can veto the open/close."}]})]})]})}}},e=>{e.O(0,[7521,8575,1289,6741,3948,7358],()=>e(e.s=9314)),_N_E=e.O()}]);