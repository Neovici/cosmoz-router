import { y as ys, _ } from './index-DY4It86c.js';

var PARAM_KEY="links";var{document,HTMLElement}=__STORYBOOK_MODULE_GLOBAL__.global;var navigate=params=>_.getChannel().emit(__STORYBOOK_MODULE_CORE_EVENTS__.SELECT_STORY,params);var linksListener=e=>{let{target}=e;if(!(target instanceof HTMLElement))return;let element=target,{sbKind:kind,sbStory:story}=element.dataset;(kind||story)&&(e.preventDefault(),navigate({kind,story}));},hasListener=false,on=()=>{hasListener||(hasListener=true,document.addEventListener("click",linksListener));},off=()=>{hasListener&&(hasListener=false,document.removeEventListener("click",linksListener));},withLinks=ys({name:"withLinks",parameterName:PARAM_KEY,wrapper:(getStory,context)=>(on(),_.getChannel().once(__STORYBOOK_MODULE_CORE_EVENTS__.STORY_CHANGED,off),getStory(context))});var decorators=[withLinks];

export { decorators };
