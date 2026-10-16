import"./modulepreload-polyfill-B5Qt9EMX.js";import{L as c}from"./lenis-CYo8HTSz.js";const p=`
@font-face{font-family:HelveticaNow;src:url("/fonts/helvetica-now/HelveticaNowDisplay.woff2") format("woff2");font-weight:100 900;font-display:swap}
html,body{margin:0;background:#000;color:#f4f2ec;font-family:HelveticaNow,Helvetica,Arial,sans-serif}
.ot-nav{position:fixed;z-index:5;top:0;left:0;padding:calc(24px + env(safe-area-inset-top,0px)) 3.8vw}
.ot-nav img{width:117px;height:auto;display:block}
.ot-scene{height:320svh}
.ot-stage{position:sticky;top:0;height:100svh;overflow:hidden}
.ot-plate img{position:absolute;inset:-4%;width:108%;height:108%;object-fit:cover;transform-origin:50% 60%;will-change:transform}
.ot-glow{position:absolute;inset:0;background:radial-gradient(ellipse 60% 30% at 50% 26%,#5aa0ff22,transparent 70%);mix-blend-mode:screen;pointer-events:none}
.ot-pair{position:absolute;left:50%;top:40%;width:min(44vw,820px);transform:translate(-50%,-50%);will-change:transform;filter:drop-shadow(0 40px 60px #0008)}
.ot-shade{position:absolute;inset:0;background:linear-gradient(180deg,#0006 0%,transparent 22%,transparent 58%,#000c 100%);pointer-events:none}
.ot-copy{position:absolute;left:3.8vw;bottom:calc(48px + env(safe-area-inset-bottom,0px));max-width:760px}
.ot-kicker{margin:0 0 22px;font-size:11px;font-weight:500;letter-spacing:.18em;text-transform:uppercase;color:#f2632a}
.ot-copy h1{margin:0 0 18px;font-size:clamp(40px,5.6vw,96px);font-weight:300;letter-spacing:-.04em;line-height:1.02}
.ot-desc{margin:0;max-width:440px;font-size:12px;font-weight:500;letter-spacing:.14em;line-height:1.7;text-transform:uppercase;color:#e9e7dccc}
.ot-copy>*{opacity:0;transform:translateY(18px);transition:opacity 1.1s cubic-bezier(.2,.7,.2,1),transform 1.2s cubic-bezier(.2,.7,.2,1)}
.ot-copy.in>*{opacity:1;transform:none}.ot-copy.in>:nth-child(2){transition-delay:.12s}.ot-copy.in>:nth-child(3){transition-delay:.24s}
.ot-credit{position:absolute;right:3.8vw;bottom:calc(20px + env(safe-area-inset-bottom,0px));margin:0;font-size:10px;letter-spacing:.06em;color:#ffffff70}
.ot-after{height:60svh;display:grid;place-items:center;background:#050608;color:#888;font-size:12px;letter-spacing:.14em;text-transform:uppercase}
@media(max-aspect-ratio:1/1){.ot-pair{width:86vw;top:36%}.ot-copy{right:6vw;left:6vw}.ot-copy h1{font-size:clamp(34px,10vw,52px)}}
@media(prefers-reduced-motion:reduce){.ot-copy>*{transition:none;opacity:1;transform:none}}`;document.head.append(Object.assign(document.createElement("style"),{textContent:p}));const r=matchMedia("(prefers-reduced-motion: reduce)").matches,l=document.querySelector(".ot-scene"),f=document.querySelector(".ot-plate img"),m=document.querySelector(".ot-pair"),d=document.querySelector(".ot-copy"),n=r?null:new c({lerp:.08,smoothWheel:!0}),h=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;let i=-1;function s(t){n==null||n.raf(t);const a=l.getBoundingClientRect(),o=Math.max(0,Math.min(1,-a.top/(a.height-innerHeight)));if(Math.abs(o-i)>1e-4){i=o;const e=h(o);r||(f.style.transform=`translate3d(${-1.5*e}%,${-2*e}%,0) scale(${1+.07*e})`,m.style.transform=`translate(-50%,-50%) translate3d(${6-10*e}vw,${4-8*e}vh,0) scale(${.86+.26*e}) rotate(${-3+5*e}deg)`),d.classList.toggle("in",o>.12)}requestAnimationFrame(s)}requestAnimationFrame(s);
