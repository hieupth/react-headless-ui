(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[3593],{29856:(e,t,s)=>{Promise.resolve().then(s.bind(s,67202))},67202:(e,t,s)=>{"use strict";s.r(t),s.d(t,{default:()=>i});var o=s(25454),r=s(89918),n=s(21887),a=s(55782),l=s(828);function i(){let[e,t]=(0,r.useState)(!1);return(0,o.jsxs)("div",{className:"mx-auto max-w-3xl px-6 py-12 space-y-8",children:[(0,o.jsxs)("header",{className:"space-y-3",children:[(0,o.jsx)("h1",{className:"text-3xl font-bold",children:"Popover"}),(0,o.jsxs)("p",{className:"text-gray-600 dark:text-gray-400",children:["Floating, anchored content backed by the headless"," ",(0,o.jsx)("code",{className:"font-mono text-sm",children:"usePopover"})," hook. It positions relative to a trigger (12 placements), opens on click or hover, closes on outside-click / Escape / blur, and supports open/close delays. Unlike Dialog it is non-modal and stays in the layer stack."]})]}),(0,o.jsxs)("section",{className:"space-y-4",children:[(0,o.jsx)("h2",{className:"text-xl font-semibold",children:"Click trigger"}),(0,o.jsxs)("p",{className:"text-sm text-gray-600 dark:text-gray-400",children:["Default ",(0,o.jsx)("code",{children:'trigger="click"'})," toggles the popover;"," ",(0,o.jsx)("code",{children:"position"})," sets placement (",(0,o.jsx)("code",{children:"top"})," /"," ",(0,o.jsx)("code",{children:"bottom"})," / ",(0,o.jsx)("code",{children:"left"})," / ",(0,o.jsx)("code",{children:"right"})," +"," ",(0,o.jsx)("code",{children:"-start"})," / ",(0,o.jsx)("code",{children:"-end"}),")."]}),(0,o.jsx)(a.Demo,{code:`const [open, setOpen] = useState(false);

<Popover
  open={open}
  onOpenChange={setOpen}
  position="bottom"
  trigger={
    <button
      type="button"
      className="inline-flex items-center justify-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-gray-900"
    >
      Settings
    </button>
  }
>
  <div className="w-48 rounded-md border border-gray-200 bg-white p-3 text-sm shadow-lg dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
    <p className="font-medium">Quick settings</p>
    <p className="mt-1 text-gray-500">Theme the emitted class hooks to match your app.</p>
  </div>
</Popover>`,children:(0,o.jsx)(n.AMh,{open:e,onOpenChange:t,position:"bottom",closeOnClickOutside:!0,closeOnEscape:!0,trigger:(0,o.jsx)("button",{type:"button",className:"rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 dark:bg-white dark:text-gray-900",children:"Settings"}),children:(0,o.jsxs)("div",{className:"w-48 rounded-md border border-gray-200 bg-white p-3 text-sm shadow-lg dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200",children:[(0,o.jsx)("p",{className:"font-medium",children:"Quick settings"}),(0,o.jsx)("p",{className:"mt-1 text-gray-500",children:"Theme the emitted class hooks to match your app."})]})})})]}),(0,o.jsxs)("section",{className:"space-y-4",children:[(0,o.jsx)("h2",{className:"text-xl font-semibold",children:"Hover trigger & delays"}),(0,o.jsxs)("p",{className:"text-sm text-gray-600 dark:text-gray-400",children:[(0,o.jsx)("code",{children:'trigger="hover"'})," opens on hover with"," ",(0,o.jsx)("code",{children:"openDelay"})," / ",(0,o.jsx)("code",{children:"closeDelay"})," to prevent flicker;",(0,o.jsx)("code",{children:"closeOnTriggerBlur"})," dismisses when focus leaves."]}),(0,o.jsx)(a.Demo,{code:`<Popover
  position="top"
  openDelay={200}
  closeDelay={150}
  trigger={<button>Hover me</button>}
>
  Tooltip-like content
</Popover>`,children:(0,o.jsx)("p",{className:"text-sm text-gray-500",children:"Hover-triggered popovers behave like rich tooltips — see snippet."})})]}),(0,o.jsxs)("section",{className:"space-y-4",children:[(0,o.jsx)("h2",{className:"text-xl font-semibold",children:"Props"}),(0,o.jsx)(l.X,{props:[{name:"open / defaultOpen",type:"boolean",default:"—",description:"Controlled / uncontrolled open state."},{name:"onOpenChange",type:"(open: boolean) => void",default:"—",description:"Open change callback."},{name:"trigger",type:"ReactNode",default:"—",description:"The element the popover anchors to (opens on click)."},{name:"position",type:"PopoverPosition",default:"'top'",description:"Placement relative to the trigger (12 options)."},{name:"openDelay / closeDelay",type:"number",default:"—",description:"Hover open/close delays in ms."},{name:"closeOnClickOutside / closeOnEscape / closeOnTriggerBlur",type:"boolean",default:"true",description:"Dismiss triggers."},{name:"disabled",type:"boolean",default:"false",description:"Disable open interactions."},{name:"onOpen / onClose",type:"() => void",default:"—",description:"Open/close lifecycle callbacks."}]})]})]})}}},e=>{e.O(0,[7521,8575,1289,6741,3948,7358],()=>e(e.s=29856)),_N_E=e.O()}]);