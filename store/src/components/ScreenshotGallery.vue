<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  screenshots: {
    type: Array,
    default: () => [],
  },
});

const activeIndex = ref(0);

const hasMultiple = computed(() => props.screenshots.length > 1);

function prev() {
  activeIndex.value = activeIndex.value > 0 ? activeIndex.value - 1 : props.screenshots.length - 1;
}

function next() {
  activeIndex.value = activeIndex.value < props.screenshots.length - 1 ? activeIndex.value + 1 : 0;
}

watch(() => props.screenshots, () => {
  activeIndex.value = 0;
});
</script>

<template>
  <div v-if="screenshots.length > 0" class="space-y-3">
    <div class="relative bg-neutral-100 dark:bg-neutral-700 rounded-xl overflow-hidden aspect-video">
      <img
        :src="screenshots[activeIndex]"
        :alt="'Screenshot ' + (activeIndex + 1)"
        class="w-full h-full object-cover"
        loading="lazy"
      />

      <button
        v-if="hasMultiple"
        @click="prev"
        class="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
      >
        <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>
      <button
        v-if="hasMultiple"
        @click="next"
        class="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
      >
        <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>

      <div v-if="hasMultiple" class="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
        <button
          v-for="(_, i) in screenshots"
          :key="i"
          @click="activeIndex = i"
          :class="i === activeIndex ? 'bg-white' : 'bg-white/50'"
          class="w-2 h-2 rounded-full transition-colors"
        />
      </div>
    </div>

    <div v-if="hasMultiple" class="flex gap-2 overflow-x-auto no-scrollbar">
      <button
        v-for="(src, i) in screenshots"
        :key="i"
        @click="activeIndex = i"
        :class="i === activeIndex ? 'ring-2 ring-amber-400' : 'opacity-60 hover:opacity-100'"
        class="flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden transition-all"
      >
        <img :src="src" :alt="'Thumbnail ' + (i + 1)" class="w-full h-full object-cover" loading="lazy" />
      </button>
    </div>
  </div>
</template>
