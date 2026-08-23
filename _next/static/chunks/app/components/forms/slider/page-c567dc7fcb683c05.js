(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[8825],{828:(e,s,a)=>{"use strict";a.d(s,{X:()=>t});var l=a(25454);function t({props:e}){return 0===e.length?(0,l.jsx)("p",{className:"docs-desc",children:"No props."}):(0,l.jsx)("div",{className:"props-table-wrap",children:(0,l.jsxs)("table",{className:"props-table",children:[(0,l.jsx)("thead",{children:(0,l.jsxs)("tr",{children:[(0,l.jsx)("th",{scope:"col",children:"Name"}),(0,l.jsx)("th",{scope:"col",children:"Type"}),(0,l.jsx)("th",{scope:"col",children:"Default"}),(0,l.jsx)("th",{scope:"col",children:"Description"})]})}),(0,l.jsx)("tbody",{children:e.map(e=>(0,l.jsxs)("tr",{children:[(0,l.jsx)("td",{className:"props-name",children:e.name}),(0,l.jsx)("td",{className:"props-type",children:e.type}),(0,l.jsx)("td",{className:"props-default",children:e.default??"—"}),(0,l.jsx)("td",{children:e.description})]},e.name))})]})})}},4956:(e,s,a)=>{"use strict";a.d(s,{CodeBlock:()=>r});var l=a(25454),t=a(89918),d=a(17521);function r({code:e,language:s="tsx"}){let[a,n]=(0,t.useState)(""),[i,c]=(0,t.useState)(!1);async function o(){try{await navigator.clipboard.writeText(e),c(!0),setTimeout(()=>c(!1),1500)}catch{}}return(0,t.useEffect)(()=>{let a=!1;return(0,d.Yz)(e,{lang:s,theme:"github-dark"}).then(e=>{a||n(e)}).catch(()=>{a||n("")}),()=>{a=!0}},[e,s]),(0,l.jsxs)("div",{className:"code-block",children:[(0,l.jsx)("button",{type:"button",onClick:o,className:"code-copy","aria-label":"Copy code",children:i?"Copied!":"Copy"}),a?(0,l.jsx)("div",{className:"overflow-x-auto [&>pre]:!m-0 [&>pre]:!bg-transparent [&>pre]:p-4",dangerouslySetInnerHTML:{__html:a}}):(0,l.jsx)("pre",{className:"overflow-x-auto p-4",style:{background:"#0d1117",color:"#f3f4f6"},children:(0,l.jsx)("code",{children:e})})]})}},36914:(e,s,a)=>{"use strict";a.r(s),a.d(s,{default:()=>c});var l=a(25454),t=a(89918),d=a(17405),r=a(55782),n=a(828);function i({isRange:e,...s}){return(0,l.jsx)(d.Ap,{...s,isRange:e,className:"w-full max-w-xs",render:s=>{let a=Math.min(s.percentages[0],s.percentages[1]),t=Math.max(s.percentages[0],s.percentages[1]),d=e?2:1;return(0,l.jsxs)("div",{className:"w-full",children:[(0,l.jsxs)("div",{ref:s.sliderRef,className:"relative h-6 w-full flex items-center",onKeyDown:s.onKeyDown,onFocus:s.onFocus,onBlur:s.onBlur,onMouseDown:s.onMouseDown,onTouchStart:s.onTouchStart,onMouseEnter:s.onMouseEnter,onMouseLeave:s.onMouseLeave,...s.sliderAttributes,children:[(0,l.jsx)("div",{className:`h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700 ${s.disabled?"opacity-50":""}`}),(0,l.jsx)("div",{className:"absolute h-1.5 rounded-full bg-indigo-600",style:{left:`${a}%`,width:`${Math.max(0,t-a)}%`}}),Array.from({length:d}).map((e,a)=>(0,l.jsx)("div",{ref:e=>{s.thumbRefs[a]&&(s.thumbRefs[a].current=e)},className:`absolute h-4 w-4 -translate-x-1/2 rounded-full border-2 border-indigo-600 bg-white shadow dark:bg-gray-100 transition-transform ${s.activeThumb===a?"scale-110":""} focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500`,style:{left:`${s.percentages[a]}%`},...s.getThumbAttributes(a)},a))]}),(0,l.jsxs)("div",{className:"mt-1 flex justify-between text-xs text-gray-500 dark:text-gray-400",children:[(0,l.jsx)("span",{children:s.values[0]}),e&&(0,l.jsx)("span",{children:s.values[1]})]})]})}})}function c(){let[e,s]=(0,t.useState)(40);return(0,l.jsxs)("div",{className:"docs-page",children:[(0,l.jsxs)("header",{className:"docs-header",children:[(0,l.jsx)("h1",{className:"docs-h1",children:"Slider"}),(0,l.jsxs)("p",{className:"docs-lead",children:["A range slider backed by the headless"," ",(0,l.jsx)("code",{className:"docs-code",children:"useSlider"})," hook. It handles pointer and keyboard dragging, min/max/step snapping, single-value and range (two-thumb) modes, and full ARIA"," ",(0,l.jsx)("code",{className:"docs-code",children:"slider"})," semantics. The default render ships empty classes — theme it via the"," ",(0,l.jsx)("code",{className:"docs-code",children:"render"})," prop."]})]}),(0,l.jsxs)("section",{className:"docs-section",children:[(0,l.jsx)("h2",{className:"docs-h2",children:"Basic"}),(0,l.jsxs)("p",{className:"docs-desc",children:["A single-thumb slider with ",(0,l.jsx)("code",{children:"min"}),", ",(0,l.jsx)("code",{children:"max"}),", and"," ",(0,l.jsx)("code",{children:"step"}),"."]}),(0,l.jsx)(r.Demo,{code:`<Slider
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
          className="absolute h-1.5 rounded-full bg-indigo-600"
          style={{ left: '0%', width: \`\${p.percentages[0]}%\` }}
        />
        <div
          ref={(el) => { p.thumbRefs[0].current = el; }}
          className="absolute h-4 w-4 -translate-x-1/2 rounded-full border-2 border-indigo-600 bg-white shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          style={{ left: \`\${p.percentages[0]}%\` }}
          {...p.getThumbAttributes(0)}
        />
      </div>
    </div>
  )}
/>`,children:(0,l.jsx)(i,{min:0,max:100,step:1,defaultValue:40})})]}),(0,l.jsxs)("section",{className:"docs-section",children:[(0,l.jsx)("h2",{className:"docs-h2",children:"Range (two thumbs)"}),(0,l.jsxs)("p",{className:"docs-desc",children:["Set ",(0,l.jsx)("code",{children:"isRange"})," for a min/max selection; the value is a"," ",(0,l.jsx)("code",{children:"[number, number]"})," tuple."]}),(0,l.jsx)(r.Demo,{code:`<Slider
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
            className="absolute h-1.5 rounded-full bg-indigo-600"
            style={{ left: \`\${min}%\`, width: \`\${Math.max(0, max - min)}%\` }}
          />
          {[0, 1].map((i) => (
            <div
              key={i}
              ref={(el) => { p.thumbRefs[i].current = el; }}
              className="absolute h-4 w-4 -translate-x-1/2 rounded-full border-2 border-indigo-600 bg-white shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              style={{ left: \`\${p.percentages[i]}%\` }}
              {...p.getThumbAttributes(i)}
            />
          ))}
        </div>
      </div>
    );
  }}
/>`,children:(0,l.jsx)(i,{isRange:!0,min:0,max:100,defaultValue:[20,70]})})]}),(0,l.jsxs)("section",{className:"docs-section",children:[(0,l.jsx)("h2",{className:"docs-h2",children:"Controlled & disabled"}),(0,l.jsxs)("p",{className:"docs-desc",children:["Drive value with ",(0,l.jsx)("code",{children:"value"})," / ",(0,l.jsx)("code",{children:"onValueChange"}),";",(0,l.jsx)("code",{children:" disabled"})," blocks interaction."]}),(0,l.jsx)(r.Demo,{code:`const [v, setV] = useState(40);
<Slider value={v} onValueChange={setV} min={0} max={100} className="w-full max-w-xs" render={(p) => (
  <div className="w-full">
    <div ref={p.sliderRef} className="relative flex h-6 w-full items-center" {...p.sliderAttributes}>
      <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700" />
      <div className="absolute h-1.5 rounded-full bg-indigo-600" style={{ left: '0%', width: \`\${p.percentages[0]}%\` }} />
      <div ref={(el) => { p.thumbRefs[0].current = el; }} className="absolute h-4 w-4 -translate-x-1/2 rounded-full border-2 border-indigo-600 bg-white shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500" style={{ left: \`\${p.percentages[0]}%\` }} {...p.getThumbAttributes(0)} />
    </div>
  </div>
)} />
<Slider disabled defaultValue={60} className="w-full max-w-xs" render={(p) => (
  <div className="w-full">
    <div ref={p.sliderRef} className="relative flex h-6 w-full items-center" {...p.sliderAttributes}>
      <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700 opacity-50" />
      <div className="absolute h-1.5 rounded-full bg-indigo-600" style={{ left: '0%', width: \`\${p.percentages[0]}%\` }} />
      <div ref={(el) => { p.thumbRefs[0].current = el; }} className="absolute h-4 w-4 -translate-x-1/2 rounded-full border-2 border-indigo-600 bg-white shadow" style={{ left: \`\${p.percentages[0]}%\` }} {...p.getThumbAttributes(0)} />
    </div>
  </div>
)} />`,children:(0,l.jsxs)("div",{className:"w-full max-w-xs space-y-4",children:[(0,l.jsx)(i,{value:e,onValueChange:e=>s(e),min:0,max:100}),(0,l.jsx)(i,{disabled:!0,defaultValue:60})]})})]}),(0,l.jsxs)("section",{className:"docs-section",children:[(0,l.jsx)("h2",{className:"docs-h2",children:"Props"}),(0,l.jsx)(n.X,{props:[{name:"value / defaultValue",type:"number | [number, number]",default:"—",description:"Controlled or uncontrolled value (tuple for range)."},{name:"onValueChange",type:"(value: number | [number, number]) => void",default:"—",description:"Called with the new value on change."},{name:"min / max",type:"number",default:"0 / 100",description:"Value bounds."},{name:"step",type:"number",default:"1",description:"Snapping increment."},{name:"isRange",type:"boolean",default:"false",description:"Render two thumbs (min/max selection)."},{name:"orientation",type:"'horizontal' | 'vertical'",default:"'horizontal'",description:"Track orientation."},{name:"disabled / readOnly",type:"boolean",default:"false",description:"Disables interaction; reflected to ARIA."},{name:"size / variant",type:"'sm' | 'md' | 'lg' / 'default' | 'solid' | 'outline'",default:"'md' / 'default'",description:"Size and variant hooks."},{name:"render",type:"(props: SliderRenderProps) => ReactElement",default:"—",description:"Escape-hatch custom renderer (values, percentages, refs, handlers)."}]})]})]})}},55782:(e,s,a)=>{"use strict";a.d(s,{Demo:()=>r});var l=a(25454),t=a(89918),d=a(4956);function r({code:e,children:s}){let[a,n]=(0,t.useState)(!1),[i,c]=(0,t.useState)(!1),o=(0,t.useId)();return(0,l.jsxs)("div",{className:"demo-frame",children:[(0,l.jsxs)("div",{className:"demo-toolbar",children:[(0,l.jsx)("span",{className:"demo-label",children:"Preview"}),(0,l.jsx)("button",{type:"button",onClick:()=>{n(e=>!e),c(!0)},className:"demo-toggle","aria-expanded":a,"aria-controls":o,children:a?"Hide Code":"Show Code"})]}),(0,l.jsx)("div",{className:"demo-canvas",children:s}),(0,l.jsx)("div",{id:o,className:"demo-code-panel",hidden:!a,children:i&&(0,l.jsx)(d.CodeBlock,{code:e})})]})}},81384:(e,s,a)=>{Promise.resolve().then(a.bind(a,36914))}},e=>{e.O(0,[7521,7405,6741,3948,7358],()=>e(e.s=81384)),_N_E=e.O()}]);