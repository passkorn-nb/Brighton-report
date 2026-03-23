<script setup>
import { cn } from "@/lib/utils";

const props = defineProps({
  src: { type: String, required: false },
  alt: { type: String, required: false, default: '' },
  aspectRatio: { type: String, required: false, default: 'aspect-video' },
  objectFit: { type: String, required: false, default: 'object-cover' },
  backgroundColor: { type: String, required: false, default: 'bg-muted' },
  class: { type: null, required: false },
});
</script>

<template>
  <div
    data-slot="card-image"
    :class="
      cn(
        'relative overflow-hidden rounded-t-xl flex items-center justify-center',
        props.aspectRatio,
        !props.src && props.backgroundColor,
        props.class,
      )
    "
  >
    <img
      v-if="props.src"
      :src="props.src"
      :alt="props.alt"
      :class="
        cn(
          'h-full w-full transition-transform hover:scale-105',
          props.objectFit,
        )
      "
    />
    <slot />
  </div>
</template>