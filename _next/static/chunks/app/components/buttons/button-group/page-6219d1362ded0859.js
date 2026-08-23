(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[9724],{828:(e,t,s)=>{"use strict";s.d(t,{X:()=>o});var a=s(25454);function o({props:e}){return 0===e.length?(0,a.jsx)("p",{className:"docs-desc",children:"No props."}):(0,a.jsx)("div",{className:"props-table-wrap",children:(0,a.jsxs)("table",{className:"props-table",children:[(0,a.jsx)("thead",{children:(0,a.jsxs)("tr",{children:[(0,a.jsx)("th",{scope:"col",children:"Name"}),(0,a.jsx)("th",{scope:"col",children:"Type"}),(0,a.jsx)("th",{scope:"col",children:"Default"}),(0,a.jsx)("th",{scope:"col",children:"Description"})]})}),(0,a.jsx)("tbody",{children:e.map(e=>(0,a.jsxs)("tr",{children:[(0,a.jsx)("td",{className:"props-name",children:e.name}),(0,a.jsx)("td",{className:"props-type",children:e.type}),(0,a.jsx)("td",{className:"props-default",children:e.default??"—"}),(0,a.jsx)("td",{children:e.description})]},e.name))})]})})}},4956:(e,t,s)=>{"use strict";s.d(t,{CodeBlock:()=>r});var a=s(25454),o=s(89918),d=s(17521);function r({code:e,language:t="tsx"}){let[s,n]=(0,o.useState)(""),[l,i]=(0,o.useState)(!1);async function c(){try{await navigator.clipboard.writeText(e),i(!0),setTimeout(()=>i(!1),1500)}catch{}}return(0,o.useEffect)(()=>{let s=!1;return(0,d.Yz)(e,{lang:t,theme:"github-dark"}).then(e=>{s||n(e)}).catch(()=>{s||n("")}),()=>{s=!0}},[e,t]),(0,a.jsxs)("div",{className:"code-block",children:[(0,a.jsx)("button",{type:"button",onClick:c,className:"code-copy","aria-label":"Copy code",children:l?"Copied!":"Copy"}),s?(0,a.jsx)("div",{className:"overflow-x-auto [&>pre]:!m-0 [&>pre]:!bg-transparent [&>pre]:p-4",dangerouslySetInnerHTML:{__html:s}}):(0,a.jsx)("pre",{className:"overflow-x-auto p-4",style:{background:"#0d1117",color:"#f3f4f6"},children:(0,a.jsx)("code",{children:e})})]})}},52191:(e,t,s)=>{Promise.resolve().then(s.bind(s,58979))},55782:(e,t,s)=>{"use strict";s.d(t,{Demo:()=>r});var a=s(25454),o=s(89918),d=s(4956);function r({code:e,children:t}){let[s,n]=(0,o.useState)(!1),[l,i]=(0,o.useState)(!1),c=(0,o.useId)();return(0,a.jsxs)("div",{className:"demo-frame",children:[(0,a.jsxs)("div",{className:"demo-toolbar",children:[(0,a.jsx)("span",{className:"demo-label",children:"Preview"}),(0,a.jsx)("button",{type:"button",onClick:()=>{n(e=>!e),i(!0)},className:"demo-toggle","aria-expanded":s,"aria-controls":c,children:s?"Hide Code":"Show Code"})]}),(0,a.jsx)("div",{className:"demo-canvas",children:t}),(0,a.jsx)("div",{id:c,className:"demo-code-panel",hidden:!s,children:l&&(0,a.jsx)(d.CodeBlock,{code:e})})]})}},58979:(e,t,s)=>{"use strict";s.r(t),s.d(t,{default:()=>h});var a=s(25454),o=s(42098),d=s(55782),r=s(828);let n="px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",l="bg-gray-900 text-white hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200",i="border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800",c="border-indigo-600 bg-indigo-600 text-white",u="text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800";function h(){return(0,a.jsxs)("div",{className:"docs-page",children:[(0,a.jsxs)("header",{className:"docs-header",children:[(0,a.jsx)("h1",{className:"docs-h1",children:"ButtonGroup"}),(0,a.jsxs)("p",{className:"docs-lead",children:["Groups related buttons into a connected segmented control, backed by the headless ",(0,a.jsx)("code",{className:"docs-code",children:"useButtonGroup"})," ","hook. Supports horizontal/vertical orientation, attached edges, and exclusive (radio-like) or multi selection — all wired with proper ARIA roles. Like every react-headless-ui component it ships no styles; theme the container and each item via classes or the"," ",(0,a.jsx)("code",{className:"docs-code",children:"children"})," render prop."]})]}),(0,a.jsxs)("section",{className:"docs-section",children:[(0,a.jsx)("h2",{className:"docs-h2",children:"Attached segments"}),(0,a.jsxs)("p",{className:"docs-desc",children:["A connected toolbar of actions using"," ",(0,a.jsx)("code",{children:"attached"}),". Each item is themed through the"," ",(0,a.jsx)("code",{children:"children"})," render prop (the headless build leaves internal classes empty)."]}),(0,a.jsx)(d.Demo,{code:`<ButtonGroup
  variant="primary"
  attached
  buttons={[
    { label: 'Day' },
    { label: 'Week' },
    { label: 'Month' },
  ]}
>
  {(_, props, index) => {
    const isLast = index === 2;
    const radius = index === 0 ? 'rounded-l-md' : isLast ? 'rounded-r-md' : '';
    return (
      <button
        {...props}
        className={\`\${btnBase} \${variantStyle.primary.rest} \${radius}\`}
      />
    );
  }}
</ButtonGroup>`,children:(0,a.jsx)(o.e,{variant:"primary",attached:!0,buttons:[{label:"Day"},{label:"Week"},{label:"Month"}],children:(e,t,s)=>(0,a.jsx)("button",{...t,className:`${n} ${l} ${0===s?"rounded-l-md":2===s?"rounded-r-md":""}`})})})]}),(0,a.jsxs)("section",{className:"docs-section",children:[(0,a.jsx)("h2",{className:"docs-h2",children:"Exclusive selection"}),(0,a.jsxs)("p",{className:"docs-desc",children:["With ",(0,a.jsx)("code",{children:"exclusive"}),", the group behaves like a radio control: a single selected index, controlled via"," ",(0,a.jsx)("code",{children:"selectedIndex"})," / ",(0,a.jsx)("code",{children:"onSelectionChange"}),"."]}),(0,a.jsx)(d.Demo,{code:`<ButtonGroup
  variant="outline"
  exclusive
  defaultSelectedIndex={1}
  buttons={[
    { label: 'List' },
    { label: 'Grid' },
    { label: 'Gallery' },
  ]}
>
  {(_, props, index, isSelected) => {
    const radius = index === 0
      ? 'rounded-l-md border-r-0'
      : index === 2
        ? 'rounded-r-md'
        : 'border-r-0';
    const state = isSelected ? variantStyle.outline.selected : variantStyle.outline.rest;
    return <button {...props} className={\`\${btnBase} \${radius} \${state}\`} />;
  }}
</ButtonGroup>`,children:(0,a.jsx)(o.e,{variant:"outline",exclusive:!0,defaultSelectedIndex:1,buttons:[{label:"List"},{label:"Grid"},{label:"Gallery"}],children:(e,t,s,o)=>(0,a.jsx)("button",{...t,className:`${n} ${0===s?"rounded-l-md border-r-0":2===s?"rounded-r-md":"border-r-0"} ${o?c:i}`})})})]}),(0,a.jsxs)("section",{className:"docs-section",children:[(0,a.jsx)("h2",{className:"docs-h2",children:"Vertical & disabled"}),(0,a.jsxs)("p",{className:"docs-desc",children:["Set ",(0,a.jsx)("code",{children:'orientation="vertical"'})," for stacked groups, and"," ",(0,a.jsx)("code",{children:"disabled"})," to disable every item at once."]}),(0,a.jsx)(d.Demo,{code:`<ButtonGroup
  variant="ghost"
  orientation="vertical"
  buttons={[
    { label: 'Profile' },
    { label: 'Settings' },
    { label: 'Sign out' },
  ]}
>
  {(_, props, index) => {
    const radius = index === 0 ? 'rounded-t-md' : index === 2 ? 'rounded-b-md' : '';
    return (
      <button
        {...props}
        className={\`\${btnBase} w-full text-left \${variantStyle.ghost.rest} \${radius}\`}
      />
    );
  }}
</ButtonGroup>`,children:(0,a.jsx)(o.e,{variant:"ghost",orientation:"vertical",buttons:[{label:"Profile"},{label:"Settings"},{label:"Sign out"}],children:(e,t,s)=>(0,a.jsx)("button",{...t,className:`${n} w-full text-left ${u} ${0===s?"rounded-t-md":2===s?"rounded-b-md":""}`})})})]}),(0,a.jsxs)("section",{className:"docs-section",children:[(0,a.jsx)("h2",{className:"docs-h2",children:"Props"}),(0,a.jsx)(r.X,{props:[{name:"buttons",type:"Array<{ label: ReactNode; value?: any; disabled?: boolean; onClick?: (e) => void; buttonProps?: Record<string, any> }>",default:"[]",description:"List of buttons to render in the group."},{name:"orientation",type:"'horizontal' | 'vertical'",default:"'horizontal'",description:"Layout direction of the group."},{name:"attached",type:"boolean",default:"false",description:"Visually connect adjacent button edges."},{name:"exclusive",type:"boolean",default:"false",description:"Radio-like selection: only one item selected at a time."},{name:"selectedIndex",type:"number | null",default:"—",description:"Controlled selected index (exclusive mode)."},{name:"defaultSelectedIndex",type:"number | null",default:"—",description:"Initial selected index for uncontrolled exclusive mode."},{name:"onSelectionChange",type:"(index: number | null) => void",default:"—",description:"Called when the exclusive selection changes."},{name:"size",type:"'sm' | 'md' | 'lg'",default:"'md'",description:"Size applied to every button in the group."},{name:"variant",type:"'primary' | 'secondary' | 'outline' | 'ghost'",default:"'primary'",description:"Variant applied to every button in the group."},{name:"disabled",type:"boolean",default:"false",description:"Disables the entire group."},{name:"children",type:"(button, props, index, isSelected) => ReactNode",default:"—",description:"Render prop for custom per-item rendering with full state."}]})]})]})}}},e=>{e.O(0,[7521,2098,6741,3948,7358],()=>e(e.s=52191)),_N_E=e.O()}]);