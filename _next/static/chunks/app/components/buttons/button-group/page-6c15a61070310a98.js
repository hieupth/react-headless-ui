(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[9724],{52191:(e,t,a)=>{Promise.resolve().then(a.bind(a,58979))},58979:(e,t,a)=>{"use strict";a.r(t),a.d(t,{default:()=>x});var r=a(25454),n=a(21887),s=a(55782),l=a(828);let o="px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",d="bg-gray-900 text-white hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200",i="border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800",c="border-blue-600 bg-blue-600 text-white",u="text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800";function x(){return(0,r.jsxs)("div",{className:"mx-auto max-w-3xl px-6 py-12 space-y-8",children:[(0,r.jsxs)("header",{className:"space-y-3",children:[(0,r.jsx)("h1",{className:"text-3xl font-bold",children:"ButtonGroup"}),(0,r.jsxs)("p",{className:"text-gray-600 dark:text-gray-400",children:["Groups related buttons into a connected segmented control, backed by the headless ",(0,r.jsx)("code",{className:"font-mono text-sm",children:"useButtonGroup"})," ","hook. Supports horizontal/vertical orientation, attached edges, and exclusive (radio-like) or multi selection — all wired with proper ARIA roles. Like every reui component it ships no styles; theme the container and each item via classes or the"," ",(0,r.jsx)("code",{className:"font-mono text-sm",children:"children"})," render prop."]})]}),(0,r.jsxs)("section",{className:"space-y-4",children:[(0,r.jsx)("h2",{className:"text-xl font-semibold",children:"Attached segments"}),(0,r.jsxs)("p",{className:"text-sm text-gray-600 dark:text-gray-400",children:["A connected toolbar of actions using"," ",(0,r.jsx)("code",{children:"attached"}),". Each item is themed through the"," ",(0,r.jsx)("code",{children:"children"})," render prop (the headless build leaves internal classes empty)."]}),(0,r.jsx)(s.Demo,{code:`<ButtonGroup
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
</ButtonGroup>`,children:(0,r.jsx)(n.e2v,{variant:"primary",attached:!0,buttons:[{label:"Day"},{label:"Week"},{label:"Month"}],children:(e,t,a)=>(0,r.jsx)("button",{...t,className:`${o} ${d} ${0===a?"rounded-l-md":2===a?"rounded-r-md":""}`})})})]}),(0,r.jsxs)("section",{className:"space-y-4",children:[(0,r.jsx)("h2",{className:"text-xl font-semibold",children:"Exclusive selection"}),(0,r.jsxs)("p",{className:"text-sm text-gray-600 dark:text-gray-400",children:["With ",(0,r.jsx)("code",{children:"exclusive"}),", the group behaves like a radio control: a single selected index, controlled via"," ",(0,r.jsx)("code",{children:"selectedIndex"})," / ",(0,r.jsx)("code",{children:"onSelectionChange"}),"."]}),(0,r.jsx)(s.Demo,{code:`<ButtonGroup
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
</ButtonGroup>`,children:(0,r.jsx)(n.e2v,{variant:"outline",exclusive:!0,defaultSelectedIndex:1,buttons:[{label:"List"},{label:"Grid"},{label:"Gallery"}],children:(e,t,a,n)=>(0,r.jsx)("button",{...t,className:`${o} ${0===a?"rounded-l-md border-r-0":2===a?"rounded-r-md":"border-r-0"} ${n?c:i}`})})})]}),(0,r.jsxs)("section",{className:"space-y-4",children:[(0,r.jsx)("h2",{className:"text-xl font-semibold",children:"Vertical & disabled"}),(0,r.jsxs)("p",{className:"text-sm text-gray-600 dark:text-gray-400",children:["Set ",(0,r.jsx)("code",{children:'orientation="vertical"'})," for stacked groups, and"," ",(0,r.jsx)("code",{children:"disabled"})," to disable every item at once."]}),(0,r.jsx)(s.Demo,{code:`<ButtonGroup
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
</ButtonGroup>`,children:(0,r.jsx)(n.e2v,{variant:"ghost",orientation:"vertical",buttons:[{label:"Profile"},{label:"Settings"},{label:"Sign out"}],children:(e,t,a)=>(0,r.jsx)("button",{...t,className:`${o} w-full text-left ${u} ${0===a?"rounded-t-md":2===a?"rounded-b-md":""}`})})})]}),(0,r.jsxs)("section",{className:"space-y-4",children:[(0,r.jsx)("h2",{className:"text-xl font-semibold",children:"Props"}),(0,r.jsx)(l.X,{props:[{name:"buttons",type:"Array<{ label: ReactNode; value?: any; disabled?: boolean; onClick?: (e) => void; buttonProps?: Record<string, any> }>",default:"[]",description:"List of buttons to render in the group."},{name:"orientation",type:"'horizontal' | 'vertical'",default:"'horizontal'",description:"Layout direction of the group."},{name:"attached",type:"boolean",default:"false",description:"Visually connect adjacent button edges."},{name:"exclusive",type:"boolean",default:"false",description:"Radio-like selection: only one item selected at a time."},{name:"selectedIndex",type:"number | null",default:"—",description:"Controlled selected index (exclusive mode)."},{name:"defaultSelectedIndex",type:"number | null",default:"—",description:"Initial selected index for uncontrolled exclusive mode."},{name:"onSelectionChange",type:"(index: number | null) => void",default:"—",description:"Called when the exclusive selection changes."},{name:"size",type:"'sm' | 'md' | 'lg'",default:"'md'",description:"Size applied to every button in the group."},{name:"variant",type:"'primary' | 'secondary' | 'outline' | 'ghost'",default:"'primary'",description:"Variant applied to every button in the group."},{name:"disabled",type:"boolean",default:"false",description:"Disables the entire group."},{name:"children",type:"(button, props, index, isSelected) => ReactNode",default:"—",description:"Render prop for custom per-item rendering with full state."}]})]})]})}}},e=>{e.O(0,[7521,8575,1289,6741,3948,7358],()=>e(e.s=52191)),_N_E=e.O()}]);