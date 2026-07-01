const SCALES = ['0','0.5','1','1.5','2','2.5','3','3.5','4','5','6','7','8','9','10','11','12','14','16','20','24','28','32','36','40','44','48','52','56','60','64','72','80','96']
const COLORS = ['slate','gray','zinc','neutral','stone','red','orange','amber','yellow','lime','green','emerald','teal','cyan','sky','blue','indigo','violet','purple','fuchsia','pink','rose']
const SHADES = ['50','100','200','300','400','500','600','700','800','900','950']

function colorScale(prefix: string) {
  return [
    `${prefix}-white`, `${prefix}-black`, `${prefix}-transparent`, `${prefix}-current`,
    ...COLORS.flatMap(c => SHADES.map(s => `${prefix}-${c}-${s}`))
  ]
}

export const ALL_TW_CLASSES: string[] = [
  // display
  'block','inline-block','inline','flex','inline-flex','grid','inline-grid','hidden','contents','flow-root',
  // position
  'relative','absolute','fixed','sticky','static',
  'top-0','right-0','bottom-0','left-0','inset-0','inset-x-0','inset-y-0',
  // z-index
  'z-0','z-10','z-20','z-30','z-40','z-50','z-auto',
  // overflow
  'overflow-hidden','overflow-auto','overflow-scroll','overflow-visible','overflow-x-hidden','overflow-y-auto',
  // flexbox
  'flex-row','flex-col','flex-row-reverse','flex-col-reverse',
  'flex-wrap','flex-nowrap','flex-wrap-reverse',
  'items-start','items-center','items-end','items-stretch','items-baseline',
  'justify-start','justify-center','justify-end','justify-between','justify-around','justify-evenly',
  'self-auto','self-start','self-center','self-end','self-stretch',
  'flex-1','flex-auto','flex-none','flex-initial',
  'grow','grow-0','shrink','shrink-0',
  // grid
  ...['1','2','3','4','5','6','7','8','9','10','11','12','none'].map(n => `grid-cols-${n}`),
  ...['1','2','3','4','5','6','7','8','9','10','11','12','full'].map(n => `col-span-${n}`),
  ...['1','2','3','4','5','6','none'].map(n => `grid-rows-${n}`),
  'col-auto','row-auto',
  // gap
  ...SCALES.flatMap(s => [`gap-${s}`,`gap-x-${s}`,`gap-y-${s}`]),
  // spacing - padding
  ...SCALES.flatMap(s => [`p-${s}`,`px-${s}`,`py-${s}`,`pt-${s}`,`pr-${s}`,`pb-${s}`,`pl-${s}`]),
  // spacing - margin
  ...SCALES.flatMap(s => [`m-${s}`,`mx-${s}`,`my-${s}`,`mt-${s}`,`mr-${s}`,`mb-${s}`,`ml-${s}`,`-m-${s}`,`-mt-${s}`,`-mb-${s}`,`-ml-${s}`,`-mr-${s}`]),
  'mx-auto','my-auto',
  // sizing
  ...SCALES.flatMap(s => [`w-${s}`,`h-${s}`,`min-w-${s}`,`min-h-${s}`,`max-w-${s}`,`max-h-${s}`]),
  'w-full','w-screen','w-auto','w-fit','w-min','w-max',
  'h-full','h-screen','h-auto','h-fit','h-min','h-max','h-dvh','h-svh','h-lvh',
  'w-1/2','w-1/3','w-2/3','w-1/4','w-3/4','w-1/5','w-2/5','w-3/5','w-4/5',
  'max-w-xs','max-w-sm','max-w-md','max-w-lg','max-w-xl','max-w-2xl','max-w-3xl','max-w-4xl','max-w-5xl','max-w-6xl','max-w-7xl','max-w-full','max-w-screen-sm','max-w-screen-md','max-w-screen-lg','max-w-screen-xl',
  // typography
  'text-xs','text-sm','text-base','text-lg','text-xl','text-2xl','text-3xl','text-4xl','text-5xl','text-6xl','text-7xl','text-8xl','text-9xl',
  'font-thin','font-extralight','font-light','font-normal','font-medium','font-semibold','font-bold','font-extrabold','font-black',
  'leading-none','leading-tight','leading-snug','leading-normal','leading-relaxed','leading-loose',
  ...['3','4','5','6','7','8','9','10'].map(n => `leading-${n}`),
  'tracking-tighter','tracking-tight','tracking-normal','tracking-wide','tracking-wider','tracking-widest',
  'text-left','text-center','text-right','text-justify','text-start','text-end',
  'uppercase','lowercase','capitalize','normal-case',
  'truncate','text-ellipsis','text-clip','line-clamp-1','line-clamp-2','line-clamp-3','line-clamp-4',
  'whitespace-normal','whitespace-nowrap','whitespace-pre','whitespace-pre-wrap','whitespace-pre-line',
  'break-normal','break-words','break-all','break-keep',
  'italic','not-italic','underline','line-through','no-underline',
  'antialiased','subpixel-antialiased',
  // colors
  ...colorScale('bg'),
  ...colorScale('text'),
  ...colorScale('border'),
  ...colorScale('ring'),
  ...colorScale('shadow'),
  ...colorScale('outline'),
  ...colorScale('accent'),
  ...colorScale('caret'),
  ...colorScale('fill'),
  ...colorScale('stroke'),
  // background
  'bg-cover','bg-contain','bg-auto','bg-center','bg-top','bg-bottom','bg-left','bg-right','bg-no-repeat','bg-repeat','bg-fixed','bg-local','bg-scroll',
  // borders
  'border','border-0','border-2','border-4','border-8',
  'border-t','border-r','border-b','border-l','border-x','border-y',
  'border-t-0','border-r-0','border-b-0','border-l-0',
  'border-solid','border-dashed','border-dotted','border-double','border-none',
  'rounded','rounded-sm','rounded-md','rounded-lg','rounded-xl','rounded-2xl','rounded-3xl','rounded-full','rounded-none',
  'rounded-t','rounded-r','rounded-b','rounded-l','rounded-tl','rounded-tr','rounded-bl','rounded-br',
  'rounded-t-lg','rounded-b-lg','rounded-t-xl','rounded-b-xl','rounded-t-2xl','rounded-b-2xl','rounded-full',
  // shadow
  'shadow','shadow-sm','shadow-md','shadow-lg','shadow-xl','shadow-2xl','shadow-inner','shadow-none',
  // opacity
  ...['0','5','10','15','20','25','30','35','40','45','50','55','60','65','70','75','80','85','90','95','100'].map(n => `opacity-${n}`),
  // blur / filter
  'blur-none','blur-sm','blur','blur-md','blur-lg','blur-xl','blur-2xl','blur-3xl',
  'backdrop-blur-none','backdrop-blur-sm','backdrop-blur','backdrop-blur-md','backdrop-blur-lg','backdrop-blur-xl','backdrop-blur-2xl','backdrop-blur-3xl',
  'brightness-0','brightness-50','brightness-75','brightness-90','brightness-95','brightness-100','brightness-105','brightness-110','brightness-125','brightness-150','brightness-200',
  // transitions
  'transition','transition-all','transition-colors','transition-opacity','transition-shadow','transition-transform','transition-none',
  'duration-0','duration-75','duration-100','duration-150','duration-200','duration-300','duration-500','duration-700','duration-1000',
  'ease-linear','ease-in','ease-out','ease-in-out',
  'delay-0','delay-75','delay-100','delay-150','delay-200','delay-300','delay-500','delay-700','delay-1000',
  // transforms
  'scale-0','scale-50','scale-75','scale-90','scale-95','scale-100','scale-105','scale-110','scale-125','scale-150',
  'scale-x-0','scale-x-50','scale-x-75','scale-x-95','scale-x-100','scale-x-105',
  'scale-y-0','scale-y-50','scale-y-75','scale-y-95','scale-y-100','scale-y-105',
  'rotate-0','rotate-1','rotate-2','rotate-3','rotate-6','rotate-12','rotate-45','rotate-90','rotate-180',
  '-rotate-1','-rotate-2','-rotate-3','-rotate-6','-rotate-12','-rotate-45','-rotate-90','-rotate-180',
  ...SCALES.flatMap(s => [`translate-x-${s}`,`translate-y-${s}`,`-translate-x-${s}`,`-translate-y-${s}`]),
  'skew-x-0','skew-x-1','skew-x-2','skew-x-3','skew-x-6','skew-x-12',
  'skew-y-0','skew-y-1','skew-y-2','skew-y-3','skew-y-6','skew-y-12',
  // ring
  'ring','ring-0','ring-1','ring-2','ring-4','ring-8','ring-inset','ring-offset-0','ring-offset-1','ring-offset-2','ring-offset-4','ring-offset-8',
  // outline
  'outline','outline-none','outline-dashed','outline-dotted','outline-double',
  'outline-0','outline-1','outline-2','outline-4','outline-8',
  // interactivity
  'cursor-auto','cursor-default','cursor-pointer','cursor-wait','cursor-text','cursor-move','cursor-help','cursor-not-allowed','cursor-grab','cursor-grabbing','cursor-crosshair','cursor-zoom-in','cursor-zoom-out',
  'select-none','select-text','select-all','select-auto',
  'pointer-events-none','pointer-events-auto',
  'resize','resize-none','resize-x','resize-y',
  'touch-none','touch-auto','touch-pan-x','touch-pan-y',
  // visibility
  'visible','invisible','collapse',
  // object
  'object-contain','object-cover','object-fill','object-none','object-scale-down',
  'object-center','object-top','object-bottom','object-left','object-right',
  // list
  'list-none','list-disc','list-decimal','list-inside','list-outside',
  // misc
  'appearance-none','appearance-auto',
  'aspect-auto','aspect-square','aspect-video',
  'isolate','isolation-auto',
  'mix-blend-normal','mix-blend-multiply','mix-blend-screen','mix-blend-overlay','mix-blend-darken','mix-blend-lighten',
  'will-change-auto','will-change-scroll','will-change-contents','will-change-transform',
  'container','sr-only','not-sr-only',
  'space-x-0','space-x-1','space-x-2','space-x-4','space-x-8',
  'space-y-0','space-y-1','space-y-2','space-y-4','space-y-8',
  'divide-x','divide-y','divide-solid','divide-dashed','divide-dotted','divide-none',
]

export function getTwCompletions(partial: string): string[] {
  if (!partial) return ALL_TW_CLASSES
  return ALL_TW_CLASSES.filter(cls => cls.startsWith(partial))
}
