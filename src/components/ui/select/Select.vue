<script setup>
import { SelectRoot, useForwardPropsEmits } from 'reka-ui'
import { cn } from '@/lib/utils'
import * as LucideIcons from 'lucide-vue-next'

const props = defineProps({
    open: { type: Boolean, required: false },
    defaultOpen: { type: Boolean, required: false },
    defaultValue: { type: null, required: false },
    modelValue: { type: null, required: false },
    by: { type: [String, Function], required: false },
    dir: { type: String, required: false },
    multiple: { type: Boolean, required: false },
    autocomplete: { type: String, required: false },
    disabled: { type: Boolean, required: false },
    name: { type: String, required: false },
    required: { type: Boolean, required: false },
    class: { type: null, required: false },
    prependIcon: { type: [String, Object, Function], required: false },
    appendIcon: { type: [String, Object, Function], required: false },
    label: { type: String, required: false },
    placeholder: { type: String, required: false, default: '' },
    clearable: { type: Boolean, required: false, default: false },
    errorMsg: { type: String, required: false },
    hint: { type: String, required: false }
})
const emits = defineEmits(['update:modelValue', 'update:open'])

const forwarded = useForwardPropsEmits(props, emits)

const getPrependIcon = () => {
    if (typeof props.prependIcon === 'string') {
        return LucideIcons[props.prependIcon]
    }
    return props.prependIcon
}

const getAppendIcon = () => {
    if (typeof props.appendIcon === 'string') {
        return LucideIcons[props.appendIcon]
    }
    return props.appendIcon
}
</script>

<template>
    <div class="relative mt-2">
        <label v-if="label" class="block text-sm font-medium text-foreground mb-1">
            {{ label }}
        </label>
        <div class="relative">
            <div
                v-if="prependIcon"
                class="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground z-10"
            >
                <component :is="getPrependIcon()" class="w-4 h-4" />
            </div>
            <SelectRoot
                data-slot="select"
                v-bind="forwarded"
                :class="
                    cn(
                        'flex h-9 w-full rounded-lg bg-input-background py-1 text-sm shadow-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
                        prependIcon ? 'pl-10' : 'pl-3',
                        appendIcon || clearable ? 'pr-10' : 'pr-3',
                        errorMsg ? 'border border-red-500 focus-visible:ring-red-500' : 'border-border',
                        props.class
                    )
                "
            >
                <slot />
            </SelectRoot>
            <div
                v-if="clearable && modelValue"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground cursor-pointer hover:text-foreground transition-colors z-10"
                @click="$emit('update:modelValue', null)"
            >
                <LucideIcons.X class="w-4 h-4" />
            </div>
            <div
                v-if="appendIcon"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground z-10"
            >
                <component :is="getAppendIcon()" class="w-4 h-4" />
            </div>
        </div>
        <li v-if="errorMsg" class="mt-1 ml-6 text-xs text-red-600">
            {{ errorMsg }}
        </li>
        <p v-if="hint && !errorMsg" class="mt-1 text-xs text-muted-foreground">
            {{ hint }}
        </p>
    </div>
</template>
