(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[5668],{57903:(e,t,l)=>{"use strict";l.r(t),l.d(t,{default:()=>c});var a=l(25454),r=l(89918),s=l(21887),o=l(55782),n=l(828);let i=[{key:"apple",label:"Apple",value:"apple"},{key:"banana",label:"Banana",value:"banana"},{key:"cherry",label:"Cherry",value:"cherry"},{key:"date",label:"Date",value:"date"}];function d({options:e=i,...t}){return(0,a.jsx)(s.l6P,{options:e,className:"w-full max-w-xs",renderTrigger:e=>(0,a.jsxs)("button",{ref:e.triggerRef,type:"button",className:`inline-flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:shadow-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${e.className} ${e.className.includes("disabled")?"opacity-50":""}`,onClick:e.handleTriggerClick,onKeyDown:e.handleKeyDown,...e.triggerAttributes,children:[(0,a.jsx)("span",{className:e.selectedOption?"text-gray-900 dark:text-gray-100":"text-gray-400",children:e.selectedOption?e.selectedOption.label:"Select an option"}),(0,a.jsx)("svg",{className:`h-4 w-4 text-gray-400 transition-transform ${e.open?"rotate-180":""}`,fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:(0,a.jsx)("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M19 9l-7 7-7-7"})})]}),renderListbox:e=>e.open?(0,a.jsx)("div",{className:"z-50 mt-1 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-900",style:{minWidth:e.triggerRef.current?.offsetWidth||200,maxHeight:240},children:(0,a.jsx)("ul",{ref:e.listboxRef,...e.listboxAttributes,onKeyDown:e.handleKeyDown,children:0===e.filteredOptions.length?(0,a.jsx)("li",{className:"px-3 py-2 text-sm text-gray-400",children:"No options"}):e.filteredOptions.map((t,l)=>{let r=t.value===e.selectedValue,s=l===e.highlightedIndex;return(0,a.jsxs)("li",{className:`flex cursor-pointer items-center justify-between px-3 py-2 text-sm ${s?"bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300":"text-gray-700 dark:text-gray-200"} `,onClick:()=>e.selectOption(t.value),onMouseEnter:()=>e.highlightOption(l),...e.getOptionAttributes(t,l),children:[(0,a.jsx)("span",{children:t.label}),r&&(0,a.jsx)("svg",{className:"h-4 w-4 text-blue-600",fill:"currentColor",viewBox:"0 0 20 20",children:(0,a.jsx)("path",{fillRule:"evenodd",d:"M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z",clipRule:"evenodd"})})]},t.key)})})}):null,...t})}function c(){let[e,t]=(0,r.useState)("apple");return(0,a.jsxs)("div",{className:"mx-auto max-w-3xl px-6 py-12 space-y-8",children:[(0,a.jsxs)("header",{className:"space-y-3",children:[(0,a.jsx)("h1",{className:"text-3xl font-bold",children:"Select"}),(0,a.jsxs)("p",{className:"text-gray-600 dark:text-gray-400",children:["A dropdown select backed by the headless"," ",(0,a.jsx)("code",{className:"font-mono text-sm",children:"useSelect"})," hook. It handles open/close, roving arrow-key navigation, optional search, single selection, and full ARIA"," ",(0,a.jsx)("code",{className:"font-mono text-sm",children:"combobox"})," /"," ",(0,a.jsx)("code",{className:"font-mono text-sm",children:"listbox"})," roles. The listbox is portaled to ",(0,a.jsx)("code",{className:"font-mono text-sm",children:"document.body"}),", so theme the trigger and dropdown via the"," ",(0,a.jsx)("code",{className:"font-mono text-sm",children:"renderTrigger"})," /"," ",(0,a.jsx)("code",{className:"font-mono text-sm",children:"renderListbox"})," render props."]})]}),(0,a.jsxs)("section",{className:"space-y-4",children:[(0,a.jsx)("h2",{className:"text-xl font-semibold",children:"Basic"}),(0,a.jsx)("p",{className:"text-sm text-gray-600 dark:text-gray-400",children:"A controlled select. Click the trigger, then arrow-key or click an option."}),(0,a.jsx)(o.Demo,{code:`<Select
  options={options}
  defaultValue="apple"
  className="w-full max-w-xs"
  renderTrigger={(p) => (
    <button
      ref={p.triggerRef}
      type="button"
      className="inline-flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
      onClick={p.handleTriggerClick}
      {...p.triggerAttributes}
    >
      {p.selectedOption ? p.selectedOption.label : 'Select an option'}
      <svg className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
      </svg>
    </button>
  )}
/>`,children:(0,a.jsx)(d,{defaultValue:"apple"})})]}),(0,a.jsxs)("section",{className:"space-y-4",children:[(0,a.jsx)("h2",{className:"text-xl font-semibold",children:"Controlled"}),(0,a.jsxs)("p",{className:"text-sm text-gray-600 dark:text-gray-400",children:["Drive selection with ",(0,a.jsx)("code",{children:"value"})," / ",(0,a.jsx)("code",{children:"onValueChange"}),"."]}),(0,a.jsx)(o.Demo,{code:`<Select
  value={fruit}
  onValueChange={setFruit}
  options={options}
  className="w-full max-w-xs"
  renderTrigger={(p) => (
    <button
      ref={p.triggerRef}
      type="button"
      className="inline-flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
      onClick={p.handleTriggerClick}
      {...p.triggerAttributes}
    >
      {p.selectedOption ? p.selectedOption.label : 'Select an option'}
      <svg className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
      </svg>
    </button>
  )}
/>`,children:(0,a.jsxs)("div",{className:"flex flex-col items-center gap-2",children:[(0,a.jsx)(d,{value:e,onValueChange:e=>t(e)}),(0,a.jsxs)("p",{className:"text-xs text-gray-500",children:["Selected: ",e]})]})})]}),(0,a.jsxs)("section",{className:"space-y-4",children:[(0,a.jsx)("h2",{className:"text-xl font-semibold",children:"Searchable & clearable"}),(0,a.jsxs)("p",{className:"text-sm text-gray-600 dark:text-gray-400",children:[(0,a.jsx)("code",{children:"searchable"})," adds a filter input;"," ",(0,a.jsx)("code",{children:"allowClear"})," adds a clear affordance."]}),(0,a.jsx)(o.Demo,{code:`<Select
  searchable
  allowClear
  options={options}
  className="w-full max-w-xs"
  renderTrigger={(p) => (
    <button
      ref={p.triggerRef}
      type="button"
      className="inline-flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
      onClick={p.handleTriggerClick}
      {...p.triggerAttributes}
    >
      {p.selectedOption ? p.selectedOption.label : 'Select an option'}
      <svg className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
      </svg>
    </button>
  )}
/>`,children:(0,a.jsx)(d,{searchable:!0,allowClear:!0})})]}),(0,a.jsxs)("section",{className:"space-y-4",children:[(0,a.jsx)("h2",{className:"text-xl font-semibold",children:"Props"}),(0,a.jsx)(n.X,{props:[{name:"options",type:"SelectOption[]",default:"[]",description:"Options: { key, label, value, disabled?, icon?, description? }."},{name:"value / defaultValue",type:"any",default:"—",description:"Controlled or uncontrolled selected value."},{name:"onValueChange",type:"(value: any) => void",default:"—",description:"Called when the selection changes."},{name:"placeholder",type:"string",default:"'Select an option'",description:"Text shown when nothing is selected."},{name:"searchable",type:"boolean",default:"false",description:"Show a filter input at the top of the listbox."},{name:"allowClear",type:"boolean",default:"false",description:"Show a clear-selection affordance."},{name:"disabled",type:"boolean",default:"false",description:"Disables the trigger; reflected to ARIA."},{name:"size / variant",type:"'sm' | 'md' | 'lg' / 'default' | 'outlined' | 'filled'",default:"'md' / 'default'",description:"Size and variant hooks."},{name:"renderTrigger / renderListbox / renderOption",type:"(props) => ReactNode",default:"—",description:"Custom renderers for trigger, dropdown, and each option."}]})]})]})}},85119:(e,t,l)=>{Promise.resolve().then(l.bind(l,57903))}},e=>{e.O(0,[7521,8575,1289,6741,3948,7358],()=>e(e.s=85119)),_N_E=e.O()}]);