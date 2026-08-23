"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[9401],{10427:(e,a,n)=>{n.d(a,{D:()=>t}),n(25454);var r=n(89918);let l=(0,r.createContext)({colors:{background:"#ffffff",foreground:"#000000",primary:"#3b82f6",secondary:"#6b7280",muted:"#f3f4f6",border:"#e5e7eb",destructive:"#ef4444",text:"#111827",white:"#ffffff",mutedForeground:"#6b7280",error:"#ef4444",gray:"#6b7280",gray50:"#f9fafb",gray200:"#e5e7eb",gray600:"#4b5563",primary100:"#dbeafe",primary500:"#3b82f6",primary700:"#1d4ed8"},borderRadius:{sm:"0.125rem",md:"0.375rem",lg:"0.5rem"},spacing:{xs:"0.25rem",sm:"0.5rem",md:"1rem",lg:"1.5rem",xl:"2rem"},fontSizes:{xs:"0.75rem",sm:"0.875rem",md:"1rem",lg:"1.125rem",xl:"1.25rem"},fontWeights:{normal:"400",medium:"500",semibold:"600",bold:"700"},fonts:{mono:"ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"},shadows:{sm:"0 1px 2px 0 rgba(0, 0, 0, 0.05)",md:"0 4px 6px -1px rgba(0, 0, 0, 0.1)",lg:"0 10px 15px -3px rgba(0, 0, 0, 0.1)"}}),t=()=>(0,r.useContext)(l)},29401:(e,a,n)=>{n.d(a,{A:()=>m});var r=n(25454),l=n(89918),t=n(57576),i=n(55817),o=n(53778);function s(e,a){for(let n of e){if(n.id===a)return n;if(n.children&&n.children.length>0){let e=s(n.children,a);if(e)return e}}return null}var u=n(10427);let m=(0,l.forwardRef)(({className:e="",style:a,orientation:n="horizontal",renderTrigger:m,renderPanel:c,panelAnimationDuration:d=300,panelPosition:g="bottom",showPanelArrows:p=!0,...f},b)=>{let h=(0,u.D)(),{state:x,actions:v,style:k,ref:y,eventHandlers:C}=function(e){let a,{initialActiveId:n=null,disabled:r=!1,items:u=[],config:m={},onActiveChange:c,onPanelOpen:d,onPanelClose:g,onItemSelect:p,...f}=e,b={closeOnEscape:!0,closeOnOutsideClick:!0,allowMultipleOpen:!1,openDelay:150,closeDelay:300,hoverActivation:!1,animatePanels:!0,...m},[h,x]=(0,l.useState)(n),[v,k]=(0,l.useState)(new Set),[y,C]=(0,l.useState)(-1),w=(0,l.useRef)(null),$=(0,l.useRef)(null),D=(0,l.useRef)(null),z=(0,t.V)({disabled:r,...f}),j={},E=e=>{z.focusRef.current=e},M=(0,i.S)({disabled:r,onPress:()=>H(),...f}),O={},{style:S}=(0,o.$)({role:"menubar",...f}),N=(a=[],!function e(n){for(let r of n)a.push(r),r.children&&r.children.length>0&&e(r.children)}(u),a),R=(0,l.useCallback)(()=>{$.current&&(clearTimeout($.current),$.current=null),D.current&&(clearTimeout(D.current),D.current=null)},[]),I=(0,l.useCallback)(e=>{if(!r){if(x(e),e){let a=N.findIndex(a=>a.id===e);C(a>=0?a:-1)}else C(-1);c?.(e)}},[r,N,c]),T=(0,l.useCallback)(e=>{if(r)return;R();let a=s(u,e);a&&a.panel&&(k(a=>{let n=new Set(a);return b.allowMultipleOpen||n.clear(),n.add(e),n}),d?.(e))},[r,u,b.allowMultipleOpen,d,R]),A=(0,l.useCallback)(e=>{r||(R(),k(a=>{let n=new Set(a);return n.delete(e),n}),g?.(e))},[r,g,R]),K=(0,l.useCallback)(e=>{v.has(e)?A(e):T(e)},[v,T,A]),L=(0,l.useCallback)(()=>{r||(R(),k(new Set))},[r,R]),_=(0,l.useCallback)(()=>{if(r||0===N.length)return;let e=y<N.length-1?y+1:0;I(N[e].id)},[r,N,y,I]),F=(0,l.useCallback)(()=>{if(r||0===N.length)return;let e=y>0?y-1:N.length-1;I(N[e].id)},[r,N,y,I]),P=(0,l.useCallback)(()=>{r||0===N.length||I(N[0].id)},[r,N,I]),B=(0,l.useCallback)(()=>{r||0===N.length||I(N[N.length-1].id)},[r,N,I]),H=(0,l.useCallback)(()=>{if(r||!h)return;let e=s(u,h);e&&!e.disabled&&(e.panel&&K(h),e.onClick&&e.onClick(),p?.(e))},[r,h,u,K,p]),V=(0,l.useCallback)(e=>{if(!r)switch(e.key){case"ArrowRight":e.preventDefault(),_();break;case"ArrowLeft":e.preventDefault(),F();break;case"Home":e.preventDefault(),P();break;case"End":e.preventDefault(),B();break;case"Enter":case" ":e.preventDefault(),H();break;case"Escape":b.closeOnEscape&&(e.preventDefault(),L(),I(null))}},[r,_,F,P,B,H,b.closeOnEscape,L,I]),W=(0,l.useCallback)(e=>{r||e.disabled||(I(e.id),e.panel&&K(e.id),e.onClick&&e.onClick(),p?.(e))},[r,I,K,p]),Y=(0,l.useCallback)(e=>{r||!b.hoverActivation||e.disabled||(R(),$.current=setTimeout(()=>{I(e.id),e.panel&&T(e.id)},b.openDelay))},[r,b.hoverActivation,b.openDelay,R,I,T]),q=(0,l.useCallback)(()=>{b.closeOnOutsideClick&&(L(),I(null))},[b.closeOnOutsideClick,L,I]),U=(0,l.useCallback)(()=>{b.hoverActivation&&(R(),D.current=setTimeout(()=>{L()},b.closeDelay))},[b.hoverActivation,b.closeDelay,R,L]);(0,l.useEffect)(()=>{if(!b.closeOnOutsideClick)return;let e=e=>{w.current&&!w.current.contains(e.target)&&q()};return document.addEventListener("mousedown",e),()=>{document.removeEventListener("mousedown",e)}},[b.closeOnOutsideClick,q]),(0,l.useEffect)(()=>()=>{R()},[R]);let G=(0,l.useCallback)(e=>{w.current=e,E(e)},[E]),J=(0,l.useMemo)(()=>({...j,...O,...S}),[j,O,S]),Q=(0,l.useMemo)(()=>({activeItemId:h,openPanelIds:v,focusable:z,pressable:M,disabled:r,focusedItemIndex:y,items:u}),[h,v,z,M,r,y,u]),X=(0,l.useMemo)(()=>({focusable:z,pressable:M,setActiveItem:I,openPanel:T,closePanel:A,togglePanel:K,closeAllPanels:L,navigateNext:_,navigatePrevious:F,navigateFirst:P,navigateLast:B,selectCurrentItem:H,handleKeyDown:V,handleItemClick:W,handleItemHover:Y,handleOutsideClick:q}),[z,M,I,T,A,K,L,_,F,P,B,H,V,W,Y,q]),Z=(0,l.useMemo)(()=>({onKeyDown:V,onClick:M.press,onMouseEnter:e=>{let a=e.currentTarget.dataset.itemId;if(a){let e=s(u,a);e&&Y(e)}},onMouseLeave:U,onBlur:q}),[V,M.press,u,Y,U,q]);return(0,l.useMemo)(()=>({state:Q,actions:X,style:J,ref:G,eventHandlers:Z}),[Q,X,J,G,Z])}(f),w=["mega-menu",`mega-menu-${n}`,x.disabled?"mega-menu-disabled":"mega-menu-enabled",e].filter(Boolean).join(" "),$=(e,a=0)=>e.map(e=>{let l=x.activeItemId===e.id,t=x.openPanelIds.has(e.id);return(0,r.jsxs)("div",{className:`mega-menu-item mega-menu-item-level-${a} ${l?"mega-menu-item-active":""} ${t?"mega-menu-item-open":""}`,"data-item-id":e.id,children:[(0,r.jsx)("div",{className:"mega-menu-trigger-wrapper",onKeyDown:a=>{("Enter"===a.key||" "===a.key)&&(a.preventDefault(),v.handleItemClick(e))},onClick:()=>v.handleItemClick(e),onMouseEnter:()=>v.handleItemHover(e),children:m?m(e,l,t):(0,r.jsxs)("div",{className:`mega-menu-trigger ${l?"mega-menu-trigger-active":""} ${t?"mega-menu-trigger-open":""} ${e.disabled?"mega-menu-trigger-disabled":""}`,"data-item-id":e.id,children:[(0,r.jsxs)("span",{className:"mega-menu-trigger-content",children:[e.icon&&(0,r.jsx)("span",{className:"mega-menu-trigger-icon",children:e.icon}),(0,r.jsx)("span",{className:"mega-menu-trigger-label",children:e.label}),e.panel&&p&&(0,r.jsx)("span",{className:"mega-menu-trigger-arrow",children:"horizontal"===n?"▼":"▶"})]}),e.description&&(0,r.jsx)("span",{className:"mega-menu-trigger-description",children:e.description})]})}),e.panel&&(0,r.jsx)("div",{className:`mega-menu-panel-wrapper mega-menu-panel-${g}`,children:c?c(e,t):(0,r.jsx)("div",{className:`mega-menu-panel mega-menu-panel-${g} ${t?"mega-menu-panel-open":"mega-menu-panel-closed"}`,style:{animationDuration:`${d}ms`},children:(0,r.jsx)("div",{className:"mega-menu-panel-content",children:e.panel})})}),e.children&&e.children.length>0&&(0,r.jsx)("div",{className:`mega-menu-children mega-menu-children-level-${a+1}`,children:$(e.children,a+1)})]},e.id)});return(0,r.jsxs)("nav",{ref:e=>{y(e),"function"==typeof b?b(e):b&&(b.current=e)},className:w,style:{...a,...k},...C,"data-orientation":n,"data-testid":"mega-menu",children:[(0,r.jsx)("div",{className:"mega-menu-items",children:$(x.items)}),(0,r.jsx)("style",{children:`
        .mega-menu {
          position: relative;
          display: flex;
          background: ${h.colors?.background||"#ffffff"};
          border: 1px solid ${h.colors?.border||"#e5e7eb"};
          border-radius: ${h.borderRadius?.md||"8px"};
          box-shadow: ${h.shadows?.sm||"0 1px 2px 0 rgba(0, 0, 0, 0.05)"};
        }

        .mega-menu-horizontal {
          flex-direction: row;
          align-items: center;
        }

        .mega-menu-vertical {
          flex-direction: column;
          align-items: stretch;
        }

        .mega-menu-items {
          display: flex;
          flex: 1;
        }

        .mega-menu-horizontal .mega-menu-items {
          flex-direction: row;
        }

        .mega-menu-vertical .mega-menu-items {
          flex-direction: column;
        }

        .mega-menu-item {
          position: relative;
        }

        .mega-menu-trigger-wrapper {
          cursor: pointer;
          user-select: none;
        }

        .mega-menu-trigger {
          display: flex;
          flex-direction: column;
          padding: ${h.spacing?.md||"16px"};
          transition: all ${d}ms ease;
          border-radius: ${h.borderRadius?.md||"8px"};
        }

        .mega-menu-horizontal .mega-menu-trigger {
          min-width: 120px;
        }

        .mega-menu-vertical .mega-menu-trigger {
          width: 100%;
        }

        .mega-menu-trigger:hover {
          background: ${h.colors?.gray50||"#f9fafb"};
        }

        .mega-menu-trigger-active {
          background: ${h.colors?.primary100||"#dbeafe"};
          color: ${h.colors?.primary700||"#1d4ed8"};
        }

        .mega-menu-trigger-disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .mega-menu-trigger-content {
          display: flex;
          align-items: center;
          gap: ${h.spacing?.sm||"8px"};
        }

        .mega-menu-trigger-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mega-menu-trigger-label {
          font-weight: ${h.fontWeights?.medium||"500"};
          font-size: ${h.fontSizes?.md||"16px"};
        }

        .mega-menu-trigger-arrow {
          margin-left: auto;
          font-size: ${h.fontSizes?.xs||"12px"};
          opacity: 0.7;
        }

        .mega-menu-trigger-description {
          font-size: ${h.fontSizes?.sm||"14px"};
          color: ${h.colors?.gray600||"#4b5563"};
          margin-top: ${h.spacing?.xs||"4px"};
        }

        .mega-menu-panel-wrapper {
          position: absolute;
          z-index: 50;
        }

        .mega-menu-horizontal .mega-menu-panel-bottom {
          top: 100%;
          left: 0;
          right: 0;
        }

        .mega-menu-horizontal .mega-menu-panel-top {
          bottom: 100%;
          left: 0;
          right: 0;
        }

        .mega-menu-vertical .mega-menu-panel-right {
          top: 0;
          left: 100%;
        }

        .mega-menu-vertical .mega-menu-panel-left {
          top: 0;
          right: 100%;
        }

        .mega-menu-panel {
          background: ${h.colors?.background||"#ffffff"};
          border: 1px solid ${h.colors?.border||"#e5e7eb"};
          border-radius: ${h.borderRadius?.lg||"12px"};
          box-shadow: ${h.shadows?.lg||"0 10px 15px -3px rgba(0, 0, 0, 0.1)"};
          overflow: hidden;
          min-width: 300px;
          max-width: 600px;
        }

        .mega-menu-panel-closed {
          opacity: 0;
          visibility: hidden;
          transform: translateY(-10px);
          pointer-events: none;
        }

        .mega-menu-panel-open {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
          pointer-events: auto;
        }

        .mega-menu-panel-content {
          padding: ${h.spacing?.lg||"24px"};
        }

        .mega-menu-children {
          position: relative;
        }

        .mega-menu-horizontal .mega-menu-children {
          position: absolute;
          top: 100%;
          left: 0;
          background: ${h.colors?.background||"#ffffff"};
          border: 1px solid ${h.colors?.border||"#e5e7eb"};
          border-radius: ${h.borderRadius?.md||"8px"};
          box-shadow: ${h.shadows?.md||"0 4px 6px -1px rgba(0, 0, 0, 0.1)"};
          z-index: 40;
          min-width: 200px;
        }

        .mega-menu-vertical .mega-menu-children {
          margin-left: ${h.spacing?.lg||"24px"};
          border-left: 2px solid ${h.colors?.gray200||"#e5e7eb"};
          padding-left: ${h.spacing?.lg||"24px"};
        }

        .mega-menu-disabled {
          opacity: 0.6;
          pointer-events: none;
        }

        /* Focus styles */
        .mega-menu-trigger:focus-visible {
          outline: 2px solid ${h.colors?.primary500||"#3b82f6"};
          outline-offset: 2px;
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .mega-menu-horizontal {
            flex-direction: column;
          }

          .mega-menu-horizontal .mega-menu-items {
            flex-direction: column;
            width: 100%;
          }

          .mega-menu-panel {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            width: 100vw;
            height: 100vh;
            border-radius: 0;
            max-width: none;
          }

          .mega-menu-horizontal .mega-menu-panel-wrapper {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 100;
          }

          .mega-menu-panel-content {
            max-height: 80vh;
            overflow-y: auto;
          }
        }
      `})]})});m.displayName="MegaMenu"},53778:(e,a,n)=>{n.d(a,{$:()=>l});var r=n(89918);let l=(e={})=>{let{role:a="generic",label:n,labelledBy:l,describedBy:t,expanded:i,selected:o,disabled:s=!1,required:u=!1,hasPopup:m,live:c,...d}=e,g=(0,r.useRef)(d);if(g.current!==d){let e=g.current,a=Object.keys(e),n=Object.keys(d);a.length===n.length&&a.every(a=>e[a]===d[a])||(g.current=d)}let p=g.current;return(0,r.useMemo)(()=>{let e={...p};return a&&"generic"!==a&&(e.role=a),n&&(e["aria-label"]=n),l&&(e["aria-labelledby"]=l),t&&(e["aria-describedby"]=t),void 0!==i&&(e["aria-expanded"]=i),void 0!==o&&(e["aria-selected"]=o),s&&(e["aria-disabled"]=s),u&&(e["aria-required"]=u),void 0!==m&&(e["aria-haspopup"]=m),void 0!==c&&(e["aria-live"]=c),e},[a,n,l,t,i,o,s,u,m,c,p])}},55817:(e,a,n)=>{n.d(a,{S:()=>l});var r=n(89918);let l=(e={})=>{let{defaultPressed:a=!1,pressable:n=!0,onPress:l,onPressStart:t,onPressEnd:i,onLongPress:o,longPressDuration:s=500,disabled:u=!1,preventDefault:m=!1}=e,[c,d]=(0,r.useState)(a),[g,p]=(0,r.useState)(!1),[f,b]=(0,r.useState)(0),h=(0,r.useRef)(null),x=(0,r.useRef)(!1),v=(0,r.useCallback)(()=>{n&&!u&&(x.current=!0,d(!0),t?.(),o&&s>0&&(h.current=setTimeout(()=>{p(!0),o()},s)))},[n,u,t,o,s]),k=(0,r.useCallback)(()=>{x.current&&(x.current=!1,d(!1),p(!1),i?.(),h.current&&(clearTimeout(h.current),h.current=null))},[i]),y=(0,r.useCallback)(e=>{m&&e.preventDefault(),v()},[m,v]),C=(0,r.useCallback)(e=>{k()},[k]),w=(0,r.useCallback)(e=>{1===e.buttons&&x.current&&d(!0)},[]),$=(0,r.useCallback)(e=>{x.current&&d(!1)},[]),D=(0,r.useCallback)(e=>{m&&e.preventDefault(),v()},[m,v]),z=(0,r.useCallback)(e=>{k()},[k]),j=(0,r.useCallback)(e=>{m&&e.preventDefault(),n&&!u&&(b(e=>e+1),l?.())},[m,n,u,l]),E=(0,r.useCallback)(e=>{n&&!u&&("Enter"===e.key||" "===e.key)&&(m&&e.preventDefault(),v())},[n,u,m,v]),M=(0,r.useCallback)(()=>{n&&!u&&(b(e=>e+1),l?.())},[n,u,l]),O=(0,r.useCallback)(()=>{k(),b(0)},[k]);return(0,r.useMemo)(()=>({pressed:c,disabled:!n||u,longPressed:g,pressCount:f,handleMouseDown:y,handleMouseUp:C,handleMouseEnter:w,handleMouseLeave:$,handleTouchStart:D,handleTouchEnd:z,handleClick:j,handleKeyDown:E,press:M,reset:O}),[c,n,u,g,f,y,C,w,$,D,z,j,E,M,O])}},57576:(e,a,n)=>{n.d(a,{V:()=>l});var r=n(89918);let l=(e={})=>{let{defaultFocused:a=!1,focusable:n=!0,focusStrategy:l="auto",onFocus:t,onBlur:i,keyboard:o}=e,[s,u]=(0,r.useState)(a),m=(0,r.useRef)(null),c=(0,r.useCallback)(()=>n?"programmatic"===l||"first"===l?s?0:-1:0:-1,[n,l,s]),d=(0,r.useCallback)(e=>{n&&(u(!0),t?.(e))},[n,t]),g=(0,r.useCallback)(e=>{u(!1),i?.(e)},[i]),p=(0,r.useCallback)(()=>{m.current&&n&&m.current.focus()},[n]),f=(0,r.useCallback)(()=>{m.current&&m.current.blur()},[]),b=(0,r.useCallback)(()=>{s?f():p()},[s,p,f]),h=(0,r.useCallback)(e=>{o?.navigationKeys.length&&o.navigationKeys.includes(e.key)&&o.onKeyDown?.(e.nativeEvent)},[o]),x=(0,r.useCallback)(e=>{o?.navigationKeys.length&&o.navigationKeys.includes(e.key)&&o.onKeyUp?.(e.nativeEvent)},[o]);return(0,r.useEffect)(()=>{if(a&&"auto"===l){let e=setTimeout(p,0);return()=>clearTimeout(e)}},[a,l,p]),(0,r.useMemo)(()=>({focused:s,disabled:!n,tabIndex:c(),focusRef:m,focus:p,blur:f,toggleFocus:b,handleKeyDown:h,handleKeyUp:x,handleFocus:d,handleBlur:g}),[s,n,l,m,p,f,b,h,x,d,g,c])}}}]);