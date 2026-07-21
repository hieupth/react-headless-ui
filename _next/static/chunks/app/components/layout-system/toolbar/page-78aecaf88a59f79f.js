(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[1860],{68817:(e,t,a)=>{"use strict";a.r(t),a.d(t,{default:()=>c});var r=a(25454),o=a(89918),s=a(21887),i=a(55782),l=a(828);let n=[{id:"new",label:"New",type:"button",icon:(0,r.jsx)("span",{"aria-hidden":!0,children:"＋"}),variant:"primary"},{id:"open",label:"Open",type:"button",icon:(0,r.jsx)("span",{"aria-hidden":!0,children:"\uD83D\uDCC2"})},{id:"sep1",label:"",type:"separator"},{id:"cut",label:"Cut",type:"button",icon:(0,r.jsx)("span",{"aria-hidden":!0,children:"✂"})},{id:"copy",label:"Copy",type:"button",icon:(0,r.jsx)("span",{"aria-hidden":!0,children:"⧉"})},{id:"paste",label:"Paste",type:"button",disabled:!0},{id:"sep2",label:"",type:"separator"},{id:"undo",label:"Undo",type:"button"}],d=[{id:"bold",label:"Bold",type:"button",icon:(0,r.jsx)("span",{"aria-hidden":!0,children:"B"})},{id:"italic",label:"Italic",type:"button",icon:(0,r.jsx)("span",{"aria-hidden":!0,children:"I"})},{id:"underline",label:"Underline",type:"button",icon:(0,r.jsx)("span",{"aria-hidden":!0,children:"U"})},{id:"sep",label:"",type:"separator"},{id:"clear",label:"Clear",type:"button"}];function c(){let[e,t]=(0,o.useState)("—");return(0,r.jsxs)("div",{className:"mx-auto max-w-3xl px-6 py-12 space-y-8",children:[(0,r.jsxs)("header",{className:"space-y-3",children:[(0,r.jsx)("h1",{className:"text-3xl font-bold",children:"Toolbar"}),(0,r.jsxs)("p",{className:"text-gray-600 dark:text-gray-400",children:["A grouped set of action buttons backed by the headless"," ",(0,r.jsx)("code",{className:"font-mono text-sm",children:"useToolbar"})," hook. It manages item activation, keyboard navigation (Arrow / Home / End), and the"," ",(0,r.jsx)("code",{children:"toolbar"})," role with ",(0,r.jsx)("code",{children:"aria-orientation"}),". Items are declared as data — ",(0,r.jsx)("code",{children:"button"}),", ",(0,r.jsx)("code",{children:"separator"}),","," ",(0,r.jsx)("code",{children:"spacer"}),", or ",(0,r.jsx)("code",{children:"group"})," — and the default renderer maps them to styled controls. Provide ",(0,r.jsx)("code",{children:"renderItem"})," to draw each item yourself."]})]}),(0,r.jsxs)("section",{className:"space-y-4",children:[(0,r.jsx)("h2",{className:"text-xl font-semibold",children:"Horizontal toolbar"}),(0,r.jsxs)("p",{className:"text-sm text-gray-600 dark:text-gray-400",children:["A file-style toolbar: a primary action, regular buttons, a separator, and a disabled item. Last activated:"," ",(0,r.jsx)("code",{className:"font-mono",children:e}),"."]}),(0,r.jsx)(i.Demo,{code:`<Toolbar
  defaultItems={[
    { id: 'new', label: 'New', type: 'button', icon: <span aria-hidden>＋</span>, variant: 'primary' },
    { id: 'open', label: 'Open', type: 'button', icon: <span aria-hidden>📂</span> },
    { id: 'sep1', label: '', type: 'separator' },
    { id: 'cut', label: 'Cut', type: 'button', icon: <span aria-hidden>✂</span> },
    { id: 'copy', label: 'Copy', type: 'button', icon: <span aria-hidden>⧉</span> },
    { id: 'paste', label: 'Paste', type: 'button', disabled: true },
    { id: 'sep2', label: '', type: 'separator' },
    { id: 'undo', label: 'Undo', type: 'button' },
  ]}
  orientation="horizontal"
  className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-2 shadow-sm dark:border-gray-700 dark:bg-gray-900"
  onItemActivate={(item) => console.log(item.id)}
/>`,children:(0,r.jsx)(s.M7E,{defaultItems:n,orientation:"horizontal",label:"File actions",className:"flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-2 shadow-sm dark:border-gray-700 dark:bg-gray-900",onItemActivate:e=>t(String(e.id))})})]}),(0,r.jsxs)("section",{className:"space-y-4",children:[(0,r.jsx)("h2",{className:"text-xl font-semibold",children:"Icon-only & vertical"}),(0,r.jsxs)("p",{className:"text-sm text-gray-600 dark:text-gray-400",children:["With ",(0,r.jsx)("code",{children:"showLabels"})," off, only icons render."," ",(0,r.jsx)("code",{children:'orientation="vertical"'})," stacks the items and flips"," ",(0,r.jsx)("code",{children:"aria-orientation"}),"."]}),(0,r.jsx)(i.Demo,{code:`<Toolbar
  defaultItems={verticalItems}
  orientation="vertical"
  size="sm"
  showLabels={false}
  className="inline-flex flex-col items-center gap-2 rounded-lg border border-gray-200 bg-white p-2 shadow-sm dark:border-gray-700 dark:bg-gray-900"
/>`,children:(0,r.jsx)(s.M7E,{defaultItems:d,orientation:"vertical",size:"sm",showLabels:!1,className:"inline-flex flex-col items-center gap-2 rounded-lg border border-gray-200 bg-white p-2 shadow-sm dark:border-gray-700 dark:bg-gray-900",onItemActivate:e=>t(String(e.id))})})]}),(0,r.jsxs)("section",{className:"space-y-4",children:[(0,r.jsx)("h2",{className:"text-xl font-semibold",children:"Custom item renderer"}),(0,r.jsxs)("p",{className:"text-sm text-gray-600 dark:text-gray-400",children:["Pass ",(0,r.jsx)("code",{children:"renderItem"})," to take full control of how each item is drawn — useful for toggles, dropdowns, or brand-styled buttons."]}),(0,r.jsx)(i.Demo,{code:`<Toolbar
  defaultItems={[
    { id: 'left', label: 'Left', type: 'button' },
    { id: 'center', label: 'Center', type: 'button' },
    { id: 'right', label: 'Right', type: 'button' },
  ]}
  showBorder={false}
  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1 shadow-sm dark:border-gray-700 dark:bg-gray-900"
  renderItem={({ item, isActive, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      data-active={isActive}
      className={
        'rounded-md px-3 py-1.5 text-sm font-medium transition-colors ' +
        (isActive
          ? 'bg-blue-600 text-white'
          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800')
      }
    >
      {item.label}
    </button>
  )}
/>`,children:(0,r.jsx)(s.M7E,{defaultItems:[{id:"left",label:"Left",type:"button"},{id:"center",label:"Center",type:"button"},{id:"right",label:"Right",type:"button"}],showBorder:!1,className:"inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1 shadow-sm dark:border-gray-700 dark:bg-gray-900",renderItem:({item:e,isActive:t,onClick:a})=>(0,r.jsx)("button",{type:"button",onClick:a,"data-active":t,className:"rounded-md px-3 py-1.5 text-sm font-medium transition-colors "+(t?"bg-blue-600 text-white":"text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"),children:e.label})})})]}),(0,r.jsxs)("section",{className:"space-y-4",children:[(0,r.jsx)("h2",{className:"text-xl font-semibold",children:"Props"}),(0,r.jsx)(l.X,{props:[{name:"defaultItems",type:"ToolbarItem[]",default:"[]",description:"Uncontrolled initial items (button | separator | spacer | group)."},{name:"items",type:"ToolbarItem[]",default:"—",description:"Controlled item list."},{name:"orientation",type:"'horizontal' | 'vertical'",default:"'horizontal'",description:"Layout direction; sets aria-orientation."},{name:"size",type:"'sm' | 'md' | 'lg'",default:"'md'",description:"Density of the toolbar and its default buttons."},{name:"showLabels",type:"boolean",default:"true",description:"When false, only icons render on buttons."},{name:"disabled",type:"boolean",default:"false",description:"Disables the whole toolbar (aria-disabled)."},{name:"collapsed",type:"boolean",default:"false",description:"Controlled collapsed state for overflow menus."},{name:"sticky",type:"boolean",default:"false",description:"Makes the toolbar position: sticky at the top."},{name:"label",type:"string",default:"—",description:"Accessible name (aria-label) for the toolbar."},{name:"onItemActivate",type:"(item: ToolbarItem) => void",default:"—",description:"Fires when an item is activated (click or keyboard)."},{name:"renderItem",type:"(props) => ReactNode",default:"—",description:"Escape-hatch custom renderer per item."}]})]})]})}},90137:(e,t,a)=>{Promise.resolve().then(a.bind(a,68817))}},e=>{e.O(0,[7521,8575,1289,6741,3948,7358],()=>e(e.s=90137)),_N_E=e.O()}]);