<script setup>
import { ref } from 'vue'
import { useVModel } from '@vueuse/core'
import { cn } from '@/lib/utils'
import * as LucideIcons from 'lucide-vue-next'

const props = defineProps({
    defaultValue: { type: [String, Number], required: false },
    modelValue: { type: [String, Number], required: false },
    class: { type: null, required: false },
    prependIcon: { type: [String, Object, Function], required: false },
    appendIcon: { type: [String, Object, Function], required: false },
    type: { type: String, required: false, default: 'text' },
    label: { type: String, required: false },
    placeholder: { type: String, required: false, default: '' },
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

const showPassword = ref(false)
const currentInputType = ref(props.type)

const togglePasswordVisibility = () => {
    if (props.type === 'password') {
        showPassword.value = !showPassword.value
        currentInputType.value = showPassword.value ? 'text' : 'password'
    }
}

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
    <div class="relative w-full mt-2">
        <label v-if="label" class="block text-sm font-medium text-foreground mb-1">
            {{ label }}
        </label>
        <div class="relative">
            <div v-if="prependIcon" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                <component :is="getPrependIcon()" class="w-4 h-4" />
            </div>
            <input
                v-model="modelValue"
                :type="currentInputType"
                :placeholder="placeholder"
                :disabled="disabled"
                data-slot="input"
                :class="
                    cn(
                        'flex h-9 w-full rounded-lg bg-input-background py-1 text-sm shadow-sm transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
                        prependIcon ? 'pl-10' : 'pl-3',
                        appendIcon || type === 'password' || clearable ? 'pr-10' : 'pr-3',
                        errorMsg ? 'border border-red-500 focus-visible:ring-red-500' : 'border-border',
                        props.class
                    )
                "
            />
            <div
                v-if="type === 'password'"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                @click="togglePasswordVisibility"
            >
                <LucideIcons.Eye v-if="showPassword" class="w-4 h-4" />
                <LucideIcons.EyeOff v-else class="w-4 h-4" />
            </div>
            <div
                v-if="clearable && modelValue && type !== 'password'"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                @click="modelValue = ''"
            >
                <LucideIcons.X class="w-4 h-4" />
            </div>
            <div v-if="appendIcon" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
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
