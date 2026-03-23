<script setup>
import { cn } from "@/lib/utils";

const props = defineProps({
  class: { type: null, required: false },
});
</script>

<template>
  <div
    data-slot="card"
    :class="
      cn(
        'bg-card text-card-foreground flex flex-col rounded-xl border shadow-sm overflow-hidden',
        props.class,
      )
    "
  >
    <slot name="image" />
    <div class="flex flex-col gap-6 py-6">
      <slot />
    </div>
  </div>
</template>
