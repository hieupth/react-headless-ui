(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[771],{22284:(e,a,t)=>{Promise.resolve().then(t.bind(t,46382))},46382:(e,a,t)=>{"use strict";t.r(a),t.d(a,{default:()=>o});var s=t(25454),r=t(89918),l=t(21887),d=t(55782),n=t(828);function o(){let[e,a]=(0,r.useState)(!1);return(0,s.jsxs)("div",{className:"mx-auto max-w-3xl px-6 py-12 space-y-8",children:[(0,s.jsxs)("header",{className:"space-y-3",children:[(0,s.jsx)("h1",{className:"text-3xl font-bold",children:"HoverCard"}),(0,s.jsxs)("p",{className:"text-gray-600 dark:text-gray-400",children:["A hover-revealed detail card backed by the headless"," ",(0,s.jsx)("code",{className:"font-mono text-sm",children:"useHoverCard"})," hook — think Twitter-style user previews. Unlike a Tooltip it holds richer content and stays open with a grace period (",(0,s.jsx)("code",{children:"hoverDelay"})," /"," ",(0,s.jsx)("code",{children:"leaveDelay"}),") so the pointer can travel into the card. It positions to any side and closes on outside-click / Escape."]})]}),(0,s.jsxs)("section",{className:"space-y-4",children:[(0,s.jsx)("h2",{className:"text-xl font-semibold",children:"User preview"}),(0,s.jsxs)("p",{className:"text-sm text-gray-600 dark:text-gray-400",children:["Hover the link to reveal a profile card. ",(0,s.jsx)("code",{children:"placement"})," sets the side; ",(0,s.jsx)("code",{children:"offset"})," the gap."]}),(0,s.jsx)(d.Demo,{code:`const [open, setOpen] = useState(false);

<HoverCard
  open={open}
  onOpenChange={setOpen}
  placement="bottom-start"
  hoverDelay={300}
  leaveDelay={200}
  offset={6}
  trigger={
    <a href="/u/ada" className="font-medium text-blue-600 underline-offset-4 hover:underline dark:text-blue-400">
      @ada
    </a>
  }
>
  <div className="w-56 rounded-lg border border-gray-200 bg-white p-4 text-sm shadow-lg dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500" />
      <div>
        <p className="font-semibold">Ada Lovelace</p>
        <p className="text-gray-500">@ada</p>
      </div>
    </div>
    <p className="mt-3 text-gray-600 dark:text-gray-400">
      Mathematician and the first computer programmer.
    </p>
  </div>
</HoverCard>`,children:(0,s.jsx)(l.jcX,{open:e,onOpenChange:a,placement:"bottom-start",hoverDelay:300,leaveDelay:200,offset:6,closeOnClickOutside:!0,closeOnEscape:!0,trigger:(0,s.jsx)("a",{href:"#hovercard-ada",className:"font-medium text-blue-600 underline-offset-4 hover:underline dark:text-blue-400",children:"@ada"}),children:(0,s.jsxs)("div",{className:"w-56 rounded-lg border border-gray-200 bg-white p-4 text-sm shadow-lg dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200",children:[(0,s.jsxs)("div",{className:"flex items-center gap-3",children:[(0,s.jsx)("div",{className:"h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500"}),(0,s.jsxs)("div",{children:[(0,s.jsx)("p",{className:"font-semibold",children:"Ada Lovelace"}),(0,s.jsx)("p",{className:"text-gray-500",children:"@ada"})]})]}),(0,s.jsx)("p",{className:"mt-3 text-gray-600 dark:text-gray-400",children:"Mathematician and the first computer programmer."})]})})})]}),(0,s.jsxs)("section",{className:"space-y-4",children:[(0,s.jsx)("h2",{className:"text-xl font-semibold",children:"Placements & timing"}),(0,s.jsxs)("p",{className:"text-sm text-gray-600 dark:text-gray-400",children:[(0,s.jsx)("code",{children:"placement"})," supports ",(0,s.jsx)("code",{children:"top"}),"/",(0,s.jsx)("code",{children:"bottom"}),"/",(0,s.jsx)("code",{children:"left"}),"/",(0,s.jsx)("code",{children:"right"})," with ",(0,s.jsx)("code",{children:"-start"})," /",(0,s.jsx)("code",{children:"-end"})," alignment. Tune ",(0,s.jsx)("code",{children:"hoverDelay"})," to avoid accidental opens and ",(0,s.jsx)("code",{children:"leaveDelay"})," to let users cross into the card."]}),(0,s.jsx)(d.Demo,{code:`<HoverCard placement="right" hoverDelay={500} leaveDelay={300} trigger={<button>?</button>}>
  Help text
</HoverCard>`,children:(0,s.jsx)("p",{className:"text-sm text-gray-500",children:"Higher delays make the card feel intentional — see snippet."})})]}),(0,s.jsxs)("section",{className:"space-y-4",children:[(0,s.jsx)("h2",{className:"text-xl font-semibold",children:"Props"}),(0,s.jsx)(n.X,{props:[{name:"open",type:"boolean",default:"—",description:"Controlled open state."},{name:"onOpenChange",type:"(open: boolean) => void",default:"—",description:"Open change callback."},{name:"placement",type:"'top' | 'bottom' | 'left' | 'right' (\xb1 '-start'/'-end')",default:"'bottom'",description:"Side + alignment relative to the trigger."},{name:"offset",type:"number",default:"—",description:"Gap between trigger and card in px."},{name:"hoverDelay / leaveDelay",type:"number",default:"—",description:"Open / close delay in ms."},{name:"closeOnClickOutside / closeOnEscape",type:"boolean",default:"true",description:"Dismiss triggers."},{name:"trigger",type:"ReactNode",default:"—",description:"The element the card anchors to."}]})]})]})}}},e=>{e.O(0,[7521,8575,1289,6741,3948,7358],()=>e(e.s=22284)),_N_E=e.O()}]);