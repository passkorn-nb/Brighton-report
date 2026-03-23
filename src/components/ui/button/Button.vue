<script setup>
import { Primitive } from 'reka-ui'
import { cn } from '@/lib/utils'
import { buttonVariants } from '.'
import { LucideLoader2 } from 'lucide-vue-next'

const props = defineProps({
    variant: { type: null, required: false },
    size: { type: null, required: false },
    loading: { type: Boolean, required: false, default: false },
    class: { type: null, required: false },
    asChild: { type: Boolean, required: false },
    as: { type: null, required: false, default: 'button' }
})
</script>

<template>
    <Primitive
        data-slot="button"
        :as="as"
        :as-child="asChild"
        :class="cn(buttonVariants({ variant, size }), props.class)"
    >
        <LucideLoader2 v-if="loading" class="animate-spin" />
        <slot />
    </Primitive>
</template>
