(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[9724],{828:(e,r,t)=>{"use strict";t.d(r,{X:()=>o});var a=t(25454);function o({props:e}){return 0===e.length?(0,a.jsx)("p",{className:"text-sm text-gray-500 dark:text-gray-400",children:"No props."}):(0,a.jsx)("div",{className:"overflow-x-auto my-6",children:(0,a.jsxs)("table",{className:"w-full text-sm border-collapse border border-gray-200 dark:border-gray-700",children:[(0,a.jsx)("thead",{children:(0,a.jsxs)("tr",{className:"bg-gray-50 dark:bg-gray-900/40 text-left",children:[(0,a.jsx)("th",{scope:"col",className:"border border-gray-200 dark:border-gray-700 px-3 py-2 font-semibold",children:"Name"}),(0,a.jsx)("th",{scope:"col",className:"border border-gray-200 dark:border-gray-700 px-3 py-2 font-semibold",children:"Type"}),(0,a.jsx)("th",{scope:"col",className:"border border-gray-200 dark:border-gray-700 px-3 py-2 font-semibold",children:"Default"}),(0,a.jsx)("th",{scope:"col",className:"border border-gray-200 dark:border-gray-700 px-3 py-2 font-semibold",children:"Description"})]})}),(0,a.jsx)("tbody",{children:e.map(e=>(0,a.jsxs)("tr",{className:"align-top",children:[(0,a.jsx)("td",{className:"border border-gray-200 dark:border-gray-700 px-3 py-2 font-mono text-purple-700 dark:text-purple-300",children:e.name}),(0,a.jsx)("td",{className:"border border-gray-200 dark:border-gray-700 px-3 py-2 font-mono text-blue-700 dark:text-blue-300",children:e.type}),(0,a.jsx)("td",{className:"border border-gray-200 dark:border-gray-700 px-3 py-2 font-mono text-gray-600 dark:text-gray-400",children:e.default??"—"}),(0,a.jsx)("td",{className:"border border-gray-200 dark:border-gray-700 px-3 py-2 text-gray-700 dark:text-gray-300",children:e.description})]},e.name))})]})})}},4956:(e,r,t)=>{"use strict";t.d(r,{CodeBlock:()=>d});var a=t(25454),o=t(89918),s=t(17521);function d({code:e,language:r="tsx"}){let[t,l]=(0,o.useState)(""),[n,i]=(0,o.useState)(!1);async function c(){try{await navigator.clipboard.writeText(e),i(!0),setTimeout(()=>i(!1),1500)}catch{}}return(0,o.useEffect)(()=>{let t=!1;return(0,s.Yz)(e,{lang:r,theme:"github-dark"}).then(e=>{t||l(e)}).catch(()=>{t||l("")}),()=>{t=!0}},[e,r]),(0,a.jsxs)("div",{className:"relative group rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700",children:[(0,a.jsx)("button",{type:"button",onClick:c,className:"absolute top-2 right-2 z-10 px-2 py-1 text-xs rounded bg-gray-800/80 text-gray-100 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 transition-opacity hover:bg-gray-700","aria-label":"Copy code",children:n?"Copied!":"Copy"}),t?(0,a.jsx)("div",{className:"overflow-x-auto text-sm [&>pre]:!m-0 [&>pre]:!bg-transparent [&>pre]:p-4",dangerouslySetInnerHTML:{__html:t}}):(0,a.jsx)("pre",{className:"overflow-x-auto text-sm p-4 bg-gray-900 text-gray-100",children:(0,a.jsx)("code",{children:e})})]})}},52191:(e,r,t)=>{Promise.resolve().then(t.bind(t,58979))},55782:(e,r,t)=>{"use strict";t.d(r,{Demo:()=>d});var a=t(25454),o=t(89918),s=t(4956);function d({code:e,children:r}){let[t,l]=(0,o.useState)(!1),[n,i]=(0,o.useState)(!1),c=(0,o.useId)();return(0,a.jsxs)("div",{className:"my-6 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden",children:[(0,a.jsxs)("div",{className:"flex items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 px-3 py-2",children:[(0,a.jsx)("span",{className:"text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400",children:"Preview"}),(0,a.jsx)("button",{type:"button",onClick:()=>{l(e=>!e),i(!0)},className:"px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors","aria-expanded":t,"aria-controls":c,children:t?"Hide Code":"Show Code"})]}),(0,a.jsx)("div",{className:"p-6 flex items-center justify-center min-h-[120px] bg-white dark:bg-gray-950",children:r}),(0,a.jsx)("div",{id:c,className:"border-t border-gray-200 dark:border-gray-700",hidden:!t,children:n&&(0,a.jsx)(s.CodeBlock,{code:e})})]})}},58979:(e,r,t)=>{"use strict";t.r(r),t.d(r,{default:()=>x});var a=t(25454),o=t(42098),s=t(55782),d=t(828);let l="px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",n="bg-gray-900 text-white hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200",i="border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800",c="border-blue-600 bg-blue-600 text-white",u="text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800";function x(){return(0,a.jsxs)("div",{className:"mx-auto max-w-3xl px-6 py-12 space-y-8",children:[(0,a.jsxs)("header",{className:"space-y-3",children:[(0,a.jsx)("h1",{className:"text-3xl font-bold",children:"ButtonGroup"}),(0,a.jsxs)("p",{className:"text-gray-600 dark:text-gray-400",children:["Groups related buttons into a connected segmented control, backed by the headless ",(0,a.jsx)("code",{className:"font-mono text-sm",children:"useButtonGroup"})," ","hook. Supports horizontal/vertical orientation, attached edges, and exclusive (radio-like) or multi selection — all wired with proper ARIA roles. Like every react-headless-ui component it ships no styles; theme the container and each item via classes or the"," ",(0,a.jsx)("code",{className:"font-mono text-sm",children:"children"})," render prop."]})]}),(0,a.jsxs)("section",{className:"space-y-4",children:[(0,a.jsx)("h2",{className:"text-xl font-semibold",children:"Attached segments"}),(0,a.jsxs)("p",{className:"text-sm text-gray-600 dark:text-gray-400",children:["A connected toolbar of actions using"," ",(0,a.jsx)("code",{children:"attached"}),". Each item is themed through the"," ",(0,a.jsx)("code",{children:"children"})," render prop (the headless build leaves internal classes empty)."]}),(0,a.jsx)(s.Demo,{code:`<ButtonGroup
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
</ButtonGroup>`,children:(0,a.jsx)(o.e,{variant:"primary",attached:!0,buttons:[{label:"Day"},{label:"Week"},{label:"Month"}],children:(e,r,t)=>(0,a.jsx)("button",{...r,className:`${l} ${n} ${0===t?"rounded-l-md":2===t?"rounded-r-md":""}`})})})]}),(0,a.jsxs)("section",{className:"space-y-4",children:[(0,a.jsx)("h2",{className:"text-xl font-semibold",children:"Exclusive selection"}),(0,a.jsxs)("p",{className:"text-sm text-gray-600 dark:text-gray-400",children:["With ",(0,a.jsx)("code",{children:"exclusive"}),", the group behaves like a radio control: a single selected index, controlled via"," ",(0,a.jsx)("code",{children:"selectedIndex"})," / ",(0,a.jsx)("code",{children:"onSelectionChange"}),"."]}),(0,a.jsx)(s.Demo,{code:`<ButtonGroup
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
</ButtonGroup>`,children:(0,a.jsx)(o.e,{variant:"outline",exclusive:!0,defaultSelectedIndex:1,buttons:[{label:"List"},{label:"Grid"},{label:"Gallery"}],children:(e,r,t,o)=>(0,a.jsx)("button",{...r,className:`${l} ${0===t?"rounded-l-md border-r-0":2===t?"rounded-r-md":"border-r-0"} ${o?c:i}`})})})]}),(0,a.jsxs)("section",{className:"space-y-4",children:[(0,a.jsx)("h2",{className:"text-xl font-semibold",children:"Vertical & disabled"}),(0,a.jsxs)("p",{className:"text-sm text-gray-600 dark:text-gray-400",children:["Set ",(0,a.jsx)("code",{children:'orientation="vertical"'})," for stacked groups, and"," ",(0,a.jsx)("code",{children:"disabled"})," to disable every item at once."]}),(0,a.jsx)(s.Demo,{code:`<ButtonGroup
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
</ButtonGroup>`,children:(0,a.jsx)(o.e,{variant:"ghost",orientation:"vertical",buttons:[{label:"Profile"},{label:"Settings"},{label:"Sign out"}],children:(e,r,t)=>(0,a.jsx)("button",{...r,className:`${l} w-full text-left ${u} ${0===t?"rounded-t-md":2===t?"rounded-b-md":""}`})})})]}),(0,a.jsxs)("section",{className:"space-y-4",children:[(0,a.jsx)("h2",{className:"text-xl font-semibold",children:"Props"}),(0,a.jsx)(d.X,{props:[{name:"buttons",type:"Array<{ label: ReactNode; value?: any; disabled?: boolean; onClick?: (e) => void; buttonProps?: Record<string, any> }>",default:"[]",description:"List of buttons to render in the group."},{name:"orientation",type:"'horizontal' | 'vertical'",default:"'horizontal'",description:"Layout direction of the group."},{name:"attached",type:"boolean",default:"false",description:"Visually connect adjacent button edges."},{name:"exclusive",type:"boolean",default:"false",description:"Radio-like selection: only one item selected at a time."},{name:"selectedIndex",type:"number | null",default:"—",description:"Controlled selected index (exclusive mode)."},{name:"defaultSelectedIndex",type:"number | null",default:"—",description:"Initial selected index for uncontrolled exclusive mode."},{name:"onSelectionChange",type:"(index: number | null) => void",default:"—",description:"Called when the exclusive selection changes."},{name:"size",type:"'sm' | 'md' | 'lg'",default:"'md'",description:"Size applied to every button in the group."},{name:"variant",type:"'primary' | 'secondary' | 'outline' | 'ghost'",default:"'primary'",description:"Variant applied to every button in the group."},{name:"disabled",type:"boolean",default:"false",description:"Disables the entire group."},{name:"children",type:"(button, props, index, isSelected) => ReactNode",default:"—",description:"Render prop for custom per-item rendering with full state."}]})]})]})}}},e=>{e.O(0,[7521,2098,6741,3948,7358],()=>e(e.s=52191)),_N_E=e.O()}]);