import { cva } from 'class-variance-authority'

export { default as Button } from './Button.vue'

export const buttonVariants = cva(
    "inline-flex pointer items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
    {
        variants: {
            variant: {
                default: 'bg-primary shadow-md text-primary-foreground shadow-xs hover:bg-primary/90',
                primary:
                    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:shadow-lg focus-visible:ring-primary active:bg-primary/95 h-9 px-4 py-2 text-sm',
                secondary:
                    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] bg-secondary text-secondary-foreground shadow-md hover:bg-secondary/90 hover:shadow-lg focus-visible:ring-secondary active:bg-secondary/95 h-9 px-4 py-2 text-sm',
                accent: 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] bg-accent text-accent-foreground shadow-md hover:bg-accent/90 hover:shadow-lg focus-visible:ring-accent active:bg-accent/95 h-9 px-4 py-2 text-sm',
                outline:
                    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]  bg-background shadow-sm hover:bg-accent hover:text-accent-foreground hover:border-accent focus-visible:ring-primary active:bg-accent/95 h-9 px-4 py-2 text-sm',
                ghost: 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] hover:bg-accent/10 hover:text-accent focus-visible:ring-accent active:bg-accent/20 h-9 px-4 py-2 text-sm',
                link: 'class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] text-primary underline-offset-4 hover:underline focus-visible:ring-primary active:text-primary/80 h-9 px-4 py-2 text-sm',
                destructive:
                    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] bg-destructive text-destructive-foreground shadow-md hover:bg-destructive/90 hover:shadow-lg focus-visible:ring-destructive active:bg-destructive/95 h-9 px-4 py-2 text-sm'
            },
            size: {
                default: 'h-9 px-4 py-2 has-[>svg]:px-3',
                sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
                lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
                xl: 'h-11 rounded-md px-8 has-[>svg]:px-6',
                icon: 'size-9'
            }
        },
        defaultVariants: {
            variant: 'default',
            size: 'default'
        }
    }
)
