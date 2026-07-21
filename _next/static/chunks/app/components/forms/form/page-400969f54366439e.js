(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[6526],{18645:(e,t,a)=>{"use strict";a.r(t),a.d(t,{default:()=>u});var s=a(25454),r=a(89918),i=a(21887),d=a(55782),o=a(828);let l="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100",n="block text-sm font-medium text-gray-700 dark:text-gray-200",m="mt-1 text-xs text-red-600";function c(){let[e,t]=(0,r.useState)(null);return(0,s.jsx)(i.lVW,{defaultValues:{email:"",password:""},onSubmit:e=>t(e),children:t=>{let{register:a,formState:{errors:r}}=t;return(0,s.jsxs)("div",{className:"w-full max-w-sm space-y-3",children:[(0,s.jsxs)("div",{children:[(0,s.jsx)("label",{className:n,htmlFor:"email",children:"Email"}),(0,s.jsx)("input",{id:"email",className:`${l} ${r.email?"border-red-500":""}`,placeholder:"you@example.com",...a("email",{required:"Email is required"})}),r.email&&(0,s.jsx)("p",{className:m,children:r.email.message})]}),(0,s.jsxs)("div",{children:[(0,s.jsx)("label",{className:n,htmlFor:"password",children:"Password"}),(0,s.jsx)("input",{id:"password",type:"password",className:`${l} ${r.password?"border-red-500":""}`,placeholder:"••••••••",...a("password",{required:"Password is required",minLength:{value:6,message:"Min 6 characters"}})}),r.password&&(0,s.jsx)("p",{className:m,children:r.password.message})]}),(0,s.jsx)("button",{type:"submit",className:"w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200",children:"Sign in"}),e&&(0,s.jsxs)("p",{className:"text-xs text-green-600",children:["Submitted: ",JSON.stringify(e)]})]})}})}function u(){return(0,s.jsxs)("div",{className:"mx-auto max-w-3xl px-6 py-12 space-y-8",children:[(0,s.jsxs)("header",{className:"space-y-3",children:[(0,s.jsx)("h1",{className:"text-3xl font-bold",children:"Form"}),(0,s.jsxs)("p",{className:"text-gray-600 dark:text-gray-400",children:["A form component built on"," ",(0,s.jsx)("a",{className:"font-mono text-sm underline",href:"https://react-hook-form.com",target:"_blank",rel:"noreferrer",children:"React Hook Form"})," ","via the headless ",(0,s.jsx)("code",{className:"font-mono text-sm",children:"useForm"})," hook. It manages registration, validation, submit/reset, loading state, and multi-step flows. The default render ships empty classes, so use the"," ",(0,s.jsx)("code",{className:"font-mono text-sm",children:"children"})," render prop —"," ",(0,s.jsx)("code",{className:"font-mono text-sm",children:"(rhf, state, actions) => …"})," ","— to register inputs and theme them with Tailwind."]})]}),(0,s.jsxs)("section",{className:"space-y-4",children:[(0,s.jsx)("h2",{className:"text-xl font-semibold",children:"Sign-in form"}),(0,s.jsx)("p",{className:"text-sm text-gray-600 dark:text-gray-400",children:"Validation runs on submit; errors appear inline. Submit a valid form to see the serialized data."}),(0,s.jsx)(d.Demo,{code:`<Form defaultValues={{ email: '', password: '' }} onSubmit={onSubmit}>
  {(rhf) => {
    const { register, formState: { errors } } = rhf;
    return (
      <div className="w-full max-w-sm space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="email">Email</label>
          <input
            id="email"
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
            placeholder="you@example.com"
            {...register('email', { required: 'Email is required' })}
          />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
            placeholder="••••••••"
            {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
          />
          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
        </div>
        <button
          type="submit"
          className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
        >
          Sign in
        </button>
      </div>
    );
  }}
</Form>`,children:(0,s.jsx)(c,{})})]}),(0,s.jsxs)("section",{className:"space-y-4",children:[(0,s.jsx)("h2",{className:"text-xl font-semibold",children:"Controlled submit & reset"}),(0,s.jsxs)("p",{className:"text-sm text-gray-600 dark:text-gray-400",children:["The actions from the render prop (",(0,s.jsx)("code",{children:"submit"}),","," ",(0,s.jsx)("code",{children:"reset"}),") plus ",(0,s.jsx)("code",{children:"isSubmitting"})," drive async submits and a loading state."]}),(0,s.jsx)(d.Demo,{code:`<Form onSubmit={async (data) => { await api.signIn(data); }}>
  {(_, state, actions) => (
    <div className="w-full max-w-sm space-y-3">
      <input
        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
        {...rhf.register('username')}
      />
      <button
        disabled={state.isSubmitting}
        className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
      >
        {state.isSubmitting ? '…' : 'Submit'}
      </button>
    </div>
  )}
</Form>`,children:(0,s.jsxs)("p",{className:"text-sm text-gray-500",children:["The live form above already demonstrates this pattern (submit + the serialized result). Swap ",(0,s.jsx)("code",{children:"onSubmit"})," for an async function to engage the ",(0,s.jsx)("code",{children:"isSubmitting"})," loading state."]})})]}),(0,s.jsxs)("section",{className:"space-y-4",children:[(0,s.jsx)("h2",{className:"text-xl font-semibold",children:"Props"}),(0,s.jsx)(o.X,{props:[{name:"defaultValues",type:"Record<string, any>",default:"{}",description:"Initial field values passed to React Hook Form."},{name:"onSubmit",type:"(data) => void | Promise<void>",default:"—",description:"Required submit handler receiving validated data."},{name:"mode",type:"'onSubmit' | 'onBlur' | 'onChange' | 'onTouched' | 'all'",default:"'onSubmit'",description:"When validation runs."},{name:"validationRules",type:"FormValidationRule[]",default:"[]",description:"Declarative per-field validation rules."},{name:"resolver",type:"Resolver (zod / yup / …)",default:"—",description:"Schema resolver passed straight to RHF."},{name:"multiStep",type:"MultiStepFormConfig",default:"—",description:"Multi-step config; enables next/previous/goToStep."},{name:"disabled / loading / readOnly",type:"boolean",default:"false",description:"Whole-form states reflected to fields."},{name:"layout / size",type:"'vertical' | 'horizontal' | 'inline' | 'grid' / 'sm' | 'md' | 'lg'",default:"'vertical' / 'md'",description:"Layout and size hooks for the default render."},{name:"children",type:"ReactNode | ((rhf, state, actions) => ReactNode)",default:"—",description:"Static content or a render prop with the full RHF API."}]})]})]})}},20429:(e,t,a)=>{Promise.resolve().then(a.bind(a,18645))}},e=>{e.O(0,[7521,8575,1289,6741,3948,7358],()=>e(e.s=20429)),_N_E=e.O()}]);