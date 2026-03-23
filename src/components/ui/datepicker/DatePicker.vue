<script setup>
import { ref, computed } from 'vue'
import { useVModel } from '@vueuse/core'
import { Calendar as CalendarIcon } from 'lucide-vue-next'
import { getLocalTimeZone } from '@internationalized/date'
import { DateFormatter } from '@internationalized/date'
import { cn } from '@/lib/utils'
import * as LucideIcons from 'lucide-vue-next'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const props = defineProps({
    defaultValue: { type: null, required: false },
    modelValue: { type: null, required: false },
    class: { type: null, required: false },
    prependIcon: { type: [String, Object, Function], required: false, default: 'Calendar' },
    appendIcon: { type: [String, Object, Function], required: false },
    label: { type: String, required: false },
    placeholder: { type: String, required: false, default: 'Pick a date' },
    clearable: { type: Boolean, required: false, default: false },
    errorMsg: { type: String, required: false },
    hint: { type: String, required: false },
    disabled: { type: Boolean, required: false, default: false }
})

const emits = defineEmits(['update:modelValue'])

const modelValue = useVModel(props, 'modelValue', emits, {
    passive: true,
    defaultValue: props.defaultValue
})

const df = new DateFormatter('en-US', {
    dateStyle: 'medium'
})

const displayValue = computed(() => {
    if (modelValue.value) {
        return df.format(modelValue.value.toDate(getLocalTimeZone()))
    }
    return ''
})

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

const clearValue = () => {
    modelValue.value = null
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
            <Popover>
                <PopoverTrigger as-child>
                    <input
                        :value="displayValue"
                        :placeholder="placeholder"
                        :disabled="disabled"
                        readonly
                        data-slot="input"
                        :class="
                            cn(
                                'flex h-9 text-left w-full rounded-lg bg-input-background py-1 text-sm shadow-sm transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer',
                                prependIcon ? 'pl-10' : 'pl-3',
                                appendIcon || clearable ? 'pr-10' : 'pr-3',
                                errorMsg ? 'border border-red-500 focus-visible:ring-red-500' : 'border-border',
                                props.class
                            )
                        "
                    />
                </PopoverTrigger>
                <PopoverContent class="w-auto p-0">
                    <Calendar v-model="modelValue" initial-focus />
                </PopoverContent>
            </Popover>
            <div
                v-if="clearable && modelValue"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground cursor-pointer hover:text-foreground transition-colors z-10"
                @click="clearValue"
            >
                <LucideIcons.X class="w-4 h-4" />
            </div>
            <div
                v-if="appendIcon && !(clearable && modelValue)"
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
