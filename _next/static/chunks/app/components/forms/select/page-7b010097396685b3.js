(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[5668],{828:(e,s,l)=>{"use strict";l.d(s,{X:()=>a});var t=l(25454);function a({props:e}){return 0===e.length?(0,t.jsx)("p",{className:"docs-desc",children:"No props."}):(0,t.jsx)("div",{className:"props-table-wrap",children:(0,t.jsxs)("table",{className:"props-table",children:[(0,t.jsx)("thead",{children:(0,t.jsxs)("tr",{children:[(0,t.jsx)("th",{scope:"col",children:"Name"}),(0,t.jsx)("th",{scope:"col",children:"Type"}),(0,t.jsx)("th",{scope:"col",children:"Default"}),(0,t.jsx)("th",{scope:"col",children:"Description"})]})}),(0,t.jsx)("tbody",{children:e.map(e=>(0,t.jsxs)("tr",{children:[(0,t.jsx)("td",{className:"props-name",children:e.name}),(0,t.jsx)("td",{className:"props-type",children:e.type}),(0,t.jsx)("td",{className:"props-default",children:e.default??"—"}),(0,t.jsx)("td",{children:e.description})]},e.name))})]})})}},4956:(e,s,l)=>{"use strict";l.d(s,{CodeBlock:()=>o});var t=l(25454),a=l(89918),r=l(17521);function o({code:e,language:s="tsx"}){let[l,n]=(0,a.useState)(""),[d,i]=(0,a.useState)(!1);async function c(){try{await navigator.clipboard.writeText(e),i(!0),setTimeout(()=>i(!1),1500)}catch{}}return(0,a.useEffect)(()=>{let l=!1;return(0,r.Yz)(e,{lang:s,theme:"github-dark"}).then(e=>{l||n(e)}).catch(()=>{l||n("")}),()=>{l=!0}},[e,s]),(0,t.jsxs)("div",{className:"code-block",children:[(0,t.jsx)("button",{type:"button",onClick:c,className:"code-copy","aria-label":"Copy code",children:d?"Copied!":"Copy"}),l?(0,t.jsx)("div",{className:"overflow-x-auto [&>pre]:!m-0 [&>pre]:!bg-transparent [&>pre]:p-4",dangerouslySetInnerHTML:{__html:l}}):(0,t.jsx)("pre",{className:"overflow-x-auto p-4",style:{background:"#0d1117",color:"#f3f4f6"},children:(0,t.jsx)("code",{children:e})})]})}},55782:(e,s,l)=>{"use strict";l.d(s,{Demo:()=>o});var t=l(25454),a=l(89918),r=l(4956);function o({code:e,children:s}){let[l,n]=(0,a.useState)(!1),[d,i]=(0,a.useState)(!1),c=(0,a.useId)();return(0,t.jsxs)("div",{className:"demo-frame",children:[(0,t.jsxs)("div",{className:"demo-toolbar",children:[(0,t.jsx)("span",{className:"demo-label",children:"Preview"}),(0,t.jsx)("button",{type:"button",onClick:()=>{n(e=>!e),i(!0)},className:"demo-toggle","aria-expanded":l,"aria-controls":c,children:l?"Hide Code":"Show Code"})]}),(0,t.jsx)("div",{className:"demo-canvas",children:s}),(0,t.jsx)("div",{id:c,className:"demo-code-panel",hidden:!l,children:d&&(0,t.jsx)(r.CodeBlock,{code:e})})]})}},57903:(e,s,l)=>{"use strict";l.r(s),l.d(s,{default:()=>c});var t=l(25454),a=l(89918),r=l(89844),o=l(55782),n=l(828);let d=[{key:"apple",label:"Apple",value:"apple"},{key:"banana",label:"Banana",value:"banana"},{key:"cherry",label:"Cherry",value:"cherry"},{key:"date",label:"Date",value:"date"}];function i({options:e=d,...s}){return(0,t.jsx)(r.l6,{options:e,className:"w-full max-w-xs",renderTrigger:e=>(0,t.jsxs)("button",{ref:e.triggerRef,type:"button",className:`inline-flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:shadow-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${e.className} ${e.triggerAttributes["data-disabled"]?"opacity-50":""}`,onClick:e.handleTriggerClick,onKeyDown:e.handleKeyDown,...e.triggerAttributes,children:[(0,t.jsx)("span",{className:e.selectedOption?"text-gray-900 dark:text-gray-100":"text-gray-400",children:e.selectedOption?e.selectedOption.label:"Select an option"}),(0,t.jsx)("svg",{className:`h-4 w-4 text-gray-400 transition-transform ${e.open?"rotate-180":""}`,fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:(0,t.jsx)("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M19 9l-7 7-7-7"})})]}),renderListbox:e=>e.open?(0,t.jsx)("div",{className:"z-50 mt-1 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-900",style:{minWidth:e.triggerRef.current?.offsetWidth||200,maxHeight:240},children:(0,t.jsx)("ul",{ref:e.listboxRef,...e.listboxAttributes,onKeyDown:e.handleKeyDown,children:0===e.filteredOptions.length?(0,t.jsx)("li",{className:"px-3 py-2 text-sm text-gray-400",children:"No options"}):e.filteredOptions.map((s,l)=>{let a=s.value===e.selectedValue,r=l===e.highlightedIndex;return(0,t.jsxs)("li",{className:`flex cursor-pointer items-center justify-between px-3 py-2 text-sm ${r?"bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300":"text-gray-700 dark:text-gray-200"} `,onClick:()=>e.selectOption(s.value),onMouseEnter:()=>e.highlightOption(l),...e.getOptionAttributes(s,l),children:[(0,t.jsx)("span",{children:s.label}),a&&(0,t.jsx)("svg",{className:"h-4 w-4 text-indigo-600",fill:"currentColor",viewBox:"0 0 20 20",children:(0,t.jsx)("path",{fillRule:"evenodd",d:"M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z",clipRule:"evenodd"})})]},s.key)})})}):null,...s})}function c(){let[e,s]=(0,a.useState)("apple");return(0,t.jsxs)("div",{className:"docs-page",children:[(0,t.jsxs)("header",{className:"docs-header",children:[(0,t.jsx)("h1",{className:"docs-h1",children:"Select"}),(0,t.jsxs)("p",{className:"docs-lead",children:["A dropdown select backed by the headless"," ",(0,t.jsx)("code",{className:"docs-code",children:"useSelect"})," hook. It handles open/close, roving arrow-key navigation, optional search, single selection, and full ARIA"," ",(0,t.jsx)("code",{className:"docs-code",children:"combobox"})," /"," ",(0,t.jsx)("code",{className:"docs-code",children:"listbox"})," roles. The listbox is portaled to ",(0,t.jsx)("code",{className:"docs-code",children:"document.body"}),", so theme the trigger and dropdown via the"," ",(0,t.jsx)("code",{className:"docs-code",children:"renderTrigger"})," /"," ",(0,t.jsx)("code",{className:"docs-code",children:"renderListbox"})," render props."]})]}),(0,t.jsxs)("section",{className:"docs-section",children:[(0,t.jsx)("h2",{className:"docs-h2",children:"Basic"}),(0,t.jsx)("p",{className:"docs-desc",children:"A controlled select. Click the trigger, then arrow-key or click an option."}),(0,t.jsx)(o.Demo,{code:`<Select
  options={options}
  defaultValue="apple"
  className="w-full max-w-xs"
  renderTrigger={(p) => (
    <button
      ref={p.triggerRef}
      type="button"
      className="inline-flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      onClick={p.handleTriggerClick}
      {...p.triggerAttributes}
    >
      {p.selectedOption ? p.selectedOption.label : 'Select an option'}
      <svg className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
      </svg>
    </button>
  )}
/>`,children:(0,t.jsx)(i,{defaultValue:"apple"})})]}),(0,t.jsxs)("section",{className:"docs-section",children:[(0,t.jsx)("h2",{className:"docs-h2",children:"Controlled"}),(0,t.jsxs)("p",{className:"docs-desc",children:["Drive selection with ",(0,t.jsx)("code",{children:"value"})," / ",(0,t.jsx)("code",{children:"onValueChange"}),"."]}),(0,t.jsx)(o.Demo,{code:`<Select
  value={fruit}
  onValueChange={setFruit}
  options={options}
  className="w-full max-w-xs"
  renderTrigger={(p) => (
    <button
      ref={p.triggerRef}
      type="button"
      className="inline-flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      onClick={p.handleTriggerClick}
      {...p.triggerAttributes}
    >
      {p.selectedOption ? p.selectedOption.label : 'Select an option'}
      <svg className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
      </svg>
    </button>
  )}
/>`,children:(0,t.jsxs)("div",{className:"flex flex-col items-center gap-2",children:[(0,t.jsx)(i,{value:e,onValueChange:e=>s(e)}),(0,t.jsxs)("p",{className:"text-xs text-gray-500",children:["Selected: ",e]})]})})]}),(0,t.jsxs)("section",{className:"docs-section",children:[(0,t.jsx)("h2",{className:"docs-h2",children:"Searchable & clearable"}),(0,t.jsxs)("p",{className:"docs-desc",children:[(0,t.jsx)("code",{children:"searchable"})," adds a filter input;"," ",(0,t.jsx)("code",{children:"allowClear"})," adds a clear affordance."]}),(0,t.jsx)(o.Demo,{code:`<Select
  searchable
  allowClear
  options={options}
  className="w-full max-w-xs"
  renderTrigger={(p) => (
    <button
      ref={p.triggerRef}
      type="button"
      className="inline-flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      onClick={p.handleTriggerClick}
      {...p.triggerAttributes}
    >
      {p.selectedOption ? p.selectedOption.label : 'Select an option'}
      <svg className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
      </svg>
    </button>
  )}
/>`,children:(0,t.jsx)(i,{searchable:!0,allowClear:!0})})]}),(0,t.jsxs)("section",{className:"docs-section",children:[(0,t.jsx)("h2",{className:"docs-h2",children:"Props"}),(0,t.jsx)(n.X,{props:[{name:"options",type:"SelectOption[]",default:"[]",description:"Options: { key, label, value, disabled?, icon?, description? }."},{name:"value / defaultValue",type:"any",default:"—",description:"Controlled or uncontrolled selected value."},{name:"onValueChange",type:"(value: any) => void",default:"—",description:"Called when the selection changes."},{name:"placeholder",type:"string",default:"'Select an option'",description:"Text shown when nothing is selected."},{name:"searchable",type:"boolean",default:"false",description:"Show a filter input at the top of the listbox."},{name:"allowClear",type:"boolean",default:"false",description:"Show a clear-selection affordance."},{name:"disabled",type:"boolean",default:"false",description:"Disables the trigger; reflected to ARIA."},{name:"size / variant",type:"'sm' | 'md' | 'lg' / 'default' | 'outlined' | 'filled'",default:"'md' / 'default'",description:"Size and variant hooks."},{name:"renderTrigger / renderListbox / renderOption",type:"(props) => ReactNode",default:"—",description:"Custom renderers for trigger, dropdown, and each option."}]})]})]})}},85119:(e,s,l)=>{Promise.resolve().then(l.bind(l,57903))}},e=>{e.O(0,[7521,9844,6741,3948,7358],()=>e(e.s=85119)),_N_E=e.O()}]);