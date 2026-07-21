(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[5376],{19517:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>d});var s=r(25454),a=r(89918),n=r(21887),l=r(55782),o=r(828);function d(){let[e,t]=(0,a.useState)(!1);return(0,s.jsxs)("div",{className:"mx-auto max-w-3xl px-6 py-12 space-y-8",children:[(0,s.jsxs)("header",{className:"space-y-3",children:[(0,s.jsx)("h1",{className:"text-3xl font-bold",children:"Menu"}),(0,s.jsxs)("p",{className:"text-gray-600 dark:text-gray-400",children:["A vertical menu backed by the headless"," ",(0,s.jsx)("code",{className:"font-mono text-sm",children:"useMenu"})," hook. It opens on click / hover / right-click, roves focus with arrow keys, supports single/multi selection, submenus, separators, and closes on outside-click / Escape / selection. The floating list renders through a portal to ",(0,s.jsx)("code",{className:"font-mono text-sm",children:"document.body"})," — theme the ",(0,s.jsx)("code",{children:"menu"})," / ",(0,s.jsx)("code",{children:"menuitem"})," roles."]})]}),(0,s.jsxs)("section",{className:"space-y-4",children:[(0,s.jsx)("h2",{className:"text-xl font-semibold",children:"Click-trigger menu"}),(0,s.jsxs)("p",{className:"text-sm text-gray-600 dark:text-gray-400",children:["Pass a trigger element as ",(0,s.jsx)("code",{children:"children"})," and an"," ",(0,s.jsx)("code",{children:"items"})," array. Default ",(0,s.jsx)("code",{children:'trigger="click"'})," toggles the menu; ",(0,s.jsx)("code",{children:"closeOnSelection"})," dismisses after a click."]}),(0,s.jsx)(l.Demo,{code:`<Menu
  className="min-w-[10rem] rounded-md border border-gray-200 bg-white p-1 text-sm shadow-lg dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
  open={open}
  onOpenChange={setOpen}
  trigger="click"
  items={[
    { key: 'new', label: 'New file', shortcut: '⌘N' },
    { key: 'open', label: 'Open…' },
    { key: 'sep', label: '—' },
    { key: 'exit', label: 'Exit', disabled: true }
  ]}
>
  <button className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800">
    File
  </button>
</Menu>`,children:(0,s.jsxs)("div",{className:"flex flex-col items-center gap-3",children:[(0,s.jsx)(n.W1t,{className:"min-w-[10rem] rounded-md border border-gray-200 bg-white p-1 text-sm shadow-lg dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100",open:e,onOpenChange:t,trigger:"click",items:[{key:"new",label:"New file",shortcut:"⌘N"},{key:"open",label:"Open…"},{key:"exit",label:"Exit",disabled:!0}],children:(0,s.jsxs)("button",{type:"button",className:"inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800",children:["File ",(0,s.jsx)("span",{"aria-hidden":!0,children:"▾"})]})}),(0,s.jsxs)("span",{className:"text-xs text-gray-500",children:["The menu list portals to body and positions absolutely — the"," ",(0,s.jsx)("code",{children:"className"})," themes the list; theme the trigger button."]})]})})]}),(0,s.jsxs)("section",{className:"space-y-4",children:[(0,s.jsx)("h2",{className:"text-xl font-semibold",children:"Selection & submenus"}),(0,s.jsxs)("p",{className:"text-sm text-gray-600 dark:text-gray-400",children:["Enable ",(0,s.jsx)("code",{children:"multiSelect"})," to render check marks for more than one item; nest items under ",(0,s.jsx)("code",{children:"submenu"})," for cascading menus. Hover-triggered menus open with ",(0,s.jsx)("code",{children:'trigger="hover"'}),"."]}),(0,s.jsx)(l.Demo,{code:`<Menu
  className="min-w-[10rem] rounded-md border border-gray-200 bg-white p-1 text-sm shadow-lg dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
  trigger="hover"
  multiSelect
  items={[
    { key: 'bold', label: 'Bold', selected: true },
    { key: 'italic', label: 'Italic' },
    { key: 'theme', label: 'Theme', submenu: [
      { key: 'light', label: 'Light' },
      { key: 'dark', label: 'Dark' }
    ]}
  ]}
>
  <button className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800">
    Format
  </button>
</Menu>`,children:(0,s.jsx)("p",{className:"text-sm text-gray-500",children:"Multi-select + submenu behavior is wired by the hook — see the snippet for the data shape."})})]}),(0,s.jsxs)("section",{className:"space-y-4",children:[(0,s.jsx)("h2",{className:"text-xl font-semibold",children:"Props"}),(0,s.jsx)(o.X,{props:[{name:"items",type:"MenuItem[]",default:"—",description:"Menu entries: { key, label, shortcut?, disabled?, submenu?, action? }."},{name:"children",type:"ReactElement",default:"—",description:"The trigger element (cloned with menu-managed handlers + ARIA)."},{name:"open / onOpenChange",type:"boolean / (open) => void",default:"—",description:"Controlled visibility of the menu."},{name:"trigger",type:"'click' | 'hover' | 'context'",default:"'click'",description:"Interaction that opens the menu."},{name:"multiSelect",type:"boolean",default:"false",description:"Allow more than one item to be selected at a time."},{name:"closeOnSelection / closeOnOutsideClick",type:"boolean",default:"true",description:"Dismiss after selecting an item / clicking outside."},{name:"renderItem",type:"(item, props) => ReactNode",default:"—",description:"Custom renderer for each menu item."}]})]})]})}},74765:(e,t,r)=>{Promise.resolve().then(r.bind(r,19517))}},e=>{e.O(0,[7521,8575,1289,6741,3948,7358],()=>e(e.s=74765)),_N_E=e.O()}]);