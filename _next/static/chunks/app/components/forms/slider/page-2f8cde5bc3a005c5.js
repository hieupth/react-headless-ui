(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[8825],{828:(e,r,a)=>{"use strict";a.d(r,{X:()=>t});var s=a(25454);function t({props:e}){return 0===e.length?(0,s.jsx)("p",{className:"text-sm text-gray-500 dark:text-gray-400",children:"No props."}):(0,s.jsx)("div",{className:"overflow-x-auto my-6",children:(0,s.jsxs)("table",{className:"w-full text-sm border-collapse border border-gray-200 dark:border-gray-700",children:[(0,s.jsx)("thead",{children:(0,s.jsxs)("tr",{className:"bg-gray-50 dark:bg-gray-900/40 text-left",children:[(0,s.jsx)("th",{scope:"col",className:"border border-gray-200 dark:border-gray-700 px-3 py-2 font-semibold",children:"Name"}),(0,s.jsx)("th",{scope:"col",className:"border border-gray-200 dark:border-gray-700 px-3 py-2 font-semibold",children:"Type"}),(0,s.jsx)("th",{scope:"col",className:"border border-gray-200 dark:border-gray-700 px-3 py-2 font-semibold",children:"Default"}),(0,s.jsx)("th",{scope:"col",className:"border border-gray-200 dark:border-gray-700 px-3 py-2 font-semibold",children:"Description"})]})}),(0,s.jsx)("tbody",{children:e.map(e=>(0,s.jsxs)("tr",{className:"align-top",children:[(0,s.jsx)("td",{className:"border border-gray-200 dark:border-gray-700 px-3 py-2 font-mono text-purple-700 dark:text-purple-300",children:e.name}),(0,s.jsx)("td",{className:"border border-gray-200 dark:border-gray-700 px-3 py-2 font-mono text-blue-700 dark:text-blue-300",children:e.type}),(0,s.jsx)("td",{className:"border border-gray-200 dark:border-gray-700 px-3 py-2 font-mono text-gray-600 dark:text-gray-400",children:e.default??"—"}),(0,s.jsx)("td",{className:"border border-gray-200 dark:border-gray-700 px-3 py-2 text-gray-700 dark:text-gray-300",children:e.description})]},e.name))})]})})}},4956:(e,r,a)=>{"use strict";a.d(r,{CodeBlock:()=>d});var s=a(25454),t=a(89918),l=a(17521);function d({code:e,language:r="tsx"}){let[a,n]=(0,t.useState)(""),[i,o]=(0,t.useState)(!1);async function c(){try{await navigator.clipboard.writeText(e),o(!0),setTimeout(()=>o(!1),1500)}catch{}}return(0,t.useEffect)(()=>{let a=!1;return(0,l.Yz)(e,{lang:r,theme:"github-dark"}).then(e=>{a||n(e)}).catch(()=>{a||n("")}),()=>{a=!0}},[e,r]),(0,s.jsxs)("div",{className:"relative group rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700",children:[(0,s.jsx)("button",{type:"button",onClick:c,className:"absolute top-2 right-2 z-10 px-2 py-1 text-xs rounded bg-gray-800/80 text-gray-100 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 transition-opacity hover:bg-gray-700","aria-label":"Copy code",children:i?"Copied!":"Copy"}),a?(0,s.jsx)("div",{className:"overflow-x-auto text-sm [&>pre]:!m-0 [&>pre]:!bg-transparent [&>pre]:p-4",dangerouslySetInnerHTML:{__html:a}}):(0,s.jsx)("pre",{className:"overflow-x-auto text-sm p-4 bg-gray-900 text-gray-100",children:(0,s.jsx)("code",{children:e})})]})}},36914:(e,r,a)=>{"use strict";a.r(r),a.d(r,{default:()=>o});var s=a(25454),t=a(89918),l=a(17405),d=a(55782),n=a(828);function i({isRange:e,...r}){return(0,s.jsx)(l.Ap,{...r,isRange:e,className:"w-full max-w-xs",render:r=>{let a=Math.min(r.percentages[0],r.percentages[1]),t=Math.max(r.percentages[0],r.percentages[1]),l=e?2:1;return(0,s.jsxs)("div",{className:"w-full",children:[(0,s.jsxs)("div",{ref:r.sliderRef,className:"relative h-6 w-full flex items-center",onKeyDown:r.onKeyDown,onFocus:r.onFocus,onBlur:r.onBlur,onMouseDown:r.onMouseDown,onTouchStart:r.onTouchStart,onMouseEnter:r.onMouseEnter,onMouseLeave:r.onMouseLeave,...r.sliderAttributes,children:[(0,s.jsx)("div",{className:`h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700 ${r.disabled?"opacity-50":""}`}),(0,s.jsx)("div",{className:"absolute h-1.5 rounded-full bg-blue-600",style:{left:`${a}%`,width:`${Math.max(0,t-a)}%`}}),Array.from({length:l}).map((e,a)=>(0,s.jsx)("div",{ref:e=>{r.thumbRefs[a]&&(r.thumbRefs[a].current=e)},className:`absolute h-4 w-4 -translate-x-1/2 rounded-full border-2 border-blue-600 bg-white shadow dark:bg-gray-100 transition-transform ${r.activeThumb===a?"scale-110":""} focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500`,style:{left:`${r.percentages[a]}%`},...r.getThumbAttributes(a)},a))]}),(0,s.jsxs)("div",{className:"mt-1 flex justify-between text-xs text-gray-500 dark:text-gray-400",children:[(0,s.jsx)("span",{children:r.values[0]}),e&&(0,s.jsx)("span",{children:r.values[1]})]})]})}})}function o(){let[e,r]=(0,t.useState)(40);return(0,s.jsxs)("div",{className:"mx-auto max-w-3xl px-6 py-12 space-y-8",children:[(0,s.jsxs)("header",{className:"space-y-3",children:[(0,s.jsx)("h1",{className:"text-3xl font-bold",children:"Slider"}),(0,s.jsxs)("p",{className:"text-gray-600 dark:text-gray-400",children:["A range slider backed by the headless"," ",(0,s.jsx)("code",{className:"font-mono text-sm",children:"useSlider"})," hook. It handles pointer and keyboard dragging, min/max/step snapping, single-value and range (two-thumb) modes, and full ARIA"," ",(0,s.jsx)("code",{className:"font-mono text-sm",children:"slider"})," semantics. The default render ships empty classes — theme it via the"," ",(0,s.jsx)("code",{className:"font-mono text-sm",children:"render"})," prop."]})]}),(0,s.jsxs)("section",{className:"space-y-4",children:[(0,s.jsx)("h2",{className:"text-xl font-semibold",children:"Basic"}),(0,s.jsxs)("p",{className:"text-sm text-gray-600 dark:text-gray-400",children:["A single-thumb slider with ",(0,s.jsx)("code",{children:"min"}),", ",(0,s.jsx)("code",{children:"max"}),", and"," ",(0,s.jsx)("code",{children:"step"}),"."]}),(0,s.jsx)(d.Demo,{code:`<Slider
  min={0}
  max={100}
  step={1}
  defaultValue={40}
  className="w-full max-w-xs"
  render={(p) => (
    <div className="w-full">
      <div ref={p.sliderRef} className="relative flex h-6 w-full items-center" {...p.sliderAttributes}>
        <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700" />
        <div
          className="absolute h-1.5 rounded-full bg-blue-600"
          style={{ left: '0%', width: \`\${p.percentages[0]}%\` }}
        />
        <div
          ref={(el) => { p.thumbRefs[0].current = el; }}
          className="absolute h-4 w-4 -translate-x-1/2 rounded-full border-2 border-blue-600 bg-white shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          style={{ left: \`\${p.percentages[0]}%\` }}
          {...p.getThumbAttributes(0)}
        />
      </div>
    </div>
  )}
/>`,children:(0,s.jsx)(i,{min:0,max:100,step:1,defaultValue:40})})]}),(0,s.jsxs)("section",{className:"space-y-4",children:[(0,s.jsx)("h2",{className:"text-xl font-semibold",children:"Range (two thumbs)"}),(0,s.jsxs)("p",{className:"text-sm text-gray-600 dark:text-gray-400",children:["Set ",(0,s.jsx)("code",{children:"isRange"})," for a min/max selection; the value is a"," ",(0,s.jsx)("code",{children:"[number, number]"})," tuple."]}),(0,s.jsx)(d.Demo,{code:`<Slider
  isRange
  min={0}
  max={100}
  defaultValue={[20, 70]}
  className="w-full max-w-xs"
  render={(p) => {
    const min = Math.min(p.percentages[0], p.percentages[1]);
    const max = Math.max(p.percentages[0], p.percentages[1]);
    return (
      <div className="w-full">
        <div ref={p.sliderRef} className="relative flex h-6 w-full items-center" {...p.sliderAttributes}>
          <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700" />
          <div
            className="absolute h-1.5 rounded-full bg-blue-600"
            style={{ left: \`\${min}%\`, width: \`\${Math.max(0, max - min)}%\` }}
          />
          {[0, 1].map((i) => (
            <div
              key={i}
              ref={(el) => { p.thumbRefs[i].current = el; }}
              className="absolute h-4 w-4 -translate-x-1/2 rounded-full border-2 border-blue-600 bg-white shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              style={{ left: \`\${p.percentages[i]}%\` }}
              {...p.getThumbAttributes(i)}
            />
          ))}
        </div>
      </div>
    );
  }}
/>`,children:(0,s.jsx)(i,{isRange:!0,min:0,max:100,defaultValue:[20,70]})})]}),(0,s.jsxs)("section",{className:"space-y-4",children:[(0,s.jsx)("h2",{className:"text-xl font-semibold",children:"Controlled & disabled"}),(0,s.jsxs)("p",{className:"text-sm text-gray-600 dark:text-gray-400",children:["Drive value with ",(0,s.jsx)("code",{children:"value"})," / ",(0,s.jsx)("code",{children:"onValueChange"}),";",(0,s.jsx)("code",{children:" disabled"})," blocks interaction."]}),(0,s.jsx)(d.Demo,{code:`const [v, setV] = useState(40);
<Slider value={v} onValueChange={setV} min={0} max={100} className="w-full max-w-xs" render={(p) => (
  <div className="w-full">
    <div ref={p.sliderRef} className="relative flex h-6 w-full items-center" {...p.sliderAttributes}>
      <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700" />
      <div className="absolute h-1.5 rounded-full bg-blue-600" style={{ left: '0%', width: \`\${p.percentages[0]}%\` }} />
      <div ref={(el) => { p.thumbRefs[0].current = el; }} className="absolute h-4 w-4 -translate-x-1/2 rounded-full border-2 border-blue-600 bg-white shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" style={{ left: \`\${p.percentages[0]}%\` }} {...p.getThumbAttributes(0)} />
    </div>
  </div>
)} />
<Slider disabled defaultValue={60} className="w-full max-w-xs" render={(p) => (
  <div className="w-full">
    <div ref={p.sliderRef} className="relative flex h-6 w-full items-center" {...p.sliderAttributes}>
      <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700 opacity-50" />
      <div className="absolute h-1.5 rounded-full bg-blue-600" style={{ left: '0%', width: \`\${p.percentages[0]}%\` }} />
      <div ref={(el) => { p.thumbRefs[0].current = el; }} className="absolute h-4 w-4 -translate-x-1/2 rounded-full border-2 border-blue-600 bg-white shadow" style={{ left: \`\${p.percentages[0]}%\` }} {...p.getThumbAttributes(0)} />
    </div>
  </div>
)} />`,children:(0,s.jsxs)("div",{className:"w-full max-w-xs space-y-4",children:[(0,s.jsx)(i,{value:e,onValueChange:e=>r(e),min:0,max:100}),(0,s.jsx)(i,{disabled:!0,defaultValue:60})]})})]}),(0,s.jsxs)("section",{className:"space-y-4",children:[(0,s.jsx)("h2",{className:"text-xl font-semibold",children:"Props"}),(0,s.jsx)(n.X,{props:[{name:"value / defaultValue",type:"number | [number, number]",default:"—",description:"Controlled or uncontrolled value (tuple for range)."},{name:"onValueChange",type:"(value: number | [number, number]) => void",default:"—",description:"Called with the new value on change."},{name:"min / max",type:"number",default:"0 / 100",description:"Value bounds."},{name:"step",type:"number",default:"1",description:"Snapping increment."},{name:"isRange",type:"boolean",default:"false",description:"Render two thumbs (min/max selection)."},{name:"orientation",type:"'horizontal' | 'vertical'",default:"'horizontal'",description:"Track orientation."},{name:"disabled / readOnly",type:"boolean",default:"false",description:"Disables interaction; reflected to ARIA."},{name:"size / variant",type:"'sm' | 'md' | 'lg' / 'default' | 'solid' | 'outline'",default:"'md' / 'default'",description:"Size and variant hooks."},{name:"render",type:"(props: SliderRenderProps) => ReactElement",default:"—",description:"Escape-hatch custom renderer (values, percentages, refs, handlers)."}]})]})]})}},55782:(e,r,a)=>{"use strict";a.d(r,{Demo:()=>d});var s=a(25454),t=a(89918),l=a(4956);function d({code:e,children:r}){let[a,n]=(0,t.useState)(!1),[i,o]=(0,t.useState)(!1),c=(0,t.useId)();return(0,s.jsxs)("div",{className:"my-6 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden",children:[(0,s.jsxs)("div",{className:"flex items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 px-3 py-2",children:[(0,s.jsx)("span",{className:"text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400",children:"Preview"}),(0,s.jsx)("button",{type:"button",onClick:()=>{n(e=>!e),o(!0)},className:"px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors","aria-expanded":a,"aria-controls":c,children:a?"Hide Code":"Show Code"})]}),(0,s.jsx)("div",{className:"p-6 flex items-center justify-center min-h-[120px] bg-white dark:bg-gray-950",children:r}),(0,s.jsx)("div",{id:c,className:"border-t border-gray-200 dark:border-gray-700",hidden:!a,children:i&&(0,s.jsx)(l.CodeBlock,{code:e})})]})}},81384:(e,r,a)=>{Promise.resolve().then(a.bind(a,36914))}},e=>{e.O(0,[7521,7405,6741,3948,7358],()=>e(e.s=81384)),_N_E=e.O()}]);