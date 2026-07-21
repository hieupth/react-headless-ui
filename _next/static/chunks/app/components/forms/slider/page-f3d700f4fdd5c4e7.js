(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[8825],{36914:(e,s,l)=>{"use strict";l.r(s),l.d(s,{default:()=>u});var a=l(25454),t=l(89918),r=l(21887),n=l(55782),i=l(828);function d({isRange:e,...s}){return(0,a.jsx)(r.Apm,{...s,isRange:e,className:"w-full max-w-xs",render:s=>{let l=Math.min(s.percentages[0],s.percentages[1]),t=Math.max(s.percentages[0],s.percentages[1]),r=e?2:1;return(0,a.jsxs)("div",{className:"w-full",children:[(0,a.jsxs)("div",{ref:s.sliderRef,className:"relative h-6 w-full flex items-center",onKeyDown:s.onKeyDown,onFocus:s.onFocus,onBlur:s.onBlur,onMouseDown:s.onMouseDown,onTouchStart:s.onTouchStart,onMouseEnter:s.onMouseEnter,onMouseLeave:s.onMouseLeave,...s.sliderAttributes,children:[(0,a.jsx)("div",{className:`h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700 ${s.disabled?"opacity-50":""}`}),(0,a.jsx)("div",{className:"absolute h-1.5 rounded-full bg-blue-600",style:{left:`${l}%`,width:`${Math.max(0,t-l)}%`}}),Array.from({length:r}).map((e,l)=>(0,a.jsx)("div",{ref:e=>{s.thumbRefs[l]&&(s.thumbRefs[l].current=e)},className:`absolute h-4 w-4 -translate-x-1/2 rounded-full border-2 border-blue-600 bg-white shadow dark:bg-gray-100 transition-transform ${s.activeThumb===l?"scale-110":""} focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500`,style:{left:`${s.percentages[l]}%`},...s.getThumbAttributes(l)},l))]}),(0,a.jsxs)("div",{className:"mt-1 flex justify-between text-xs text-gray-500 dark:text-gray-400",children:[(0,a.jsx)("span",{children:s.values[0]}),e&&(0,a.jsx)("span",{children:s.values[1]})]})]})}})}function u(){let[e,s]=(0,t.useState)(40);return(0,a.jsxs)("div",{className:"mx-auto max-w-3xl px-6 py-12 space-y-8",children:[(0,a.jsxs)("header",{className:"space-y-3",children:[(0,a.jsx)("h1",{className:"text-3xl font-bold",children:"Slider"}),(0,a.jsxs)("p",{className:"text-gray-600 dark:text-gray-400",children:["A range slider backed by the headless"," ",(0,a.jsx)("code",{className:"font-mono text-sm",children:"useSlider"})," hook. It handles pointer and keyboard dragging, min/max/step snapping, single-value and range (two-thumb) modes, and full ARIA"," ",(0,a.jsx)("code",{className:"font-mono text-sm",children:"slider"})," semantics. The default render ships empty classes — theme it via the"," ",(0,a.jsx)("code",{className:"font-mono text-sm",children:"render"})," prop."]})]}),(0,a.jsxs)("section",{className:"space-y-4",children:[(0,a.jsx)("h2",{className:"text-xl font-semibold",children:"Basic"}),(0,a.jsxs)("p",{className:"text-sm text-gray-600 dark:text-gray-400",children:["A single-thumb slider with ",(0,a.jsx)("code",{children:"min"}),", ",(0,a.jsx)("code",{children:"max"}),", and"," ",(0,a.jsx)("code",{children:"step"}),"."]}),(0,a.jsx)(n.Demo,{code:`<Slider
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
/>`,children:(0,a.jsx)(d,{min:0,max:100,step:1,defaultValue:40})})]}),(0,a.jsxs)("section",{className:"space-y-4",children:[(0,a.jsx)("h2",{className:"text-xl font-semibold",children:"Range (two thumbs)"}),(0,a.jsxs)("p",{className:"text-sm text-gray-600 dark:text-gray-400",children:["Set ",(0,a.jsx)("code",{children:"isRange"})," for a min/max selection; the value is a"," ",(0,a.jsx)("code",{children:"[number, number]"})," tuple."]}),(0,a.jsx)(n.Demo,{code:`<Slider
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
/>`,children:(0,a.jsx)(d,{isRange:!0,min:0,max:100,defaultValue:[20,70]})})]}),(0,a.jsxs)("section",{className:"space-y-4",children:[(0,a.jsx)("h2",{className:"text-xl font-semibold",children:"Controlled & disabled"}),(0,a.jsxs)("p",{className:"text-sm text-gray-600 dark:text-gray-400",children:["Drive value with ",(0,a.jsx)("code",{children:"value"})," / ",(0,a.jsx)("code",{children:"onValueChange"}),";",(0,a.jsx)("code",{children:" disabled"})," blocks interaction."]}),(0,a.jsx)(n.Demo,{code:`const [v, setV] = useState(40);
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
)} />`,children:(0,a.jsxs)("div",{className:"w-full max-w-xs space-y-4",children:[(0,a.jsx)(d,{value:e,onValueChange:e=>s(e),min:0,max:100}),(0,a.jsx)(d,{disabled:!0,defaultValue:60})]})})]}),(0,a.jsxs)("section",{className:"space-y-4",children:[(0,a.jsx)("h2",{className:"text-xl font-semibold",children:"Props"}),(0,a.jsx)(i.X,{props:[{name:"value / defaultValue",type:"number | [number, number]",default:"—",description:"Controlled or uncontrolled value (tuple for range)."},{name:"onValueChange",type:"(value: number | [number, number]) => void",default:"—",description:"Called with the new value on change."},{name:"min / max",type:"number",default:"0 / 100",description:"Value bounds."},{name:"step",type:"number",default:"1",description:"Snapping increment."},{name:"isRange",type:"boolean",default:"false",description:"Render two thumbs (min/max selection)."},{name:"orientation",type:"'horizontal' | 'vertical'",default:"'horizontal'",description:"Track orientation."},{name:"disabled / readOnly",type:"boolean",default:"false",description:"Disables interaction; reflected to ARIA."},{name:"size / variant",type:"'sm' | 'md' | 'lg' / 'default' | 'solid' | 'outline'",default:"'md' / 'default'",description:"Size and variant hooks."},{name:"render",type:"(props: SliderRenderProps) => ReactElement",default:"—",description:"Escape-hatch custom renderer (values, percentages, refs, handlers)."}]})]})]})}},81384:(e,s,l)=>{Promise.resolve().then(l.bind(l,36914))}},e=>{e.O(0,[7521,8575,1289,6741,3948,7358],()=>e(e.s=81384)),_N_E=e.O()}]);