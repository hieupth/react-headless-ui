(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[8904],{34231:(e,a,t)=>{Promise.resolve().then(t.bind(t,86463))},86463:(e,a,t)=>{"use strict";t.r(a),t.d(a,{default:()=>o});var r=t(25454),s=t(21887),d=t(55782),i=t(828);let n=[{label:"Revenue",color:"#6366f1",data:[{x:"Jan",y:12},{x:"Feb",y:18},{x:"Mar",y:14},{x:"Apr",y:22},{x:"May",y:28}]}],l=[{label:"Signups",color:"#10b981",data:[{x:"Mon",y:30},{x:"Tue",y:45},{x:"Wed",y:25},{x:"Thu",y:60},{x:"Fri",y:38}]}];function o(){return(0,r.jsxs)("div",{className:"mx-auto max-w-3xl px-6 py-12 space-y-8",children:[(0,r.jsxs)("header",{className:"space-y-3",children:[(0,r.jsx)("h1",{className:"text-3xl font-bold",children:"Chart"}),(0,r.jsxs)("p",{className:"text-gray-600 dark:text-gray-400",children:["Lightweight SVG charts backed by the headless"," ",(0,r.jsx)("code",{className:"font-mono text-sm",children:"useChart"})," hook. It draws"," ",(0,r.jsx)("code",{children:"line"}),", ",(0,r.jsx)("code",{children:"bar"}),", ",(0,r.jsx)("code",{children:"area"}),","," ",(0,r.jsx)("code",{children:"pie"}),", and ",(0,r.jsx)("code",{children:"scatter"})," charts from one or more"," ",(0,r.jsx)("code",{children:"datasets"}),", computing scales, axes, legends, and optional tooltips. Because it renders inline SVG it appears unstyled-by-CSS — set dimensions and colors through props."]})]}),(0,r.jsxs)("section",{className:"space-y-4",children:[(0,r.jsx)("h2",{className:"text-xl font-semibold",children:"Line chart"}),(0,r.jsxs)("p",{className:"text-sm text-gray-600 dark:text-gray-400",children:["Each dataset is ",(0,r.jsx)("code",{children:"{ label, data, color }"})," where data points are ",(0,r.jsx)("code",{children:"{ x, y }"}),"."]}),(0,r.jsx)(d.Demo,{code:`<div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
  <Chart
    type="line"
    width={400}
    height={200}
    datasets={[{
      label: 'Revenue',
      color: '#6366f1',
      data: [
        { x: 'Jan', y: 12 }, { x: 'Feb', y: 18 },
        { x: 'Mar', y: 14 }, { x: 'Apr', y: 22 }, { x: 'May', y: 28 }
      ]
    }]}
  />
</div>`,children:(0,r.jsx)("div",{className:"rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900",children:(0,r.jsx)(s.t1X,{type:"line",width:400,height:200,datasets:n})})})]}),(0,r.jsxs)("section",{className:"space-y-4",children:[(0,r.jsx)("h2",{className:"text-xl font-semibold",children:"Bar chart"}),(0,r.jsxs)("p",{className:"text-sm text-gray-600 dark:text-gray-400",children:["Switch ",(0,r.jsx)("code",{children:"type"})," to ",(0,r.jsx)("code",{children:"bar"})," for categorical values."]}),(0,r.jsx)(d.Demo,{code:`<div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
  <Chart
    type="bar"
    width={400}
    height={200}
    datasets={[{
      label: 'Signups',
      color: '#10b981',
      data: [
        { x: 'Mon', y: 30 }, { x: 'Tue', y: 45 }, { x: 'Wed', y: 25 },
        { x: 'Thu', y: 60 }, { x: 'Fri', y: 38 }
      ]
    }]}
  />
</div>`,children:(0,r.jsx)("div",{className:"rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900",children:(0,r.jsx)(s.t1X,{type:"bar",width:400,height:200,datasets:l})})})]}),(0,r.jsxs)("section",{className:"space-y-4",children:[(0,r.jsx)("h2",{className:"text-xl font-semibold",children:"Props"}),(0,r.jsx)(i.X,{props:[{name:"type",type:"'line' | 'bar' | 'pie' | 'area' | 'scatter'",default:"'line'",description:"Chart kind."},{name:"datasets",type:"ChartDataset[]",default:"—",description:"Series: { label, data: {x,y}[], color?, fill? }."},{name:"width / height",type:"number",default:"—",description:"SVG dimensions."},{name:"xAxis / yAxis",type:"ChartAxis",default:"—",description:"Axis configuration (labels, ticks)."},{name:"legend",type:"ChartLegend",default:"—",description:"Legend visibility and placement."},{name:"colors",type:"string[]",default:"—",description:"Override the default palette."},{name:"responsive",type:"boolean",default:"—",description:"Scale to the container width."},{name:"animated / animationDuration",type:"boolean / number",default:"—",description:"Enter animation controls."},{name:"showTooltips",type:"boolean",default:"—",description:"Render data-point tooltips."},{name:"onDataPointClick",type:"(dataset, point) => void",default:"—",description:"Point click handler."},{name:"pointRenderer / barRenderer / lineRenderer",type:"(…) => ReactNode",default:"—",description:"Replace the default SVG primitives."}]})]})]})}}},e=>{e.O(0,[7521,8575,1289,6741,3948,7358],()=>e(e.s=34231)),_N_E=e.O()}]);