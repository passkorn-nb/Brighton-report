<script setup>
import { reactiveOmit } from '@vueuse/core'
import { Check } from 'lucide-vue-next'
import { CheckboxIndicator, CheckboxRoot, useForwardPropsEmits } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = defineProps({
    defaultValue: { type: [Boolean, String], required: false },
    label: { type: String, required: false },
    modelValue: { type: [Boolean, String, null], required: false },
    disabled: { type: Boolean, required: false },
    value: { type: null, required: false },
    id: { type: String, required: false },
    asChild: { type: Boolean, required: false },
    as: { type: null, required: false },
    name: { type: String, required: false },
    required: { type: Boolean, required: false },
    class: { type: null, required: false }
})
const emits = defineEmits(['update:modelValue'])

const delegatedProps = reactiveOmit(props, 'class')

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
    <CheckboxRoot
        data-slot="checkbox"
        v-bind="forwarded"
        :class="
            cn(
                'peer h-4 w-4 shrink-0 rounded border border-input shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground',
                props.class
            )
        "
    >
        <CheckboxIndicator
            data-slot="checkbox-indicator"
            class="flex items-center justify-center text-current transition-none"
        >
            <slot>
                <Check class="size-3.5" />
            </slot>
        </CheckboxIndicator>
    </CheckboxRoot>
    <label
        v-if="props.label"
        :for="props.id"
        class="select-none text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
    >
        {{ props.label }}
    </label>
</template>
