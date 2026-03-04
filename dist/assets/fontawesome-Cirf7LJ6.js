import{R as Oa,r as Ut}from"./react-vendor-B7Ji3yVk.js";function Ie(e,a){(a==null||a>e.length)&&(a=e.length);for(var t=0,n=Array(a);t<a;t++)n[t]=e[t];return n}function Wt(e){if(Array.isArray(e))return e}function Yt(e){if(Array.isArray(e))return Ie(e)}function Ht(e,a){if(!(e instanceof a))throw new TypeError("Cannot call a class as a function")}function Gt(e,a){for(var t=0;t<a.length;t++){var n=a[t];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,La(n.key),n)}}function Xt(e,a,t){return a&&Gt(e.prototype,a),Object.defineProperty(e,"prototype",{writable:!1}),e}function oe(e,a){var t=typeof Symbol<"u"&&e[Symbol.iterator]||e["@@iterator"];if(!t){if(Array.isArray(e)||(t=De(e))||a){t&&(e=t);var n=0,r=function(){};return{s:r,n:function(){return n>=e.length?{done:!0}:{done:!1,value:e[n++]}},e:function(l){throw l},f:r}}throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}var i,o=!0,s=!1;return{s:function(){t=t.call(e)},n:function(){var l=t.next();return o=l.done,l},e:function(l){s=!0,i=l},f:function(){try{o||t.return==null||t.return()}finally{if(s)throw i}}}}function h(e,a,t){return(a=La(a))in e?Object.defineProperty(e,a,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[a]=t,e}function Bt(e){if(typeof Symbol<"u"&&e[Symbol.iterator]!=null||e["@@iterator"]!=null)return Array.from(e)}function Vt(e,a){var t=e==null?null:typeof Symbol<"u"&&e[Symbol.iterator]||e["@@iterator"];if(t!=null){var n,r,i,o,s=[],l=!0,u=!1;try{if(i=(t=t.call(e)).next,a===0){if(Object(t)!==t)return;l=!1}else for(;!(l=(n=i.call(t)).done)&&(s.push(n.value),s.length!==a);l=!0);}catch(c){u=!0,r=c}finally{try{if(!l&&t.return!=null&&(o=t.return(),Object(o)!==o))return}finally{if(u)throw r}}return s}}function Kt(){throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function Jt(){throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function Qe(e,a){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);a&&(n=n.filter(function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable})),t.push.apply(t,n)}return t}function f(e){for(var a=1;a<arguments.length;a++){var t=arguments[a]!=null?arguments[a]:{};a%2?Qe(Object(t),!0).forEach(function(n){h(e,n,t[n])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):Qe(Object(t)).forEach(function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))})}return e}function de(e,a){return Wt(e)||Vt(e,a)||De(e,a)||Kt()}function F(e){return Yt(e)||Bt(e)||De(e)||Jt()}function qt(e,a){if(typeof e!="object"||!e)return e;var t=e[Symbol.toPrimitive];if(t!==void 0){var n=t.call(e,a);if(typeof n!="object")return n;throw new TypeError("@@toPrimitive must return a primitive value.")}return(a==="string"?String:Number)(e)}function La(e){var a=qt(e,"string");return typeof a=="symbol"?a:a+""}function fe(e){"@babel/helpers - typeof";return fe=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(a){return typeof a}:function(a){return a&&typeof Symbol=="function"&&a.constructor===Symbol&&a!==Symbol.prototype?"symbol":typeof a},fe(e)}function De(e,a){if(e){if(typeof e=="string")return Ie(e,a);var t={}.toString.call(e).slice(8,-1);return t==="Object"&&e.constructor&&(t=e.constructor.name),t==="Map"||t==="Set"?Array.from(e):t==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)?Ie(e,a):void 0}}var Ze=function(){},Ue={},Ma={},za=null,Ta={mark:Ze,measure:Ze};try{typeof window<"u"&&(Ue=window),typeof document<"u"&&(Ma=document),typeof MutationObserver<"u"&&(za=MutationObserver),typeof performance<"u"&&(Ta=performance)}catch{}var Qt=Ue.navigator||{},ea=Qt.userAgent,aa=ea===void 0?"":ea,_=Ue,x=Ma,ta=za,re=Ta;_.document;var T=!!x.documentElement&&!!x.head&&typeof x.addEventListener=="function"&&typeof x.createElement=="function",_a=~aa.indexOf("MSIE")||~aa.indexOf("Trident/"),be,Zt=/fa(k|kd|s|r|l|t|d|dr|dl|dt|b|slr|slpr|wsb|tl|ns|nds|es|gt|jr|jfr|jdr|usb|ufsb|udsb|cr|ss|sr|sl|st|sds|sdr|sdl|sdt)?[\-\ ]/,en=/Font ?Awesome ?([567 ]*)(Solid|Regular|Light|Thin|Duotone|Brands|Free|Pro|Sharp Duotone|Sharp|Kit|Notdog Duo|Notdog|Chisel|Etch|Graphite|Thumbprint|Jelly Fill|Jelly Duo|Jelly|Utility|Utility Fill|Utility Duo|Slab Press|Slab|Whiteboard)?.*/i,ja={classic:{fa:"solid",fas:"solid","fa-solid":"solid",far:"regular","fa-regular":"regular",fal:"light","fa-light":"light",fat:"thin","fa-thin":"thin",fab:"brands","fa-brands":"brands"},duotone:{fa:"solid",fad:"solid","fa-solid":"solid","fa-duotone":"solid",fadr:"regular","fa-regular":"regular",fadl:"light","fa-light":"light",fadt:"thin","fa-thin":"thin"},sharp:{fa:"solid",fass:"solid","fa-solid":"solid",fasr:"regular","fa-regular":"regular",fasl:"light","fa-light":"light",fast:"thin","fa-thin":"thin"},"sharp-duotone":{fa:"solid",fasds:"solid","fa-solid":"solid",fasdr:"regular","fa-regular":"regular",fasdl:"light","fa-light":"light",fasdt:"thin","fa-thin":"thin"},slab:{"fa-regular":"regular",faslr:"regular"},"slab-press":{"fa-regular":"regular",faslpr:"regular"},thumbprint:{"fa-light":"light",fatl:"light"},whiteboard:{"fa-semibold":"semibold",fawsb:"semibold"},notdog:{"fa-solid":"solid",fans:"solid"},"notdog-duo":{"fa-solid":"solid",fands:"solid"},etch:{"fa-solid":"solid",faes:"solid"},graphite:{"fa-thin":"thin",fagt:"thin"},jelly:{"fa-regular":"regular",fajr:"regular"},"jelly-fill":{"fa-regular":"regular",fajfr:"regular"},"jelly-duo":{"fa-regular":"regular",fajdr:"regular"},chisel:{"fa-regular":"regular",facr:"regular"},utility:{"fa-semibold":"semibold",fausb:"semibold"},"utility-duo":{"fa-semibold":"semibold",faudsb:"semibold"},"utility-fill":{"fa-semibold":"semibold",faufsb:"semibold"}},an={GROUP:"duotone-group",PRIMARY:"primary",SECONDARY:"secondary"},Ra=["fa-classic","fa-duotone","fa-sharp","fa-sharp-duotone","fa-thumbprint","fa-whiteboard","fa-notdog","fa-notdog-duo","fa-chisel","fa-etch","fa-graphite","fa-jelly","fa-jelly-fill","fa-jelly-duo","fa-slab","fa-slab-press","fa-utility","fa-utility-duo","fa-utility-fill"],I="classic",ee="duotone",$a="sharp",Da="sharp-duotone",Ua="chisel",Wa="etch",Ya="graphite",Ha="jelly",Ga="jelly-duo",Xa="jelly-fill",Ba="notdog",Va="notdog-duo",Ka="slab",Ja="slab-press",qa="thumbprint",Qa="utility",Za="utility-duo",et="utility-fill",at="whiteboard",tn="Classic",nn="Duotone",rn="Sharp",on="Sharp Duotone",sn="Chisel",ln="Etch",fn="Graphite",un="Jelly",cn="Jelly Duo",dn="Jelly Fill",mn="Notdog",vn="Notdog Duo",hn="Slab",pn="Slab Press",gn="Thumbprint",bn="Utility",yn="Utility Duo",xn="Utility Fill",wn="Whiteboard",tt=[I,ee,$a,Da,Ua,Wa,Ya,Ha,Ga,Xa,Ba,Va,Ka,Ja,qa,Qa,Za,et,at];be={},h(h(h(h(h(h(h(h(h(h(be,I,tn),ee,nn),$a,rn),Da,on),Ua,sn),Wa,ln),Ya,fn),Ha,un),Ga,cn),Xa,dn),h(h(h(h(h(h(h(h(h(be,Ba,mn),Va,vn),Ka,hn),Ja,pn),qa,gn),Qa,bn),Za,yn),et,xn),at,wn);var An={classic:{900:"fas",400:"far",normal:"far",300:"fal",100:"fat"},duotone:{900:"fad",400:"fadr",300:"fadl",100:"fadt"},sharp:{900:"fass",400:"fasr",300:"fasl",100:"fast"},"sharp-duotone":{900:"fasds",400:"fasdr",300:"fasdl",100:"fasdt"},slab:{400:"faslr"},"slab-press":{400:"faslpr"},whiteboard:{600:"fawsb"},thumbprint:{300:"fatl"},notdog:{900:"fans"},"notdog-duo":{900:"fands"},etch:{900:"faes"},graphite:{100:"fagt"},chisel:{400:"facr"},jelly:{400:"fajr"},"jelly-fill":{400:"fajfr"},"jelly-duo":{400:"fajdr"},utility:{600:"fausb"},"utility-duo":{600:"faudsb"},"utility-fill":{600:"faufsb"}},Sn={"Font Awesome 7 Free":{900:"fas",400:"far"},"Font Awesome 7 Pro":{900:"fas",400:"far",normal:"far",300:"fal",100:"fat"},"Font Awesome 7 Brands":{400:"fab",normal:"fab"},"Font Awesome 7 Duotone":{900:"fad",400:"fadr",normal:"fadr",300:"fadl",100:"fadt"},"Font Awesome 7 Sharp":{900:"fass",400:"fasr",normal:"fasr",300:"fasl",100:"fast"},"Font Awesome 7 Sharp Duotone":{900:"fasds",400:"fasdr",normal:"fasdr",300:"fasdl",100:"fasdt"},"Font Awesome 7 Jelly":{400:"fajr",normal:"fajr"},"Font Awesome 7 Jelly Fill":{400:"fajfr",normal:"fajfr"},"Font Awesome 7 Jelly Duo":{400:"fajdr",normal:"fajdr"},"Font Awesome 7 Slab":{400:"faslr",normal:"faslr"},"Font Awesome 7 Slab Press":{400:"faslpr",normal:"faslpr"},"Font Awesome 7 Thumbprint":{300:"fatl",normal:"fatl"},"Font Awesome 7 Notdog":{900:"fans",normal:"fans"},"Font Awesome 7 Notdog Duo":{900:"fands",normal:"fands"},"Font Awesome 7 Etch":{900:"faes",normal:"faes"},"Font Awesome 7 Graphite":{100:"fagt",normal:"fagt"},"Font Awesome 7 Chisel":{400:"facr",normal:"facr"},"Font Awesome 7 Whiteboard":{600:"fawsb",normal:"fawsb"},"Font Awesome 7 Utility":{600:"fausb",normal:"fausb"},"Font Awesome 7 Utility Duo":{600:"faudsb",normal:"faudsb"},"Font Awesome 7 Utility Fill":{600:"faufsb",normal:"faufsb"}},kn=new Map([["classic",{defaultShortPrefixId:"fas",defaultStyleId:"solid",styleIds:["solid","regular","light","thin","brands"],futureStyleIds:[],defaultFontWeight:900}],["duotone",{defaultShortPrefixId:"fad",defaultStyleId:"solid",styleIds:["solid","regular","light","thin"],futureStyleIds:[],defaultFontWeight:900}],["sharp",{defaultShortPrefixId:"fass",defaultStyleId:"solid",styleIds:["solid","regular","light","thin"],futureStyleIds:[],defaultFontWeight:900}],["sharp-duotone",{defaultShortPrefixId:"fasds",defaultStyleId:"solid",styleIds:["solid","regular","light","thin"],futureStyleIds:[],defaultFontWeight:900}],["chisel",{defaultShortPrefixId:"facr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["etch",{defaultShortPrefixId:"faes",defaultStyleId:"solid",styleIds:["solid"],futureStyleIds:[],defaultFontWeight:900}],["graphite",{defaultShortPrefixId:"fagt",defaultStyleId:"thin",styleIds:["thin"],futureStyleIds:[],defaultFontWeight:100}],["jelly",{defaultShortPrefixId:"fajr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["jelly-duo",{defaultShortPrefixId:"fajdr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["jelly-fill",{defaultShortPrefixId:"fajfr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["notdog",{defaultShortPrefixId:"fans",defaultStyleId:"solid",styleIds:["solid"],futureStyleIds:[],defaultFontWeight:900}],["notdog-duo",{defaultShortPrefixId:"fands",defaultStyleId:"solid",styleIds:["solid"],futureStyleIds:[],defaultFontWeight:900}],["slab",{defaultShortPrefixId:"faslr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["slab-press",{defaultShortPrefixId:"faslpr",defaultStyleId:"regular",styleIds:["regular"],futureStyleIds:[],defaultFontWeight:400}],["thumbprint",{defaultShortPrefixId:"fatl",defaultStyleId:"light",styleIds:["light"],futureStyleIds:[],defaultFontWeight:300}],["utility",{defaultShortPrefixId:"fausb",defaultStyleId:"semibold",styleIds:["semibold"],futureStyleIds:[],defaultFontWeight:600}],["utility-duo",{defaultShortPrefixId:"faudsb",defaultStyleId:"semibold",styleIds:["semibold"],futureStyleIds:[],defaultFontWeight:600}],["utility-fill",{defaultShortPrefixId:"faufsb",defaultStyleId:"semibold",styleIds:["semibold"],futureStyleIds:[],defaultFontWeight:600}],["whiteboard",{defaultShortPrefixId:"fawsb",defaultStyleId:"semibold",styleIds:["semibold"],futureStyleIds:[],defaultFontWeight:600}]]),In={chisel:{regular:"facr"},classic:{brands:"fab",light:"fal",regular:"far",solid:"fas",thin:"fat"},duotone:{light:"fadl",regular:"fadr",solid:"fad",thin:"fadt"},etch:{solid:"faes"},graphite:{thin:"fagt"},jelly:{regular:"fajr"},"jelly-duo":{regular:"fajdr"},"jelly-fill":{regular:"fajfr"},notdog:{solid:"fans"},"notdog-duo":{solid:"fands"},sharp:{light:"fasl",regular:"fasr",solid:"fass",thin:"fast"},"sharp-duotone":{light:"fasdl",regular:"fasdr",solid:"fasds",thin:"fasdt"},slab:{regular:"faslr"},"slab-press":{regular:"faslpr"},thumbprint:{light:"fatl"},utility:{semibold:"fausb"},"utility-duo":{semibold:"faudsb"},"utility-fill":{semibold:"faufsb"},whiteboard:{semibold:"fawsb"}},nt=["fak","fa-kit","fakd","fa-kit-duotone"],na={kit:{fak:"kit","fa-kit":"kit"},"kit-duotone":{fakd:"kit-duotone","fa-kit-duotone":"kit-duotone"}},Pn=["kit"],En="kit",Fn="kit-duotone",Cn="Kit",Nn="Kit Duotone";h(h({},En,Cn),Fn,Nn);var On={kit:{"fa-kit":"fak"}},Ln={"Font Awesome Kit":{400:"fak",normal:"fak"},"Font Awesome Kit Duotone":{400:"fakd",normal:"fakd"}},Mn={kit:{fak:"fa-kit"}},ra={kit:{kit:"fak"},"kit-duotone":{"kit-duotone":"fakd"}},ye,ie={GROUP:"duotone-group",SWAP_OPACITY:"swap-opacity",PRIMARY:"primary",SECONDARY:"secondary"},zn=["fa-classic","fa-duotone","fa-sharp","fa-sharp-duotone","fa-thumbprint","fa-whiteboard","fa-notdog","fa-notdog-duo","fa-chisel","fa-etch","fa-graphite","fa-jelly","fa-jelly-fill","fa-jelly-duo","fa-slab","fa-slab-press","fa-utility","fa-utility-duo","fa-utility-fill"],Tn="classic",_n="duotone",jn="sharp",Rn="sharp-duotone",$n="chisel",Dn="etch",Un="graphite",Wn="jelly",Yn="jelly-duo",Hn="jelly-fill",Gn="notdog",Xn="notdog-duo",Bn="slab",Vn="slab-press",Kn="thumbprint",Jn="utility",qn="utility-duo",Qn="utility-fill",Zn="whiteboard",er="Classic",ar="Duotone",tr="Sharp",nr="Sharp Duotone",rr="Chisel",ir="Etch",or="Graphite",sr="Jelly",lr="Jelly Duo",fr="Jelly Fill",ur="Notdog",cr="Notdog Duo",dr="Slab",mr="Slab Press",vr="Thumbprint",hr="Utility",pr="Utility Duo",gr="Utility Fill",br="Whiteboard";ye={},h(h(h(h(h(h(h(h(h(h(ye,Tn,er),_n,ar),jn,tr),Rn,nr),$n,rr),Dn,ir),Un,or),Wn,sr),Yn,lr),Hn,fr),h(h(h(h(h(h(h(h(h(ye,Gn,ur),Xn,cr),Bn,dr),Vn,mr),Kn,vr),Jn,hr),qn,pr),Qn,gr),Zn,br);var yr="kit",xr="kit-duotone",wr="Kit",Ar="Kit Duotone";h(h({},yr,wr),xr,Ar);var Sr={classic:{"fa-brands":"fab","fa-duotone":"fad","fa-light":"fal","fa-regular":"far","fa-solid":"fas","fa-thin":"fat"},duotone:{"fa-regular":"fadr","fa-light":"fadl","fa-thin":"fadt"},sharp:{"fa-solid":"fass","fa-regular":"fasr","fa-light":"fasl","fa-thin":"fast"},"sharp-duotone":{"fa-solid":"fasds","fa-regular":"fasdr","fa-light":"fasdl","fa-thin":"fasdt"},slab:{"fa-regular":"faslr"},"slab-press":{"fa-regular":"faslpr"},whiteboard:{"fa-semibold":"fawsb"},thumbprint:{"fa-light":"fatl"},notdog:{"fa-solid":"fans"},"notdog-duo":{"fa-solid":"fands"},etch:{"fa-solid":"faes"},graphite:{"fa-thin":"fagt"},jelly:{"fa-regular":"fajr"},"jelly-fill":{"fa-regular":"fajfr"},"jelly-duo":{"fa-regular":"fajdr"},chisel:{"fa-regular":"facr"},utility:{"fa-semibold":"fausb"},"utility-duo":{"fa-semibold":"faudsb"},"utility-fill":{"fa-semibold":"faufsb"}},kr={classic:["fas","far","fal","fat","fad"],duotone:["fadr","fadl","fadt"],sharp:["fass","fasr","fasl","fast"],"sharp-duotone":["fasds","fasdr","fasdl","fasdt"],slab:["faslr"],"slab-press":["faslpr"],whiteboard:["fawsb"],thumbprint:["fatl"],notdog:["fans"],"notdog-duo":["fands"],etch:["faes"],graphite:["fagt"],jelly:["fajr"],"jelly-fill":["fajfr"],"jelly-duo":["fajdr"],chisel:["facr"],utility:["fausb"],"utility-duo":["faudsb"],"utility-fill":["faufsb"]},Pe={classic:{fab:"fa-brands",fad:"fa-duotone",fal:"fa-light",far:"fa-regular",fas:"fa-solid",fat:"fa-thin"},duotone:{fadr:"fa-regular",fadl:"fa-light",fadt:"fa-thin"},sharp:{fass:"fa-solid",fasr:"fa-regular",fasl:"fa-light",fast:"fa-thin"},"sharp-duotone":{fasds:"fa-solid",fasdr:"fa-regular",fasdl:"fa-light",fasdt:"fa-thin"},slab:{faslr:"fa-regular"},"slab-press":{faslpr:"fa-regular"},whiteboard:{fawsb:"fa-semibold"},thumbprint:{fatl:"fa-light"},notdog:{fans:"fa-solid"},"notdog-duo":{fands:"fa-solid"},etch:{faes:"fa-solid"},graphite:{fagt:"fa-thin"},jelly:{fajr:"fa-regular"},"jelly-fill":{fajfr:"fa-regular"},"jelly-duo":{fajdr:"fa-regular"},chisel:{facr:"fa-regular"},utility:{fausb:"fa-semibold"},"utility-duo":{faudsb:"fa-semibold"},"utility-fill":{faufsb:"fa-semibold"}},Ir=["fa-solid","fa-regular","fa-light","fa-thin","fa-duotone","fa-brands","fa-semibold"],rt=["fa","fas","far","fal","fat","fad","fadr","fadl","fadt","fab","fass","fasr","fasl","fast","fasds","fasdr","fasdl","fasdt","faslr","faslpr","fawsb","fatl","fans","fands","faes","fagt","fajr","fajfr","fajdr","facr","fausb","faudsb","faufsb"].concat(zn,Ir),Pr=["solid","regular","light","thin","duotone","brands","semibold"],it=[1,2,3,4,5,6,7,8,9,10],Er=it.concat([11,12,13,14,15,16,17,18,19,20]),Fr=["aw","fw","pull-left","pull-right"],Cr=[].concat(F(Object.keys(kr)),Pr,Fr,["2xs","xs","sm","lg","xl","2xl","beat","border","fade","beat-fade","bounce","flip-both","flip-horizontal","flip-vertical","flip","inverse","layers","layers-bottom-left","layers-bottom-right","layers-counter","layers-text","layers-top-left","layers-top-right","li","pull-end","pull-start","pulse","rotate-180","rotate-270","rotate-90","rotate-by","shake","spin-pulse","spin-reverse","spin","stack-1x","stack-2x","stack","ul","width-auto","width-fixed",ie.GROUP,ie.SWAP_OPACITY,ie.PRIMARY,ie.SECONDARY]).concat(it.map(function(e){return"".concat(e,"x")})).concat(Er.map(function(e){return"w-".concat(e)})),Nr={"Font Awesome 5 Free":{900:"fas",400:"far"},"Font Awesome 5 Pro":{900:"fas",400:"far",normal:"far",300:"fal"},"Font Awesome 5 Brands":{400:"fab",normal:"fab"},"Font Awesome 5 Duotone":{900:"fad"}},M="___FONT_AWESOME___",Ee=16,ot="fa",st="svg-inline--fa",D="data-fa-i2svg",Fe="data-fa-pseudo-element",Or="data-fa-pseudo-element-pending",We="data-prefix",Ye="data-icon",ia="fontawesome-i2svg",Lr="async",Mr=["HTML","HEAD","STYLE","SCRIPT"],lt=["::before","::after",":before",":after"],ft=(function(){try{return!0}catch{return!1}})();function ae(e){return new Proxy(e,{get:function(t,n){return n in t?t[n]:t[I]}})}var ut=f({},ja);ut[I]=f(f(f(f({},{"fa-duotone":"duotone"}),ja[I]),na.kit),na["kit-duotone"]);var zr=ae(ut),Ce=f({},In);Ce[I]=f(f(f(f({},{duotone:"fad"}),Ce[I]),ra.kit),ra["kit-duotone"]);var oa=ae(Ce),Ne=f({},Pe);Ne[I]=f(f({},Ne[I]),Mn.kit);var He=ae(Ne),Oe=f({},Sr);Oe[I]=f(f({},Oe[I]),On.kit);ae(Oe);var Tr=Zt,ct="fa-layers-text",_r=en,jr=f({},An);ae(jr);var Rr=["class","data-prefix","data-icon","data-fa-transform","data-fa-mask"],xe=an,$r=[].concat(F(Pn),F(Cr)),K=_.FontAwesomeConfig||{};function Dr(e){var a=x.querySelector("script["+e+"]");if(a)return a.getAttribute(e)}function Ur(e){return e===""?!0:e==="false"?!1:e==="true"?!0:e}if(x&&typeof x.querySelector=="function"){var Wr=[["data-family-prefix","familyPrefix"],["data-css-prefix","cssPrefix"],["data-family-default","familyDefault"],["data-style-default","styleDefault"],["data-replacement-class","replacementClass"],["data-auto-replace-svg","autoReplaceSvg"],["data-auto-add-css","autoAddCss"],["data-search-pseudo-elements","searchPseudoElements"],["data-search-pseudo-elements-warnings","searchPseudoElementsWarnings"],["data-search-pseudo-elements-full-scan","searchPseudoElementsFullScan"],["data-observe-mutations","observeMutations"],["data-mutate-approach","mutateApproach"],["data-keep-original-source","keepOriginalSource"],["data-measure-performance","measurePerformance"],["data-show-missing-icons","showMissingIcons"]];Wr.forEach(function(e){var a=de(e,2),t=a[0],n=a[1],r=Ur(Dr(t));r!=null&&(K[n]=r)})}var dt={styleDefault:"solid",familyDefault:I,cssPrefix:ot,replacementClass:st,autoReplaceSvg:!0,autoAddCss:!0,searchPseudoElements:!1,searchPseudoElementsWarnings:!0,searchPseudoElementsFullScan:!1,observeMutations:!0,mutateApproach:"async",keepOriginalSource:!0,measurePerformance:!1,showMissingIcons:!0};K.familyPrefix&&(K.cssPrefix=K.familyPrefix);var X=f(f({},dt),K);X.autoReplaceSvg||(X.observeMutations=!1);var m={};Object.keys(dt).forEach(function(e){Object.defineProperty(m,e,{enumerable:!0,set:function(t){X[e]=t,J.forEach(function(n){return n(m)})},get:function(){return X[e]}})});Object.defineProperty(m,"familyPrefix",{enumerable:!0,set:function(a){X.cssPrefix=a,J.forEach(function(t){return t(m)})},get:function(){return X.cssPrefix}});_.FontAwesomeConfig=m;var J=[];function Yr(e){return J.push(e),function(){J.splice(J.indexOf(e),1)}}var W=Ee,C={size:16,x:0,y:0,rotate:0,flipX:!1,flipY:!1};function Hr(e){if(!(!e||!T)){var a=x.createElement("style");a.setAttribute("type","text/css"),a.innerHTML=e;for(var t=x.head.childNodes,n=null,r=t.length-1;r>-1;r--){var i=t[r],o=(i.tagName||"").toUpperCase();["STYLE","LINK"].indexOf(o)>-1&&(n=i)}return x.head.insertBefore(a,n),e}}var Gr="0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";function sa(){for(var e=12,a="";e-- >0;)a+=Gr[Math.random()*62|0];return a}function B(e){for(var a=[],t=(e||[]).length>>>0;t--;)a[t]=e[t];return a}function Ge(e){return e.classList?B(e.classList):(e.getAttribute("class")||"").split(" ").filter(function(a){return a})}function mt(e){return"".concat(e).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/'/g,"&#39;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function Xr(e){return Object.keys(e||{}).reduce(function(a,t){return a+"".concat(t,'="').concat(mt(e[t]),'" ')},"").trim()}function me(e){return Object.keys(e||{}).reduce(function(a,t){return a+"".concat(t,": ").concat(e[t].trim(),";")},"")}function Xe(e){return e.size!==C.size||e.x!==C.x||e.y!==C.y||e.rotate!==C.rotate||e.flipX||e.flipY}function Br(e){var a=e.transform,t=e.containerWidth,n=e.iconWidth,r={transform:"translate(".concat(t/2," 256)")},i="translate(".concat(a.x*32,", ").concat(a.y*32,") "),o="scale(".concat(a.size/16*(a.flipX?-1:1),", ").concat(a.size/16*(a.flipY?-1:1),") "),s="rotate(".concat(a.rotate," 0 0)"),l={transform:"".concat(i," ").concat(o," ").concat(s)},u={transform:"translate(".concat(n/2*-1," -256)")};return{outer:r,inner:l,path:u}}function Vr(e){var a=e.transform,t=e.width,n=t===void 0?Ee:t,r=e.height,i=r===void 0?Ee:r,o="";return _a?o+="translate(".concat(a.x/W-n/2,"em, ").concat(a.y/W-i/2,"em) "):o+="translate(calc(-50% + ".concat(a.x/W,"em), calc(-50% + ").concat(a.y/W,"em)) "),o+="scale(".concat(a.size/W*(a.flipX?-1:1),", ").concat(a.size/W*(a.flipY?-1:1),") "),o+="rotate(".concat(a.rotate,"deg) "),o}var Kr=`:root, :host {
  --fa-font-solid: normal 900 1em/1 'Font Awesome 7 Free';
  --fa-font-regular: normal 400 1em/1 'Font Awesome 7 Free';
  --fa-font-light: normal 300 1em/1 'Font Awesome 7 Pro';
  --fa-font-thin: normal 100 1em/1 'Font Awesome 7 Pro';
  --fa-font-duotone: normal 900 1em/1 'Font Awesome 7 Duotone';
  --fa-font-duotone-regular: normal 400 1em/1 'Font Awesome 7 Duotone';
  --fa-font-duotone-light: normal 300 1em/1 'Font Awesome 7 Duotone';
  --fa-font-duotone-thin: normal 100 1em/1 'Font Awesome 7 Duotone';
  --fa-font-brands: normal 400 1em/1 'Font Awesome 7 Brands';
  --fa-font-sharp-solid: normal 900 1em/1 'Font Awesome 7 Sharp';
  --fa-font-sharp-regular: normal 400 1em/1 'Font Awesome 7 Sharp';
  --fa-font-sharp-light: normal 300 1em/1 'Font Awesome 7 Sharp';
  --fa-font-sharp-thin: normal 100 1em/1 'Font Awesome 7 Sharp';
  --fa-font-sharp-duotone-solid: normal 900 1em/1 'Font Awesome 7 Sharp Duotone';
  --fa-font-sharp-duotone-regular: normal 400 1em/1 'Font Awesome 7 Sharp Duotone';
  --fa-font-sharp-duotone-light: normal 300 1em/1 'Font Awesome 7 Sharp Duotone';
  --fa-font-sharp-duotone-thin: normal 100 1em/1 'Font Awesome 7 Sharp Duotone';
  --fa-font-slab-regular: normal 400 1em/1 'Font Awesome 7 Slab';
  --fa-font-slab-press-regular: normal 400 1em/1 'Font Awesome 7 Slab Press';
  --fa-font-whiteboard-semibold: normal 600 1em/1 'Font Awesome 7 Whiteboard';
  --fa-font-thumbprint-light: normal 300 1em/1 'Font Awesome 7 Thumbprint';
  --fa-font-notdog-solid: normal 900 1em/1 'Font Awesome 7 Notdog';
  --fa-font-notdog-duo-solid: normal 900 1em/1 'Font Awesome 7 Notdog Duo';
  --fa-font-etch-solid: normal 900 1em/1 'Font Awesome 7 Etch';
  --fa-font-graphite-thin: normal 100 1em/1 'Font Awesome 7 Graphite';
  --fa-font-jelly-regular: normal 400 1em/1 'Font Awesome 7 Jelly';
  --fa-font-jelly-fill-regular: normal 400 1em/1 'Font Awesome 7 Jelly Fill';
  --fa-font-jelly-duo-regular: normal 400 1em/1 'Font Awesome 7 Jelly Duo';
  --fa-font-chisel-regular: normal 400 1em/1 'Font Awesome 7 Chisel';
  --fa-font-utility-semibold: normal 600 1em/1 'Font Awesome 7 Utility';
  --fa-font-utility-duo-semibold: normal 600 1em/1 'Font Awesome 7 Utility Duo';
  --fa-font-utility-fill-semibold: normal 600 1em/1 'Font Awesome 7 Utility Fill';
}

.svg-inline--fa {
  box-sizing: content-box;
  display: var(--fa-display, inline-block);
  height: 1em;
  overflow: visible;
  vertical-align: -0.125em;
  width: var(--fa-width, 1.25em);
}
.svg-inline--fa.fa-2xs {
  vertical-align: 0.1em;
}
.svg-inline--fa.fa-xs {
  vertical-align: 0em;
}
.svg-inline--fa.fa-sm {
  vertical-align: -0.0714285714em;
}
.svg-inline--fa.fa-lg {
  vertical-align: -0.2em;
}
.svg-inline--fa.fa-xl {
  vertical-align: -0.25em;
}
.svg-inline--fa.fa-2xl {
  vertical-align: -0.3125em;
}
.svg-inline--fa.fa-pull-left,
.svg-inline--fa .fa-pull-start {
  float: inline-start;
  margin-inline-end: var(--fa-pull-margin, 0.3em);
}
.svg-inline--fa.fa-pull-right,
.svg-inline--fa .fa-pull-end {
  float: inline-end;
  margin-inline-start: var(--fa-pull-margin, 0.3em);
}
.svg-inline--fa.fa-li {
  width: var(--fa-li-width, 2em);
  inset-inline-start: calc(-1 * var(--fa-li-width, 2em));
  inset-block-start: 0.25em; /* syncing vertical alignment with Web Font rendering */
}

.fa-layers-counter, .fa-layers-text {
  display: inline-block;
  position: absolute;
  text-align: center;
}

.fa-layers {
  display: inline-block;
  height: 1em;
  position: relative;
  text-align: center;
  vertical-align: -0.125em;
  width: var(--fa-width, 1.25em);
}
.fa-layers .svg-inline--fa {
  inset: 0;
  margin: auto;
  position: absolute;
  transform-origin: center center;
}

.fa-layers-text {
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  transform-origin: center center;
}

.fa-layers-counter {
  background-color: var(--fa-counter-background-color, #ff253a);
  border-radius: var(--fa-counter-border-radius, 1em);
  box-sizing: border-box;
  color: var(--fa-inverse, #fff);
  line-height: var(--fa-counter-line-height, 1);
  max-width: var(--fa-counter-max-width, 5em);
  min-width: var(--fa-counter-min-width, 1.5em);
  overflow: hidden;
  padding: var(--fa-counter-padding, 0.25em 0.5em);
  right: var(--fa-right, 0);
  text-overflow: ellipsis;
  top: var(--fa-top, 0);
  transform: scale(var(--fa-counter-scale, 0.25));
  transform-origin: top right;
}

.fa-layers-bottom-right {
  bottom: var(--fa-bottom, 0);
  right: var(--fa-right, 0);
  top: auto;
  transform: scale(var(--fa-layers-scale, 0.25));
  transform-origin: bottom right;
}

.fa-layers-bottom-left {
  bottom: var(--fa-bottom, 0);
  left: var(--fa-left, 0);
  right: auto;
  top: auto;
  transform: scale(var(--fa-layers-scale, 0.25));
  transform-origin: bottom left;
}

.fa-layers-top-right {
  top: var(--fa-top, 0);
  right: var(--fa-right, 0);
  transform: scale(var(--fa-layers-scale, 0.25));
  transform-origin: top right;
}

.fa-layers-top-left {
  left: var(--fa-left, 0);
  right: auto;
  top: var(--fa-top, 0);
  transform: scale(var(--fa-layers-scale, 0.25));
  transform-origin: top left;
}

.fa-1x {
  font-size: 1em;
}

.fa-2x {
  font-size: 2em;
}

.fa-3x {
  font-size: 3em;
}

.fa-4x {
  font-size: 4em;
}

.fa-5x {
  font-size: 5em;
}

.fa-6x {
  font-size: 6em;
}

.fa-7x {
  font-size: 7em;
}

.fa-8x {
  font-size: 8em;
}

.fa-9x {
  font-size: 9em;
}

.fa-10x {
  font-size: 10em;
}

.fa-2xs {
  font-size: calc(10 / 16 * 1em); /* converts a 10px size into an em-based value that's relative to the scale's 16px base */
  line-height: calc(1 / 10 * 1em); /* sets the line-height of the icon back to that of it's parent */
  vertical-align: calc((6 / 10 - 0.375) * 1em); /* vertically centers the icon taking into account the surrounding text's descender */
}

.fa-xs {
  font-size: calc(12 / 16 * 1em); /* converts a 12px size into an em-based value that's relative to the scale's 16px base */
  line-height: calc(1 / 12 * 1em); /* sets the line-height of the icon back to that of it's parent */
  vertical-align: calc((6 / 12 - 0.375) * 1em); /* vertically centers the icon taking into account the surrounding text's descender */
}

.fa-sm {
  font-size: calc(14 / 16 * 1em); /* converts a 14px size into an em-based value that's relative to the scale's 16px base */
  line-height: calc(1 / 14 * 1em); /* sets the line-height of the icon back to that of it's parent */
  vertical-align: calc((6 / 14 - 0.375) * 1em); /* vertically centers the icon taking into account the surrounding text's descender */
}

.fa-lg {
  font-size: calc(20 / 16 * 1em); /* converts a 20px size into an em-based value that's relative to the scale's 16px base */
  line-height: calc(1 / 20 * 1em); /* sets the line-height of the icon back to that of it's parent */
  vertical-align: calc((6 / 20 - 0.375) * 1em); /* vertically centers the icon taking into account the surrounding text's descender */
}

.fa-xl {
  font-size: calc(24 / 16 * 1em); /* converts a 24px size into an em-based value that's relative to the scale's 16px base */
  line-height: calc(1 / 24 * 1em); /* sets the line-height of the icon back to that of it's parent */
  vertical-align: calc((6 / 24 - 0.375) * 1em); /* vertically centers the icon taking into account the surrounding text's descender */
}

.fa-2xl {
  font-size: calc(32 / 16 * 1em); /* converts a 32px size into an em-based value that's relative to the scale's 16px base */
  line-height: calc(1 / 32 * 1em); /* sets the line-height of the icon back to that of it's parent */
  vertical-align: calc((6 / 32 - 0.375) * 1em); /* vertically centers the icon taking into account the surrounding text's descender */
}

.fa-width-auto {
  --fa-width: auto;
}

.fa-fw,
.fa-width-fixed {
  --fa-width: 1.25em;
}

.fa-ul {
  list-style-type: none;
  margin-inline-start: var(--fa-li-margin, 2.5em);
  padding-inline-start: 0;
}
.fa-ul > li {
  position: relative;
}

.fa-li {
  inset-inline-start: calc(-1 * var(--fa-li-width, 2em));
  position: absolute;
  text-align: center;
  width: var(--fa-li-width, 2em);
  line-height: inherit;
}

/* Heads Up: Bordered Icons will not be supported in the future!
  - This feature will be deprecated in the next major release of Font Awesome (v8)!
  - You may continue to use it in this version *v7), but it will not be supported in Font Awesome v8.
*/
/* Notes:
* --@{v.$css-prefix}-border-width = 1/16 by default (to render as ~1px based on a 16px default font-size)
* --@{v.$css-prefix}-border-padding =
  ** 3/16 for vertical padding (to give ~2px of vertical whitespace around an icon considering it's vertical alignment)
  ** 4/16 for horizontal padding (to give ~4px of horizontal whitespace around an icon)
*/
.fa-border {
  border-color: var(--fa-border-color, #eee);
  border-radius: var(--fa-border-radius, 0.1em);
  border-style: var(--fa-border-style, solid);
  border-width: var(--fa-border-width, 0.0625em);
  box-sizing: var(--fa-border-box-sizing, content-box);
  padding: var(--fa-border-padding, 0.1875em 0.25em);
}

.fa-pull-left,
.fa-pull-start {
  float: inline-start;
  margin-inline-end: var(--fa-pull-margin, 0.3em);
}

.fa-pull-right,
.fa-pull-end {
  float: inline-end;
  margin-inline-start: var(--fa-pull-margin, 0.3em);
}

.fa-beat {
  animation-name: fa-beat;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, ease-in-out);
}

.fa-bounce {
  animation-name: fa-bounce;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, cubic-bezier(0.28, 0.84, 0.42, 1));
}

.fa-fade {
  animation-name: fa-fade;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, cubic-bezier(0.4, 0, 0.6, 1));
}

.fa-beat-fade {
  animation-name: fa-beat-fade;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, cubic-bezier(0.4, 0, 0.6, 1));
}

.fa-flip {
  animation-name: fa-flip;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, ease-in-out);
}

.fa-shake {
  animation-name: fa-shake;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, linear);
}

.fa-spin {
  animation-name: fa-spin;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 2s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, linear);
}

.fa-spin-reverse {
  --fa-animation-direction: reverse;
}

.fa-pulse,
.fa-spin-pulse {
  animation-name: fa-spin;
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, steps(8));
}

@media (prefers-reduced-motion: reduce) {
  .fa-beat,
  .fa-bounce,
  .fa-fade,
  .fa-beat-fade,
  .fa-flip,
  .fa-pulse,
  .fa-shake,
  .fa-spin,
  .fa-spin-pulse {
    animation: none !important;
    transition: none !important;
  }
}
@keyframes fa-beat {
  0%, 90% {
    transform: scale(1);
  }
  45% {
    transform: scale(var(--fa-beat-scale, 1.25));
  }
}
@keyframes fa-bounce {
  0% {
    transform: scale(1, 1) translateY(0);
  }
  10% {
    transform: scale(var(--fa-bounce-start-scale-x, 1.1), var(--fa-bounce-start-scale-y, 0.9)) translateY(0);
  }
  30% {
    transform: scale(var(--fa-bounce-jump-scale-x, 0.9), var(--fa-bounce-jump-scale-y, 1.1)) translateY(var(--fa-bounce-height, -0.5em));
  }
  50% {
    transform: scale(var(--fa-bounce-land-scale-x, 1.05), var(--fa-bounce-land-scale-y, 0.95)) translateY(0);
  }
  57% {
    transform: scale(1, 1) translateY(var(--fa-bounce-rebound, -0.125em));
  }
  64% {
    transform: scale(1, 1) translateY(0);
  }
  100% {
    transform: scale(1, 1) translateY(0);
  }
}
@keyframes fa-fade {
  50% {
    opacity: var(--fa-fade-opacity, 0.4);
  }
}
@keyframes fa-beat-fade {
  0%, 100% {
    opacity: var(--fa-beat-fade-opacity, 0.4);
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(var(--fa-beat-fade-scale, 1.125));
  }
}
@keyframes fa-flip {
  50% {
    transform: rotate3d(var(--fa-flip-x, 0), var(--fa-flip-y, 1), var(--fa-flip-z, 0), var(--fa-flip-angle, -180deg));
  }
}
@keyframes fa-shake {
  0% {
    transform: rotate(-15deg);
  }
  4% {
    transform: rotate(15deg);
  }
  8%, 24% {
    transform: rotate(-18deg);
  }
  12%, 28% {
    transform: rotate(18deg);
  }
  16% {
    transform: rotate(-22deg);
  }
  20% {
    transform: rotate(22deg);
  }
  32% {
    transform: rotate(-12deg);
  }
  36% {
    transform: rotate(12deg);
  }
  40%, 100% {
    transform: rotate(0deg);
  }
}
@keyframes fa-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.fa-rotate-90 {
  transform: rotate(90deg);
}

.fa-rotate-180 {
  transform: rotate(180deg);
}

.fa-rotate-270 {
  transform: rotate(270deg);
}

.fa-flip-horizontal {
  transform: scale(-1, 1);
}

.fa-flip-vertical {
  transform: scale(1, -1);
}

.fa-flip-both,
.fa-flip-horizontal.fa-flip-vertical {
  transform: scale(-1, -1);
}

.fa-rotate-by {
  transform: rotate(var(--fa-rotate-angle, 0));
}

.svg-inline--fa .fa-primary {
  fill: var(--fa-primary-color, currentColor);
  opacity: var(--fa-primary-opacity, 1);
}

.svg-inline--fa .fa-secondary {
  fill: var(--fa-secondary-color, currentColor);
  opacity: var(--fa-secondary-opacity, 0.4);
}

.svg-inline--fa.fa-swap-opacity .fa-primary {
  opacity: var(--fa-secondary-opacity, 0.4);
}

.svg-inline--fa.fa-swap-opacity .fa-secondary {
  opacity: var(--fa-primary-opacity, 1);
}

.svg-inline--fa mask .fa-primary,
.svg-inline--fa mask .fa-secondary {
  fill: black;
}

.svg-inline--fa.fa-inverse {
  fill: var(--fa-inverse, #fff);
}

.fa-stack {
  display: inline-block;
  height: 2em;
  line-height: 2em;
  position: relative;
  vertical-align: middle;
  width: 2.5em;
}

.fa-inverse {
  color: var(--fa-inverse, #fff);
}

.svg-inline--fa.fa-stack-1x {
  --fa-width: 1.25em;
  height: 1em;
  width: var(--fa-width);
}
.svg-inline--fa.fa-stack-2x {
  --fa-width: 2.5em;
  height: 2em;
  width: var(--fa-width);
}

.fa-stack-1x,
.fa-stack-2x {
  inset: 0;
  margin: auto;
  position: absolute;
  z-index: var(--fa-stack-z-index, auto);
}`;function vt(){var e=ot,a=st,t=m.cssPrefix,n=m.replacementClass,r=Kr;if(t!==e||n!==a){var i=new RegExp("\\.".concat(e,"\\-"),"g"),o=new RegExp("\\--".concat(e,"\\-"),"g"),s=new RegExp("\\.".concat(a),"g");r=r.replace(i,".".concat(t,"-")).replace(o,"--".concat(t,"-")).replace(s,".".concat(n))}return r}var la=!1;function we(){m.autoAddCss&&!la&&(Hr(vt()),la=!0)}var Jr={mixout:function(){return{dom:{css:vt,insertCss:we}}},hooks:function(){return{beforeDOMElementCreation:function(){we()},beforeI2svg:function(){we()}}}},z=_||{};z[M]||(z[M]={});z[M].styles||(z[M].styles={});z[M].hooks||(z[M].hooks={});z[M].shims||(z[M].shims=[]);var E=z[M],ht=[],pt=function(){x.removeEventListener("DOMContentLoaded",pt),ue=1,ht.map(function(a){return a()})},ue=!1;T&&(ue=(x.documentElement.doScroll?/^loaded|^c/:/^loaded|^i|^c/).test(x.readyState),ue||x.addEventListener("DOMContentLoaded",pt));function qr(e){T&&(ue?setTimeout(e,0):ht.push(e))}function te(e){var a=e.tag,t=e.attributes,n=t===void 0?{}:t,r=e.children,i=r===void 0?[]:r;return typeof e=="string"?mt(e):"<".concat(a," ").concat(Xr(n),">").concat(i.map(te).join(""),"</").concat(a,">")}function fa(e,a,t){if(e&&e[a]&&e[a][t])return{prefix:a,iconName:t,icon:e[a][t]}}var Ae=function(a,t,n,r){var i=Object.keys(a),o=i.length,s=t,l,u,c;for(n===void 0?(l=1,c=a[i[0]]):(l=0,c=n);l<o;l++)u=i[l],c=s(c,a[u],u,a);return c};function gt(e){return F(e).length!==1?null:e.codePointAt(0).toString(16)}function ua(e){return Object.keys(e).reduce(function(a,t){var n=e[t],r=!!n.icon;return r?a[n.iconName]=n.icon:a[t]=n,a},{})}function Le(e,a){var t=arguments.length>2&&arguments[2]!==void 0?arguments[2]:{},n=t.skipHooks,r=n===void 0?!1:n,i=ua(a);typeof E.hooks.addPack=="function"&&!r?E.hooks.addPack(e,ua(a)):E.styles[e]=f(f({},E.styles[e]||{}),i),e==="fas"&&Le("fa",a)}var Q=E.styles,Qr=E.shims,bt=Object.keys(He),Zr=bt.reduce(function(e,a){return e[a]=Object.keys(He[a]),e},{}),Be=null,yt={},xt={},wt={},At={},St={};function ei(e){return~$r.indexOf(e)}function ai(e,a){var t=a.split("-"),n=t[0],r=t.slice(1).join("-");return n===e&&r!==""&&!ei(r)?r:null}var kt=function(){var a=function(i){return Ae(Q,function(o,s,l){return o[l]=Ae(s,i,{}),o},{})};yt=a(function(r,i,o){if(i[3]&&(r[i[3]]=o),i[2]){var s=i[2].filter(function(l){return typeof l=="number"});s.forEach(function(l){r[l.toString(16)]=o})}return r}),xt=a(function(r,i,o){if(r[o]=o,i[2]){var s=i[2].filter(function(l){return typeof l=="string"});s.forEach(function(l){r[l]=o})}return r}),St=a(function(r,i,o){var s=i[2];return r[o]=o,s.forEach(function(l){r[l]=o}),r});var t="far"in Q||m.autoFetchSvg,n=Ae(Qr,function(r,i){var o=i[0],s=i[1],l=i[2];return s==="far"&&!t&&(s="fas"),typeof o=="string"&&(r.names[o]={prefix:s,iconName:l}),typeof o=="number"&&(r.unicodes[o.toString(16)]={prefix:s,iconName:l}),r},{names:{},unicodes:{}});wt=n.names,At=n.unicodes,Be=ve(m.styleDefault,{family:m.familyDefault})};Yr(function(e){Be=ve(e.styleDefault,{family:m.familyDefault})});kt();function Ve(e,a){return(yt[e]||{})[a]}function ti(e,a){return(xt[e]||{})[a]}function $(e,a){return(St[e]||{})[a]}function It(e){return wt[e]||{prefix:null,iconName:null}}function ni(e){var a=At[e],t=Ve("fas",e);return a||(t?{prefix:"fas",iconName:t}:null)||{prefix:null,iconName:null}}function j(){return Be}var Pt=function(){return{prefix:null,iconName:null,rest:[]}};function ri(e){var a=I,t=bt.reduce(function(n,r){return n[r]="".concat(m.cssPrefix,"-").concat(r),n},{});return tt.forEach(function(n){(e.includes(t[n])||e.some(function(r){return Zr[n].includes(r)}))&&(a=n)}),a}function ve(e){var a=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},t=a.family,n=t===void 0?I:t,r=zr[n][e];if(n===ee&&!e)return"fad";var i=oa[n][e]||oa[n][r],o=e in E.styles?e:null,s=i||o||null;return s}function ii(e){var a=[],t=null;return e.forEach(function(n){var r=ai(m.cssPrefix,n);r?t=r:n&&a.push(n)}),{iconName:t,rest:a}}function ca(e){return e.sort().filter(function(a,t,n){return n.indexOf(a)===t})}var da=rt.concat(nt);function he(e){var a=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},t=a.skipLookups,n=t===void 0?!1:t,r=null,i=ca(e.filter(function(v){return da.includes(v)})),o=ca(e.filter(function(v){return!da.includes(v)})),s=i.filter(function(v){return r=v,!Ra.includes(v)}),l=de(s,1),u=l[0],c=u===void 0?null:u,d=ri(i),p=f(f({},ii(o)),{},{prefix:ve(c,{family:d})});return f(f(f({},p),fi({values:e,family:d,styles:Q,config:m,canonical:p,givenPrefix:r})),oi(n,r,p))}function oi(e,a,t){var n=t.prefix,r=t.iconName;if(e||!n||!r)return{prefix:n,iconName:r};var i=a==="fa"?It(r):{},o=$(n,r);return r=i.iconName||o||r,n=i.prefix||n,n==="far"&&!Q.far&&Q.fas&&!m.autoFetchSvg&&(n="fas"),{prefix:n,iconName:r}}var si=tt.filter(function(e){return e!==I||e!==ee}),li=Object.keys(Pe).filter(function(e){return e!==I}).map(function(e){return Object.keys(Pe[e])}).flat();function fi(e){var a=e.values,t=e.family,n=e.canonical,r=e.givenPrefix,i=r===void 0?"":r,o=e.styles,s=o===void 0?{}:o,l=e.config,u=l===void 0?{}:l,c=t===ee,d=a.includes("fa-duotone")||a.includes("fad"),p=u.familyDefault==="duotone",v=n.prefix==="fad"||n.prefix==="fa-duotone";if(!c&&(d||p||v)&&(n.prefix="fad"),(a.includes("fa-brands")||a.includes("fab"))&&(n.prefix="fab"),!n.prefix&&si.includes(t)){var y=Object.keys(s).find(function(w){return li.includes(w)});if(y||u.autoFetchSvg){var b=kn.get(t).defaultShortPrefixId;n.prefix=b,n.iconName=$(n.prefix,n.iconName)||n.iconName}}return(n.prefix==="fa"||i==="fa")&&(n.prefix=j()||"fas"),n}var ui=(function(){function e(){Ht(this,e),this.definitions={}}return Xt(e,[{key:"add",value:function(){for(var t=this,n=arguments.length,r=new Array(n),i=0;i<n;i++)r[i]=arguments[i];var o=r.reduce(this._pullDefinitions,{});Object.keys(o).forEach(function(s){t.definitions[s]=f(f({},t.definitions[s]||{}),o[s]),Le(s,o[s]);var l=He[I][s];l&&Le(l,o[s]),kt()})}},{key:"reset",value:function(){this.definitions={}}},{key:"_pullDefinitions",value:function(t,n){var r=n.prefix&&n.iconName&&n.icon?{0:n}:n;return Object.keys(r).map(function(i){var o=r[i],s=o.prefix,l=o.iconName,u=o.icon,c=u[2];t[s]||(t[s]={}),c.length>0&&c.forEach(function(d){typeof d=="string"&&(t[s][d]=u)}),t[s][l]=u}),t}}])})(),ma=[],H={},G={},ci=Object.keys(G);function di(e,a){var t=a.mixoutsTo;return ma=e,H={},Object.keys(G).forEach(function(n){ci.indexOf(n)===-1&&delete G[n]}),ma.forEach(function(n){var r=n.mixout?n.mixout():{};if(Object.keys(r).forEach(function(o){typeof r[o]=="function"&&(t[o]=r[o]),fe(r[o])==="object"&&Object.keys(r[o]).forEach(function(s){t[o]||(t[o]={}),t[o][s]=r[o][s]})}),n.hooks){var i=n.hooks();Object.keys(i).forEach(function(o){H[o]||(H[o]=[]),H[o].push(i[o])})}n.provides&&n.provides(G)}),t}function Me(e,a){for(var t=arguments.length,n=new Array(t>2?t-2:0),r=2;r<t;r++)n[r-2]=arguments[r];var i=H[e]||[];return i.forEach(function(o){a=o.apply(null,[a].concat(n))}),a}function U(e){for(var a=arguments.length,t=new Array(a>1?a-1:0),n=1;n<a;n++)t[n-1]=arguments[n];var r=H[e]||[];r.forEach(function(i){i.apply(null,t)})}function R(){var e=arguments[0],a=Array.prototype.slice.call(arguments,1);return G[e]?G[e].apply(null,a):void 0}function ze(e){e.prefix==="fa"&&(e.prefix="fas");var a=e.iconName,t=e.prefix||j();if(a)return a=$(t,a)||a,fa(Et.definitions,t,a)||fa(E.styles,t,a)}var Et=new ui,mi=function(){m.autoReplaceSvg=!1,m.observeMutations=!1,U("noAuto")},vi={i2svg:function(){var a=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};return T?(U("beforeI2svg",a),R("pseudoElements2svg",a),R("i2svg",a)):Promise.reject(new Error("Operation requires a DOM of some kind."))},watch:function(){var a=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{},t=a.autoReplaceSvgRoot;m.autoReplaceSvg===!1&&(m.autoReplaceSvg=!0),m.observeMutations=!0,qr(function(){pi({autoReplaceSvgRoot:t}),U("watch",a)})}},hi={icon:function(a){if(a===null)return null;if(fe(a)==="object"&&a.prefix&&a.iconName)return{prefix:a.prefix,iconName:$(a.prefix,a.iconName)||a.iconName};if(Array.isArray(a)&&a.length===2){var t=a[1].indexOf("fa-")===0?a[1].slice(3):a[1],n=ve(a[0]);return{prefix:n,iconName:$(n,t)||t}}if(typeof a=="string"&&(a.indexOf("".concat(m.cssPrefix,"-"))>-1||a.match(Tr))){var r=he(a.split(" "),{skipLookups:!0});return{prefix:r.prefix||j(),iconName:$(r.prefix,r.iconName)||r.iconName}}if(typeof a=="string"){var i=j();return{prefix:i,iconName:$(i,a)||a}}}},P={noAuto:mi,config:m,dom:vi,parse:hi,library:Et,findIconDefinition:ze,toHtml:te},pi=function(){var a=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{},t=a.autoReplaceSvgRoot,n=t===void 0?x:t;(Object.keys(E.styles).length>0||m.autoFetchSvg)&&T&&m.autoReplaceSvg&&P.dom.i2svg({node:n})};function pe(e,a){return Object.defineProperty(e,"abstract",{get:a}),Object.defineProperty(e,"html",{get:function(){return e.abstract.map(function(n){return te(n)})}}),Object.defineProperty(e,"node",{get:function(){if(T){var n=x.createElement("div");return n.innerHTML=e.html,n.children}}}),e}function gi(e){var a=e.children,t=e.main,n=e.mask,r=e.attributes,i=e.styles,o=e.transform;if(Xe(o)&&t.found&&!n.found){var s=t.width,l=t.height,u={x:s/l/2,y:.5};r.style=me(f(f({},i),{},{"transform-origin":"".concat(u.x+o.x/16,"em ").concat(u.y+o.y/16,"em")}))}return[{tag:"svg",attributes:r,children:a}]}function bi(e){var a=e.prefix,t=e.iconName,n=e.children,r=e.attributes,i=e.symbol,o=i===!0?"".concat(a,"-").concat(m.cssPrefix,"-").concat(t):i;return[{tag:"svg",attributes:{style:"display: none;"},children:[{tag:"symbol",attributes:f(f({},r),{},{id:o}),children:n}]}]}function yi(e){var a=["aria-label","aria-labelledby","title","role"];return a.some(function(t){return t in e})}function Ke(e){var a=e.icons,t=a.main,n=a.mask,r=e.prefix,i=e.iconName,o=e.transform,s=e.symbol,l=e.maskId,u=e.extra,c=e.watchable,d=c===void 0?!1:c,p=n.found?n:t,v=p.width,y=p.height,b=[m.replacementClass,i?"".concat(m.cssPrefix,"-").concat(i):""].filter(function(g){return u.classes.indexOf(g)===-1}).filter(function(g){return g!==""||!!g}).concat(u.classes).join(" "),w={children:[],attributes:f(f({},u.attributes),{},{"data-prefix":r,"data-icon":i,class:b,role:u.attributes.role||"img",viewBox:"0 0 ".concat(v," ").concat(y)})};!yi(u.attributes)&&!u.attributes["aria-hidden"]&&(w.attributes["aria-hidden"]="true"),d&&(w.attributes[D]="");var A=f(f({},w),{},{prefix:r,iconName:i,main:t,mask:n,maskId:l,transform:o,symbol:s,styles:f({},u.styles)}),S=n.found&&t.found?R("generateAbstractMask",A)||{children:[],attributes:{}}:R("generateAbstractIcon",A)||{children:[],attributes:{}},k=S.children,N=S.attributes;return A.children=k,A.attributes=N,s?bi(A):gi(A)}function va(e){var a=e.content,t=e.width,n=e.height,r=e.transform,i=e.extra,o=e.watchable,s=o===void 0?!1:o,l=f(f({},i.attributes),{},{class:i.classes.join(" ")});s&&(l[D]="");var u=f({},i.styles);Xe(r)&&(u.transform=Vr({transform:r,width:t,height:n}),u["-webkit-transform"]=u.transform);var c=me(u);c.length>0&&(l.style=c);var d=[];return d.push({tag:"span",attributes:l,children:[a]}),d}function xi(e){var a=e.content,t=e.extra,n=f(f({},t.attributes),{},{class:t.classes.join(" ")}),r=me(t.styles);r.length>0&&(n.style=r);var i=[];return i.push({tag:"span",attributes:n,children:[a]}),i}var Se=E.styles;function Te(e){var a=e[0],t=e[1],n=e.slice(4),r=de(n,1),i=r[0],o=null;return Array.isArray(i)?o={tag:"g",attributes:{class:"".concat(m.cssPrefix,"-").concat(xe.GROUP)},children:[{tag:"path",attributes:{class:"".concat(m.cssPrefix,"-").concat(xe.SECONDARY),fill:"currentColor",d:i[0]}},{tag:"path",attributes:{class:"".concat(m.cssPrefix,"-").concat(xe.PRIMARY),fill:"currentColor",d:i[1]}}]}:o={tag:"path",attributes:{fill:"currentColor",d:i}},{found:!0,width:a,height:t,icon:o}}var wi={found:!1,width:512,height:512};function Ai(e,a){!ft&&!m.showMissingIcons&&e&&console.error('Icon with name "'.concat(e,'" and prefix "').concat(a,'" is missing.'))}function _e(e,a){var t=a;return a==="fa"&&m.styleDefault!==null&&(a=j()),new Promise(function(n,r){if(t==="fa"){var i=It(e)||{};e=i.iconName||e,a=i.prefix||a}if(e&&a&&Se[a]&&Se[a][e]){var o=Se[a][e];return n(Te(o))}Ai(e,a),n(f(f({},wi),{},{icon:m.showMissingIcons&&e?R("missingIconAbstract")||{}:{}}))})}var ha=function(){},je=m.measurePerformance&&re&&re.mark&&re.measure?re:{mark:ha,measure:ha},V='FA "7.2.0"',Si=function(a){return je.mark("".concat(V," ").concat(a," begins")),function(){return Ft(a)}},Ft=function(a){je.mark("".concat(V," ").concat(a," ends")),je.measure("".concat(V," ").concat(a),"".concat(V," ").concat(a," begins"),"".concat(V," ").concat(a," ends"))},Je={begin:Si,end:Ft},se=function(){};function pa(e){var a=e.getAttribute?e.getAttribute(D):null;return typeof a=="string"}function ki(e){var a=e.getAttribute?e.getAttribute(We):null,t=e.getAttribute?e.getAttribute(Ye):null;return a&&t}function Ii(e){return e&&e.classList&&e.classList.contains&&e.classList.contains(m.replacementClass)}function Pi(){if(m.autoReplaceSvg===!0)return le.replace;var e=le[m.autoReplaceSvg];return e||le.replace}function Ei(e){return x.createElementNS("http://www.w3.org/2000/svg",e)}function Fi(e){return x.createElement(e)}function Ct(e){var a=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},t=a.ceFn,n=t===void 0?e.tag==="svg"?Ei:Fi:t;if(typeof e=="string")return x.createTextNode(e);var r=n(e.tag);Object.keys(e.attributes||[]).forEach(function(o){r.setAttribute(o,e.attributes[o])});var i=e.children||[];return i.forEach(function(o){r.appendChild(Ct(o,{ceFn:n}))}),r}function Ci(e){var a=" ".concat(e.outerHTML," ");return a="".concat(a,"Font Awesome fontawesome.com "),a}var le={replace:function(a){var t=a[0];if(t.parentNode)if(a[1].forEach(function(r){t.parentNode.insertBefore(Ct(r),t)}),t.getAttribute(D)===null&&m.keepOriginalSource){var n=x.createComment(Ci(t));t.parentNode.replaceChild(n,t)}else t.remove()},nest:function(a){var t=a[0],n=a[1];if(~Ge(t).indexOf(m.replacementClass))return le.replace(a);var r=new RegExp("".concat(m.cssPrefix,"-.*"));if(delete n[0].attributes.id,n[0].attributes.class){var i=n[0].attributes.class.split(" ").reduce(function(s,l){return l===m.replacementClass||l.match(r)?s.toSvg.push(l):s.toNode.push(l),s},{toNode:[],toSvg:[]});n[0].attributes.class=i.toSvg.join(" "),i.toNode.length===0?t.removeAttribute("class"):t.setAttribute("class",i.toNode.join(" "))}var o=n.map(function(s){return te(s)}).join(`
`);t.setAttribute(D,""),t.innerHTML=o}};function ga(e){e()}function Nt(e,a){var t=typeof a=="function"?a:se;if(e.length===0)t();else{var n=ga;m.mutateApproach===Lr&&(n=_.requestAnimationFrame||ga),n(function(){var r=Pi(),i=Je.begin("mutate");e.map(r),i(),t()})}}var qe=!1;function Ot(){qe=!0}function Re(){qe=!1}var ce=null;function ba(e){if(ta&&m.observeMutations){var a=e.treeCallback,t=a===void 0?se:a,n=e.nodeCallback,r=n===void 0?se:n,i=e.pseudoElementsCallback,o=i===void 0?se:i,s=e.observeMutationsRoot,l=s===void 0?x:s;ce=new ta(function(u){if(!qe){var c=j();B(u).forEach(function(d){if(d.type==="childList"&&d.addedNodes.length>0&&!pa(d.addedNodes[0])&&(m.searchPseudoElements&&o(d.target),t(d.target)),d.type==="attributes"&&d.target.parentNode&&m.searchPseudoElements&&o([d.target],!0),d.type==="attributes"&&pa(d.target)&&~Rr.indexOf(d.attributeName))if(d.attributeName==="class"&&ki(d.target)){var p=he(Ge(d.target)),v=p.prefix,y=p.iconName;d.target.setAttribute(We,v||c),y&&d.target.setAttribute(Ye,y)}else Ii(d.target)&&r(d.target)})}}),T&&ce.observe(l,{childList:!0,attributes:!0,characterData:!0,subtree:!0})}}function Ni(){ce&&ce.disconnect()}function Oi(e){var a=e.getAttribute("style"),t=[];return a&&(t=a.split(";").reduce(function(n,r){var i=r.split(":"),o=i[0],s=i.slice(1);return o&&s.length>0&&(n[o]=s.join(":").trim()),n},{})),t}function Li(e){var a=e.getAttribute("data-prefix"),t=e.getAttribute("data-icon"),n=e.innerText!==void 0?e.innerText.trim():"",r=he(Ge(e));return r.prefix||(r.prefix=j()),a&&t&&(r.prefix=a,r.iconName=t),r.iconName&&r.prefix||(r.prefix&&n.length>0&&(r.iconName=ti(r.prefix,e.innerText)||Ve(r.prefix,gt(e.innerText))),!r.iconName&&m.autoFetchSvg&&e.firstChild&&e.firstChild.nodeType===Node.TEXT_NODE&&(r.iconName=e.firstChild.data)),r}function Mi(e){var a=B(e.attributes).reduce(function(t,n){return t.name!=="class"&&t.name!=="style"&&(t[n.name]=n.value),t},{});return a}function zi(){return{iconName:null,prefix:null,transform:C,symbol:!1,mask:{iconName:null,prefix:null,rest:[]},maskId:null,extra:{classes:[],styles:{},attributes:{}}}}function ya(e){var a=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{styleParser:!0},t=Li(e),n=t.iconName,r=t.prefix,i=t.rest,o=Mi(e),s=Me("parseNodeAttributes",{},e),l=a.styleParser?Oi(e):[];return f({iconName:n,prefix:r,transform:C,mask:{iconName:null,prefix:null,rest:[]},maskId:null,symbol:!1,extra:{classes:i,styles:l,attributes:o}},s)}var Ti=E.styles;function Lt(e){var a=m.autoReplaceSvg==="nest"?ya(e,{styleParser:!1}):ya(e);return~a.extra.classes.indexOf(ct)?R("generateLayersText",e,a):R("generateSvgReplacementMutation",e,a)}function _i(){return[].concat(F(nt),F(rt))}function xa(e){var a=arguments.length>1&&arguments[1]!==void 0?arguments[1]:null;if(!T)return Promise.resolve();var t=x.documentElement.classList,n=function(d){return t.add("".concat(ia,"-").concat(d))},r=function(d){return t.remove("".concat(ia,"-").concat(d))},i=m.autoFetchSvg?_i():Ra.concat(Object.keys(Ti));i.includes("fa")||i.push("fa");var o=[".".concat(ct,":not([").concat(D,"])")].concat(i.map(function(c){return".".concat(c,":not([").concat(D,"])")})).join(", ");if(o.length===0)return Promise.resolve();var s=[];try{s=B(e.querySelectorAll(o))}catch{}if(s.length>0)n("pending"),r("complete");else return Promise.resolve();var l=Je.begin("onTree"),u=s.reduce(function(c,d){try{var p=Lt(d);p&&c.push(p)}catch(v){ft||v.name==="MissingIcon"&&console.error(v)}return c},[]);return new Promise(function(c,d){Promise.all(u).then(function(p){Nt(p,function(){n("active"),n("complete"),r("pending"),typeof a=="function"&&a(),l(),c()})}).catch(function(p){l(),d(p)})})}function ji(e){var a=arguments.length>1&&arguments[1]!==void 0?arguments[1]:null;Lt(e).then(function(t){t&&Nt([t],a)})}function Ri(e){return function(a){var t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},n=(a||{}).icon?a:ze(a||{}),r=t.mask;return r&&(r=(r||{}).icon?r:ze(r||{})),e(n,f(f({},t),{},{mask:r}))}}var $i=function(a){var t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},n=t.transform,r=n===void 0?C:n,i=t.symbol,o=i===void 0?!1:i,s=t.mask,l=s===void 0?null:s,u=t.maskId,c=u===void 0?null:u,d=t.classes,p=d===void 0?[]:d,v=t.attributes,y=v===void 0?{}:v,b=t.styles,w=b===void 0?{}:b;if(a){var A=a.prefix,S=a.iconName,k=a.icon;return pe(f({type:"icon"},a),function(){return U("beforeDOMElementCreation",{iconDefinition:a,params:t}),Ke({icons:{main:Te(k),mask:l?Te(l.icon):{found:!1,width:null,height:null,icon:{}}},prefix:A,iconName:S,transform:f(f({},C),r),symbol:o,maskId:c,extra:{attributes:y,styles:w,classes:p}})})}},Di={mixout:function(){return{icon:Ri($i)}},hooks:function(){return{mutationObserverCallbacks:function(t){return t.treeCallback=xa,t.nodeCallback=ji,t}}},provides:function(a){a.i2svg=function(t){var n=t.node,r=n===void 0?x:n,i=t.callback,o=i===void 0?function(){}:i;return xa(r,o)},a.generateSvgReplacementMutation=function(t,n){var r=n.iconName,i=n.prefix,o=n.transform,s=n.symbol,l=n.mask,u=n.maskId,c=n.extra;return new Promise(function(d,p){Promise.all([_e(r,i),l.iconName?_e(l.iconName,l.prefix):Promise.resolve({found:!1,width:512,height:512,icon:{}})]).then(function(v){var y=de(v,2),b=y[0],w=y[1];d([t,Ke({icons:{main:b,mask:w},prefix:i,iconName:r,transform:o,symbol:s,maskId:u,extra:c,watchable:!0})])}).catch(p)})},a.generateAbstractIcon=function(t){var n=t.children,r=t.attributes,i=t.main,o=t.transform,s=t.styles,l=me(s);l.length>0&&(r.style=l);var u;return Xe(o)&&(u=R("generateAbstractTransformGrouping",{main:i,transform:o,containerWidth:i.width,iconWidth:i.width})),n.push(u||i.icon),{children:n,attributes:r}}}},Ui={mixout:function(){return{layer:function(t){var n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},r=n.classes,i=r===void 0?[]:r;return pe({type:"layer"},function(){U("beforeDOMElementCreation",{assembler:t,params:n});var o=[];return t(function(s){Array.isArray(s)?s.map(function(l){o=o.concat(l.abstract)}):o=o.concat(s.abstract)}),[{tag:"span",attributes:{class:["".concat(m.cssPrefix,"-layers")].concat(F(i)).join(" ")},children:o}]})}}}},Wi={mixout:function(){return{counter:function(t){var n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{};n.title;var r=n.classes,i=r===void 0?[]:r,o=n.attributes,s=o===void 0?{}:o,l=n.styles,u=l===void 0?{}:l;return pe({type:"counter",content:t},function(){return U("beforeDOMElementCreation",{content:t,params:n}),xi({content:t.toString(),extra:{attributes:s,styles:u,classes:["".concat(m.cssPrefix,"-layers-counter")].concat(F(i))}})})}}}},Yi={mixout:function(){return{text:function(t){var n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},r=n.transform,i=r===void 0?C:r,o=n.classes,s=o===void 0?[]:o,l=n.attributes,u=l===void 0?{}:l,c=n.styles,d=c===void 0?{}:c;return pe({type:"text",content:t},function(){return U("beforeDOMElementCreation",{content:t,params:n}),va({content:t,transform:f(f({},C),i),extra:{attributes:u,styles:d,classes:["".concat(m.cssPrefix,"-layers-text")].concat(F(s))}})})}}},provides:function(a){a.generateLayersText=function(t,n){var r=n.transform,i=n.extra,o=null,s=null;if(_a){var l=parseInt(getComputedStyle(t).fontSize,10),u=t.getBoundingClientRect();o=u.width/l,s=u.height/l}return Promise.resolve([t,va({content:t.innerHTML,width:o,height:s,transform:r,extra:i,watchable:!0})])}}},Mt=new RegExp('"',"ug"),wa=[1105920,1112319],Aa=f(f(f(f({},{FontAwesome:{normal:"fas",400:"fas"}}),Sn),Nr),Ln),$e=Object.keys(Aa).reduce(function(e,a){return e[a.toLowerCase()]=Aa[a],e},{}),Hi=Object.keys($e).reduce(function(e,a){var t=$e[a];return e[a]=t[900]||F(Object.entries(t))[0][1],e},{});function Gi(e){var a=e.replace(Mt,"");return gt(F(a)[0]||"")}function Xi(e){var a=e.getPropertyValue("font-feature-settings").includes("ss01"),t=e.getPropertyValue("content"),n=t.replace(Mt,""),r=n.codePointAt(0),i=r>=wa[0]&&r<=wa[1],o=n.length===2?n[0]===n[1]:!1;return i||o||a}function Bi(e,a){var t=e.replace(/^['"]|['"]$/g,"").toLowerCase(),n=parseInt(a),r=isNaN(n)?"normal":n;return($e[t]||{})[r]||Hi[t]}function Sa(e,a){var t="".concat(Or).concat(a.replace(":","-"));return new Promise(function(n,r){if(e.getAttribute(t)!==null)return n();var i=B(e.children),o=i.filter(function(ne){return ne.getAttribute(Fe)===a})[0],s=_.getComputedStyle(e,a),l=s.getPropertyValue("font-family"),u=l.match(_r),c=s.getPropertyValue("font-weight"),d=s.getPropertyValue("content");if(o&&!u)return e.removeChild(o),n();if(u&&d!=="none"&&d!==""){var p=s.getPropertyValue("content"),v=Bi(l,c),y=Gi(p),b=u[0].startsWith("FontAwesome"),w=Xi(s),A=Ve(v,y),S=A;if(b){var k=ni(y);k.iconName&&k.prefix&&(A=k.iconName,v=k.prefix)}if(A&&!w&&(!o||o.getAttribute(We)!==v||o.getAttribute(Ye)!==S)){e.setAttribute(t,S),o&&e.removeChild(o);var N=zi(),g=N.extra;g.attributes[Fe]=a,_e(A,v).then(function(ne){var $t=Ke(f(f({},N),{},{icons:{main:ne,mask:Pt()},prefix:v,iconName:S,extra:g,watchable:!0})),ge=x.createElementNS("http://www.w3.org/2000/svg","svg");a==="::before"?e.insertBefore(ge,e.firstChild):e.appendChild(ge),ge.outerHTML=$t.map(function(Dt){return te(Dt)}).join(`
`),e.removeAttribute(t),n()}).catch(r)}else n()}else n()})}function Vi(e){return Promise.all([Sa(e,"::before"),Sa(e,"::after")])}function Ki(e){return e.parentNode!==document.head&&!~Mr.indexOf(e.tagName.toUpperCase())&&!e.getAttribute(Fe)&&(!e.parentNode||e.parentNode.tagName!=="svg")}var Ji=function(a){return!!a&&lt.some(function(t){return a.includes(t)})},qi=function(a){if(!a)return[];var t=new Set,n=a.split(/,(?![^()]*\))/).map(function(l){return l.trim()});n=n.flatMap(function(l){return l.includes("(")?l:l.split(",").map(function(u){return u.trim()})});var r=oe(n),i;try{for(r.s();!(i=r.n()).done;){var o=i.value;if(Ji(o)){var s=lt.reduce(function(l,u){return l.replace(u,"")},o);s!==""&&s!=="*"&&t.add(s)}}}catch(l){r.e(l)}finally{r.f()}return t};function ka(e){var a=arguments.length>1&&arguments[1]!==void 0?arguments[1]:!1;if(T){var t;if(a)t=e;else if(m.searchPseudoElementsFullScan)t=e.querySelectorAll("*");else{var n=new Set,r=oe(document.styleSheets),i;try{for(r.s();!(i=r.n()).done;){var o=i.value;try{var s=oe(o.cssRules),l;try{for(s.s();!(l=s.n()).done;){var u=l.value,c=qi(u.selectorText),d=oe(c),p;try{for(d.s();!(p=d.n()).done;){var v=p.value;n.add(v)}}catch(b){d.e(b)}finally{d.f()}}}catch(b){s.e(b)}finally{s.f()}}catch(b){m.searchPseudoElementsWarnings&&console.warn("Font Awesome: cannot parse stylesheet: ".concat(o.href," (").concat(b.message,`)
If it declares any Font Awesome CSS pseudo-elements, they will not be rendered as SVG icons. Add crossorigin="anonymous" to the <link>, enable searchPseudoElementsFullScan for slower but more thorough DOM parsing, or suppress this warning by setting searchPseudoElementsWarnings to false.`))}}}catch(b){r.e(b)}finally{r.f()}if(!n.size)return;var y=Array.from(n).join(", ");try{t=e.querySelectorAll(y)}catch{}}return new Promise(function(b,w){var A=B(t).filter(Ki).map(Vi),S=Je.begin("searchPseudoElements");Ot(),Promise.all(A).then(function(){S(),Re(),b()}).catch(function(){S(),Re(),w()})})}}var Qi={hooks:function(){return{mutationObserverCallbacks:function(t){return t.pseudoElementsCallback=ka,t}}},provides:function(a){a.pseudoElements2svg=function(t){var n=t.node,r=n===void 0?x:n;m.searchPseudoElements&&ka(r)}}},Ia=!1,Zi={mixout:function(){return{dom:{unwatch:function(){Ot(),Ia=!0}}}},hooks:function(){return{bootstrap:function(){ba(Me("mutationObserverCallbacks",{}))},noAuto:function(){Ni()},watch:function(t){var n=t.observeMutationsRoot;Ia?Re():ba(Me("mutationObserverCallbacks",{observeMutationsRoot:n}))}}}},Pa=function(a){var t={size:16,x:0,y:0,flipX:!1,flipY:!1,rotate:0};return a.toLowerCase().split(" ").reduce(function(n,r){var i=r.toLowerCase().split("-"),o=i[0],s=i.slice(1).join("-");if(o&&s==="h")return n.flipX=!0,n;if(o&&s==="v")return n.flipY=!0,n;if(s=parseFloat(s),isNaN(s))return n;switch(o){case"grow":n.size=n.size+s;break;case"shrink":n.size=n.size-s;break;case"left":n.x=n.x-s;break;case"right":n.x=n.x+s;break;case"up":n.y=n.y-s;break;case"down":n.y=n.y+s;break;case"rotate":n.rotate=n.rotate+s;break}return n},t)},eo={mixout:function(){return{parse:{transform:function(t){return Pa(t)}}}},hooks:function(){return{parseNodeAttributes:function(t,n){var r=n.getAttribute("data-fa-transform");return r&&(t.transform=Pa(r)),t}}},provides:function(a){a.generateAbstractTransformGrouping=function(t){var n=t.main,r=t.transform,i=t.containerWidth,o=t.iconWidth,s={transform:"translate(".concat(i/2," 256)")},l="translate(".concat(r.x*32,", ").concat(r.y*32,") "),u="scale(".concat(r.size/16*(r.flipX?-1:1),", ").concat(r.size/16*(r.flipY?-1:1),") "),c="rotate(".concat(r.rotate," 0 0)"),d={transform:"".concat(l," ").concat(u," ").concat(c)},p={transform:"translate(".concat(o/2*-1," -256)")},v={outer:s,inner:d,path:p};return{tag:"g",attributes:f({},v.outer),children:[{tag:"g",attributes:f({},v.inner),children:[{tag:n.icon.tag,children:n.icon.children,attributes:f(f({},n.icon.attributes),v.path)}]}]}}}},ke={x:0,y:0,width:"100%",height:"100%"};function Ea(e){var a=arguments.length>1&&arguments[1]!==void 0?arguments[1]:!0;return e.attributes&&(e.attributes.fill||a)&&(e.attributes.fill="black"),e}function ao(e){return e.tag==="g"?e.children:[e]}var to={hooks:function(){return{parseNodeAttributes:function(t,n){var r=n.getAttribute("data-fa-mask"),i=r?he(r.split(" ").map(function(o){return o.trim()})):Pt();return i.prefix||(i.prefix=j()),t.mask=i,t.maskId=n.getAttribute("data-fa-mask-id"),t}}},provides:function(a){a.generateAbstractMask=function(t){var n=t.children,r=t.attributes,i=t.main,o=t.mask,s=t.maskId,l=t.transform,u=i.width,c=i.icon,d=o.width,p=o.icon,v=Br({transform:l,containerWidth:d,iconWidth:u}),y={tag:"rect",attributes:f(f({},ke),{},{fill:"white"})},b=c.children?{children:c.children.map(Ea)}:{},w={tag:"g",attributes:f({},v.inner),children:[Ea(f({tag:c.tag,attributes:f(f({},c.attributes),v.path)},b))]},A={tag:"g",attributes:f({},v.outer),children:[w]},S="mask-".concat(s||sa()),k="clip-".concat(s||sa()),N={tag:"mask",attributes:f(f({},ke),{},{id:S,maskUnits:"userSpaceOnUse",maskContentUnits:"userSpaceOnUse"}),children:[y,A]},g={tag:"defs",children:[{tag:"clipPath",attributes:{id:k},children:ao(p)},N]};return n.push(g,{tag:"rect",attributes:f({fill:"currentColor","clip-path":"url(#".concat(k,")"),mask:"url(#".concat(S,")")},ke)}),{children:n,attributes:r}}}},no={provides:function(a){var t=!1;_.matchMedia&&(t=_.matchMedia("(prefers-reduced-motion: reduce)").matches),a.missingIconAbstract=function(){var n=[],r={fill:"currentColor"},i={attributeType:"XML",repeatCount:"indefinite",dur:"2s"};n.push({tag:"path",attributes:f(f({},r),{},{d:"M156.5,447.7l-12.6,29.5c-18.7-9.5-35.9-21.2-51.5-34.9l22.7-22.7C127.6,430.5,141.5,440,156.5,447.7z M40.6,272H8.5 c1.4,21.2,5.4,41.7,11.7,61.1L50,321.2C45.1,305.5,41.8,289,40.6,272z M40.6,240c1.4-18.8,5.2-37,11.1-54.1l-29.5-12.6 C14.7,194.3,10,216.7,8.5,240H40.6z M64.3,156.5c7.8-14.9,17.2-28.8,28.1-41.5L69.7,92.3c-13.7,15.6-25.5,32.8-34.9,51.5 L64.3,156.5z M397,419.6c-13.9,12-29.4,22.3-46.1,30.4l11.9,29.8c20.7-9.9,39.8-22.6,56.9-37.6L397,419.6z M115,92.4 c13.9-12,29.4-22.3,46.1-30.4l-11.9-29.8c-20.7,9.9-39.8,22.6-56.8,37.6L115,92.4z M447.7,355.5c-7.8,14.9-17.2,28.8-28.1,41.5 l22.7,22.7c13.7-15.6,25.5-32.9,34.9-51.5L447.7,355.5z M471.4,272c-1.4,18.8-5.2,37-11.1,54.1l29.5,12.6 c7.5-21.1,12.2-43.5,13.6-66.8H471.4z M321.2,462c-15.7,5-32.2,8.2-49.2,9.4v32.1c21.2-1.4,41.7-5.4,61.1-11.7L321.2,462z M240,471.4c-18.8-1.4-37-5.2-54.1-11.1l-12.6,29.5c21.1,7.5,43.5,12.2,66.8,13.6V471.4z M462,190.8c5,15.7,8.2,32.2,9.4,49.2h32.1 c-1.4-21.2-5.4-41.7-11.7-61.1L462,190.8z M92.4,397c-12-13.9-22.3-29.4-30.4-46.1l-29.8,11.9c9.9,20.7,22.6,39.8,37.6,56.9 L92.4,397z M272,40.6c18.8,1.4,36.9,5.2,54.1,11.1l12.6-29.5C317.7,14.7,295.3,10,272,8.5V40.6z M190.8,50 c15.7-5,32.2-8.2,49.2-9.4V8.5c-21.2,1.4-41.7,5.4-61.1,11.7L190.8,50z M442.3,92.3L419.6,115c12,13.9,22.3,29.4,30.5,46.1 l29.8-11.9C470,128.5,457.3,109.4,442.3,92.3z M397,92.4l22.7-22.7c-15.6-13.7-32.8-25.5-51.5-34.9l-12.6,29.5 C370.4,72.1,384.4,81.5,397,92.4z"})});var o=f(f({},i),{},{attributeName:"opacity"}),s={tag:"circle",attributes:f(f({},r),{},{cx:"256",cy:"364",r:"28"}),children:[]};return t||s.children.push({tag:"animate",attributes:f(f({},i),{},{attributeName:"r",values:"28;14;28;28;14;28;"})},{tag:"animate",attributes:f(f({},o),{},{values:"1;0;1;1;0;1;"})}),n.push(s),n.push({tag:"path",attributes:f(f({},r),{},{opacity:"1",d:"M263.7,312h-16c-6.6,0-12-5.4-12-12c0-71,77.4-63.9,77.4-107.8c0-20-17.8-40.2-57.4-40.2c-29.1,0-44.3,9.6-59.2,28.7 c-3.9,5-11.1,6-16.2,2.4l-13.1-9.2c-5.6-3.9-6.9-11.8-2.6-17.2c21.2-27.2,46.4-44.7,91.2-44.7c52.3,0,97.4,29.8,97.4,80.2 c0,67.6-77.4,63.5-77.4,107.8C275.7,306.6,270.3,312,263.7,312z"}),children:t?[]:[{tag:"animate",attributes:f(f({},o),{},{values:"1;0;0;0;0;1;"})}]}),t||n.push({tag:"path",attributes:f(f({},r),{},{opacity:"0",d:"M232.5,134.5l7,168c0.3,6.4,5.6,11.5,12,11.5h9c6.4,0,11.7-5.1,12-11.5l7-168c0.3-6.8-5.2-12.5-12-12.5h-23 C237.7,122,232.2,127.7,232.5,134.5z"}),children:[{tag:"animate",attributes:f(f({},o),{},{values:"0;0;1;1;0;0;"})}]}),{tag:"g",attributes:{class:"missing"},children:n}}}},ro={hooks:function(){return{parseNodeAttributes:function(t,n){var r=n.getAttribute("data-fa-symbol"),i=r===null?!1:r===""?!0:r;return t.symbol=i,t}}}},io=[Jr,Di,Ui,Wi,Yi,Qi,Zi,eo,to,no,ro];di(io,{mixoutsTo:P});P.noAuto;var Z=P.config;P.library;P.dom;var zt=P.parse;P.findIconDefinition;P.toHtml;var oo=P.icon;P.layer;P.text;P.counter;function so(e){return e=e-0,e===e}function Tt(e){return so(e)?e:(e=e.replace(/[_-]+(.)?/g,(a,t)=>t?t.toUpperCase():""),e.charAt(0).toLowerCase()+e.slice(1))}function lo(e){return e.charAt(0).toUpperCase()+e.slice(1)}var Y=new Map,fo=1e3;function uo(e){if(Y.has(e))return Y.get(e);const a={};let t=0;const n=e.length;for(;t<n;){const r=e.indexOf(";",t),i=r===-1?n:r,o=e.slice(t,i).trim();if(o){const s=o.indexOf(":");if(s>0){const l=o.slice(0,s).trim(),u=o.slice(s+1).trim();if(l&&u){const c=Tt(l);a[c.startsWith("webkit")?lo(c):c]=u}}}t=i+1}if(Y.size===fo){const r=Y.keys().next().value;r&&Y.delete(r)}return Y.set(e,a),a}function _t(e,a,t={}){if(typeof a=="string")return a;const n=(a.children||[]).map(c=>_t(e,c)),r=a.attributes||{},i={};for(const[c,d]of Object.entries(r))switch(!0){case c==="class":{i.className=d;break}case c==="style":{i.style=uo(String(d));break}case c.startsWith("aria-"):case c.startsWith("data-"):{i[c.toLowerCase()]=d;break}default:i[Tt(c)]=d}const{style:o,role:s,"aria-label":l,...u}=t;return o&&(i.style=i.style?{...i.style,...o}:o),s&&(i.role=s),l&&(i["aria-label"]=l,i["aria-hidden"]="false"),e(a.tag,{...i,...u},...n)}var co=_t.bind(null,Oa.createElement),Fa=(e,a)=>{const t=Ut.useId();return e||(a?t:void 0)},mo=class{constructor(e="react-fontawesome"){this.enabled=!1;let a=!1;try{a=typeof process<"u"&&!1}catch{}this.scope=e,this.enabled=a}log(...e){this.enabled&&console.log(`[${this.scope}]`,...e)}warn(...e){this.enabled&&console.warn(`[${this.scope}]`,...e)}error(...e){this.enabled&&console.error(`[${this.scope}]`,...e)}},vo="searchPseudoElementsFullScan"in Z?"7.0.0":"6.0.0",ho=Number.parseInt(vo)>=7,q="fa",O={beat:"fa-beat",fade:"fa-fade",beatFade:"fa-beat-fade",bounce:"fa-bounce",shake:"fa-shake",spin:"fa-spin",spinPulse:"fa-spin-pulse",spinReverse:"fa-spin-reverse",pulse:"fa-pulse"},po={left:"fa-pull-left",right:"fa-pull-right"},go={90:"fa-rotate-90",180:"fa-rotate-180",270:"fa-rotate-270"},bo={"2xs":"fa-2xs",xs:"fa-xs",sm:"fa-sm",lg:"fa-lg",xl:"fa-xl","2xl":"fa-2xl","1x":"fa-1x","2x":"fa-2x","3x":"fa-3x","4x":"fa-4x","5x":"fa-5x","6x":"fa-6x","7x":"fa-7x","8x":"fa-8x","9x":"fa-9x","10x":"fa-10x"},L={border:"fa-border",fixedWidth:"fa-fw",flip:"fa-flip",flipHorizontal:"fa-flip-horizontal",flipVertical:"fa-flip-vertical",inverse:"fa-inverse",rotateBy:"fa-rotate-by",swapOpacity:"fa-swap-opacity",widthAuto:"fa-width-auto"};function yo(e){const a=Z.cssPrefix||Z.familyPrefix||q;return a===q?e:e.replace(new RegExp(String.raw`(?<=^|\s)${q}-`,"g"),`${a}-`)}function xo(e){const{beat:a,fade:t,beatFade:n,bounce:r,shake:i,spin:o,spinPulse:s,spinReverse:l,pulse:u,fixedWidth:c,inverse:d,border:p,flip:v,size:y,rotation:b,pull:w,swapOpacity:A,rotateBy:S,widthAuto:k,className:N}=e,g=[];return N&&g.push(...N.split(" ")),a&&g.push(O.beat),t&&g.push(O.fade),n&&g.push(O.beatFade),r&&g.push(O.bounce),i&&g.push(O.shake),o&&g.push(O.spin),l&&g.push(O.spinReverse),s&&g.push(O.spinPulse),u&&g.push(O.pulse),c&&g.push(L.fixedWidth),d&&g.push(L.inverse),p&&g.push(L.border),v===!0&&g.push(L.flip),(v==="horizontal"||v==="both")&&g.push(L.flipHorizontal),(v==="vertical"||v==="both")&&g.push(L.flipVertical),y!=null&&g.push(bo[y]),b!=null&&b!==0&&g.push(go[b]),w!=null&&g.push(po[w]),A&&g.push(L.swapOpacity),ho?(S&&g.push(L.rotateBy),k&&g.push(L.widthAuto),(Z.cssPrefix||Z.familyPrefix||q)===q?g:g.map(yo)):g}var wo=e=>typeof e=="object"&&"icon"in e&&!!e.icon;function Ca(e){if(e)return wo(e)?e:zt.icon(e)}function Ao(e){return Object.keys(e)}var Na=new mo("FontAwesomeIcon"),jt={border:!1,className:"",mask:void 0,maskId:void 0,fixedWidth:!1,inverse:!1,flip:!1,icon:void 0,listItem:!1,pull:void 0,pulse:!1,rotation:void 0,rotateBy:!1,size:void 0,spin:!1,spinPulse:!1,spinReverse:!1,beat:!1,fade:!1,beatFade:!1,bounce:!1,shake:!1,symbol:!1,title:"",titleId:void 0,transform:void 0,swapOpacity:!1,widthAuto:!1},So=new Set(Object.keys(jt)),ko=Oa.forwardRef((e,a)=>{const t={...jt,...e},{icon:n,mask:r,symbol:i,title:o,titleId:s,maskId:l,transform:u}=t,c=Fa(l,!!r),d=Fa(s,!!o),p=Ca(n);if(!p)return Na.error("Icon lookup is undefined",n),null;const v=xo(t),y=typeof u=="string"?zt.transform(u):u,b=Ca(r),w=oo(p,{...v.length>0&&{classes:v},...y&&{transform:y},...b&&{mask:b},symbol:i,title:o,titleId:d,maskId:c});if(!w)return Na.error("Could not find icon",p),null;const{abstract:A}=w,S={ref:a};for(const k of Ao(t))So.has(k)||(S[k]=t[k]);return co(A[0],S)});ko.displayName="FontAwesomeIcon";var Io={prefix:"fas",iconName:"cloud-arrow-up",icon:[576,512,[62338,"cloud-upload","cloud-upload-alt"],"f0ee","M144 480c-79.5 0-144-64.5-144-144 0-63.4 41-117.2 97.9-136.5-1.3-7.7-1.9-15.5-1.9-23.5 0-79.5 64.5-144 144-144 55.4 0 103.5 31.3 127.6 77.1 14.2-8.3 30.8-13.1 48.4-13.1 53 0 96 43 96 96 0 15.7-3.8 30.6-10.5 43.7 44 20.3 74.5 64.7 74.5 116.3 0 70.7-57.3 128-128 128l-304 0zM305 191c-9.4-9.4-24.6-9.4-33.9 0l-72 72c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l31-31 0 102.1c0 13.3 10.7 24 24 24s24-10.7 24-24l0-102.1 31 31c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-72-72z"]},Oo=Io,Lo={prefix:"fas",iconName:"user-check",icon:[640,512,[],"f4fc","M286 304c98.5 0 178.3 79.8 178.3 178.3 0 16.4-13.3 29.7-29.7 29.7L78 512c-16.4 0-29.7-13.3-29.7-29.7 0-98.5 79.8-178.3 178.3-178.3l59.4 0zM585.7 105.9c7.8-10.7 22.8-13.1 33.5-5.3s13.1 22.8 5.3 33.5L522.1 274.9c-4.2 5.7-10.7 9.4-17.7 9.8s-14-2.2-18.9-7.3l-46.4-48c-9.2-9.5-9-24.7 .6-33.9 9.5-9.2 24.7-8.9 33.9 .6l26.5 27.4 85.6-117.7zM256.3 248a120 120 0 1 1 0-240 120 120 0 1 1 0 240z"]},Po={prefix:"fas",iconName:"up-right-from-square",icon:[512,512,["external-link-alt"],"f35d","M290.4 19.8C295.4 7.8 307.1 0 320 0L480 0c17.7 0 32 14.3 32 32l0 160c0 12.9-7.8 24.6-19.8 29.6s-25.7 2.2-34.9-6.9L400 157.3 246.6 310.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L354.7 112 297.4 54.6c-9.2-9.2-11.9-22.9-6.9-34.9zM0 176c0-44.2 35.8-80 80-80l80 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-80 0c-8.8 0-16 7.2-16 16l0 256c0 8.8 7.2 16 16 16l256 0c8.8 0 16-7.2 16-16l0-80c0-17.7 14.3-32 32-32s32 14.3 32 32l0 80c0 44.2-35.8 80-80 80L80 512c-44.2 0-80-35.8-80-80L0 176z"]},Mo=Po,zo={prefix:"fas",iconName:"camera",icon:[512,512,[62258,"camera-alt"],"f030","M149.1 64.8L138.7 96 64 96C28.7 96 0 124.7 0 160L0 416c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-256c0-35.3-28.7-64-64-64l-74.7 0-10.4-31.2C356.4 45.2 338.1 32 317.4 32L194.6 32c-20.7 0-39 13.2-45.5 32.8zM256 192a96 96 0 1 1 0 192 96 96 0 1 1 0-192z"]},To={prefix:"fas",iconName:"eye",icon:[576,512,[128065],"f06e","M288 32c-80.8 0-145.5 36.8-192.6 80.6-46.8 43.5-78.1 95.4-93 131.1-3.3 7.9-3.3 16.7 0 24.6 14.9 35.7 46.2 87.7 93 131.1 47.1 43.7 111.8 80.6 192.6 80.6s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1 3.3-7.9 3.3-16.7 0-24.6-14.9-35.7-46.2-87.7-93-131.1-47.1-43.7-111.8-80.6-192.6-80.6zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64-11.5 0-22.3-3-31.7-8.4-1 10.9-.1 22.1 2.9 33.2 13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-12.2-45.7-55.5-74.8-101.1-70.8 5.3 9.3 8.4 20.1 8.4 31.7z"]},_o={prefix:"fas",iconName:"clock",icon:[512,512,[128339,"clock-four"],"f017","M256 0a256 256 0 1 1 0 512 256 256 0 1 1 0-512zM232 120l0 136c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2 280 120c0-13.3-10.7-24-24-24s-24 10.7-24 24z"]},jo={prefix:"fas",iconName:"folder-open",icon:[576,512,[128194,128449,61717],"f07c","M56 225.6L32.4 296.2 32.4 96c0-35.3 28.7-64 64-64l138.7 0c13.8 0 27.3 4.5 38.4 12.8l38.4 28.8c5.5 4.2 12.3 6.4 19.2 6.4l117.3 0c35.3 0 64 28.7 64 64l0 16-365.4 0c-41.3 0-78 26.4-91.1 65.6zM477.8 448L99 448c-32.8 0-55.9-32.1-45.5-63.2l48-144C108 221.2 126.4 208 147 208l378.8 0c32.8 0 55.9 32.1 45.5 63.2l-48 144c-6.5 19.6-24.9 32.8-45.5 32.8z"]},Ro={prefix:"fas",iconName:"chevron-right",icon:[320,512,[9002],"f054","M311.1 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L243.2 256 73.9 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"]},$o={prefix:"fas",iconName:"users",icon:[640,512,[],"f0c0","M320 16a104 104 0 1 1 0 208 104 104 0 1 1 0-208zM96 88a72 72 0 1 1 0 144 72 72 0 1 1 0-144zM0 416c0-70.7 57.3-128 128-128 12.8 0 25.2 1.9 36.9 5.4-32.9 36.8-52.9 85.4-52.9 138.6l0 16c0 11.4 2.4 22.2 6.7 32L32 480c-17.7 0-32-14.3-32-32l0-32zm521.3 64c4.3-9.8 6.7-20.6 6.7-32l0-16c0-53.2-20-101.8-52.9-138.6 11.7-3.5 24.1-5.4 36.9-5.4 70.7 0 128 57.3 128 128l0 32c0 17.7-14.3 32-32 32l-86.7 0zM472 160a72 72 0 1 1 144 0 72 72 0 1 1 -144 0zM160 432c0-88.4 71.6-160 160-160s160 71.6 160 160l0 16c0 17.7-14.3 32-32 32l-256 0c-17.7 0-32-14.3-32-32l0-16z"]},Do={prefix:"fas",iconName:"image",icon:[448,512,[],"f03e","M64 32C28.7 32 0 60.7 0 96L0 416c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-320c0-35.3-28.7-64-64-64L64 32zm64 80a48 48 0 1 1 0 96 48 48 0 1 1 0-96zM272 224c8.4 0 16.1 4.4 20.5 11.5l88 144c4.5 7.4 4.7 16.7 .5 24.3S368.7 416 360 416L88 416c-8.9 0-17.2-5-21.3-12.9s-3.5-17.5 1.6-24.8l56-80c4.5-6.4 11.8-10.2 19.7-10.2s15.2 3.8 19.7 10.2l26.4 37.8 61.4-100.5c4.4-7.1 12.1-11.5 20.5-11.5z"]},Uo={prefix:"fas",iconName:"lightbulb",icon:[384,512,[128161],"f0eb","M292.9 384c7.3-22.3 21.9-42.5 38.4-59.9 32.7-34.4 52.7-80.9 52.7-132.1 0-106-86-192-192-192S0 86 0 192c0 51.2 20 97.7 52.7 132.1 16.5 17.4 31.2 37.6 38.4 59.9l201.7 0zM288 432l-192 0 0 16c0 44.2 35.8 80 80 80l32 0c44.2 0 80-35.8 80-80l0-16zM184 112c-39.8 0-72 32.2-72 72 0 13.3-10.7 24-24 24s-24-10.7-24-24c0-66.3 53.7-120 120-120 13.3 0 24 10.7 24 24s-10.7 24-24 24z"]},Wo={prefix:"fas",iconName:"file",icon:[384,512,[128196,128459,61462],"f15b","M64 0C28.7 0 0 28.7 0 64L0 448c0 35.3 28.7 64 64 64l256 0c35.3 0 64-28.7 64-64l0-277.5c0-17-6.7-33.3-18.7-45.3L258.7 18.7C246.7 6.7 230.5 0 213.5 0L64 0zM325.5 176L232 176c-13.3 0-24-10.7-24-24L208 58.5 325.5 176z"]},Yo={prefix:"fas",iconName:"check",icon:[448,512,[10003,10004],"f00c","M434.8 70.1c14.3 10.4 17.5 30.4 7.1 44.7l-256 352c-5.5 7.6-14 12.3-23.4 13.1s-18.5-2.7-25.1-9.3l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l101.5 101.5 234-321.7c10.4-14.3 30.4-17.5 44.7-7.1z"]},Ho={prefix:"fas",iconName:"spinner",icon:[512,512,[],"f110","M208 48a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm0 416a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zM48 208a48 48 0 1 1 0 96 48 48 0 1 1 0-96zm368 48a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zM75 369.1A48 48 0 1 1 142.9 437 48 48 0 1 1 75 369.1zM75 75A48 48 0 1 1 142.9 142.9 48 48 0 1 1 75 75zM437 369.1A48 48 0 1 1 369.1 437 48 48 0 1 1 437 369.1z"]},Rt={prefix:"fas",iconName:"xmark",icon:[384,512,[128473,10005,10006,10060,215,"close","multiply","remove","times"],"f00d","M55.1 73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L147.2 256 9.9 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192.5 301.3 329.9 438.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.8 256 375.1 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192.5 210.7 55.1 73.4z"]},Go=Rt,Xo=Rt,Eo={prefix:"fas",iconName:"file-lines",icon:[384,512,[128441,128462,61686,"file-alt","file-text"],"f15c","M0 64C0 28.7 28.7 0 64 0L213.5 0c17 0 33.3 6.7 45.3 18.7L365.3 125.3c12 12 18.7 28.3 18.7 45.3L384 448c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 64zm208-5.5l0 93.5c0 13.3 10.7 24 24 24L325.5 176 208 58.5zM120 256c-13.3 0-24 10.7-24 24s10.7 24 24 24l144 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-144 0zm0 96c-13.3 0-24 10.7-24 24s10.7 24 24 24l144 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-144 0z"]},Bo=Eo,Vo={prefix:"fas",iconName:"chevron-left",icon:[320,512,[9001],"f053","M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z"]},Fo={prefix:"fas",iconName:"triangle-exclamation",icon:[512,512,[9888,"exclamation-triangle","warning"],"f071","M256 0c14.7 0 28.2 8.1 35.2 21l216 400c6.7 12.4 6.4 27.4-.8 39.5S486.1 480 472 480L40 480c-14.1 0-27.2-7.4-34.4-19.5s-7.5-27.1-.8-39.5l216-400c7-12.9 20.5-21 35.2-21zm0 352a32 32 0 1 0 0 64 32 32 0 1 0 0-64zm0-192c-18.2 0-32.7 15.5-31.4 33.7l7.4 104c.9 12.5 11.4 22.3 23.9 22.3 12.6 0 23-9.7 23.9-22.3l7.4-104c1.3-18.2-13.1-33.7-31.4-33.7z"]},Ko=Fo,Jo={prefix:"fas",iconName:"file-pdf",icon:[576,512,[],"f1c1","M96 0C60.7 0 32 28.7 32 64l0 384c0 35.3 28.7 64 64 64l80 0 0-112c0-35.3 28.7-64 64-64l176 0 0-165.5c0-17-6.7-33.3-18.7-45.3L290.7 18.7C278.7 6.7 262.5 0 245.5 0L96 0zM357.5 176L264 176c-13.3 0-24-10.7-24-24L240 58.5 357.5 176zM240 380c-11 0-20 9-20 20l0 128c0 11 9 20 20 20s20-9 20-20l0-28 12 0c33.1 0 60-26.9 60-60s-26.9-60-60-60l-32 0zm32 80l-12 0 0-40 12 0c11 0 20 9 20 20s-9 20-20 20zm96-80c-11 0-20 9-20 20l0 128c0 11 9 20 20 20l32 0c28.7 0 52-23.3 52-52l0-64c0-28.7-23.3-52-52-52l-32 0zm20 128l0-88 12 0c6.6 0 12 5.4 12 12l0 64c0 6.6-5.4 12-12 12l-12 0zm88-108l0 128c0 11 9 20 20 20s20-9 20-20l0-44 28 0c11 0 20-9 20-20s-9-20-20-20l-28 0 0-24 28 0c11 0 20-9 20-20s-9-20-20-20l-48 0c-11 0-20 9-20 20z"]},qo={prefix:"fas",iconName:"upload",icon:[448,512,[],"f093","M256 109.3L256 320c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-210.7-41.4 41.4c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l96-96c12.5-12.5 32.8-12.5 45.3 0l96 96c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L256 109.3zM224 400c44.2 0 80-35.8 80-80l80 0c35.3 0 64 28.7 64 64l0 32c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64l0-32c0-35.3 28.7-64 64-64l80 0c0 44.2 35.8 80 80 80zm144 24a24 24 0 1 0 0-48 24 24 0 1 0 0 48z"]},Qo={prefix:"fas",iconName:"arrow-left",icon:[512,512,[8592],"f060","M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 288 480 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-370.7 0 105.4-105.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"]},Co={prefix:"fas",iconName:"arrow-rotate-right",icon:[512,512,[8635,"arrow-right-rotate","arrow-rotate-forward","redo"],"f01e","M436.7 74.7L448 85.4 448 32c0-17.7 14.3-32 32-32s32 14.3 32 32l0 128c0 17.7-14.3 32-32 32l-128 0c-17.7 0-32-14.3-32-32s14.3-32 32-32l47.9 0-7.6-7.2c-.2-.2-.4-.4-.6-.6-75-75-196.5-75-271.5 0s-75 196.5 0 271.5 196.5 75 271.5 0c8.2-8.2 15.5-16.9 21.9-26.1 10.1-14.5 30.1-18 44.6-7.9s18 30.1 7.9 44.6c-8.5 12.2-18.2 23.8-29.1 34.7-100 100-262.1 100-362 0S-25 175 75 75c99.9-99.9 261.7-100 361.7-.3z"]},Zo=Co,es={prefix:"fas",iconName:"qrcode",icon:[448,512,[],"f029","M64 160l64 0 0-64-64 0 0 64zM0 80C0 53.5 21.5 32 48 32l96 0c26.5 0 48 21.5 48 48l0 96c0 26.5-21.5 48-48 48l-96 0c-26.5 0-48-21.5-48-48L0 80zM64 416l64 0 0-64-64 0 0 64zM0 336c0-26.5 21.5-48 48-48l96 0c26.5 0 48 21.5 48 48l0 96c0 26.5-21.5 48-48 48l-96 0c-26.5 0-48-21.5-48-48l0-96zM320 96l0 64 64 0 0-64-64 0zM304 32l96 0c26.5 0 48 21.5 48 48l0 96c0 26.5-21.5 48-48 48l-96 0c-26.5 0-48-21.5-48-48l0-96c0-26.5 21.5-48 48-48zM288 352a32 32 0 1 1 0-64 32 32 0 1 1 0 64zm0 64c17.7 0 32 14.3 32 32s-14.3 32-32 32-32-14.3-32-32 14.3-32 32-32zm96 32c0-17.7 14.3-32 32-32s32 14.3 32 32-14.3 32-32 32-32-14.3-32-32zm32-96a32 32 0 1 1 0-64 32 32 0 1 1 0 64zm-32 32a32 32 0 1 1 -64 0 32 32 0 1 1 64 0z"]};export{ko as F,Go as a,To as b,Wo as c,Vo as d,Ro as e,Bo as f,Xo as g,Yo as h,zo as i,qo as j,_o as k,es as l,$o as m,Jo as n,Mo as o,Lo as p,Do as q,jo as r,Zo as s,Oo as t,Ho as u,Qo as v,Uo as w,Ko as x};
